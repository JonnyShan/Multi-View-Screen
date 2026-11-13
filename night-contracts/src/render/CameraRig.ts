/**
 * Low third-person chase camera. Follows the bike heading with damping, pulls
 * back and widens with speed, eases back on the throttle and in on the brakes,
 * looks a little into turns, avoids clipping into buildings and shakes on
 * impacts. Separate behaviour on foot, airborne and on a roof.
 */
import * as THREE from 'three';
import type { Tuning } from '../config/tuning';
import { angleDiff, clamp, dampFactor, lerp } from '../core/math';
import type { Sim } from '../sim/Sim';

/**
 * Vertical field of view (degrees) for a screen wider than `refAspect`. `keep`
 * 0 holds the vertical angle (the sides stretch), 1 holds the horizontal angle
 * (the hero shrinks). In between trims part of the extra width.
 */
export function wideFov(fov: number, aspect: number, refAspect: number, keep: number): number {
  if (aspect <= refAspect) return fov;
  const half = Math.tan((fov * Math.PI) / 360) * Math.pow(refAspect / aspect, keep);
  return (Math.atan(half) * 360) / Math.PI;
}

export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;
  /** Extra yaw from touch drag or keys, decays back to zero on the bike. */
  orbit = 0;
  /** Current camera yaw in sim angle terms (used for camera relative input). */
  yaw = 0;
  private trauma = 0;
  private dist: number;
  private height: number;
  private readonly focus = new THREE.Vector3();
  private readonly look = new THREE.Vector3();
  private readonly pos = new THREE.Vector3();
  /** Smoothed camera position before shake, so shake never feeds back into the follow. */
  private readonly smooth = new THREE.Vector3();
  private readonly noiseSeed = Math.random() * 100;
  private time = 0;
  private initialised = false;
  /** Bike focus last frame (sim x, y), so the camera can ride along with it. */
  private readonly lastFocus = new THREE.Vector2();
  private carry = false;
  /** A lagging copy of the bike speed: the gap to the real speed is the smoothed acceleration. */
  private lagSpeed = 0;
  private turnRate = 0;

  constructor(private readonly t: Tuning) {
    const c = t.camera;
    this.camera = new THREE.PerspectiveCamera(c.fov, 16 / 9, 1.5, c.far);
    this.dist = c.distance;
    this.height = c.height;
  }

  shake(amount: number): void {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  get focusPoint(): THREE.Vector3 {
    return this.focus;
  }

  update(sim: Sim, alpha: number, dt: number): void {
    const c = this.t.camera;
    const pl = sim.player;
    const b = sim.bike;
    this.time += dt;
    this.lastMode = pl.mode;
    let fx: number;
    let fy: number;
    let fz: number;
    let targetYaw: number;
    let dist: number;
    let height: number;
    let fov = c.fov;
    let lookAhead = c.lookAhead;
    let yawRate = c.yawDamping;
    let pull = 0;

    if (pl.mode === 'riding') {
      fx = b.px + (b.x - b.px) * alpha;
      fy = b.py + (b.y - b.py) * alpha;
      fz = b.pz + (b.z - b.pz) * alpha;
      const sp = Math.abs(b.speed);
      const k = clamp(sp / this.t.bike.topSpeed, 0, 1);
      // follow a blend of heading and travel direction so drifts read well
      targetYaw = b.speed < -5 ? b.heading : b.velAngle + angleDiff(b.velAngle, b.heading) * 0.35;
      // ease back while speeding up and in while braking. The lag is clamped so a
      // wall hit reads as one hard stop and lets go at once.
      const gap = 1 / (c.accelPull * c.accelPullRate); // speed gap per unit of pull
      this.lagSpeed = clamp(this.lagSpeed + (sp - this.lagSpeed) * dampFactor(c.accelPullRate, dt), sp - c.accelPullMax * gap, sp + c.brakeDiveMax * gap);
      pull = (sp - this.lagSpeed) / gap;
      dist = lerp(c.distance, c.distanceFast, k);
      height = lerp(c.height, c.heightFast, k);
      fov = lerp(c.fov, c.fovFast, k * k);
      lookAhead = lerp(c.lookAhead, c.lookAheadFast, k);
      this.orbit *= Math.exp(-dt * 2.5);
      this.turnRate += (b.yawRate - this.turnRate) * dampFactor(c.turnLookRate, dt);
    } else {
      this.lagSpeed = Math.abs(b.speed);
      this.turnRate -= this.turnRate * dampFactor(c.turnLookRate, dt);
      fx = pl.px + (pl.x - pl.px) * alpha;
      fy = pl.py + (pl.y - pl.py) * alpha;
      fz = pl.pz + (pl.z - pl.pz) * alpha;
      const speed = Math.hypot(pl.vx, pl.vy);
      if (pl.mode === 'air') {
        targetYaw = speed > 20 ? Math.atan2(pl.vy, pl.vx) : this.yaw;
        dist = c.airDistance;
        height = c.airHeight;
        fov = c.fov + 6;
      } else if (pl.mode === 'roof') {
        const car = sim.cars.find((k) => k.id === pl.roofCar);
        targetYaw = car ? car.a : this.yaw;
        dist = c.roofDistance;
        height = c.roofHeight;
        fov = c.fov + 4;
        yawRate = 3;
      } else {
        // on foot: lazily swing behind the direction of travel
        targetYaw = speed > 12 ? Math.atan2(pl.vy, pl.vx) : this.yaw;
        yawRate = speed > 12 ? 2.2 : 0;
        dist = c.footDistance;
        height = c.footHeight;
        lookAhead = 8;
      }
    }

    if (!this.initialised) {
      this.yaw = targetYaw;
      this.initialised = true;
    }
    if (pl.mode === 'riding') {
      this.yaw += angleDiff(this.yaw, targetYaw + this.orbit) * dampFactor(yawRate, dt);
    } else if (pl.mode === 'foot') {
      this.yaw += this.pendingOrbit;
      const rel = Math.abs(angleDiff(this.yaw, targetYaw));
      if (yawRate > 0 && rel < 1.6) this.yaw += angleDiff(this.yaw, targetYaw) * dampFactor(yawRate * 0.5, dt);
    } else {
      this.yaw += this.pendingOrbit;
      if (yawRate > 0) this.yaw += angleDiff(this.yaw, targetYaw) * dampFactor(yawRate * 0.5, dt);
    }
    this.pendingOrbit = 0;

    this.dist += (dist - this.dist) * dampFactor(4, dt);
    this.height += (height - this.height) * dampFactor(4, dt);
    // tall screens (an upright phone) widen the vertical angle so the road ahead stays in view,
    // wide phones (19.5:9) narrow it a little so the hero stays big and the sides do not stretch
    const aspect = this.camera.aspect;
    // a hidden page can report a 0x0 window, which makes the aspect NaN or 0: keep the last angle
    if (!(aspect > 0) || !Number.isFinite(aspect)) fov = this.camera.fov;
    else if (aspect < 1.2) fov = Math.min(100, fov * Math.pow(Math.min(1.5, 1.2 / aspect), 0.8));
    else fov = wideFov(fov, aspect, c.wideAspect, c.wideFovKeep);
    // the first frame starts at the right angle instead of zooming in on wide phones
    this.camera.fov = this.firstFrame ? fov : this.camera.fov + (fov - this.camera.fov) * dampFactor(3, dt);

    // focus in three space
    this.focus.set(fx, fz + c.lookHeight, fy);
    const cy = Math.cos(this.yaw);
    const sy = Math.sin(this.yaw);
    // look a little toward the corner exit (a positive yaw rate turns right)
    const lookYaw = this.yaw + clamp(this.turnRate * c.turnLook, -c.turnLookMax, c.turnLookMax);
    this.look.set(fx + Math.cos(lookYaw) * lookAhead, fz + c.lookHeight, fy + Math.sin(lookYaw) * lookAhead);

    // clip avoidance against buildings in the city index (2D rays in sim space)
    const free = this.dist + pull;
    let d = free;
    const hit = sim.city.index.raycast(fx, fy, -cy, -sy, d + c.clipPadding, true, fz + this.height * 0.5);
    if (hit >= 0) d = Math.max(10, hit - c.clipPadding);
    const clipK = d / free;
    const h = this.height * (0.75 + 0.25 * clipK) + (1 - clipK) * 8;
    this.pos.set(fx - cy * d, fz + h, fy - sy * d);
    // never below the ground under the camera
    const g = sim.city.heightAt(this.pos.x, this.pos.z) + 3;
    if (this.pos.y < g) this.pos.y = g;

    // on the bike, move along with it before smoothing: a plain follow trails by
    // speed / posDamping, which is about 30 units at top speed on a 60 Hz screen
    if (pl.mode === 'riding') {
      if (this.carry) {
        this.smooth.x += fx - this.lastFocus.x;
        this.smooth.z += fy - this.lastFocus.y;
      }
      this.lastFocus.set(fx, fy);
    }
    this.carry = pl.mode === 'riding';

    if (this.firstFrame) {
      this.smooth.copy(this.pos);
      this.firstFrame = false;
    } else {
      this.smooth.lerp(this.pos, dampFactor(c.posDamping, dt));
    }
    this.camera.position.copy(this.smooth);

    // shake: an offset on top of the smoothed position, the same at any frame rate
    this.trauma = Math.max(0, this.trauma - dt * c.shakeDecay * 0.3);
    const s = this.trauma * this.trauma;
    if (s > 0.0001) {
      const n = (k: number): number => Math.sin(this.time * 37 + k * 11.3 + this.noiseSeed) * 0.6 + Math.sin(this.time * 23 + k * 5.1) * 0.4;
      this.camera.position.x += n(1) * s * c.shakeMove;
      this.camera.position.y += n(2) * s * c.shakeMove * 0.75;
      this.camera.position.z += n(3) * s * c.shakeMove;
    }
    this.camera.lookAt(this.look);
    if (s > 0.0001) this.camera.rotation.z += Math.sin(this.time * 29 + this.noiseSeed) * s * 0.05;
    this.camera.updateProjectionMatrix();
  }

  private firstFrame = true;
  private pendingOrbit = 0;

  /** Rotate the camera (touch drag, arrow keys) in radians. */
  addOrbit(delta: number): void {
    if (this.lastMode === 'riding') this.orbit = clamp(this.orbit + delta, -2.6, 2.6);
    else this.pendingOrbit += delta;
  }

  private lastMode = 'riding';
}
