/** Player state. Mode logic lives in Sim (movement) and Combat (weapons). */
import type { Tuning } from '../config/tuning';

export type PlayerMode = 'riding' | 'foot' | 'air' | 'roof' | 'down' | 'dead';

export class Player {
  mode: PlayerMode = 'riding';
  x = 0;
  y = 0;
  z = 0;
  vx = 0;
  vy = 0;
  vz = 0;
  facing = 0;
  health: number;
  cash = 0;
  // weapons
  ammo: number;
  reloadT = 0;
  fireT = 0;
  slashT = 0;
  /** Seconds since the last slash, for animation. */
  slashAnim = 9;
  firing = false;
  aimX = 0;
  aimY = 0;
  /** Car id the gun is locked onto by aim assist, or -1. */
  assistTarget = -1;
  // status timers
  hitCooldown = 0;
  sinceHurt = 99;
  downT = 0;
  deadT = 0;
  /** True when the air phase came from a crash (damage applies on landing). */
  thrown = false;
  pendingLandDamage = 0;
  leaping = false;
  roofCar = -1;
  roofT = 0;
  roofLX = 0;
  roofLY = 0;
  /** Counts down through the whistle pose. */
  whistleT = 0;
  /** Seconds in current mode, for animation. */
  modeT = 0;
  // interpolation
  px = 0;
  py = 0;
  pz = 0;
  pFacing = 0;

  constructor(t: Tuning) {
    this.health = t.player.maxHealth;
    this.ammo = t.gun.magazine;
  }

  setMode(m: PlayerMode): void {
    if (this.mode !== m) this.modeT = 0;
    this.mode = m;
  }

  snapshot(): void {
    this.px = this.x;
    this.py = this.y;
    this.pz = this.z;
    this.pFacing = this.facing;
  }

  get alive(): boolean {
    return this.mode !== 'dead';
  }
}
