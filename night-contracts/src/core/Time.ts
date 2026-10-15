/** Game clock helpers and the presentation time-scale controller. */

export function formatClock(hours: number): string {
  const h = Math.floor(((hours % 24) + 24) % 24);
  const m = Math.floor((((hours % 1) + 1) % 1) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Slow motion and hit stop. Purely presentational: it scales how fast real
 * time feeds the fixed-step sim.
 */
export class TimeScale {
  private slowLeft = 0;
  private slowScale = 1;
  private stopLeft = 0;

  slowMo(scale: number, realSeconds: number): void {
    this.slowScale = Math.min(this.slowLeft > 0 ? this.slowScale : 1, scale);
    this.slowLeft = Math.max(this.slowLeft, realSeconds);
  }

  hitStop(realSeconds: number): void {
    this.stopLeft = Math.max(this.stopLeft, realSeconds);
  }

  /** Advance by real time and return the current scale. */
  update(realDt: number): number {
    if (this.stopLeft > 0) {
      this.stopLeft -= realDt;
      return 0.02;
    }
    if (this.slowLeft > 0) {
      this.slowLeft -= realDt;
      // ease back to full speed in the last 30% of the window
      return this.slowScale;
    }
    return 1;
  }
}
