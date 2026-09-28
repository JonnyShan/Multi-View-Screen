/**
 * A car: Rapier dynamic body driven by an arcade controller. AI modules set
 * `targetSpeed` and `steer`; the controller turns that into velocities and
 * reads back collisions as impact damage.
 */
import type { CarModel, CarSpec, KillMethod, Tuning } from '../config/tuning';
import { clamp, damp, fwdX, fwdY, rightX, rightY } from '../core/math';
import { yawOf, type Body } from './Physics';

export type CarKind = 'civilian' | 'target' | 'escort' | 'police';
export type CarMode = 'traffic' | 'parked' | 'route' | 'follow' | 'hunt' | 'flee' | 'roadblock' | 'wreck' | 'idle' | 'exit';

export interface Waypoint {
  x: number;
  y: number;
  /** Speed limit at this point. */
  speed: number;
  /** Intersection node this point belongs to (turn curve), or -1. */
  node: number;
  /** Node the car enters next when this is the last lane point before a turn. */
  gate: number;
  turn: number;
}

export class Car {
  readonly spec: CarSpec;
  x = 0;
  y = 0;
  a = 0;
  vx = 0;
  vy = 0;
  w = 0;
  /** Forward speed (signed). */
  speed = 0;
  px = 0;
  py = 0;
  pa = 0;
  hp: number;
  maxHp: number;
  dead = false;
  deadT = 0;
  exploded = false;
  explodeT = -1;
  burning = false;
  /** Blown tyres: front left, front right, rear left, rear right. */
  blown = [false, false, false, false];
  spinT = 0;
  limp = false;
  // controls (set by AI)
  targetSpeed = 0;
  steer = 0;
  handbrake = false;
  // AI state
  mode: CarMode = 'traffic';
  waypoints: Waypoint[] = [];
  wpIndex = 0;
  lastNode = -1;
  nextNode = -1;
  heading = -1;
  personality = 1;
  waitT = 0;
  stuckT = 0;
  reverseT = 0;
  panicT = 0;
  inIntersection = -1;
  intersectionFrom = 0;
  intersectionTurn = 0;
  routeGoal = -1;
  alerted = false;
  backoffT = 0;
  fireT = 0;
  burstLeft = 0;
  shoots = false;
  rams = false;
  followId = -1;
  siren = false;
  brakeLight = false;
  /** Visual wheel spin angle. */
  wheelSpin = 0;
  // damage attribution
  lastHitBy: 'player' | 'env' = 'env';
  lastMethod: KillMethod | null = null;
  lastHitTime = -99;
  // commanded velocity for impact detection
  cmdX = 0;
  cmdY = 0;
  lastImpact = 0;

  constructor(
    readonly id: number,
    public kind: CarKind,
    public model: CarModel,
    public color: number,
    public body: Body,
    t: Tuning,
    hp?: number,
  ) {
    this.spec = t.car.specs[model];
    this.maxHp = this.hp = hp ?? this.spec.hp;
  }

  /** Half length and width, so a Car is usable as an OBB. */
  get hl(): number {
    return this.spec.hl;
  }

  get hw(): number {
    return this.spec.hw;
  }

  get blownCount(): number {
    return this.blown.reduce((n, b) => n + (b ? 1 : 0), 0);
  }

  get alive(): boolean {
    return !this.dead;
  }

  snapshot(): void {
    this.px = this.x;
    this.py = this.y;
    this.pa = this.a;
  }

  readBody(): void {
    const p = this.body.translation();
    const v = this.body.linvel();
    this.x = p.x;
    this.y = p.y;
    this.a = yawOf(this.body);
    this.vx = v.x;
    this.vy = v.y;
    this.w = this.body.angvel().z;
    this.speed = this.vx * fwdX(this.a) + this.vy * fwdY(this.a);
  }

  /** Arcade controller: sets body velocities from targetSpeed and steer. */
  drive(t: Tuning, dt: number, wet: number): void {
    const c = t.car;
    const a = this.a;
    const fx = fwdX(a);
    const fy = fwdY(a);
    const rx = rightX(a);
    const ry = rightY(a);
    let vf = this.vx * fx + this.vy * fy;
    let vr = this.vx * rx + this.vy * ry;
    let w = this.w;
    const blown = this.blownCount;

    if (this.dead) {
      vf *= Math.exp(-1.6 * dt);
      vr *= Math.exp(-3 * dt);
      w *= Math.exp(-2 * dt);
    } else if (this.spinT > 0) {
      this.spinT -= dt;
      vf *= Math.exp(-0.35 * dt);
      vr *= Math.exp(-c.spinGrip * dt);
      w *= Math.exp(-c.spinAngularDamp * dt);
    } else {
      let maxV = this.spec.maxSpeed * (blown ? c.blownTyreSpeedMul : 1);
      if (this.limp) maxV = Math.min(maxV, t.katana.limpSpeed);
      const target = clamp(this.targetSpeed, -maxV * 0.35, maxV);
      if (target > vf) vf = Math.min(target, vf + this.spec.accel * dt * (vf < 0 ? 2 : 1));
      else vf = Math.max(target, vf - c.brake * dt * (vf > 0 ? 1 : 0.6));
      const gripMul = (blown ? c.blownTyreGrip : 1) * (1 - 0.3 * wet) * (this.handbrake ? 0.2 : 1);
      vr *= Math.exp(-c.grip * gripMul * dt);
      const steer = clamp(this.steer, -c.maxSteer, c.maxSteer);
      let desiredW = (vf * Math.tan(steer)) / this.spec.wheelbase;
      // a blown front tyre pulls to its side
      if (this.blown[0]) desiredW -= 0.12 * Math.min(1, Math.abs(vf) / 100);
      if (this.blown[1]) desiredW += 0.12 * Math.min(1, Math.abs(vf) / 100);
      w = damp(w, desiredW, c.yawResponse, dt);
    }
    this.cmdX = fx * vf + rx * vr;
    this.cmdY = fy * vf + ry * vr;
    this.body.setLinvel({ x: this.cmdX, y: this.cmdY, z: 0 }, true);
    this.body.setAngvel({ x: 0, y: 0, z: w }, true);
    this.brakeLight = !this.dead && (this.targetSpeed < vf - 10 || this.targetSpeed <= 1);
    this.wheelSpin += (vf / 2.8) * dt;
  }

  /** After the physics step: returns the delta-v impact magnitude. */
  afterPhysics(): number {
    this.readBody();
    const impact = Math.hypot(this.cmdX - this.vx, this.cmdY - this.vy);
    this.lastImpact = impact;
    return impact;
  }
}
