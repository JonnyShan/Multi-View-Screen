// DOM HUD: timing tower, speedo, cornering G gauge, minimap, messages.
import { TUNE, BRAND } from './config.js';
import { SECTORS } from './track.js';
import { fmtTime, fmtDelta } from './store.js';

const $ = (id) => document.getElementById(id);

export class Hud {
  constructor(track) {
    this.track = track;
    this.el = $('hud');
    this.time = $('hTime'); this.delta = $('hDelta'); this.best = $('hBest');
    this.speed = $('hSpeed'); this.gear = $('hGear'); this.lean = $('hLean');
    this.leanBike = $('leanBike'); this.leanArc = $('leanArc');
    this.msgEl = $('hMsg'); this.call = $('hCall'); this.brake = $('hBrake');
    this.lightsEl = $('hLights');
    this.sectors = [0, 1, 2].map(i => $('hS' + i));
    this.revs = $('hRevs');
    this.revSegs = [];
    for (let i = 0; i < 24; i++) {
      const s = document.createElement('i');
      if (i >= 19) s.className = 'r'; else if (i >= 14) s.className = 'g';
      this.revs.appendChild(s); this.revSegs.push(s);
    }
    this.last = {};
    this.#buildMap();
  }

  #buildMap() {
    const cv = this.map = $('hMap');
    const T = this.track;
    let minx = Infinity, maxx = -Infinity, minz = Infinity, maxz = -Infinity;
    for (let i = 0; i < T.N; i++) { minx = Math.min(minx, T.X[i]); maxx = Math.max(maxx, T.X[i]); minz = Math.min(minz, T.Z[i]); maxz = Math.max(maxz, T.Z[i]); }
    const W = cv.width, H = cv.height, pad = 34;
    const sc = Math.min((W - pad * 2) / (maxx - minx), (H - pad * 2) / (maxz - minz));
    const ox = (W - (maxx - minx) * sc) / 2, oz = (H - (maxz - minz) * sc) / 2;
    this.mapXY = (x, z) => [ox + (x - minx) * sc, oz + (z - minz) * sc];
    const base = document.createElement('canvas'); base.width = W; base.height = H;
    const g = base.getContext('2d');
    g.fillStyle = BRAND.dark + '9e';
    g.beginPath(); g.roundRect ? g.roundRect(0, 0, W, H, 18) : g.rect(0, 0, W, H); g.fill();
    const path = () => {
      g.beginPath();
      for (let i = 0; i <= T.N; i++) { const [x, y] = this.mapXY(T.X[i % T.N], T.Z[i % T.N]); i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.closePath();
    };
    g.lineJoin = 'round';
    g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 14; path(); g.stroke();
    g.strokeStyle = BRAND.light; g.lineWidth = 6; path(); g.stroke();
    // sector ticks + start line
    const tick = (s, col, w) => {
      const f = T.frame(s);
      const [x, y] = this.mapXY(f.x, f.z);
      g.strokeStyle = col; g.lineWidth = w;
      g.beginPath(); g.moveTo(x - f.rx * 14, y - f.rz * 14); g.lineTo(x + f.rx * 14, y + f.rz * 14); g.stroke();
    };
    SECTORS.forEach(s => tick(s, BRAND.accent, 4));
    tick(0, BRAND.primaryHot, 6);
    this.mapBase = base;
    this.mapCtx = cv.getContext('2d');
  }

  show(on) { this.el.classList.toggle('show', on); }

  reset(bestTime) {
    this.sectors.forEach((s, i) => { s.className = ''; s.textContent = 'S' + (i + 1); });
    this.best.textContent = fmtTime(bestTime);
    this.delta.textContent = ''; this.delta.className = 'delta';
    this.time.textContent = fmtTime(0);
    this.brakeHint(false);
    this.last = {};
  }

  setSector(i, cls, dt) {
    const s = this.sectors[i];
    s.className = cls;
    s.textContent = dt == null ? 'S' + (i + 1) : fmtDelta(dt);
  }

  update(st, raceT, delta, ghost) {
    const L = this.last;
    const t = fmtTime(Math.max(0, raceT));
    if (t !== L.t) { this.time.textContent = t; L.t = t; }
    if (delta != null) {
      const now = performance.now();
      if (!L.dT || now - L.dT > 100) {
        L.dT = now;
        this.delta.textContent = fmtDelta(delta);
        this.delta.className = 'delta ' + (delta <= 0 ? 'neg' : 'pos');
      }
    }
    const kmh = Math.round(st.v * 3.6);
    if (kmh !== L.kmh) { this.speed.textContent = kmh; L.kmh = kmh; }
    const gear = st.v < 0.5 && raceT <= 0 ? 'N' : String(st.gear + 1);
    if (gear !== L.gear) { this.gear.textContent = gear; L.gear = gear; }
    // lateral G (the physics' cornering load); the arc sweeps to 90° at full grip
    const gl = Math.tan(Math.abs(st.lean)), lean = Math.round(gl * 10);
    if (lean !== L.lean) {
      this.lean.textContent = (lean / 10).toFixed(1) + 'G';
      L.lean = lean;
      const a = Math.sign(st.lean) * Math.min(1, gl / Math.tan(TUNE.maxLean)) * Math.PI / 2;
      const x = 66 * Math.sin(a), y = -66 * Math.cos(a);
      this.leanArc.setAttribute('d', `M0 -66 A66 66 0 0 ${a >= 0 ? 1 : 0} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    const lit = Math.round(Math.min(1, st.rpm / TUNE.redline) * 24);
    if (lit !== L.lit) {
      for (let i = 0; i < 24; i++) this.revSegs[i].classList.toggle('on', i < lit);
      L.lit = lit;
    }
    const flash = st.rpm > TUNE.redline * 0.95;
    if (flash !== L.flash) { this.revs.classList.toggle('flash', flash); L.flash = flash; }
    this.#drawMap(st.s, st.x, ghost);
  }

  #drawMap(s, x, ghost) {
    const g = this.mapCtx;
    g.clearRect(0, 0, this.map.width, this.map.height);
    g.drawImage(this.mapBase, 0, 0);
    const dot = (s, lat, fill, r) => {
      const p = this.track.toWorld(s, lat);
      const [mx, my] = this.mapXY(p.x, p.z);
      g.beginPath(); g.arc(mx, my, r, 0, Math.PI * 2);
      g.fillStyle = fill; g.fill();
      g.lineWidth = 3; g.strokeStyle = BRAND.dark; g.stroke();
    };
    if (ghost) dot(ghost.s, ghost.x, BRAND.accent, 8);
    dot(s, x, BRAND.primaryHot, 11);
  }

  lights(n, on = true) {
    this.lightsEl.classList.toggle('on', on);
    [...this.lightsEl.children].forEach((c, i) => c.classList.toggle('lit', i < n));
  }

  msg(text, sub = '', ms = 1400, cls = '') {
    this.msgEl.innerHTML = `${text}${sub ? `<small>${sub}</small>` : ''}`;
    this.msgEl.className = 'on ' + cls;
    clearTimeout(this._mt);
    if (ms) this._mt = setTimeout(() => { this.msgEl.className = cls; }, ms);
  }

  clearMsg() { this.msgEl.className = ''; }

  callout(text) {
    if (text === this._call) return;
    this._call = text;
    if (!text) { this.call.classList.remove('on'); return; }
    this.call.textContent = text;
    this.call.classList.add('on');
    clearTimeout(this._ct);
    this._ct = setTimeout(() => this.call.classList.remove('on'), 2600);
  }

  brakeHint(on) {
    if (on !== this._bh) { this.brake.classList.toggle('on', on); this._bh = on; }
  }
}
