/**
 * Wanted level, 0 to 5 stars. Rises with loud kills and civilian damage,
 * decays when the police cannot see you. Isolated so it can be tuned or
 * switched off (`tuning.heat.enabled`).
 */
import type { Tuning } from '../config/tuning';
import type { SimEvent } from './events';

export class Heat {
  value = 0;
  /** Seconds since the last crime. */
  sinceCrime = 99;
  /** True while any police unit can see the player. */
  spotted = false;
  enabled: boolean;
  private lastStars = 0;

  constructor(
    private readonly t: Tuning,
    private readonly emit: (e: SimEvent) => void,
  ) {
    this.enabled = t.heat.enabled;
  }

  get stars(): number {
    return Math.min(this.t.heat.max, Math.floor(this.value + 1e-6));
  }

  add(amount: number, _x = 0, _y = 0): void {
    if (!this.enabled || amount <= 0) return;
    this.value = Math.min(this.t.heat.max + 0.99, this.value + amount);
    this.sinceCrime = 0;
    this.check();
  }

  update(dt: number): void {
    if (!this.enabled) {
      this.value = 0;
      this.check();
      return;
    }
    this.sinceCrime += dt;
    if (!this.spotted && this.sinceCrime > this.t.heat.decayDelay) {
      this.value = Math.max(0, this.value - this.t.heat.decayRate * dt);
    }
    this.check();
  }

  reset(): void {
    this.value = 0;
    this.sinceCrime = 99;
    this.check();
  }

  private check(): void {
    const s = this.stars;
    if (s !== this.lastStars) {
      this.lastStars = s;
      this.emit({ type: 'heat', stars: s });
    }
  }
}
