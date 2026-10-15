/**
 * Rain as a random weather event. Pure and seeded: rain starts with a chance
 * per game hour, lasts a few game hours, the road wets up and dries slowly,
 * and lightning strikes now and then.
 */
import type { Tuning } from '../config/tuning';
import type { RNG } from '../core/RNG';

export type WeatherMode = 'auto' | 'clear' | 'rain';

export class Weather {
  raining: boolean;
  wet: number;
  mode: WeatherMode = 'auto';
  private rainLeftHours = 0;
  private hourAcc = 0;
  private lightningT: number;

  constructor(
    private readonly t: Tuning,
    private readonly rng: RNG,
  ) {
    this.raining = t.weather.startRaining;
    this.wet = this.raining ? 0.85 : 0;
    this.rainLeftHours = this.raining ? rng.range(t.weather.rainHours[0], t.weather.rainHours[1]) : 0;
    this.lightningT = rng.range(t.weather.lightningInterval[0], t.weather.lightningInterval[1]);
  }

  /** Advance by sim seconds; `gameHours` is how far the clock moved. Returns true on a lightning strike. */
  update(dt: number, gameHours: number): boolean {
    const w = this.t.weather;
    if (this.mode === 'clear') this.raining = false;
    else if (this.mode === 'rain') this.raining = true;
    else {
      this.hourAcc += gameHours;
      if (this.raining) {
        this.rainLeftHours -= gameHours;
        if (this.rainLeftHours <= 0) this.raining = false;
      }
      while (this.hourAcc >= 1) {
        this.hourAcc -= 1;
        if (!this.raining && this.rng.chance(w.rainChancePerHour)) {
          this.raining = true;
          this.rainLeftHours = this.rng.range(w.rainHours[0], w.rainHours[1]);
        }
      }
    }
    if (this.raining) this.wet = Math.min(1, this.wet + dt / w.wetRampSeconds);
    else this.wet = Math.max(0, this.wet - dt / w.dryRampSeconds);

    if (!this.raining) return false;
    this.lightningT -= dt;
    if (this.lightningT <= 0) {
      this.lightningT = this.rng.range(w.lightningInterval[0], w.lightningInterval[1]);
      return true;
    }
    return false;
  }
}
