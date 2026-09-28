/**
 * DOM HUD: top-right stack (clock, cash, health, speed, weapon, heat stars),
 * objective line with target HP, round minimap that rotates with the camera,
 * off-screen arrows, phone card, toasts, roof countdown ring, crosshair,
 * hit markers and red screen edges on the side the player was hurt from.
 */
import * as THREE from 'three';
import { KMH, UNITS_PER_METRE } from '../config/tuning';
import { formatClock } from '../core/Time';
import type { SimEvent, Tone } from '../sim/events';
import { formatCash } from '../sim/Scoring';
import type { Sim } from '../sim/Sim';
import { ICON_KATANA, ICON_PHONE, ICON_SMG, ICON_STAR } from './icons';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', html = ''): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

const fmtTime = (s: number): string => {
  const v = Math.max(0, Math.ceil(s));
  return `${Math.floor(v / 60)}:${(v % 60).toString().padStart(2, '0')}`;
};

/** Four ticks around the point a round landed. */
const HIT_MARK = '<svg viewBox="0 0 32 32"><path d="M5 5l6 6M27 5l-6 6M5 27l6-6M27 27l-6-6"/></svg>';

interface Toast {
  text: string;
  sub?: string;
  tone: Tone;
  time: number;
}

export class Hud {
  readonly root = el('div', 'hud');
  private readonly clock = el('div', 'clock num');
  private readonly cash = el('div', 'cash num');
  private readonly health = el('div', 'healthbar', '<i></i>');
  private readonly speed = el('div', 'speed', '<b class="num">0</b><span class="label">km/h</span>');
  private readonly weapon = el('div', 'weapon');
  private readonly stars = el('div', 'stars', ICON_STAR.repeat(5));
  private readonly objLine = el('div', 'line label');
  private readonly objEta = el('div', 'eta num');
  private readonly targetBar = el('div', 'targetbar', '<i></i>');
  private readonly mapCanvas = el('canvas');
  private readonly map: CanvasRenderingContext2D;
  private staticMap: HTMLCanvasElement | null = null;
  private readonly mapScale = 0.2;
  private readonly arrows: HTMLDivElement[] = [];
  private readonly marker = el('div', 'marker', '<i></i><span class="num"></span>');
  readonly phone = el('div', 'phone');
  private readonly toastEl = el('div', 'toast', '<div class="t"></div><div class="s"></div>');
  private readonly roof = el('div', 'roofring', '<svg viewBox="0 0 110 110"><circle class="bg" cx="55" cy="55" r="46"/><circle class="fg" cx="55" cy="55" r="46"/></svg><span class="label">Strike</span>');
  private readonly crosshair = el('div', 'crosshair');
  private readonly hint = el('div', 'hint label');
  private readonly hurtEl = el('div', 'hurtvignette', '<i class="l"></i><i class="r"></i><i class="t"></i><i class="b"></i>');
  /** Glow on the left, right, top and bottom edges, 0 to 1. */
  private readonly hurtEdge = [0, 0, 0, 0];
  private readonly hitMark = el('div', 'hitmark', HIT_MARK);
  private hitT = 0;
  private hitLife = 1;
  private readonly toasts: Toast[] = [];
  private toastT = 0;
  private hudT = 0;
  private lastCash = -1;
  private phoneMode = '';
  private phoneOpenT = 0;
  onAnswer: (() => void) | null = null;
  touch = false;
  /** What the touch JUMP button does right now (JUMP, RIDE or WHISTLE). */
  jumpLabel = 'JUMP';
  private readonly v3 = new THREE.Vector3();

  constructor(
    private readonly sim: Sim,
    private readonly camera: THREE.PerspectiveCamera,
    private readonly yaw: () => number,
    private readonly mouse: () => { x: number; y: number } | null,
  ) {
    const stack = el('div', 'stack');
    stack.append(this.clock, this.cash, this.health, this.speed, this.weapon, this.stars);
    const obj = el('div', 'objective');
    obj.append(this.objLine, this.objEta, this.targetBar);
    const mm = el('div', 'minimap');
    this.mapCanvas.width = 300;
    this.mapCanvas.height = 300;
    mm.append(this.mapCanvas);
    this.map = this.mapCanvas.getContext('2d')!;
    for (let i = 0; i < 3; i++) {
      const a = el('div', 'arrow', '<i></i><span class="num"></span>');
      this.arrows.push(a);
      this.root.append(a);
    }
    this.phone.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      if (this.phoneMode === 'ringing') this.onAnswer?.();
      else if (this.phoneMode === 'brief') this.phoneOpenT = this.phone.classList.contains('compact') ? 8 : 0;
    });
    this.root.append(this.hurtEl, stack, obj, mm, this.marker, this.phone, this.toastEl, this.roof, this.crosshair, this.hitMark, this.hint);
    this.weapon.innerHTML = `${ICON_SMG}<div class="ammo num"></div>`;
  }

  show(on: boolean): void {
    this.root.classList.toggle('on', on);
  }

  onEvent(e: SimEvent): void {
    if (e.type === 'toast') this.toast(e.text, e.tone, e.sub);
    if (e.type === 'contractBrief') this.phoneOpenT = 9;
    if (e.type === 'playerHurt') this.hurtFrom(e.amount, e.fromX, e.fromY);
    if (e.type === 'shot' && e.by === 'player' && e.struck !== 'none') this.hitMarker(e.tx, e.ty, e.tz, e.struck === 'kill');
    if (e.type === 'slash' && e.hit) {
      const pl = this.sim.player;
      this.hitMarker(e.x + Math.cos(e.a) * 10, e.y + Math.sin(e.a) * 10, pl.z + 8, false);
    }
  }

  /** Light the screen edge facing where the damage came from (every edge when it had no direction). */
  private hurtFrom(amount: number, fromX?: number, fromY?: number): void {
    const k = Math.min(1, 0.65 + amount / 25);
    const e = this.hurtEdge;
    const pl = this.sim.player;
    if (fromX === undefined || fromY === undefined || Math.hypot(fromX - pl.x, fromY - pl.y) < 1) {
      for (let i = 0; i < 4; i++) e[i] = Math.min(1, e[i] + k * 0.6);
      return;
    }
    const dx = fromX - pl.x;
    const dy = fromY - pl.y;
    const len = Math.hypot(dx, dy);
    const yaw = this.yaw();
    // camera space: forward is up the screen, right is right
    const f = (dx * Math.cos(yaw) + dy * Math.sin(yaw)) / len;
    const r = (dx * -Math.sin(yaw) + dy * Math.cos(yaw)) / len;
    // squared so the nearest side dominates (the four weights sum to 1)
    const w = [r < 0 ? r * r : 0, r > 0 ? r * r : 0, f > 0 ? f * f : 0, f < 0 ? f * f : 0];
    for (let i = 0; i < 4; i++) e[i] = Math.min(1, e[i] + k * w[i]);
  }

  private hitMarker(x: number, y: number, z: number, kill: boolean): void {
    const s = this.project(x, y, z);
    if (s.behind) return;
    // a kill holds the red marker longer; a plain hit never cuts a kill short
    if (!kill && this.hitMark.classList.contains('kill') && this.hitT > 0.15) return;
    this.hitLife = kill ? 0.5 : 0.22;
    this.hitT = this.hitLife;
    this.hitMark.classList.toggle('kill', kill);
    this.hitMark.style.left = `${s.sx}px`;
    this.hitMark.style.top = `${s.sy}px`;
  }

  private updateHits(dt: number): void {
    const e = this.hurtEdge;
    for (let i = 0; i < 4; i++) {
      if (e[i] <= 0) continue;
      e[i] = Math.max(0, e[i] - dt * 1.1);
      (this.hurtEl.children[i] as HTMLElement).style.opacity = e[i].toFixed(3);
    }
    if (this.hitT <= 0) return;
    this.hitT = Math.max(0, this.hitT - dt);
    const k = this.hitT / this.hitLife;
    this.hitMark.style.opacity = Math.min(1, k * 2.5).toFixed(3);
    this.hitMark.style.transform = `scale(${(1 + 0.4 * k * k).toFixed(3)})`;
  }

  toast(text: string, tone: Tone, sub?: string): void {
    // collapse duplicates
    if (this.toasts.length && this.toasts[this.toasts.length - 1].text === text) return;
    this.toasts.push({ text, tone, sub, time: sub ? 2.4 : 1.5 });
    if (this.toasts.length > 4) this.toasts.shift();
  }

  update(dt: number): void {
    this.updateHits(dt);
    this.updateToasts(dt);
    this.updateArrows();
    this.updateRoof();
    this.updateCrosshair();
    this.hudT -= dt;
    if (this.hudT > 0) return;
    this.hudT = 1 / 15;
    this.updateStack();
    this.updateObjective();
    this.updatePhone(1 / 15);
    this.drawMap();
    this.updateHint();
  }

  private updateStack(): void {
    const sim = this.sim;
    const pl = sim.player;
    this.clock.textContent = formatClock(sim.clock);
    const cash = Math.round(pl.cash);
    if (cash !== this.lastCash) {
      this.cash.textContent = formatCash(cash);
      if (this.lastCash >= 0 && cash > this.lastCash) {
        this.cash.classList.remove('flash');
        void this.cash.offsetWidth;
        this.cash.classList.add('flash');
      }
      this.lastCash = cash;
    }
    const hp = Math.max(0, pl.health / sim.t.player.maxHealth);
    (this.health.firstElementChild as HTMLElement).style.transform = `scaleX(${hp})`;
    this.health.classList.toggle('low', hp < 0.3);
    const kmh = pl.mode === 'riding' ? Math.abs(sim.bike.speed) / KMH : Math.hypot(pl.vx, pl.vy) / KMH;
    (this.speed.firstElementChild as HTMLElement).textContent = Math.round(kmh).toString();
    const ammo = this.weapon.querySelector('.ammo') as HTMLElement;
    if (pl.reloadT > 0) ammo.innerHTML = '<span class="reload label">Reload</span>';
    else ammo.innerHTML = `${pl.ammo}<small>/${sim.t.gun.magazine}</small>`;
    const svg = this.weapon.querySelector('svg')!;
    const slashing = pl.slashAnim < 0.4;
    if (slashing && !this.weapon.dataset.k) {
      svg.outerHTML = ICON_KATANA;
      this.weapon.dataset.k = '1';
    } else if (!slashing && this.weapon.dataset.k) {
      this.weapon.querySelector('svg')!.outerHTML = ICON_SMG;
      delete this.weapon.dataset.k;
    }
    const stars = sim.heat.stars;
    this.stars.querySelectorAll('svg').forEach((s, i) => s.classList.toggle('on', i < stars));
    this.stars.classList.toggle('flash', sim.heat.spotted && stars > 0);
  }

  private updateObjective(): void {
    const c = this.sim.contracts;
    const d = c.def;
    let line = '';
    let eta = '';
    let hp = -1;
    switch (c.state) {
      case 'idle':
        line = 'Ride the city. Wait for the call.';
        break;
      case 'ringing':
        line = this.touch ? 'Tap the phone to answer' : 'Press <b>Enter</b> to answer the phone';
        break;
      case 'briefed':
        line = `Get to <b>${d.from}</b>. ${d.target} arrives soon.`;
        eta = fmtTime(c.countdown);
        break;
      case 'arriving':
        line = `<b>${d.target}</b> is arriving at ${d.from}`;
        eta = fmtTime(c.countdown);
        break;
      case 'meeting':
        line = `Kill <b>${d.target}</b>. Leaves in`;
        eta = fmtTime(c.meetT);
        break;
      case 'moving':
        line = c.alerted ? `<b>${d.target}</b> is running for ${d.to}` : `Kill <b>${d.target}</b> before ${d.to}`;
        break;
      default:
        line = '';
    }
    if (c.target && !c.target.dead) hp = c.target.hp / c.target.maxHp;
    if (this.objLine.innerHTML !== line) this.objLine.innerHTML = line;
    this.objEta.textContent = eta;
    this.targetBar.classList.toggle('on', hp >= 0);
    if (hp >= 0) (this.targetBar.firstElementChild as HTMLElement).style.transform = `scaleX(${hp})`;
  }

  private updatePhone(dt: number): void {
    const c = this.sim.contracts;
    const d = c.def;
    let mode = '';
    if (c.state === 'ringing') mode = 'ringing';
    else if (c.active) mode = 'brief';
    this.phoneOpenT = Math.max(0, this.phoneOpenT - dt);
    const compact = mode === 'brief' && this.phoneOpenT <= 0;
    const key = `${mode}:${c.index}:${compact}`;
    this.phone.classList.toggle('on', mode !== '');
    this.phone.classList.toggle('ringing', mode === 'ringing');
    this.phone.classList.toggle('compact', compact);
    if (this.phone.dataset.key === key) return;
    this.phoneMode = mode;
    this.phone.dataset.key = key;
    if (mode === 'ringing') {
      this.phone.innerHTML = `<div class="who"><div class="avatar">${ICON_PHONE}</div><div><div class="name label">Handler</div><div class="sub">Incoming call</div></div></div><button class="answer">${this.touch ? 'ANSWER' : 'ANSWER  (ENTER)'}</button>`;
    } else if (mode === 'brief') {
      this.phone.innerHTML = `<div class="who"><div class="avatar">${ICON_PHONE}</div><div><div class="name label">Contract ${(c.index % 3) + 1}${c.loop ? ` / loop ${c.loop + 1}` : ''}</div><div class="sub">${formatCash(c.fee)}</div></div></div>
        <div class="target num">${d.target}</div><div class="alias">"${d.alias}"</div>
        <dl class="dossier"><dt>Car</dt><dd>${d.car}</dd><dt>Meets</dt><dd>${d.from}</dd><dt>Runs to</dt><dd>${d.to}</dd><dt>Escorts</dt><dd>${d.escorts || 'None'}</dd></dl>`;
    } else this.phone.innerHTML = '';
  }

  private updateToasts(dt: number): void {
    const cur = this.toasts[0];
    if (!cur) {
      this.toastEl.classList.remove('show');
      return;
    }
    if (this.toastT === 0) {
      (this.toastEl.firstElementChild as HTMLElement).textContent = cur.text;
      (this.toastEl.lastElementChild as HTMLElement).textContent = cur.sub ?? '';
      this.toastEl.className = `toast show ${cur.tone}`;
    }
    this.toastT += dt;
    if (this.toastT > cur.time) {
      this.toastEl.classList.remove('show');
      if (this.toastT > cur.time + 0.2) {
        this.toasts.shift();
        this.toastT = 0;
      }
    }
  }

  /** Project a sim point to CSS pixels. */
  private project(x: number, y: number, z: number): { sx: number; sy: number; behind: boolean } {
    const v = this.v3.set(x, z, y).project(this.camera);
    const w = window.innerWidth;
    const h = window.innerHeight;
    return { sx: (v.x * 0.5 + 0.5) * w, sy: (-v.y * 0.5 + 0.5) * h, behind: v.z > 1 };
  }

  private updateArrows(): void {
    const sim = this.sim;
    const c = sim.contracts;
    const pl = sim.player;
    const pts: { x: number; y: number; z: number; gold: boolean }[] = [];
    const obj = c.objective();
    if (obj) pts.push({ x: obj.x, y: obj.y, z: sim.city.heightAt(obj.x, obj.y) + 16, gold: obj.kind !== 'target' });
    const dst = c.destination();
    if (dst && c.state === 'moving') pts.push({ x: dst.x, y: dst.y, z: sim.city.heightAt(dst.x, dst.y) + 10, gold: true });
    if (pl.mode === 'foot' && sim.bike.riderless) pts.push({ x: sim.bike.x, y: sim.bike.y, z: sim.bike.z + 12, gold: true });
    const w = window.innerWidth;
    const h = window.innerHeight;
    let markerUsed = false;
    this.arrows.forEach((a, i) => {
      const p = pts[i];
      if (!p) {
        a.classList.remove('on');
        return;
      }
      const d = Math.hypot(p.x - pl.x, p.y - pl.y) / UNITS_PER_METRE;
      const s = this.project(p.x, p.y, p.z);
      const margin = 44;
      const on = !s.behind && s.sx > margin && s.sx < w - margin && s.sy > margin && s.sy < h - margin;
      if (on && !markerUsed && i === 0) {
        markerUsed = true;
        this.marker.classList.add('on');
        this.marker.style.left = `${s.sx}px`;
        this.marker.style.top = `${s.sy}px`;
        (this.marker.lastElementChild as HTMLElement).textContent = `${Math.round(d)} m`;
        (this.marker.firstElementChild as HTMLElement).style.background = p.gold ? 'var(--gold)' : 'var(--red)';
        a.classList.remove('on');
        return;
      }
      if (on) {
        a.classList.remove('on');
        return;
      }
      let dx = s.sx - w / 2;
      let dy = s.sy - h / 2;
      if (s.behind) {
        dx = -dx;
        dy = -dy;
        if (Math.abs(dy) < 1) dy = h;
      }
      const ang = Math.atan2(dy, dx);
      const rx = w / 2 - margin;
      const ry = h / 2 - margin;
      const k = Math.min(rx / Math.abs(Math.cos(ang) || 1e-6), ry / Math.abs(Math.sin(ang) || 1e-6));
      a.style.left = `${w / 2 + Math.cos(ang) * k}px`;
      a.style.top = `${h / 2 + Math.sin(ang) * k}px`;
      (a.firstElementChild as HTMLElement).style.transform = `rotate(${ang}rad)`;
      (a.lastElementChild as HTMLElement).textContent = `${Math.round(d)} m`;
      a.classList.add('on');
      a.classList.toggle('gold', p.gold);
    });
    if (!markerUsed) this.marker.classList.remove('on');
  }

  private updateRoof(): void {
    const pl = this.sim.player;
    const on = pl.mode === 'roof';
    this.roof.classList.toggle('on', on);
    if (on) {
      const k = Math.max(0, pl.roofT / this.sim.t.leap.roofTime);
      const circ = 2 * Math.PI * 46;
      const fg = this.roof.querySelector('.fg') as SVGCircleElement;
      fg.style.strokeDasharray = `${circ}`;
      fg.style.strokeDashoffset = `${circ * (1 - k)}`;
      fg.style.stroke = k < 0.35 ? 'var(--red)' : 'var(--gold)';
    }
  }

  private updateCrosshair(): void {
    const sim = this.sim;
    const pl = sim.player;
    const m = this.mouse();
    const armed = pl.mode === 'riding' || pl.mode === 'foot';
    if (m && armed) {
      this.crosshair.classList.add('on');
      this.crosshair.style.left = `${m.x}px`;
      this.crosshair.style.top = `${m.y}px`;
      this.crosshair.classList.remove('lock');
      return;
    }
    const tgt = pl.assistTarget >= 0 ? sim.carById(pl.assistTarget) : undefined;
    if (tgt && armed && pl.firing) {
      const s = this.project(tgt.x, tgt.y, sim.city.heightAt(tgt.x, tgt.y) + tgt.spec.roof * 0.6);
      this.crosshair.classList.add('on', 'lock');
      this.crosshair.style.left = `${s.sx}px`;
      this.crosshair.style.top = `${s.sy}px`;
    } else this.crosshair.classList.remove('on');
  }

  private updateHint(): void {
    const sim = this.sim;
    const pl = sim.player;
    let h = '';
    const t = this.touch;
    let jump = 'JUMP';
    if (pl.mode === 'foot') {
      const d = Math.hypot(sim.bike.x - pl.x, sim.bike.y - pl.y);
      if (d < sim.t.player.remountRange) {
        h = t ? 'RIDE to get on' : 'E to ride';
        jump = 'RIDE';
      } else {
        if (!sim.bike.auto) h = t ? 'WHISTLE for your bike' : 'E to whistle for your bike';
        jump = 'WHISTLE';
      }
    } else if (pl.mode === 'roof') h = t ? 'SLASH to strike. JUMP to hop off' : 'K or right click to strike. E to hop off';
    else if (pl.mode === 'riding' && sim.bike.speed > sim.t.leap.minSpeed && sim.contracts.target) h = t ? 'JUMP at speed to leap onto a roof' : 'E at speed to leap onto a roof';
    if (this.hint.textContent !== h) this.hint.textContent = h;
    this.jumpLabel = jump;
  }

  // ---------------------------------------------------------------- minimap
  private buildStaticMap(): HTMLCanvasElement {
    const city = this.sim.city;
    const b = city.bounds;
    const s = this.mapScale;
    const c = document.createElement('canvas');
    c.width = Math.ceil((b.maxX - b.minX) * s);
    c.height = Math.ceil((b.maxY - b.minY) * s);
    const g = c.getContext('2d')!;
    const X = (x: number): number => (x - b.minX) * s;
    const Y = (y: number): number => (y - b.minY) * s;
    const rect = (x0: number, y0: number, x1: number, y1: number, col: string): void => {
      g.fillStyle = col;
      g.fillRect(X(x0), Y(y0), (x1 - x0) * s, (y1 - y0) * s);
    };
    rect(b.minX, b.minY, b.maxX, b.maxY, '#131519');
    rect(b.minX, b.minY, b.maxX, city.shoreY, '#0d2a33');
    rect(b.minX, city.shoreY, b.maxX, city.boulevardY - city.half, '#5a5040');
    const H = city.half;
    // roads
    g.fillStyle = '#5d6068';
    for (let j = 0; j <= 8; j++) rect(-H, j * city.pitch - H, city.size + H, j * city.pitch + H, '#5d6068');
    for (let i = 0; i <= 8; i++) rect(i * city.pitch - H, -H, i * city.pitch + H, city.size + H, '#5d6068');
    rect(-H, city.boulevardY - H, city.size + H, city.boulevardY + H, '#6e7179');
    for (const col of this.sim.t.world.rampColumns) rect(col * city.pitch - H, city.boulevardY, col * city.pitch + H, 0, '#6e7179');
    for (const bl of city.blocks) {
      const colour = bl.kind === 'plaza' || bl.kind === 'temple' ? '#2c3a2c' : bl.kind === 'carpark' ? '#26282d' : '#202226';
      rect(bl.minX, bl.minY, bl.maxX, bl.maxY, colour);
      for (const a of bl.alleys) rect(a.minX, a.minY, a.maxX, a.maxY, '#3a3c42');
    }
    for (const bd of city.buildings) rect(bd.minX, bd.minY, bd.maxX, bd.maxY, '#34373e');
    for (const p of city.piers) rect(p.minX, p.minY, p.maxX, p.maxY, '#6b5a46');
    return c;
  }

  private drawMap(): void {
    const sim = this.sim;
    if (!this.staticMap) this.staticMap = this.buildStaticMap();
    const g = this.map;
    const W = this.mapCanvas.width;
    const cx = W / 2;
    const cy = W / 2;
    const zoom = 0.34;
    const yaw = this.yaw();
    const sn = Math.sin(yaw);
    const cs = Math.cos(yaw);
    const pl = sim.player;
    const px = pl.x;
    const py = pl.y;
    // world -> map: x' = r * zoom, y' = -f * zoom where f is camera forward, r camera right
    const a = -sn * zoom;
    const c = cs * zoom;
    const b = -cs * zoom;
    const d = -sn * zoom;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = '#0e0f11';
    g.fillRect(0, 0, W, W);
    g.setTransform(a, b, c, d, cx - a * px - c * py, cy - b * px - d * py);
    const bnd = sim.city.bounds;
    g.translate(bnd.minX, bnd.minY);
    g.scale(1 / this.mapScale, 1 / this.mapScale);
    g.drawImage(this.staticMap, 0, 0);
    g.setTransform(1, 0, 0, 1, 0, 0);

    const toMap = (x: number, y: number): [number, number] => {
      const dx = x - px;
      const dy = y - py;
      const f = dx * cs + dy * sn;
      const r = dx * -sn + dy * cs;
      return [cx + r * zoom, cy - f * zoom];
    };
    const R = W / 2 - 12;
    const blip = (x: number, y: number, color: string, size: number, shape: 'dot' | 'square' | 'ring', clamp: boolean): void => {
      let [mx, my] = toMap(x, y);
      const dx = mx - cx;
      const dy = my - cy;
      const dd = Math.hypot(dx, dy);
      if (dd > R) {
        if (!clamp) return;
        mx = cx + (dx / dd) * R;
        my = cy + (dy / dd) * R;
      }
      g.fillStyle = color;
      g.strokeStyle = color;
      g.lineWidth = 3;
      g.beginPath();
      if (shape === 'square') g.rect(mx - size, my - size, size * 2, size * 2);
      else g.arc(mx, my, size, 0, Math.PI * 2);
      if (shape === 'ring') g.stroke();
      else {
        g.fill();
        g.lineWidth = 2;
        g.strokeStyle = '#0e0f11';
        g.stroke();
      }
    };
    for (const car of sim.cars) {
      if (car.dead) continue;
      if (car.kind === 'police') blip(car.x, car.y, Math.floor(sim.time * 6) % 2 ? '#e0262b' : '#3a7bd2', 6, 'dot', false);
      else if (car.kind === 'escort') blip(car.x, car.y, '#8f1418', 6, 'dot', false);
    }
    const c2 = sim.contracts;
    const dst = c2.destination();
    if (dst) blip(dst.x, dst.y, '#d9a441', 8, 'square', true);
    const obj = c2.objective();
    if (obj) blip(obj.x, obj.y, obj.kind === 'target' ? '#e0262b' : '#d9a441', obj.kind === 'target' ? 9 : 10, obj.kind === 'target' ? 'dot' : 'ring', true);
    if (pl.mode !== 'riding') blip(sim.bike.x, sim.bike.y, '#ece6da', 5, 'ring', true);
    // player arrow
    const facing = pl.mode === 'riding' ? sim.bike.heading : pl.facing;
    const rel = facing - yaw;
    g.save();
    g.translate(cx, cy);
    g.rotate(rel);
    g.fillStyle = '#ece6da';
    g.strokeStyle = '#0e0f11';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(0, -13);
    g.lineTo(9, 10);
    g.lineTo(0, 5);
    g.lineTo(-9, 10);
    g.closePath();
    g.fill();
    g.stroke();
    g.restore();
    // north marker
    const nf = sn;
    const nr = cs;
    const nl = Math.hypot(nf, nr) || 1;
    const nx = cx + (nr / nl) * (R + 2);
    const ny = cy - (nf / nl) * (R + 2);
    g.fillStyle = '#e0262b';
    g.beginPath();
    g.arc(nx, ny, 12, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#fff';
    g.font = '600 18px Teko, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('N', nx, ny + 1);
  }
}
