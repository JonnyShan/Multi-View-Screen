/**
 * A rigged rider GLB with Mixamo-style bone names (Hips, Spine, LeftArm,
 * RightHand...) driven by an AnimationMixer. Clips come from the file (idle,
 * walk, run, jump, slash, fall). The riding and roof-crouch poses are solved
 * here with two-bone IK against the bike's seat, grips and pegs, and aiming,
 * the riding slash, the whistle and lean are layered on top every frame (on the
 * bike the left hand stays on its grip). The katana and gun are the code-built
 * ones from RiderView, placed by hand each frame.
 */
import * as THREE from 'three';
import type { Sim } from '../sim/Sim';
import type { BikeModel } from './BikeView';
import { buildRiderModel } from './RiderView';
import { yawToThree } from './Shared';

type ClipKey = 'idle' | 'walk' | 'run' | 'jump' | 'slash' | 'fall' | 'ride' | 'crouch';

/** Bones the poses need, matched case-insensitively (exact, then by suffix). */
const BONE_NAMES = {
  hips: 'hips',
  spineLow: 'spine02',
  spineMid: 'spine01',
  chest: 'spine',
  neck: 'neck',
  head: 'head',
  armL: 'leftarm',
  foreL: 'leftforearm',
  handL: 'lefthand',
  armR: 'rightarm',
  foreR: 'rightforearm',
  handR: 'righthand',
  legL: 'leftupleg',
  kneeL: 'leftleg',
  footL: 'leftfoot',
  toeL: 'lefttoebase',
  legR: 'rightupleg',
  kneeR: 'rightleg',
  footR: 'rightfoot',
  toeR: 'righttoebase',
} as const;
type BoneKey = keyof typeof BONE_NAMES;

/** The swing in the slash clip, fitted into the game's 0.34 s slash. */
const SLASH_START = 0.45;
const SLASH_RATE = 1.76;
/**
 * The riding slash: the sword hand's path from the grip, past the head, down
 * and out to the right and back (rider space, from the right shoulder), and
 * when it reaches each point (fraction of the slash).
 */
const RIDE_SLASH = [new THREE.Vector3(-0.8, 2.6, -1.4), new THREE.Vector3(-3, -1.6, 2), new THREE.Vector3(-1.8, -2.6, 2.4)];
const RIDE_SLASH_AT = [0, 0.3, 0.5, 0.7, 1];
/** How fast the aim eases in and out and follows its target (per second). */
const AIM_EASE = 14;

const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0);
const _p = new THREE.Vector3();
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _q1 = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();
const _q3 = new THREE.Quaternion();
const _q4 = new THREE.Quaternion();

/** Apply a world-space rotation to a bone, keeping its position. */
function turnWorld(bone: THREE.Object3D, q: THREE.Quaternion): void {
  bone.getWorldQuaternion(_q2);
  _q1.copy(q).multiply(_q2);
  bone.parent!.getWorldQuaternion(_q3).invert();
  bone.quaternion.copy(_q3.multiply(_q1));
  bone.updateMatrixWorld(true);
}

function turnAxis(bone: THREE.Object3D, axis: THREE.Vector3, angle: number): void {
  turnWorld(bone, _q4.setFromAxisAngle(axis, angle));
}

/** Turn `bone` so that its child, currently at `child`, points at `target` (world space). */
function aim(bone: THREE.Object3D, child: THREE.Vector3, target: THREE.Vector3): void {
  bone.getWorldPosition(_p);
  _v1.copy(child).sub(_p);
  _v2.copy(target).sub(_p);
  if (_v1.lengthSq() < 1e-10 || _v2.lengthSq() < 1e-10) return;
  turnWorld(bone, _q4.setFromUnitVectors(_v1.normalize(), _v2.normalize()));
}

/** Two-bone IK: upper -> mid -> end reaches for `target`, bending towards `pole` (world space). */
function reach(upper: THREE.Object3D, mid: THREE.Object3D, end: THREE.Object3D, target: THREE.Vector3, pole: THREE.Vector3): void {
  const a = upper.getWorldPosition(new THREE.Vector3());
  const b = mid.getWorldPosition(new THREE.Vector3());
  const c = end.getWorldPosition(new THREE.Vector3());
  const l1 = a.distanceTo(b);
  const l2 = b.distanceTo(c);
  const toT = target.clone().sub(a);
  const d = THREE.MathUtils.clamp(toT.length(), Math.abs(l1 - l2) + 1e-3, (l1 + l2) * 0.999);
  const dir = toT.normalize();
  const cosA = THREE.MathUtils.clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const sinA = Math.sqrt(1 - cosA * cosA);
  const bend = pole.clone().sub(a);
  bend.addScaledVector(dir, -bend.dot(dir)).normalize();
  const joint = a.clone().addScaledVector(dir, l1 * cosA).addScaledVector(bend, l1 * sinA);
  aim(upper, b, joint);
  aim(mid, end.getWorldPosition(new THREE.Vector3()), a.addScaledVector(dir, d));
}

export class GlbRiderView {
  readonly root = new THREE.Group();
  private readonly scene: THREE.Object3D;
  private readonly mixer: THREE.AnimationMixer;
  private readonly actions = new Map<ClipKey, THREE.AnimationAction>();
  private current: THREE.AnimationAction | null = null;
  private readonly b: Record<BoneKey, THREE.Bone>;
  private readonly bones: THREE.Bone[] = [];
  private readonly rest = new Map<THREE.Bone, [THREE.Vector3, THREE.Quaternion]>();
  private readonly katana: THREE.Group;
  private readonly saya: THREE.Object3D;
  private readonly gun: THREE.Group;
  private katanaDrawn = false;
  private gunDrawn = false;
  /** How far the aim pose is blended in (0 to 1), and its smoothed angle off the body's heading. */
  private aimW = 0;
  private aimRel = 0;
  private readonly aimTarget = new THREE.Vector3();
  /** Holster transform in the right thigh's space, found at the rest pose. */
  private readonly holster: [THREE.Vector3, THREE.Quaternion, THREE.Vector3];
  /** The sheath's turn on the chest standing, and tucked on the bike (laid along the back). */
  private readonly sayaStand: THREE.Quaternion;
  private readonly sayaRide: THREE.Quaternion;

  constructor(
    private readonly bike: BikeModel,
    scene: THREE.Group,
    clips: THREE.AnimationClip[],
  ) {
    this.root.name = 'rider';
    this.scene = scene;
    this.root.add(scene);
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        (o as THREE.Mesh).castShadow = true;
        o.frustumCulled = false;
      }
      if ((o as THREE.Bone).isBone) this.bones.push(o as THREE.Bone);
    });
    const found = {} as Record<BoneKey, THREE.Bone>;
    for (const [key, name] of Object.entries(BONE_NAMES) as [BoneKey, string][]) {
      const bone = this.bones.find((x) => x.name.toLowerCase() === name) ?? this.bones.find((x) => x.name.toLowerCase().endsWith(name));
      if (!bone) throw new Error(`rider GLB has no ${name} bone`);
      found[key] = bone;
    }
    this.b = found;
    for (const bone of this.bones) this.rest.set(bone, [bone.position.clone(), bone.quaternion.clone()]);

    this.mixer = new THREE.AnimationMixer(scene);
    const find = (key: string): THREE.AnimationClip | undefined => clips.find((c) => c.name.toLowerCase() === key) ?? clips.find((c) => c.name.toLowerCase().startsWith(key));
    for (const key of ['idle', 'walk', 'run', 'jump', 'slash', 'fall'] as const) {
      const clip = find(key);
      if (clip) this.actions.set(key, this.mixer.clipAction(clip));
    }
    const ride = this.bake('ride', () => this.poseRide());
    this.actions.set('ride', this.mixer.clipAction(ride));
    this.actions.set('crouch', this.mixer.clipAction(this.bake('crouch', () => this.poseCrouch())));
    for (const key of ['jump', 'fall', 'slash'] as const) {
      const a = this.actions.get(key);
      if (!a) continue;
      a.setLoop(THREE.LoopOnce, 1);
      a.clampWhenFinished = true;
    }

    // weapons: the code-built katana, sheath and gun
    const kit = buildRiderModel();
    this.katana = kit.katana;
    this.gun = kit.gun;
    this.saya = kit.saya;
    this.restPose();
    this.root.updateMatrixWorld(true);
    // sheath diagonally across the back, mouth behind the right shoulder, tip at the left hip
    const chestY = this.b.chest.getWorldPosition(_p).y;
    this.saya.removeFromParent();
    this.saya.position.set(-0.8, chestY + 1.5, -1.25);
    this.saya.rotation.set(0, 0, -Math.PI + 0.45);
    this.root.add(this.saya);
    this.b.chest.attach(this.saya);
    this.sayaStand = this.saya.quaternion.clone();
    this.sayaRide = this.sayaAlongBack();
    // gun on the outside of the right thigh, barrel down
    const hipY = this.b.legR.getWorldPosition(_p).y;
    this.gun.removeFromParent();
    this.gun.position.set(-1.35, hipY - 1.4, 0.2);
    this.gun.rotation.set(Math.PI / 2, 0, 0);
    this.root.add(this.gun);
    this.b.legR.attach(this.gun);
    this.holster = [this.gun.position.clone(), this.gun.quaternion.clone(), this.gun.scale.clone()];
    this.sheathKatana();
  }

  /** Put every bone back to the file's rest transform. */
  private restPose(): void {
    for (const [bone, [p, q]] of this.rest) {
      bone.position.copy(p);
      bone.quaternion.copy(q);
    }
    this.scene.updateMatrixWorld(true);
  }

  /** Solve a pose from the rest pose (rider root at the origin) and keep it as a one-frame clip. */
  private bake(name: ClipKey, pose: () => void): THREE.AnimationClip {
    const parent = this.root.parent;
    this.root.removeFromParent();
    this.root.position.set(0, 0, 0);
    this.root.rotation.set(0, 0, 0);
    this.root.updateMatrixWorld(true);
    this.restPose();
    pose();
    const tracks: THREE.KeyframeTrack[] = [];
    for (const bone of this.bones) {
      const q = bone.quaternion;
      tracks.push(new THREE.QuaternionKeyframeTrack(`${bone.name}.quaternion`, [0, 1], [q.x, q.y, q.z, q.w, q.x, q.y, q.z, q.w]));
    }
    const h = this.b.hips.position;
    tracks.push(new THREE.VectorKeyframeTrack(`${this.b.hips.name}.position`, [0, 1], [h.x, h.y, h.z, h.x, h.y, h.z]));
    this.restPose();
    parent?.add(this.root);
    return new THREE.AnimationClip(name, 1, tracks);
  }

  /** Crouched on the bike: pelvis on the seat, chest down, hands on the grips, feet on the pegs. */
  private poseRide(): void {
    const b = this.b;
    const m = this.bike;
    const hips = m.seat.clone().add(new THREE.Vector3(0, 1.2, -0.45));
    b.hips.position.copy(b.hips.parent!.worldToLocal(hips));
    b.hips.updateMatrixWorld(true);
    // tucked in over the tank
    turnAxis(b.hips, X, 0.5);
    turnAxis(b.spineLow, X, 0.42);
    turnAxis(b.spineMid, X, 0.3);
    turnAxis(b.chest, X, 0.18);
    turnAxis(b.neck, X, -0.75);
    turnAxis(b.head, X, -0.55);
    this.handOnGrip(1);
    this.handOnGrip(-1);
    for (const [s, leg, knee, foot, toe, peg] of [
      [1, b.legL, b.kneeL, b.footL, b.toeL, m.pegs[0]],
      [-1, b.legR, b.kneeR, b.footR, b.toeR, m.pegs[1]],
    ] as const) {
      const ankle = peg.clone().add(new THREE.Vector3(-s * 0.35, 0.9, -0.8));
      const pole = leg.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(s * 1.2, 1, 5));
      reach(leg, knee, foot, ankle, pole);
      // toes forward and a little down onto the peg
      aim(foot, toe.getWorldPosition(new THREE.Vector3()), ankle.clone().add(new THREE.Vector3(0, -0.7, 2)));
    }
  }

  /** Where a hand holds its grip (s = 1 left, -1 right), in rider space. */
  private gripWrist(s: 1 | -1): THREE.Vector3 {
    return this.bike.grips[s === 1 ? 0 : 1].clone().add(new THREE.Vector3(-s * 0.15, 0.25, -0.55));
  }

  /** Reach a hand (s = 1 left, -1 right) to its grip, elbow out and down. */
  private handOnGrip(s: 1 | -1): void {
    const b = this.b;
    const [arm, fore, hand] = s === 1 ? [b.armL, b.foreL, b.handL] : [b.armR, b.foreR, b.handR];
    const pole = arm.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(s * 3, -3, -2).applyQuaternion(this.root.getWorldQuaternion(_q1)));
    reach(arm, fore, hand, this.root.localToWorld(this.gripWrist(s)), pole);
  }

  /** Crouched on a car roof, one foot forward, blade hand ready. */
  private poseCrouch(): void {
    const b = this.b;
    b.hips.position.copy(b.hips.parent!.worldToLocal(new THREE.Vector3(0, 4.9, -0.6)));
    b.hips.updateMatrixWorld(true);
    turnAxis(b.hips, X, 0.25);
    turnAxis(b.spineLow, X, 0.18);
    turnAxis(b.neck, X, -0.3);
    for (const [s, leg, knee, foot, toe, z] of [
      [1, b.legL, b.kneeL, b.footL, b.toeL, 1.3],
      [-1, b.legR, b.kneeR, b.footR, b.toeR, -1.5],
    ] as const) {
      const ankle = new THREE.Vector3(s * 1.2, 0.8, z);
      reach(leg, knee, foot, ankle, leg.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(s, 0.5, 5)));
      aim(foot, toe.getWorldPosition(new THREE.Vector3()), ankle.clone().add(new THREE.Vector3(0, -0.8, 2)));
    }
    reach(b.armL, b.foreL, b.handL, new THREE.Vector3(2.4, 3.2, 2.4), new THREE.Vector3(5, 5, -2));
    reach(b.armR, b.foreR, b.handR, new THREE.Vector3(-2.2, 6.2, 2.0), new THREE.Vector3(-5, 4, -2));
  }

  /**
   * Tucked on the bike the chest is nearly flat, so a sheath fixed to it would
   * stick out behind. Turn it to run from the shoulder to the left hip instead.
   */
  private sayaAlongBack(): THREE.Quaternion {
    const parent = this.root.parent;
    this.root.removeFromParent();
    this.root.position.set(0, 0, 0);
    this.root.rotation.set(0, 0, 0);
    this.root.updateMatrixWorld(true);
    this.restPose();
    this.poseRide();
    this.root.updateMatrixWorld(true);
    const from = this.saya.getWorldPosition(new THREE.Vector3());
    const q = this.saya.getWorldQuaternion(new THREE.Quaternion());
    const tipNow = Y.clone().applyQuaternion(q);
    // the lower back leans forward 0.92 rad in poseRide (hips and lowest spine), so its surface faces up and back
    const lowBack = 0.92;
    const target = this.b.legL.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, Math.sin(lowBack), -Math.cos(lowBack)).multiplyScalar(1.3));
    q.premultiply(new THREE.Quaternion().setFromUnitVectors(tipNow, target.sub(from).normalize()));
    const local = this.b.chest.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q);
    this.restPose();
    parent?.add(this.root);
    return local;
  }

  private sheathKatana(): void {
    this.saya.add(this.katana);
    this.katana.position.set(0, -0.4, 0);
    this.katana.rotation.set(0, 0, 0);
    this.katanaDrawn = false;
  }

  private holsterGun(): void {
    this.b.legR.add(this.gun);
    this.gun.position.copy(this.holster[0]);
    this.gun.quaternion.copy(this.holster[1]);
    this.gun.scale.copy(this.holster[2]);
    this.gunDrawn = false;
  }

  private play(key: ClipKey, fade: number): THREE.AnimationAction {
    const a = this.actions.get(key) ?? this.actions.get('idle')!;
    if (a === this.current) return a;
    a.reset();
    a.timeScale = 1;
    if (key === 'slash') {
      a.time = SLASH_START;
      a.timeScale = SLASH_RATE;
    }
    if (key === 'jump') a.time = 0.5;
    a.play();
    if (this.current) a.crossFadeFrom(this.current, fade, false);
    this.current = a;
    return a;
  }

  update(sim: Sim, alpha: number, dt: number): void {
    const pl = sim.player;
    const riding = pl.mode === 'riding';
    if (riding && this.root.parent !== this.bike.leanPivot) this.bike.leanPivot.add(this.root);
    else if (!riding && this.root.parent === this.bike.leanPivot) this.bike.root.parent?.add(this.root);
    if (riding) {
      this.root.position.set(0, 0, 0);
      this.root.rotation.set(0, 0, 0);
    } else {
      this.root.position.set(pl.px + (pl.x - pl.px) * alpha, pl.pz + (pl.z - pl.pz) * alpha, pl.py + (pl.y - pl.py) * alpha);
      this.root.rotation.set(0, yawToThree(pl.facing), 0);
      if (pl.mode === 'air' && pl.thrown) this.root.rotation.x = -Math.min(1.2, pl.modeT * 3);
    }
    const speed = Math.hypot(pl.vx, pl.vy);
    const slashing = pl.slashAnim < 0.34;
    let key: ClipKey;
    if (riding) key = 'ride';
    else if (slashing) key = 'slash';
    else if (pl.mode === 'air') key = 'jump';
    else if (pl.mode === 'down' || pl.mode === 'dead') key = 'fall';
    else if (pl.mode === 'roof') key = 'crouch';
    else if (speed > 22) key = 'run';
    else if (speed > 4) key = 'walk';
    else key = 'idle';
    this.saya.quaternion.copy(riding ? this.sayaRide : this.sayaStand);
    const action = this.play(key, slashing ? 0.06 : 0.22);
    if (key === 'run') action.timeScale = THREE.MathUtils.clamp(speed / 44, 0.7, 1.5);
    if (key === 'walk') action.timeScale = THREE.MathUtils.clamp(speed / 12, 0.6, 1.8);
    this.mixer.update(dt);
    this.root.updateMatrixWorld(true);

    const b = this.b;
    if (riding) {
      // keep the head nearer level than the bike through a lean
      const bike = sim.bike;
      turnAxis(b.head, this.forward(), -(bike.pLean + (bike.lean - bike.pLean) * alpha) * 0.35);
    }
    const shooting = pl.firing && pl.mode !== 'dead' && pl.mode !== 'down' && !slashing;
    // ease the aim in and out and follow its target smoothly, so a new target swings the arm round instead of snapping it
    const ease = 1 - Math.exp(-dt * AIM_EASE);
    if (shooting) {
      const rel = this.aimAngle(sim, riding);
      this.aimRel = this.aimW < 0.05 ? rel : this.aimRel + (rel - this.aimRel) * ease;
    }
    this.aimW += ((shooting ? 1 : 0) - this.aimW) * ease;
    if (this.aimW > 0.01) this.aimGun(sim, riding);
    if (shooting) this.drawGun();
    else if (this.gunDrawn) this.holsterGun();
    if (!shooting && pl.mode === 'foot' && pl.whistleT > 0) this.whistle(sim);
    if (slashing && riding) this.rideSlash(pl.slashAnim / 0.34);
    if (slashing) this.holdKatana();
    else if (this.katanaDrawn) this.sheathKatana();
  }

  /** The rider's up direction in world space (leans with the bike). */
  private up(): THREE.Vector3 {
    return Y.clone().applyQuaternion(this.root.getWorldQuaternion(_q1));
  }

  /** Run `pose` on top of the current pose, keeping `w` of what it changes on `bones`. */
  private layer(bones: THREE.Bone[], w: number, pose: () => void): void {
    const before = bones.map((bone) => bone.quaternion.clone());
    pose();
    if (w >= 1) return;
    bones.forEach((bone, i) => {
      const after = bone.quaternion.clone();
      bone.quaternion.copy(before[i]).slerp(after, w);
    });
    this.root.updateMatrixWorld(true);
  }

  /** The rider's facing direction in world space. */
  private forward(): THREE.Vector3 {
    return this.root.getWorldDirection(new THREE.Vector3());
  }

  /** The aim's angle off the body's heading (positive to the right), within reach of the gun arm. */
  private aimAngle(sim: Sim, riding: boolean): number {
    const pl = sim.player;
    let rel = Math.atan2(pl.aimY - pl.y, pl.aimX - pl.x) - (riding ? sim.bike.heading : pl.facing);
    while (rel > Math.PI) rel -= Math.PI * 2;
    while (rel < -Math.PI) rel += Math.PI * 2;
    return THREE.MathUtils.clamp(rel, -1.9, 1.9);
  }

  /**
   * Gun arm out at the target, chest turned part way. On the bike the chest
   * turns less, the head follows the aim and the left hand stays on its grip.
   */
  private aimGun(sim: Sim, riding: boolean): void {
    const b = this.b;
    const rel = this.aimRel;
    this.layer([b.chest, b.neck, b.head, b.armR, b.foreR, b.armL, b.foreL, b.handL], this.aimW, () => {
      const up = this.up();
      // increasing sim angle turns right; right of a +z model is -x, a negative turn about up
      turnAxis(b.chest, up, -rel * (riding ? 0.2 : 0.4));
      if (riding) turnAxis(b.head, up, -rel * 0.3);
      const a = (riding ? sim.bike.heading : sim.player.facing) + rel;
      const shoulder = b.armR.getWorldPosition(new THREE.Vector3());
      this.aimTarget.copy(shoulder).add(new THREE.Vector3(Math.cos(a), -0.06, Math.sin(a)).multiplyScalar(40));
      aim(b.armR, b.foreR.getWorldPosition(new THREE.Vector3()), this.aimTarget);
      aim(b.foreR, b.handR.getWorldPosition(new THREE.Vector3()), this.aimTarget);
      if (riding) this.handOnGrip(1);
    });
  }

  private drawGun(): void {
    if (!this.gunDrawn) {
      this.root.add(this.gun);
      this.gun.scale.setScalar(1);
      this.gunDrawn = true;
    }
    const hand = this.b.handR.getWorldPosition(new THREE.Vector3());
    this.gun.position.copy(this.root.worldToLocal(hand.clone()));
    this.gun.lookAt(this.aimTarget);
  }

  /**
   * The riding slash (k from 0 to 1): the sword hand sweeps up past the head,
   * down and out to the right and back to its grip, the chest turning with it.
   * A standing slash clip here threw the whole upper body about.
   */
  private rideSlash(k: number): void {
    const b = this.b;
    turnAxis(b.chest, this.up(), -0.25 * Math.sin(Math.PI * k));
    this.handOnGrip(1);
    const shoulder = this.root.worldToLocal(b.armR.getWorldPosition(new THREE.Vector3()));
    const grip = this.gripWrist(-1);
    const path = new THREE.CatmullRomCurve3([grip, ...RIDE_SLASH.map((p) => p.clone().add(shoulder)), grip.clone()]);
    let i = 0;
    while (i < RIDE_SLASH_AT.length - 2 && k > RIDE_SLASH_AT[i + 1]) i++;
    const f = THREE.MathUtils.clamp((k - RIDE_SLASH_AT[i]) / (RIDE_SLASH_AT[i + 1] - RIDE_SLASH_AT[i]), 0, 1);
    const hand = this.root.localToWorld(path.getPoint((i + f) / (RIDE_SLASH_AT.length - 1)));
    const pole = this.root.localToWorld(shoulder.add(new THREE.Vector3(-4, -1, -2.5)));
    reach(b.armR, b.foreR, b.handR, hand, pole);
  }

  private whistle(sim: Sim): void {
    const pl = sim.player;
    const b = this.b;
    const k = 1 - pl.whistleT / sim.t.bikeCall.whistleTime;
    const wave = Math.sin(k * Math.PI * 3) * 0.6;
    const head = b.head.getWorldPosition(new THREE.Vector3());
    const up = this.root.localToWorld(new THREE.Vector3(-1.4 + wave, 0, 0.6)).sub(this.root.getWorldPosition(new THREE.Vector3()));
    const target = head.add(up).add(new THREE.Vector3(0, 3.2, 0));
    const pole = this.root.localToWorld(new THREE.Vector3(-6, 12, -2));
    reach(b.armR, b.foreR, b.handR, target, pole);
  }

  private holdKatana(): void {
    const b = this.b;
    if (!this.katanaDrawn) {
      this.root.add(this.katana);
      this.katanaDrawn = true;
    }
    const hand = b.handR.getWorldPosition(new THREE.Vector3());
    const fore = b.foreR.getWorldPosition(new THREE.Vector3());
    const dir = hand.clone().sub(fore).normalize();
    // blade out past the fist, along the forearm (the model's blade runs up +y)
    this.katana.position.copy(this.root.worldToLocal(hand.clone().addScaledVector(dir, 0.4)));
    const q = new THREE.Quaternion().setFromUnitVectors(Y, dir);
    this.katana.quaternion.copy(this.root.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q));
  }
}
