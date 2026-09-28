/**
 * Touch controls, the primary scheme on phones: a floating left thumb stick,
 * FIRE (hold), SLASH, JUMP and DRIFT (hold) on the right, drag on the right
 * half to look around. Buttons can be repositioned and the layout is saved.
 */
import type { ButtonLayout } from '../core/SaveService';
import type { InputMap } from '../input/InputMap';

interface Btn {
  id: string;
  label: string;
  cls: string;
  /** Default position: distance from right and bottom edges in px. */
  r: number;
  b: number;
  /** Default position when the phone is upright. */
  ur: number;
  ub: number;
}

const BUTTONS: Btn[] = [
  { id: 'fire', label: 'FIRE', cls: 'fire', r: 26, b: 26, ur: 18, ub: 24 },
  { id: 'slash', label: 'SLASH', cls: 'slash', r: 128, b: 18, ur: 116, ub: 18 },
  { id: 'jump', label: 'JUMP', cls: 'jump', r: 214, b: 30, ur: 26, ub: 124 },
  { id: 'drift', label: 'DRIFT', cls: 'drift', r: 120, b: 104, ur: 110, ub: 100 },
];

const upright = (): boolean => typeof window !== 'undefined' && window.innerHeight > window.innerWidth;

export class TouchControls {
  readonly root = document.createElement('div');
  private readonly zone = document.createElement('div');
  private readonly look = document.createElement('div');
  private readonly base = document.createElement('div');
  private readonly knob = document.createElement('div');
  private readonly btns = new Map<string, HTMLDivElement>();
  private stickId = -1;
  private sx = 0;
  private sy = 0;
  private lookId = -1;
  private lookX = 0;
  editing = false;
  onHaptic: ((kind: 'light' | 'medium') => void) | null = null;
  onPause: (() => void) | null = null;
  onLayoutChange: ((l: ButtonLayout) => void) | null = null;

  constructor(
    private readonly input: InputMap,
    private layout: ButtonLayout,
  ) {
    this.root.className = 'touch';
    this.zone.className = 'zone';
    this.look.className = 'look';
    this.base.className = 'stick-base';
    this.knob.className = 'stick-knob';
    this.base.append(this.knob);
    this.root.append(this.zone, this.look, this.base);
    for (const b of BUTTONS) {
      const d = document.createElement('div');
      d.className = `tbtn ${b.cls}`;
      d.textContent = b.label;
      d.dataset.id = b.id;
      this.btns.set(b.id, d);
      this.root.append(d);
      this.bindButton(d, b.id);
    }
    const pause = document.createElement('div');
    pause.className = 'tbtn pause';
    pause.textContent = 'II';
    pause.style.left = 'calc(50% - 22px)';
    pause.style.bottom = 'calc(10px + env(safe-area-inset-bottom, 0px))';
    pause.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.onPause?.();
    });
    this.root.append(pause);
    this.applyLayout();
    window.addEventListener('resize', () => this.applyLayout());

    this.zone.addEventListener('pointerdown', (e) => this.stickStart(e));
    this.zone.addEventListener('pointermove', (e) => this.stickMove(e));
    this.zone.addEventListener('pointerup', (e) => this.stickEnd(e));
    this.zone.addEventListener('pointercancel', (e) => this.stickEnd(e));
    this.look.addEventListener('pointerdown', (e) => {
      if (this.lookId >= 0) return;
      this.lookId = e.pointerId;
      this.lookX = e.clientX;
      this.look.setPointerCapture(e.pointerId);
      this.input.usingTouch = true;
    });
    this.look.addEventListener('pointermove', (e) => {
      if (e.pointerId !== this.lookId) return;
      this.input.touch.lookDX += e.clientX - this.lookX;
      this.lookX = e.clientX;
    });
    const endLook = (e: PointerEvent): void => {
      if (e.pointerId === this.lookId) this.lookId = -1;
    };
    this.look.addEventListener('pointerup', endLook);
    this.look.addEventListener('pointercancel', endLook);
  }

  show(on: boolean): void {
    this.root.classList.toggle('on', on);
    if (!on) this.release();
  }

  release(): void {
    this.stickId = -1;
    this.base.classList.remove('on');
    this.input.touch.stickX = this.input.touch.stickY = 0;
    this.input.touch.fire = false;
    this.input.touch.drift = false;
    for (const b of this.btns.values()) b.classList.remove('down');
  }

  setEditing(on: boolean): void {
    this.editing = on;
    this.root.classList.toggle('editing', on);
  }

  resetLayout(): void {
    this.layout = {};
    this.applyLayout();
    this.onLayoutChange?.(this.layout);
  }

  private applyLayout(): void {
    for (const b of BUTTONS) {
      const d = this.btns.get(b.id)!;
      const pos = this.layout[b.id] ?? (upright() ? { x: b.ur, y: b.ub } : { x: b.r, y: b.b });
      d.style.right = `calc(${pos.x}px + env(safe-area-inset-right, 0px))`;
      d.style.bottom = `calc(${pos.y}px + env(safe-area-inset-bottom, 0px))`;
    }
  }

  private bindButton(d: HTMLDivElement, id: string): void {
    let dragFrom: { x: number; y: number; r: number; b: number } | null = null;
    d.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      d.setPointerCapture(e.pointerId);
      this.input.usingTouch = true;
      if (this.editing) {
        const def = BUTTONS.find((bb) => bb.id === id)!;
        const cur = this.layout[id] ?? (upright() ? { x: def.ur, y: def.ub } : { x: def.r, y: def.b });
        dragFrom = { x: e.clientX, y: e.clientY, r: cur.x, b: cur.y };
        return;
      }
      d.classList.add('down');
      this.onHaptic?.('light');
      if (id === 'fire') this.input.touch.fire = true;
      else if (id === 'drift') this.input.touch.drift = true;
      else if (id === 'slash') this.input.press('slash');
      else if (id === 'jump') this.input.press('jump');
    });
    d.addEventListener('pointermove', (e) => {
      if (!dragFrom) return;
      const r = Math.max(0, dragFrom.r - (e.clientX - dragFrom.x));
      const b = Math.max(0, dragFrom.b - (e.clientY - dragFrom.y));
      this.layout[id] = { x: r, y: b };
      this.applyLayout();
    });
    const up = (): void => {
      if (dragFrom) {
        dragFrom = null;
        this.onLayoutChange?.(this.layout);
        return;
      }
      d.classList.remove('down');
      if (id === 'fire') this.input.touch.fire = false;
      if (id === 'drift') this.input.touch.drift = false;
    };
    d.addEventListener('pointerup', up);
    d.addEventListener('pointercancel', up);
  }

  private stickStart(e: PointerEvent): void {
    if (this.stickId >= 0 || this.editing) return;
    this.stickId = e.pointerId;
    this.zone.setPointerCapture(e.pointerId);
    this.sx = e.clientX;
    this.sy = e.clientY;
    this.base.style.left = `${this.sx}px`;
    this.base.style.top = `${this.sy}px`;
    this.base.classList.add('on');
    this.knob.style.transform = 'translate(0px, 0px)';
    this.input.usingTouch = true;
  }

  private stickMove(e: PointerEvent): void {
    if (e.pointerId !== this.stickId) return;
    const R = 56;
    let dx = e.clientX - this.sx;
    let dy = e.clientY - this.sy;
    const d = Math.hypot(dx, dy);
    if (d > R) {
      // drag the base along so the stick never runs out of travel
      this.sx += (dx / d) * (d - R);
      this.sy += (dy / d) * (d - R);
      this.base.style.left = `${this.sx}px`;
      this.base.style.top = `${this.sy}px`;
      dx = e.clientX - this.sx;
      dy = e.clientY - this.sy;
    }
    this.knob.style.transform = `translate(${dx}px, ${dy}px)`;
    const nx = dx / R;
    const ny = -dy / R;
    const dead = 0.08;
    this.input.touch.stickX = Math.abs(nx) < dead ? 0 : nx;
    this.input.touch.stickY = Math.abs(ny) < dead ? 0 : ny;
  }

  private stickEnd(e: PointerEvent): void {
    if (e.pointerId !== this.stickId) return;
    this.stickId = -1;
    this.base.classList.remove('on');
    this.input.touch.stickX = 0;
    this.input.touch.stickY = 0;
  }
}
