/**
 * Fixed timestep loop: the sim steps at a fixed rate, rendering interpolates
 * between the last two sim states with `alpha`.
 *
 * `timeScale` slows the rate at which real time feeds the sim (slow motion,
 * hit stop) without changing the sim step size, so the sim stays deterministic.
 */
export interface LoopCallbacks {
  step(dt: number): void;
  render(alpha: number, frameDt: number): void;
}

export class Loop {
  readonly dt: number;
  timeScale = 1;
  paused = false;
  private acc = 0;
  private last = 0;
  private raf = 0;
  private running = false;

  constructor(
    hz: number,
    private readonly maxSteps: number,
    private readonly cb: LoopCallbacks,
  ) {
    this.dt = 1 / hz;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const frame = (now: number): void => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(frame);
      const frameDt = Math.min(0.25, (now - this.last) / 1000);
      this.last = now;
      this.tick(frameDt);
    };
    this.raf = requestAnimationFrame(frame);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  /** Advance by a real-time delta. Exposed for tests. */
  tick(frameDt: number): void {
    if (!this.paused) {
      this.acc += frameDt * this.timeScale;
      let steps = 0;
      while (this.acc >= this.dt && steps < this.maxSteps) {
        this.cb.step(this.dt);
        this.acc -= this.dt;
        steps++;
      }
      if (steps >= this.maxSteps) this.acc = Math.min(this.acc, this.dt);
    }
    this.cb.render(this.paused ? 1 : this.acc / this.dt, frameDt);
  }
}
