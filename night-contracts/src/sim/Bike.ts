/**
 * Arcade superbike handling. The model is independent of Rapier so it can be
 * unit tested: `control()` produces the commanded velocity, the physics world
 * resolves collisions, then `resolve()` reads back what really happened.
 */
import type { Tuning } from '../config/tuning';
import { angleDiff, clamp, damp, dampAngle, wrapAngle } from '../core/math';

export interface BikeControls {
  steer: number;
  throttle: number;
  brake: number;
  drift: boolean;
}

export class Bike {
  x = 0;
  y = 0;
  z = 0;
  /** Where the bike points. */
  heading = 0;
  /** Direction of travel (lags heading while drifting). */
  velAngle = 0;
  /** Signed speed along velAngle (negative when reversing). */
  speed = 0;
  yawRate = 0;
  lean = 0;
  pitch = 0;
  wheelSpin = 0;
  skidding = false;
  drifting = false;
  riderless = false;
  /** Riderless but standing on its stand (stepped off at low speed). */
  parked = false;
  /** Riderless and riding itself to the player after a whistle (see BikeCall). */
  auto = false;
  fallen = false;
  /** 0 upright to 1 lying on its side. */
  fallT = 0;
  /** Side it fell towards: 1 right, -1 left. */
  fallSide = 1;
  /** Throttle actually applied, for engine audio. */
  throttle = 0;
  /** Commanded velocity this step. */
  cmdX = 0;
  cmdY = 0;
  /** Largest impact (delta-v) seen in the last resolve. */
  lastImpact = 0;
  impactNX = 0;
  impactNY = 0;
  // previous state for interpolation
  px = 0;
  py = 0;
  pz = 0;
  pHeading = 0;
  pLean = 0;

  constructor(private readonly t: Tuning) {}

  place(x: number, y: number, z: number, heading: number): void {
    this.x = this.px = x;
    this.y = this.py = y;
    this.z = this.pz = z;
    this.heading = this.pHeading = heading;
    this.velAngle = heading;
    this.speed = 0;
    this.yawRate = 0;
    this.lean = this.pLean = 0;
    this.fallen = false;
    this.parked = false;
    this.auto = false;
    this.fallT = 0;
  }

  snapshot(): void {
    this.px = this.x;
    this.py = this.y;
    this.pz = this.z;
    this.pHeading = this.heading;
    this.pLean = this.lean;
  }

  /** Engine acceleration available at a given forward speed. */
  accelAt(speed: number): number {
    const b = this.t.bike;
    const k = clamp(speed / b.topSpeed, 0, 1);
    return b.accel * (1 - Math.pow(k, b.accelExponent));
  }

  /** Maximum yaw rate at a given speed. */
  steerRateAt(speed: number): number {
    const b = this.t.bike;
    const s = Math.abs(speed);
    const k = Math.pow(clamp(s / b.topSpeed, 0, 1), 0.7);
    const fade = clamp(s / b.steerFadeSpeed, 0, 1);
    return (b.steerRateLow + (b.steerRateHigh - b.steerRateLow) * k) * fade;
  }

  control(c: BikeControls, dt: number, wet: number): void {
    const b = this.t.bike;
    // nobody steering: a riderless bike coasts unless it is riding itself over
    const ghost = this.riderless && !this.auto;
    const ctl = ghost ? { steer: 0, throttle: 0, brake: 0, drift: false } : c;
    const gripMul = 1 + (b.wetGripMul - 1) * wet;
    const brakeMul = 1 + (b.wetBrakeMul - 1) * wet;

    this.drifting = ctl.drift && this.speed > 60;
    const dir = this.speed >= 0 ? 1 : -1;
    const yawTarget = ctl.steer * this.steerRateAt(this.speed) * dir * (this.drifting ? b.driftYawMul : 1);
    this.yawRate = damp(this.yawRate, yawTarget, b.yawResponse, dt);
    this.heading = wrapAngle(this.heading + this.yawRate * dt);

    // longitudinal
    let s = this.speed;
    this.throttle = ctl.throttle;
    if (ctl.throttle > 0) {
      if (s < 0) s = Math.min(0, s + b.brake * ctl.throttle * dt);
      else s += this.accelAt(s) * ctl.throttle * dt;
    }
    if (ctl.brake > 0) {
      if (s > 2) s = Math.max(0, s - b.brake * brakeMul * ctl.brake * dt);
      else if (ctl.throttle <= 0) s = Math.max(-b.reverseMax, s - b.reverseAccel * ctl.brake * dt);
    }
    const drag = b.rollingDrag + b.aeroDrag * s * s;
    if (ctl.throttle <= 0 || s > b.topSpeed) {
      s = s > 0 ? Math.max(0, s - drag * dt) : Math.min(0, s + drag * dt);
    }
    if (ghost) s = s > 0 ? Math.max(0, s - b.riderlessFriction * dt) : Math.min(0, s + b.riderlessFriction * dt);
    if (this.drifting) s = Math.max(0, s - b.driftSpeedLoss * dt);
    this.speed = s;

    // lateral grip: the velocity direction chases the heading
    if (s < 0) this.velAngle = this.heading;
    else this.velAngle = dampAngle(this.velAngle, this.heading, (this.drifting ? b.driftGrip : b.grip) * gripMul, dt);
    const slip = Math.abs(angleDiff(this.velAngle, this.heading));
    this.skidding = (slip > b.skidAngle && Math.abs(s) > 40) || (ctl.brake > 0.6 && s > 150);

    // lean follows the turn: atan(v * yawRate / g) in metres
    const g = 9.81 * 8;
    // once down, the fall itself is fallT (the view tips it onto fallSide)
    const leanTarget = this.fallen ? this.lean : clamp(Math.atan((Math.abs(s) * this.yawRate) / g), -b.maxLean, b.maxLean);
    this.lean = damp(this.lean, leanTarget, b.leanResponse, dt);

    if (ghost && !this.fallen && !this.parked && Math.abs(s) < b.fallOverSpeed) {
      this.fallen = true;
      this.fallSide = this.lean < 0 ? -1 : 1;
    }
    if (this.fallen) this.fallT = Math.min(1, this.fallT + dt * 2.5);

    this.wheelSpin += (s / 4.4) * dt;
    this.cmdX = Math.cos(this.velAngle) * s;
    this.cmdY = Math.sin(this.velAngle) * s;
  }

  /** Read back the velocity after physics. Returns the impact speed. */
  resolve(vx: number, vy: number): number {
    const dx = this.cmdX - vx;
    const dy = this.cmdY - vy;
    const impact = Math.hypot(dx, dy);
    this.lastImpact = impact;
    if (impact > 1e-6) {
      this.impactNX = dx / impact;
      this.impactNY = dy / impact;
    }
    if (impact > 2) {
      const mag = Math.hypot(vx, vy);
      if (mag > 4) {
        const moving = Math.atan2(vy, vx);
        this.velAngle = this.speed >= 0 ? moving : wrapAngle(moving + Math.PI);
      }
      this.speed = this.speed >= 0 ? mag : -mag;
    }
    return impact;
  }
}
