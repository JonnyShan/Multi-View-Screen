/**
 * Keyboard + mouse, gamepad and touch mapped to one Intent per sim tick.
 * Presses are latched until the next sample so no tap is ever lost between
 * fixed steps.
 */
import { emptyIntent, type Intent } from '../sim/Intent';

export type Action = 'fire' | 'slash' | 'jump' | 'drift' | 'answer' | 'pause' | 'debug' | 'interact';

export interface TouchState {
  stickX: number;
  stickY: number;
  fire: boolean;
  drift: boolean;
  /** Camera drag delta in pixels since last read. */
  lookDX: number;
}

const KEYMAP: Record<string, Action | 'up' | 'down' | 'left' | 'right' | 'camLeft' | 'camRight'> = {
  KeyW: 'up',
  KeyS: 'down',
  KeyA: 'left',
  KeyD: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'camLeft',
  ArrowRight: 'camRight',
  ShiftLeft: 'drift',
  ShiftRight: 'drift',
  Space: 'fire',
  KeyK: 'slash',
  KeyJ: 'slash',
  KeyE: 'jump',
  KeyF: 'jump',
  Enter: 'answer',
  NumpadEnter: 'answer',
  Escape: 'pause',
  KeyP: 'pause',
  F3: 'debug',
  Backquote: 'debug',
};

export class InputMap {
  readonly touch: TouchState = { stickX: 0, stickY: 0, fire: false, drift: false, lookDX: 0 };
  private readonly held = new Set<string>();
  private readonly presses = new Map<Action, number>();
  private steer = 0;
  private mouseX = 0;
  private mouseY = 0;
  private mouseFire = false;
  private mouseActiveT = -99;
  private now = 0;
  /** Latest mouse ground point (set by main each frame), or null. */
  aimPoint: { x: number; y: number } | null = null;
  usingGamepad = false;
  usingTouch = false;
  enabled = true;
  onAction: ((a: Action) => void) | null = null;

  constructor(target: HTMLElement) {
    window.addEventListener('keydown', (e) => this.key(e, true));
    window.addEventListener('keyup', (e) => this.key(e, false));
    window.addEventListener('blur', () => this.held.clear());
    target.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.mouseActiveT = this.now;
      this.usingTouch = false;
    });
    target.addEventListener('mousedown', (e) => {
      this.mouseActiveT = this.now;
      if (e.button === 0) this.mouseFire = true;
      if (e.button === 2) this.press('slash');
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouseFire = false;
    });
    target.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private key(e: KeyboardEvent, down: boolean): void {
    const a = KEYMAP[e.code];
    if (!a) return;
    if (e.code === 'Space' || e.code.startsWith('Arrow') || e.code === 'F3') e.preventDefault();
    this.usingTouch = false;
    if (down) {
      if (!this.held.has(a) && (a === 'slash' || a === 'jump' || a === 'answer' || a === 'pause' || a === 'debug' || a === 'interact')) this.press(a);
      this.held.add(a);
    } else this.held.delete(a);
  }

  press(a: Action): void {
    if (a === 'pause' || a === 'debug') {
      this.onAction?.(a);
      return;
    }
    this.presses.set(a, (this.presses.get(a) ?? 0) + 1);
  }

  /** Mouse position in client pixels while the mouse is the active pointer. */
  get mouse(): { x: number; y: number } | null {
    return this.now - this.mouseActiveT < 3 && !this.usingTouch && !this.usingGamepad ? { x: this.mouseX, y: this.mouseY } : null;
  }

  /** Camera orbit input in radians for this frame. */
  orbit(dt: number): number {
    let o = 0;
    if (this.held.has('camLeft')) o -= 2.2 * dt;
    if (this.held.has('camRight')) o += 2.2 * dt;
    o += this.touch.lookDX * 0.006;
    this.touch.lookDX = 0;
    const pad = this.gamepad();
    if (pad) {
      const rx = pad.axes[2] ?? 0;
      if (Math.abs(rx) > 0.15) o += rx * 2.6 * dt;
    }
    return o;
  }

  private gamepad(): Gamepad | null {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return null;
    for (const p of navigator.getGamepads()) if (p && p.connected) return p;
    return null;
  }

  private prevPad: boolean[] = [];

  /** Build the intent for one sim tick. `camYaw` is the camera heading in sim angle. */
  sample(dt: number, camYaw: number): Intent {
    this.now += dt;
    const i = emptyIntent();
    if (!this.enabled) {
      this.presses.clear();
      return i;
    }
    const h = this.held;
    let up = h.has('up') ? 1 : 0;
    let down = h.has('down') ? 1 : 0;
    let right = (h.has('right') ? 1 : 0) - (h.has('left') ? 1 : 0);
    let analog = false;
    let fire = h.has('fire') || this.mouseFire;
    let drift = h.has('drift');

    // gamepad
    const pad = this.gamepad();
    if (pad) {
      const btn = (n: number): boolean => !!pad.buttons[n]?.pressed;
      const ax = pad.axes[0] ?? 0;
      const ay = pad.axes[1] ?? 0;
      const rt = pad.buttons[7]?.value ?? 0;
      const lt = pad.buttons[6]?.value ?? 0;
      const any = Math.abs(ax) > 0.2 || Math.abs(ay) > 0.2 || rt > 0.1 || lt > 0.1 || pad.buttons.some((b) => b.pressed);
      if (any) this.usingGamepad = true;
      if (this.usingGamepad) {
        if (Math.abs(ax) > 0.12) {
          right = ax;
          analog = true;
        }
        up = Math.max(up, rt, ay < -0.2 ? -ay : 0);
        down = Math.max(down, lt, ay > 0.5 ? ay : 0);
        fire = fire || btn(5);
        drift = drift || btn(4);
        const edge = (n: number, a: Action): void => {
          if (btn(n) && !this.prevPad[n]) this.press(a);
        };
        edge(0, 'jump');
        edge(1, 'slash');
        edge(2, 'slash');
        edge(3, 'answer');
        edge(9, 'pause');
        this.prevPad = pad.buttons.map((b) => b.pressed);
      }
    }

    // touch stick
    const tx = this.touch.stickX;
    const ty = this.touch.stickY;
    if (Math.abs(tx) > 0.05 || Math.abs(ty) > 0.05) {
      this.usingTouch = true;
      right = tx;
      analog = true;
      up = Math.max(up, ty > 0.15 ? Math.min(1, (ty - 0.15) / 0.6) : 0);
      down = Math.max(down, ty < -0.35 ? Math.min(1, (-ty - 0.35) / 0.5) : 0);
    }
    fire = fire || this.touch.fire;
    drift = drift || this.touch.drift;

    // smooth digital steering, pass analog straight through
    if (analog) this.steer = right;
    else {
      const rate = right === 0 ? 9 : Math.sign(right) !== Math.sign(this.steer) ? 12 : 5;
      this.steer += Math.max(-rate * dt, Math.min(rate * dt, right - this.steer));
    }
    i.steer = this.steer;
    i.throttle = up;
    i.brake = down;
    i.drift = drift;
    i.fire = fire;

    // on-foot movement relative to the camera
    const fwd = up - down;
    const side = analog ? right : (h.has('right') ? 1 : 0) - (h.has('left') ? 1 : 0);
    const mx = Math.cos(camYaw) * fwd + -Math.sin(camYaw) * side;
    const my = Math.sin(camYaw) * fwd + Math.cos(camYaw) * side;
    const ml = Math.hypot(mx, my);
    const touchMag = analog ? Math.min(1, Math.hypot(tx || right, ty || fwd)) : 1;
    i.moveX = ml > 0 ? (mx / ml) * Math.min(1, ml) * touchMag : 0;
    i.moveY = ml > 0 ? (my / ml) * Math.min(1, ml) * touchMag : 0;
    if (this.touch.stickX !== 0 || this.touch.stickY !== 0) {
      // stick maps directly: up is camera forward
      const sx = this.touch.stickX;
      const sy = this.touch.stickY;
      i.moveX = Math.cos(camYaw) * sy - Math.sin(camYaw) * sx;
      i.moveY = Math.sin(camYaw) * sy + Math.cos(camYaw) * sx;
    }

    if (this.aimPoint && this.mouse) {
      i.hasAim = true;
      i.aimX = this.aimPoint.x;
      i.aimY = this.aimPoint.y;
    }

    const take = (a: Action): boolean => {
      const n = this.presses.get(a) ?? 0;
      if (n > 0) {
        this.presses.set(a, n - 1);
        return true;
      }
      return false;
    };
    i.slash = take('slash');
    i.jump = take('jump');
    i.answer = take('answer');
    i.interact = take('interact');
    return i;
  }

  reset(): void {
    this.held.clear();
    this.presses.clear();
    this.mouseFire = false;
    this.touch.fire = false;
    this.touch.drift = false;
    this.touch.stickX = this.touch.stickY = 0;
  }
}
