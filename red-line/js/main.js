// RED LINE: boot, game states, cameras, input, timing, leaderboard.
import * as THREE from 'three';
import { BRAND, AGE_RULES, DEFAULT_REGION, TUNE, QUALITY, QUALITY_TIERS, KIOSK, AGE_GATE, PARAMS } from './config.js';
import * as TX from './textures.js';
import { Track, buildTrackMeshes, buildRubber, SECTORS } from './track.js';
import { World } from './world.js';
import { buildDressing } from './dressing.js';
import { BikeModel, makeGhost, setBikeAsset, setRiderAsset } from './bike.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { newState, step, Autopilot, simulateLap } from './physics.js';
import { Audio } from './audio.js';
import { Post, Particles } from './fx.js';
import { Hud } from './hud.js';
import * as Store from './store.js';

const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const dampAngle = (a, b, k, dt) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * (1 - Math.exp(-k * dt)); };
const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const START_S = -18;
const TITLE_S = 2850; // hero shot on the Home Sweep, sun raking from the side
const PHYS_DT = 1 / 120;
const GHOST_HZ = 20;
const FIXED_DT = +(PARAMS.get('fixeddt') || 0); // debug: deterministic capture on slow GPUs
const HOUSE = ['WTK', 'KRC', 'RDL', 'OAK', 'ASH', 'BLU', 'KNT', 'LWB', 'RVR', 'CHR'];

const V3 = () => new THREE.Vector3();
const _v = V3(), _v2 = V3(), _f = {};
const SMOKE = new THREE.Color(1, 1, 1);

// A .glb loads directly. A .json pack ({ gltf, bin: base64 geometry }) is for hosts that won't serve .glb or
// fetch data: URIs; it is rewrapped as a GLB in memory and its textures load as sibling .jpg files.
async function loadModel(loader, url) {
  if (!url.endsWith('.json')) return loader.loadAsync(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { gltf, bin } = await res.json();
  const raw = atob(bin), body = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) body[i] = raw.charCodeAt(i);
  const head = new TextEncoder().encode(JSON.stringify(gltf));
  const jl = (head.length + 3) & ~3, bl = (body.length + 3) & ~3;
  const glb = new Uint8Array(28 + jl + bl), dv = new DataView(glb.buffer);
  dv.setUint32(0, 0x46546C67, true); dv.setUint32(4, 2, true); dv.setUint32(8, glb.length, true);
  dv.setUint32(12, jl, true); dv.setUint32(16, 0x4E4F534A, true);
  glb.fill(0x20, 20, 20 + jl); glb.set(head, 20);
  dv.setUint32(20 + jl, bl, true); dv.setUint32(24 + jl, 0x004E4942, true); glb.set(body, 28 + jl);
  return loader.parseAsync(glb.buffer, url.slice(0, url.lastIndexOf('/') + 1));
}

class Game {
  constructor(renderer) {
    this.renderer = renderer;
    this.state = 'loading';
    this.stateT = 0;
    this.paused = false;
    this.lastInput = performance.now();
    this.settings = Store.load('settings', { cam: 'chase', assist: 'standard', sound: true });
    delete this.settings.tilt; // tilt steering was removed; ignore an old saved setting
    this.region = Store.load('region', null) || guessRegion();
  }

  async build(progress) {
    const frame = () => new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 9000);
    progress(0.15, 'Surveying the circuit'); await frame();
    this.track = new Track();
    this.scene.add(buildTrackMeshes(this.track));
    progress(0.3, 'Carving the Kentucky River palisades'); await frame();
    this.world = new World(this.scene, this.renderer, this.track);
    this.dressing = buildDressing(this.scene, this.track, this.world);
    progress(0.72, 'Rolling out the bike'); await frame();
    if (QUALITY.tier !== 'low' && PARAMS.get('bike') !== 'code') {
      const loader = new GLTFLoader();
      const [bikeG, riderG] = await Promise.all(['assets/bike-ai.json', 'assets/rider-ai.json'].map(u => loadModel(loader, u).catch(e => {
        console.error('Model failed to load, using the built-in one:', u, e);
        (window.__assetErr ||= []).push(`${u}: ${e && e.message}`);
        return null;
      })));
      if (bikeG) setBikeAsset(bikeG.scene);
      if (riderG && PARAMS.get('rider') !== 'code') setRiderAsset(riderG.scene);
    }
    this.bike = new BikeModel();
    this.scene.add(this.bike.root);
    this.ghost = makeGhost();
    this.ghost.root.visible = false;
    this.scene.add(this.ghost.root);
    this.#exhaustFlame();
    this.sparks = new Particles(this.scene, 600, { additive: true, size: 0.06 });
    this.dust = new Particles(this.scene, 220, { additive: false, size: 0.8, texture: TX.radialTexture('rgba(170,140,100,0.5)', 'rgba(170,140,100,0)') });
    this.smoke = new Particles(this.scene, 260, { additive: false, size: 0.5, texture: TX.radialTexture('rgba(236,232,226,0.32)', 'rgba(236,232,226,0)') });
    progress(0.84, 'Setting the pace'); await frame();
    this.autopilot = new Autopilot(this.track);
    if (QUALITY.rubber) this.scene.add(buildRubber(this.track, this.autopilot));
    this.pace = simulateLap(this.track, START_S, GHOST_HZ);
    const p = this.pace.time;
    this.medals = { gold: Math.floor(p * 0.99 * 10) / 10, silver: Math.floor(p * 1.05 * 10) / 10, bronze: Math.floor(p * 1.12 * 10) / 10 };
    this.post = new Post(this.renderer, this.scene, this.camera, QUALITY);
    this.#setupReflections();
    this.hud = new Hud(this.track);
    this.audio = new Audio();
    this.#loadRecords();
    this.#setupInput();
    this.#setupUI();
    progress(0.95, 'Warming the tyres'); await frame();
    this.st = newState(START_S);
    this.demo = newState(START_S);
    this.#placeBike(this.bike, this.st);
    this.renderer.compile(this.scene, this.camera);
    this.#resize();
    addEventListener('resize', () => this.#resize());
    progress(1, 'Ready');
    window.__ready = true;
    // a slow device may have tripped the load watchdog in index.html; the game did load, so clear it
    clearTimeout(window.__boot);
    if ($('fatal').dataset.watchdog) $('fatal').style.display = 'none';
    this.#setState(!AGE_GATE || (Store.sessionGet('gate') === '1' && !KIOSK) ? 'title' : 'gate');
    $('loader').classList.remove('show');
    this.last = performance.now();
    requestAnimationFrame(this.loop);
    if (PARAMS.get('auto')) this.#debugAuto(PARAMS.get('auto'));
  }

  // ------------------------------------------------------------------ records
  #loadRecords() {
    this.best = Store.load('best', null); // {t, splits, ghost:{hz, f}}
    this.bestSectors = Store.load('bestSectors', null);
    let board = Store.load('board', null);
    if (!board || !Array.isArray(board)) {
      const mult = [1.0, 1.015, 1.03, 1.045, 1.06, 1.08, 1.1, 1.13, 1.16, 1.2];
      board = mult.map((m, i) => ({ n: HOUSE[i], t: Math.round(this.pace.time * m * 1000) / 1000, house: true }));
      Store.save('board', board);
    }
    this.board = board;
    this.#setGhost();
  }

  #setGhost() {
    const g = this.best && this.best.ghost ? this.best.ghost : { hz: GHOST_HZ, f: this.pace.frames };
    this.ghostData = g;
    this.ghostIsPace = !(this.best && this.best.ghost);
    const f = g.f;
    this.ghostS = new Float64Array(f.length);
    for (let i = 0; i < f.length; i++) this.ghostS[i] = f[i][0];
  }

  #ghostAt(t, out) {
    const g = this.ghostData;
    const fi = t * g.hz;
    const i = Math.min(g.f.length - 2, Math.max(0, Math.floor(fi)));
    const u = clamp(fi - i, 0, 1);
    const a = g.f[i], b = g.f[i + 1];
    out.s = a[0] + (b[0] - a[0]) * u; out.x = a[1] + (b[1] - a[1]) * u;
    out.lean = a[2] + (b[2] - a[2]) * u; out.v = a[3] + (b[3] - a[3]) * u;
    out.done = fi >= g.f.length - 1;
    return out;
  }

  #ghostTimeAtS(s) {
    const S = this.ghostS;
    if (!S.length || s <= S[0]) return 0;
    let lo = 0, hi = S.length - 1;
    if (s >= S[hi]) return hi / this.ghostData.hz;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (S[m] < s) lo = m; else hi = m; }
    const u = (s - S[lo]) / Math.max(1e-6, S[hi] - S[lo]);
    return (lo + u) / this.ghostData.hz;
  }

  // ------------------------------------------------------------------ states
  #setState(s) {
    const prev = this.state;
    // Kiosk: every new player passes the age gate (after results or an attract loop).
    if (AGE_GATE && KIOSK && s === 'title' && (prev === 'results' || prev === 'attract')) s = 'gate';
    this.state = s; this.stateT = 0;
    const show = (id, on) => $(id).classList.toggle('show', on);
    show('gate', s === 'gate');
    show('denied', s === 'denied');
    show('title', s === 'title' || s === 'attract');
    $('title').classList.toggle('attract', s === 'attract');
    show('results', s === 'results');
    this.hud.show(['countdown', 'race', 'finish'].includes(s));
    document.body.classList.toggle('cine', s === 'attract' || s === 'intro');
    if (s === 'gate') this.#openGate();
    if (s === 'title') {
      this.lastInput = performance.now();
      this.#renderTargets();
      this.#focusMenu(0);
      if (prev !== 'attract') { this.st = newState(START_S); this.ghost.root.visible = false; }
    }
    if (s === 'attract') { this.demo = newState(START_S); this.tvCam = null; }
    if (s === 'intro') this.#startIntro();
    if (s === 'results') this.#showResults();
  }

  #startIntro() {
    this.st = newState(START_S);
    const at = +(PARAMS.get('at') || 0);
    if (this.autoplay && at) { this.st.s = at; this.st.v = this.autopilot.sample(this.autopilot.vmax, at); this.st.gear = 3; }
    this.raceT = 0;
    this.split = [null, null, null];
    this.rec = [];
    this.recNext = 0;
    this.#placeBike(this.bike, this.st);
    const f = this.track.frame(this.st.s, _f);
    const bp = this.#bikeWorld(this.st, 0);
    this.camFrom = {
      pos: V3().set(bp.x + f.tx * 4.2 - f.rx * 2.6, bp.y + 0.55, bp.z + f.tz * 4.2 - f.rz * 2.6),
      fov: 40, target: bp.clone().setY(bp.y + 0.75),
    };
    this.chaseYaw = null;
    this.hud.reset(this.best ? this.best.t : null);
    this.hud.lights(0, false);
    this.ghost.root.visible = true;
    this.lastSection = null;
    if (!this.autoplay) this.audio.unlock();
  }

  #finishRace() {
    this.finalT = this.raceT;
    this.#setState('finish');
    this.ghost.root.visible = false;
    this.audio.cheer(4);
    const t = this.finalT;
    const splits = this.split.map((v, i) => v - (i ? this.split[i - 1] : 0));
    this.result = { t, splits, st: { top: this.st.topSpeed, lean: this.st.maxLean, off: this.st.offTime } };
    const prevBest = this.best ? this.best.t : null;
    const pb = prevBest == null || t < prevBest;
    this.result.pb = pb;
    this.result.prevBest = prevBest;
    const bs = this.bestSectors || [Infinity, Infinity, Infinity];
    this.result.sectorCls = splits.map((v, i) => v < bs[i] ? 'purple' : ((this.ghostSplits && v < this.ghostSplits[i]) ? 'green' : 'yellow'));
    this.bestSectors = splits.map((v, i) => Math.min(v, bs[i]));
    Store.save('bestSectors', this.bestSectors);
    if (pb) {
      const f = this.rec.map(r => r.map(v => Math.round(v * 100) / 100));
      this.best = { t, splits, ghost: { hz: GHOST_HZ, f } };
      Store.save('best', this.best);
      this.#setGhost();
    }
    this.hud.msg(pb ? 'Personal best' : 'Lap complete', Store.fmtTime(t), 2600);
  }

  // ------------------------------------------------------------------ main loop
  loop = (now) => {
    requestAnimationFrame(this.loop);
    const dt = FIXED_DT || Math.min(0.05, (now - this.last) / 1000);
    this.frameMs = now - this.last;
    this.last = now;
    this.#pollGamepad();
    if (!this.paused) this.#update(dt);
    this.#render(dt);
    if (!FIXED_DT) this.#perf(dt);
  };

  #update(dt) {
    this.stateT += dt;
    this.world.update(performance.now() / 1000);
    this.dressing.update(performance.now() / 1000);
    const s = this.state;
    if (s === 'gate' || s === 'denied' || s === 'title') this.#updateTitle(dt);
    else if (s === 'attract' || s === 'results') this.#updateDemo(dt, s === 'results');
    else if (s === 'intro') this.#updateIntro(dt);
    else if (s === 'countdown') this.#updateCountdown(dt);
    else if (s === 'race') this.#updateRace(dt);
    else if (s === 'finish') this.#updateFinish(dt);
    this.sparks.update(dt, -9.8, 0.4);
    this.dust.update(dt, 0.6, 1.5);
    this.smoke.update(dt, 0.5, 1.6);
    if (s !== 'intro') this.post.u.uFade.value = Math.max(0, this.post.u.uFade.value - dt * 3);

    // idle → attract (menus) / reset (kiosk results)
    const idle = this.idle = (this.lastInput !== this._li ? 0 : (this.idle || 0) + dt);
    this._li = this.lastInput;
    if (s === 'title' && idle > 22 && this.photo == null && !$('how').classList.contains('show') && !$('board').classList.contains('show')) this.#setState('attract');
    if (s === 'results' && KIOSK && idle > 45) this.#setState(AGE_GATE ? 'gate' : 'title');
    if (s === 'denied' && KIOSK && this.stateT > 8) this.#setState('gate');
  }

  // Title: bike parked on the grid, slow orbit.
  #updateTitle(dt) {
    const st = this.titleSt || (this.titleSt = Object.assign(newState(TITLE_S), { x: 1.5 }));
    st.v = 0; st.lean = 0; st.tuck = 0; st.brake = 0; st.pitch = 0;
    st.rpm = TUNE.idle + (Math.sin(this.stateT * 0.7) > 0.97 ? 5000 : 0);
    st.throttle = st.rpm > 6000 ? 1 : 0;
    this.#placeBike(this.bike, st);
    this.bike.update(dt, { ...st, discHeat: 0 });
    // hero orbit: keep the low sun ~50 degrees off the lens axis so the paint is side-lit
    const sunA = Math.atan2(this.world.sunDir.x, this.world.sunDir.z);
    const side = +(PARAMS.get('side') || -1);
    let a = sunA + Math.PI + side * 0.87 + Math.sin(this.stateT * 0.09) * 0.3;
    const tgt = this.#bikeWorld(st, 0.72);
    this.orbitTarget = tgt;
    let r = 5.6 + Math.sin(this.stateT * 0.2) * 0.4;
    if (this.photo != null) { a = this.bike.yaw + this.photo; r = 3.2; st.lean = +(PARAMS.get('lean') || 0); this.bike.update(0, { ...st, discHeat: 0 }); }
    this.camera.position.set(tgt.x + Math.sin(a) * r, tgt.y + 0.3 + Math.sin(this.stateT * 0.23) * 0.2, tgt.z + Math.cos(a) * r);
    const portrait = innerWidth < innerHeight;
    this.camera.fov = portrait ? 58 : 40;
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(tgt);
    if (this.state === 'title') this.#viewOffset(portrait ? 0 : -0.2, portrait ? 0.22 : 0);
    else this.#viewOffset(0, 0);
    this.camera.updateProjectionMatrix();
    this.#fx(0, 0);
    this.audio.update(st, { ambient: 1, crowd: 0.4, active: this.state === 'title' });
  }

  // Attract / results backdrop: autopilot lap with broadcast cameras.
  #updateDemo(dt, cooldown) {
    const st = cooldown ? this.st : this.demo;
    let acc = (this._acc || 0) + dt;
    while (acc >= PHYS_DT) {
      const inp = this.autopilot.input(st);
      if (cooldown && st.v > 32) { inp.brake = 0.35; }
      step(st, inp, this.track, PHYS_DT);
      acc -= PHYS_DT;
    }
    this._acc = acc;
    if (st.s > this.track.length * 3) st.s -= this.track.length;
    this.#placeBike(this.bike, st);
    this.bike.update(dt, st);
    this.#emitFx(st, dt);
    this.#tvCam(dt, st);
    this.#fx(st.v, 0);
    this.audio.update(st, { ambient: 0.5, crowd: 0.3, active: true });
  }

  #updateIntro(dt) {
    const st = this.st;
    this.#placeBike(this.bike, st);
    this.bike.update(dt, st);
    this.#ghostUpdate(0);
    const T = 2.6;
    const k = ease(clamp((this.stateT - 0.3) / (T - 0.3), 0, 1));
    const to = this.#chaseCam(dt, st, true);
    this.camera.position.lerpVectors(this.camFrom.pos, to.pos, k);
    this.camera.fov = this.camFrom.fov + (to.fov - this.camFrom.fov) * k;
    const tgt = _v2.lerpVectors(this.camFrom.target, to.target, k);
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(tgt);
    this.#viewOffset(0, -0.13 * k);
    this.camera.updateProjectionMatrix();
    this.#fx(0, 0);
    this.post.u.uFade.value = Math.max(0, 1 - this.stateT / 0.4);
    this.audio.update(st, { crowd: 0.5, active: true });
    this.hud.update(st, 0, null, null);
    if (this.stateT > T || (this.autoplay && PARAMS.get('at'))) { this.#setState('countdown'); this.lightsOutAt = 5 * 0.85 + 0.35 + Math.random() * 1.1; this.litN = 0; }
  }

  #updateCountdown(dt) {
    const st = this.st;
    const n = Math.min(5, Math.floor(this.stateT / 0.85));
    if (n !== this.litN && this.stateT < this.lightsOutAt) {
      this.litN = n;
      if (n > 0) this.audio.beep(520, 0.18, 0.2);
    }
    const out = this.stateT >= this.lightsOutAt || (this.autoplay && PARAMS.get('at'));
    this.world.setStartLights(out ? 0 : this.litN);
    this.hud.lights(out ? 0 : this.litN, true);
    const inp = this.#readInput(dt);
    inp.rev = this.litN >= 3;
    if (!(this.autoplay && PARAMS.get('at'))) step(st, inp, this.track, dt, { locked: true, assist: this.#assist() });
    this.#placeBike(this.bike, st);
    this.bike.update(dt, st);
    this.#ghostUpdate(0);
    this.#playerCam(dt, st);
    this.#fx(0, 0);
    this.audio.update(st, { crowd: 0.6, active: true });
    this.hud.update(st, 0, null, null);
    if (out) {
      this.#setState('race');
      this.hud.lights(0, true);
      setTimeout(() => this.hud.lights(0, false), 700);
      this.hud.msg('Lights out', '', 900);
    }
  }

  #updateRace(dt) {
    const st = this.st;
    const T = this.track;
    let acc = (this._acc || 0) + dt;
    const inp = this.#readInput(dt);
    const assist = this.#assist();
    while (acc >= PHYS_DT) {
      step(st, inp, T, PHYS_DT, { assist });
      this.raceT += PHYS_DT;
      acc -= PHYS_DT;
      for (const e of st.events) this.#onEvent(e, st);
      if (this.raceT >= this.recNext) { this.rec.push([st.s, st.x, st.lean, st.v]); this.recNext += 1 / GHOST_HZ; }
      for (let i = 0; i < 2; i++) {
        if (this.split[i] == null && st.s >= SECTORS[i]) this.#sector(i);
      }
      if (st.s >= T.length) { this.split[2] = this.raceT; this.#sector(2); this.#finishRace(); break; }
    }
    this._acc = acc;
    this.#placeBike(this.bike, st);
    this.bike.update(dt, st);
    const g = this.#ghostUpdate(this.raceT);
    this.#emitFx(st, dt);
    this.#playerCam(dt, st);
    this.#fx(st.v, st.v / 95);
    this.audio.update(st, { crowd: this.#crowdNear(st.s), active: true });
    const delta = this.raceT - this.#ghostTimeAtS(st.s);
    if (this.state === 'race') this.hud.update(st, this.raceT, this.raceT > 1 ? delta : null, g);
    // section call-outs
    const sec = T.sectionAt(st.s);
    if (sec && sec !== this.lastSection) { this.hud.callout(`T${sec.num} · ${sec.name}`); }
    this.lastSection = sec;
    // brake coaching (Standard assist): approaching too fast and not braking
    const vt = this.autopilot.sample(this.autopilot.vmax, st.s + st.v * 0.9);
    this.hud.brakeHint(this.settings.assist === 'standard' && st.v > vt + 7 && inp.brake < 0.1 && st.v > 30);
  }

  #updateFinish(dt) {
    const st = this.st;
    let acc = (this._acc || 0) + dt;
    while (acc >= PHYS_DT) {
      const inp = this.autopilot.input(st);
      if (st.v > 40) inp.brake = 0.3;
      step(st, inp, this.track, PHYS_DT);
      acc -= PHYS_DT;
    }
    this._acc = acc;
    this.#placeBike(this.bike, st);
    this.bike.update(dt, st);
    this.#ghostUpdate(this.raceT + this.stateT);
    this.#emitFx(st, dt);
    this.#tvCam(dt, st, true);
    this.#fx(st.v, 0);
    this.audio.update(st, { crowd: 0.8, active: true });
    this.hud.brakeHint(false);
    if (this.stateT > 3.2) this.#setState('results');
  }

  #sector(i) {
    this.split[i] = this.raceT;
    const time = this.raceT - (i ? this.split[i - 1] : 0);
    const gEnd = this.#ghostTimeAtS(i < 2 ? SECTORS[i] : this.track.length);
    const gStart = i ? this.#ghostTimeAtS(SECTORS[i - 1]) : 0;
    const gTime = gEnd - gStart;
    this.ghostSplits = this.ghostSplits || [];
    this.ghostSplits[i] = gTime;
    const bs = this.bestSectors;
    const cls = bs && time < bs[i] ? 'purple' : time < gTime ? 'green' : 'yellow';
    this.hud.setSector(i, cls, time - gTime);
    if (i < 2) this.hud.msg(Store.fmtDelta(time - gTime), `Sector ${i + 1}`, 1300, cls === 'yellow' ? 'warn' : '');
  }

  #onEvent(e, st) {
    if (e.type === 'upshift') { this.audio.upshift(); this.flame = 0.06; }
    if (e.type === 'downshift') { this.audio.pop(0.8); this.flame = 0.05; }
    if (e.type === 'wall') {
      this.audio.thud(e.power * 1.6);
      this.shake = Math.max(this.shake || 0, e.power * 1.2);
      const p = this.#bikeWorld(st, 0.4);
      for (let i = 0; i < 40; i++) this.sparks.emit(p, _v.set((Math.random() - 0.5) * 8, Math.random() * 5, (Math.random() - 0.5) * 8), 0.6 + Math.random() * 0.5, new THREE.Color(4, 2.2, 0.8), 0.07, p.y - 0.4);
    }
    if (e.type === 'offtrack' && this.state === 'race') this.hud.msg('Track limits', '', 900, 'warn');
  }

  #crowdNear(s) {
    const L = this.track.length;
    const ss = ((s % L) + L) % L;
    const d = Math.min(Math.abs(ss - 10), Math.abs(ss - 10 - L), Math.abs(ss - 640));
    return clamp(1 - d / 250, 0.1, 1);
  }

  #assist() { return this.settings.assist === 'pro' ? 0.35 : TUNE.assist; }

  // ------------------------------------------------------------------ bike placement
  #placeBike(model, st) {
    const f = this.track.frame(st.s, _f);
    const x = f.x + f.rx * st.x, z = f.z + f.rz * st.x;
    model.root.position.set(x, f.y + 0.02, z);
    const yaw = Math.atan2(f.tx, f.tz) - (st.psi || 0);
    model.root.rotation.set(-Math.atan(f.slope), yaw, 0, 'YXZ');
    model.yaw = yaw;
  }

  #bikeWorld(st, up = 0.8) {
    return this.track.toWorld(st.s, st.x, V3(), up);
  }

  #ghostUpdate(t) {
    if (!this.ghost.root.visible) return null;
    const g = this.#ghostAt(t, this._gs || (this._gs = {}));
    const gs = { s: g.s, x: g.x, lean: g.lean, v: g.v, psi: 0, pitch: 0, tuck: g.v > 38 ? 1 : 0, brake: 0, discHeat: 0 };
    this.#placeBike(this.ghost, gs);
    this.ghost.update(1 / 60, gs);
    const d = this.ghost.root.position.distanceTo(this.bike.root.position);
    this.ghost.ghostMat.uniforms.uAlpha.value = clamp((d - 2) / 10, 0, 0.6);
    return g;
  }

  // ------------------------------------------------------------------ cameras
  #chaseCam(dt, st, peek = false) {
    const bp = this.bike.root.position;
    const vN = clamp(st.v / 95, 0, 1);
    if (this.chaseYaw == null) this.chaseYaw = this.bike.yaw;
    const yaw = peek ? this.bike.yaw : (this.chaseYaw = dampAngle(this.chaseYaw, this.bike.yaw, 7.5, dt));
    const dist = 4.5 + vN * 1.0, h = 1.75 - vN * 0.12;
    const fx = Math.sin(yaw), fz = Math.cos(yaw);
    const pos = V3().set(bp.x - fx * dist, bp.y + h, bp.z - fz * dist);
    const target = V3().set(bp.x + fx * 1.6, bp.y + 0.95, bp.z + fz * 1.6);
    const portrait = innerWidth < innerHeight;
    const fov = (58 + 18 * vN * vN) * (portrait ? 1.45 : 1);
    return { pos, target, fov };
  }

  #playerCam(dt, st) {
    const cam = this.camera;
    const onboard = this.settings.cam === 'onboard';
    this.#riderVisible(!onboard);
    let fovBase;
    if (onboard) {
      const local = _v.set(0, 1.2 - st.tuck * 0.07, 0.3);
      const pos = this.bike.body.localToWorld(local.clone());
      const yaw = this.bike.yaw;
      cam.position.copy(pos);
      cam.up.set(0, 1, 0);
      cam.lookAt(_v2.set(pos.x + Math.sin(yaw) * 10, pos.y - 0.2, pos.z + Math.cos(yaw) * 10));
      cam.rotateZ(-st.lean * 0.62);
      fovBase = (70 + 14 * clamp(st.v / 95, 0, 1)) * (innerWidth < innerHeight ? 1.35 : 1);
    } else {
      const c = this.#chaseCam(dt, st);
      if (!this.camInit) { cam.position.copy(c.pos); this.camInit = true; }
      cam.position.copy(c.pos);
      cam.position.y = damp(this.camY ?? c.pos.y, c.pos.y, 10, dt);
      this.camY = cam.position.y;
      cam.up.set(0, 1, 0);
      cam.lookAt(c.target);
      this.camRoll = damp(this.camRoll || 0, st.lean * 0.3, 6, dt);
      cam.rotateZ(-this.camRoll);
      fovBase = c.fov;
    }
    this.#viewOffset(0, onboard ? 0 : (innerWidth < innerHeight ? 0.03 : -0.13));
    // shake: speed buzz + kerbs + impacts
    const vN = clamp(st.v / 95, 0, 1);
    this.shake = Math.max(0, (this.shake || 0) - dt * 2.5);
    const amp = 0.0025 * vN * vN + (st.kerb ? 0.006 : 0) + (st.surface === 'grass' || st.surface === 'gravel' ? 0.01 : 0) + this.shake * 0.02;
    const t = performance.now() / 1000;
    cam.rotateX(Math.sin(t * 43) * amp + Math.sin(t * 71) * amp * 0.5);
    cam.rotateY(Math.cos(t * 37) * amp * 0.6);
    cam.fov = damp(cam.fov, fovBase, 5, dt);
    cam.updateProjectionMatrix();
  }

  // Shift the rendered frame (fractions of the screen) without changing the camera's aim.
  #viewOffset(fx, fy) {
    const c = this.camera, w = innerWidth, h = innerHeight;
    if (fx || fy) c.setViewOffset(w, h, w * fx, h * fy, w, h);
    else if (c.view && c.view.enabled) c.clearViewOffset();
  }

  #riderVisible(on) {
    if (this._riderVis === on) return;
    this._riderVis = on;
    const L = this.bike.limbs;
    for (const k of ['torso', 'hump', 'neck', 'pelvis']) L[k].visible = on;
    this.bike.helmet.visible = on;
  }

  // Broadcast-style trackside cameras with long lenses.
  #tvCam(dt, st, finish = false) {
    this.#riderVisible(true);
    const T = this.track, L = T.length;
    if (!this.tvSpots) {
      this.tvSpots = [];
      const blocked = (p) => (this.world.placedBoxes || []).some(b => Math.abs(p.x - b.x) < b.hx + 4 && Math.abs(p.z - b.z) < b.hz + 4);
      for (let s = 0; s < L; s += 150) {
        const f = T.frame(s);
        for (const side of [-T.turnSide[f.i], T.turnSide[f.i]]) {
          const lat = side * (30 + (s % 3) * 7);
          const p = T.toWorld(s, lat);
          if (blocked(p)) continue;
          p.y = Math.max(this.world.heightAt(p.x, p.z), f.y) + 3 + (s % 4) * 2.2;
          this.tvSpots.push({ s, p });
          break;
        }
      }
    }
    const ss = ((st.s % L) + L) % L;
    const rel = (spot) => { let d = spot.s - ss; if (d < -L / 2) d += L; if (d > L / 2) d -= L; return d; };
    if (!this.tvCam || rel(this.tvCam) < -45 || this.tvCamT > 9) {
      let best = null, bd = Infinity;
      for (const spot of this.tvSpots) { const d = rel(spot); if (d > 35 && d < bd) { bd = d; best = spot; } }
      this.tvCam = best; this.tvCamT = 0;
    }
    this.tvCamT = (this.tvCamT || 0) + dt;
    const cam = this.camera;
    const bp = this.bike.root.position;
    this.#viewOffset(0, 0);
    cam.position.copy(this.tvCam.p);
    const lead = _v.set(Math.sin(this.bike.yaw), 0, Math.cos(this.bike.yaw)).multiplyScalar(st.v * 0.08);
    const tgt = _v2.copy(bp).add(lead); tgt.y += 0.8;
    if (!this.tvLook || this.tvCamT < dt * 1.5) this.tvLook = tgt.clone();
    this.tvLook.lerp(tgt, 1 - Math.exp(-8 * dt));
    cam.up.set(0, 1, 0);
    cam.lookAt(this.tvLook);
    const dist = cam.position.distanceTo(bp);
    cam.fov = clamp(2 * Math.atan(3.6 / dist) * 180 / Math.PI * (innerWidth < innerHeight ? 1.6 : 1), 5, 55);
    cam.updateProjectionMatrix();
  }

  // ------------------------------------------------------------------ effects
  #exhaustFlame() {
    const mat = new THREE.SpriteMaterial({ map: TX.radialTexture('rgba(255,210,150,1)', 'rgba(255,90,20,0)'), color: new THREE.Color(3, 1.6, 0.6), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
    this.flameSprite = new THREE.Sprite(mat);
    this.flameSprite.scale.setScalar(0.001);
    this.flameSprite.position.copy(this.bike.exhaustTip);
    this.bike.body.add(this.flameSprite);
    this.flame = 0;
  }

  #emitFx(st, dt) {
    // exhaust flame
    this.flame = Math.max(0, (this.flame || 0) - dt);
    const popping = this.audio.ctx && this.audio.lastPop && this.audio.ctx.currentTime - this.audio.lastPop < 0.05;
    const fs = this.flame > 0 || popping ? 0.22 + Math.random() * 0.18 : 0.001;
    this.flameSprite.scale.setScalar(fs);
    const lean = Math.abs(st.lean);
    const bp = this.bike.root.position;
    if (lean > 0.86 && st.v > 14) {
      const n = Math.random() < 0.7 ? 2 : 1;
      const k = this.bike.kneeWorld(st.lean > 0, _v);
      const fy = this.track.frame(st.s, _f).y;
      k.y = Math.max(fy + 0.04, k.y - 0.12);
      const fx = Math.sin(this.bike.yaw), fz = Math.cos(this.bike.yaw);
      for (let i = 0; i < n; i++) {
        this.sparks.emit(k, _v2.set(fx * st.v * 0.45 + (Math.random() - 0.5) * 3, 0.5 + Math.random() * 2.2, fz * st.v * 0.45 + (Math.random() - 0.5) * 3),
          0.25 + Math.random() * 0.35, new THREE.Color(5, 2.6, 0.9), 0.05 + Math.random() * 0.03, fy + 0.02);
      }
    }
    // titanium skid-plate sparks at speed over bumps
    if (st.v > 72 && Math.random() < 0.05 + (st.kerb ? 0.3 : 0)) {
      const p = this.bike.body.localToWorld(_v.set(0, 0.08, -0.25));
      const fy = this.track.frame(st.s, _f).y;
      const fx = Math.sin(this.bike.yaw), fz = Math.cos(this.bike.yaw);
      for (let i = 0; i < 14; i++) this.sparks.emit(p, _v2.set(fx * st.v * 0.35 + (Math.random() - 0.5) * 4, Math.random() * 1.5, fz * st.v * 0.35 + (Math.random() - 0.5) * 4), 0.3 + Math.random() * 0.4, new THREE.Color(5, 3.2, 1.3), 0.045, fy + 0.02);
    }
    // tyre smoke: the rear skipping under hard braking, and wheelspin off the line
    const launch = st.gear === 0 && st.throttle > 0.5 && st.v > 1 && st.v < 18;
    if (((st.brake > 0.55 && st.v > 22 && lean < 0.5) || launch) && Math.random() < (launch ? 0.9 : 0.5)) {
      const p = this.bike.body.localToWorld(_v.set((Math.random() - 0.5) * 0.12, 0.06, -0.78));
      const fx = Math.sin(this.bike.yaw), fz = Math.cos(this.bike.yaw);
      this.smoke.emit(p, _v2.set(fx * st.v * 0.35 + (Math.random() - 0.5) * 1.5, 0.3 + Math.random() * 0.8, fz * st.v * 0.35 + (Math.random() - 0.5) * 1.5),
        1.1 + Math.random() * 0.9, SMOKE, 0.35 + Math.random() * 0.3, bp.y + 0.05);
    }
    // off-track dust
    if ((st.surface === 'grass' || st.surface === 'gravel') && st.v > 4) {
      const p = this.bike.body.localToWorld(_v.set(0, 0.1, -0.8));
      const col = st.surface === 'gravel' ? new THREE.Color(0.75, 0.66, 0.5) : new THREE.Color(0.45, 0.4, 0.28);
      for (let i = 0; i < 2; i++) this.dust.emit(p, _v2.set((Math.random() - 0.5) * 3, 1 + Math.random() * 2, (Math.random() - 0.5) * 3), 0.8 + Math.random() * 0.6, col, 0.5 + Math.random() * 0.6, bp.y);
    }
  }

  #fx(v, speedFx) {
    const u = this.post.u;
    u.uSpeed.value = damp(u.uSpeed.value, clamp((speedFx - 0.55) / 0.45, 0, 1), 4, 1 / 60);
    u.uLines.value = u.uSpeed.value;
    // sun screen position
    const sp = _v.copy(this.world.sunDir).multiplyScalar(4000).add(this.camera.position).project(this.camera);
    const onScreen = sp.z < 1 && Math.abs(sp.x) < 1.2 && Math.abs(sp.y) < 1.2;
    u.uSun.value.set(sp.x * 0.5 + 0.5, sp.y * 0.5 + 0.5);
    u.uSunOn.value = onScreen ? 1 - clamp((Math.max(Math.abs(sp.x), Math.abs(sp.y)) - 0.9) / 0.3, 0, 1) : 0;
    const raysOn = sp.z < 1 ? 1 - clamp((Math.max(Math.abs(sp.x), Math.abs(sp.y)) - 1.0) / 0.9, 0, 1) : 0;
    this.post.setRays(u.uSun.value, raysOn);
  }

  // Live reflections for the bike: a small cube map around it, one face re-rendered per frame, so the paint and
  // visor mirror the trees, stands and sky it is passing instead of a generic sky.
  #setupReflections() {
    const size = QUALITY.bikeReflections;
    if (!size) return;
    const rt = new THREE.WebGLCubeRenderTarget(size, { type: THREE.HalfFloatType });
    this.cubeCam = new THREE.CubeCamera(0.5, 1200, rt);
    this.cubeCam.coordinateSystem = this.renderer.coordinateSystem;
    this.cubeCam.updateCoordinateSystem(); // faces are rendered one at a time below, not via update()
    this.cubeRT = rt;
    this.cubeFace = 0;
    this.bike.root.traverse(o => {
      if (!o.isMesh) return;
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) if (m.isMeshStandardMaterial) m.envMap = rt.texture;
    });
  }

  #updateReflections() {
    if (!this.cubeCam) return;
    const cc = this.cubeCam;
    if (this.cubeFace === 0) { cc.position.copy(this.bike.root.position); cc.position.y += 0.8; cc.updateMatrixWorld(); }
    const hide = [this.bike.root, this.ghost.root, this.sparks.points, this.dust.points, this.smoke.points, ...this.world.grassChunks.map(c => c.mesh)];
    const vis = hide.map(o => o.visible);
    hide.forEach(o => { o.visible = false; });
    const r = this.renderer, prev = r.getRenderTarget();
    const face = cc.children[this.cubeFace];
    r.setRenderTarget(this.cubeRT, this.cubeFace);
    r.render(this.scene, face);
    r.setRenderTarget(prev);
    hide.forEach((o, i) => { o.visible = vis[i]; });
    this.cubeFace = (this.cubeFace + 1) % 6;
    if (this.cubeFace === 0) this.cubeRT.texture.needsPMREMUpdate = true;
  }

  #render(dt) {
    this.#updateReflections();
    this.world.followShadow(this.bike.root.position);
    const cam = this.post.renderPass.camera;
    cam.updateMatrixWorld();
    this.world.updateView(cam);
    // Depth of field on the cinematic shots, focused on the bike.
    if (this.post.dof) {
      const s = this.state;
      const want = ['gate', 'denied', 'title', 'intro', 'attract', 'finish', 'results'].includes(s) ? 1 : 0;
      this._dof = damp(this._dof || 0, want, 3, dt);
      const bp = this.bike.root.position;
      const focus = cam.position.distanceTo(_v.set(bp.x, bp.y + 0.8, bp.z));
      this.post.setDof(this._dof, focus, Math.max(1.2, focus * 0.12));
    }
    this.post.render(dt);
  }

  // Adaptive resolution: keep the frame rate up on phones and kiosks.
  #perf(dt) {
    this._pf = this._pf || { t: 0, n: 0, sum: 0 };
    const p = this._pf;
    p.t += dt; p.n++; p.sum += dt;
    if (p.t < 2) return;
    const avg = p.sum / p.n;
    p.t = 0; p.n = 0; p.sum = 0;
    const pr = this.renderer.getPixelRatio();
    const maxPr = Math.min(devicePixelRatio, QUALITY.maxDpr);
    const minPr = Math.min(maxPr, QUALITY.minDpr);
    let next = pr;
    if (avg > 1 / 45 && pr > minPr) next = Math.max(minPr, pr - 0.15);
    else if (avg < 1 / 57 && pr < maxPr) next = Math.min(maxPr, pr + 0.1);
    if (Math.abs(next - pr) > 0.01) { this.renderer.setPixelRatio(next); this.#resize(); }
  }

  #resize() {
    const w = innerWidth, h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.post.setSize(w, h);
    this.sparks.resize(this.renderer.getPixelRatio());
    this.dust.resize(this.renderer.getPixelRatio());
    this.smoke.resize(this.renderer.getPixelRatio());
    document.body.classList.toggle('landscape', w > h);
  }

  // ------------------------------------------------------------------ input
  #setupInput() {
    this.keys = new Set();
    this.touchBtns = new Map();
    const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    document.body.classList.toggle('is-touch', isTouch);
    if (KIOSK) document.body.classList.add('kiosk');
    addEventListener('keydown', (e) => {
      this.lastInput = performance.now();
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter'].includes(e.code)) e.preventDefault();
      if (e.repeat) return;
      this.keys.add(e.code);
      this.#onKey(e);
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
    addEventListener('pointerdown', () => { this.lastInput = performance.now(); this.audio.unlock(); if (this.state === 'attract') this.#setState('title'); });
    addEventListener('contextmenu', (e) => e.preventDefault());
    // Touch buttons (multi-touch, slide between left/right)
    const touch = $('touch');
    const which = (x, y) => { const el = document.elementFromPoint(x, y); const b = el && el.closest('.tbtn'); return b ? b.id : null; };
    const upd = () => { for (const id of ['tL', 'tR', 'tB']) $(id).classList.toggle('on', [...this.touchBtns.values()].includes(id)); };
    touch.addEventListener('pointerdown', (e) => { const id = which(e.clientX, e.clientY); if (id) { this.touchBtns.set(e.pointerId, id); e.preventDefault(); upd(); } });
    addEventListener('pointermove', (e) => { if (this.touchBtns.has(e.pointerId)) { const id = which(e.clientX, e.clientY); if (id && id !== 'tB' && this.touchBtns.get(e.pointerId) !== 'tB') this.touchBtns.set(e.pointerId, id); upd(); } });
    const end = (e) => { if (this.touchBtns.delete(e.pointerId)) upd(); };
    addEventListener('pointerup', end); addEventListener('pointercancel', end);
  }

  #pollGamepad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    this.pad = null;
    for (const p of pads) if (p && p.connected) { this.pad = p; break; }
    if (!this.pad) return;
    const b = (i) => this.pad.buttons[i] && this.pad.buttons[i].pressed;
    const prev = this.padPrev || {};
    const now = { a: b(0), b: b(1), y: b(3), start: b(9), up: b(12), down: b(13) };
    const pressed = (k) => now[k] && !prev[k];
    if (Object.values(now).some(Boolean) || Math.abs(this.pad.axes[0] || 0) > 0.3) this.lastInput = performance.now();
    if (pressed('start')) this.#onKey({ code: 'Escape', gamepad: true });
    if (pressed('a')) this.#onKey({ code: 'Enter', gamepad: true });
    if (pressed('b') && this.state !== 'race') this.#onKey({ code: 'Escape', gamepad: true });
    if (pressed('y')) this.#onKey({ code: 'KeyC', gamepad: true });
    if (pressed('up')) this.#onKey({ code: 'ArrowUp', gamepad: true });
    if (pressed('down')) this.#onKey({ code: 'ArrowDown', gamepad: true });
    this.padPrev = now;
  }

  #readInput(dt) {
    if (this.autoplay) return this.autopilot.input(this.st);
    const k = this.keys;
    let right = (k.has('ArrowRight') || k.has('KeyD') ? 1 : 0) - (k.has('ArrowLeft') || k.has('KeyA') ? 1 : 0);
    let brake = k.has('ArrowDown') || k.has('KeyS') || k.has('Space') ? 1 : 0;
    const tb = [...this.touchBtns.values()];
    if (tb.includes('tR')) right += 1;
    if (tb.includes('tL')) right -= 1;
    if (tb.includes('tB')) brake = 1;
    let analog = null;
    if (this.pad) {
      const ax = this.pad.axes[0] || 0;
      if (Math.abs(ax) > 0.08) analog = Math.sign(ax) * (Math.abs(ax) - 0.08) / 0.92;
      const lt = this.pad.buttons[6] ? this.pad.buttons[6].value : 0;
      const rt = this.pad.buttons[7] ? this.pad.buttons[7].value : 0;
      brake = Math.max(brake, lt, rt * 0, this.pad.buttons[2] && this.pad.buttons[2].pressed ? 1 : 0, this.pad.buttons[1] && this.pad.buttons[1].pressed ? 1 : 0);
    }
    right = clamp(right, -1, 1);
    this.steer = this.steer || 0;
    if (analog != null) this.steer = analog;
    else {
      const rate = right === 0 ? 7 : (Math.sign(right) !== Math.sign(this.steer) && this.steer !== 0 ? 9 : 4.5);
      this.steer += clamp(right - this.steer, -rate * dt, rate * dt);
    }
    return { steer: this.steer, brake };
  }

  #onKey(e) {
    const c = e.code;
    const s = this.state;
    if (c === 'KeyM') { this.#toggle('sound'); return; }
    if (s === 'attract') { this.#setState('title'); return; }
    if ($('how').classList.contains('show')) { if (c === 'Enter' || c === 'Escape' || c === 'Space') this.#modal('how', false); return; }
    if ($('board').classList.contains('show')) { if (c === 'Enter' || c === 'Escape') this.#modal('board', false); return; }
    if (s === 'title') {
      if (c === 'ArrowDown' || c === 'KeyS') this.#focusMenu(this.menuIdx + 1);
      if (c === 'ArrowUp' || c === 'KeyW') this.#focusMenu(this.menuIdx - 1);
      if (c === 'Enter' || (e.gamepad && c === 'Enter')) this.menuBtns[this.menuIdx].click();
      if (c === 'KeyC') this.#toggle('cam');
      return;
    }
    if (s === 'gate' && c === 'Enter') { $('gateForm').requestSubmit(); return; }
    if (['intro', 'countdown', 'race'].includes(s)) {
      if (c === 'Escape' || c === 'KeyP') this.#pause(!this.paused);
      else if (this.paused && c === 'KeyR') { this.#pause(false); this.#setState('intro'); }
      else if (this.paused && c === 'Enter') this.#pause(false);
      else if (c === 'KeyC') this.#toggle('cam');
      return;
    }
    if (s === 'results') {
      if (!$('rInit').classList.contains('hidden')) { this.#initialsKey(c, e.key); return; }
      if (c === 'Enter' || c === 'KeyR') this.#ride();
      if (c === 'Escape') this.#setState('title');
    }
  }

  #pause(on) {
    this.paused = on;
    this.#modal('pause', on);
    if (this.audio.ctx) on ? this.audio.ctx.suspend() : this.audio.ctx.resume();
  }

  // ------------------------------------------------------------------ UI
  #setupUI() {
    // region + gate
    const sel = $('region');
    for (const [k, r] of Object.entries(AGE_RULES)) {
      const o = document.createElement('option'); o.value = k; o.textContent = `${r.label} (${r.age}+)`; sel.appendChild(o);
    }
    sel.value = this.region;
    sel.addEventListener('change', () => { this.region = sel.value; Store.save('region', sel.value); this.#applyRegion(); });
    this.#applyRegion();
    const ins = ['dobA', 'dobB', 'dobY'].map($);
    ins.forEach((inp, i) => inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/\D/g, '');
      if (inp.value.length >= inp.maxLength && ins[i + 1]) ins[i + 1].focus();
    }));
    $('gateForm').addEventListener('submit', (e) => { e.preventDefault(); this.#checkAge(); });

    // title menu
    this.menuBtns = [$('btnRide'), $('btnBoard'), $('btnHow')];
    this.menuIdx = 0;
    this.menuBtns.forEach((b, i) => b.addEventListener('mouseenter', () => this.#focusMenu(i)));
    $('btnRide').addEventListener('click', () => this.#ride());
    $('btnBoard').addEventListener('click', () => { this.#renderBoard($('boardTable')); this.#modal('board', true); });
    $('btnHow').addEventListener('click', () => this.#modal('how', true));
    $('howClose').addEventListener('click', () => this.#modal('how', false));
    $('boardClose').addEventListener('click', () => this.#modal('board', false));
    $('togCam').addEventListener('click', () => this.#toggle('cam'));
    $('togAssist').addEventListener('click', () => this.#toggle('assist'));
    $('togSound').addEventListener('click', () => this.#toggle('sound'));
    $('togGfx').addEventListener('click', () => {
      // Tiers change what gets built (trees, grass, shadow maps), so apply by reloading.
      const next = QUALITY_TIERS[(QUALITY_TIERS.indexOf(QUALITY.tier) + 1) % QUALITY_TIERS.length];
      Store.save('gfx', next);
      this.audio.click();
      const u = new URL(location.href);
      u.searchParams.delete('q');
      location.replace(u.toString());
    });
    $('togFull').addEventListener('click', () => {
      const d = document;
      if (d.fullscreenElement) d.exitFullscreen && d.exitFullscreen();
      else d.documentElement.requestFullscreen && d.documentElement.requestFullscreen().catch(() => {});
    });
    if (!document.documentElement.requestFullscreen) $('togFull').classList.add('hidden');
    this.#syncToggles();
    // pause + results
    $('pauseBtn').addEventListener('click', () => this.#pause(true));
    $('pResume').addEventListener('click', () => this.#pause(false));
    $('pRestart').addEventListener('click', () => { this.#pause(false); this.#setState('intro'); });
    $('pQuit').addEventListener('click', () => { this.#pause(false); this.world.setStartLights(0); this.#setState('title'); });
    $('rAgain').addEventListener('click', () => this.#ride());
    $('rMenu').addEventListener('click', () => this.#setState('title'));
    $('rSave').addEventListener('click', () => this.#saveInitials());
  }

  #applyRegion() {
    const r = AGE_RULES[this.region] || AGE_RULES[DEFAULT_REGION];
    $('legalLine').textContent = r.line;
    $('gateLine').textContent = r.line;
    const us = this.region === 'US';
    $('dobA').placeholder = us ? 'MM' : 'DD';
    $('dobB').placeholder = us ? 'DD' : 'MM';
    $('gateAsk').textContent = `You must be ${r.age} or over to enter. Enter your date of birth.`;
  }

  #openGate() {
    ['dobA', 'dobB', 'dobY'].forEach(id => { $(id).value = ''; });
    $('gateErr').textContent = '';
    if (!document.body.classList.contains('is-touch')) setTimeout(() => $('dobA').focus(), 300);
  }

  #checkAge() {
    this.audio.unlock();
    const us = this.region === 'US';
    const a = +$('dobA').value, b = +$('dobB').value, y = +$('dobY').value;
    const d = us ? b : a, m = us ? a : b;
    const err = $('gateErr');
    const now = new Date();
    const valid = y > 1900 && y <= now.getFullYear() && m >= 1 && m <= 12 && d >= 1 && d <= new Date(y, m, 0).getDate();
    if (!valid) { err.textContent = 'Please enter a valid date of birth.'; return; }
    let age = now.getFullYear() - y;
    if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;
    const need = (AGE_RULES[this.region] || AGE_RULES.OTHER).age;
    if (age < need) { this.#setState('denied'); return; }
    if (!KIOSK) Store.sessionSet('gate', '1');
    this.#setState('title');
  }

  #focusMenu(i) {
    this.menuIdx = (i + this.menuBtns.length) % this.menuBtns.length;
    this.menuBtns.forEach((b, j) => b.classList.toggle('focus', j === this.menuIdx));
  }

  #modal(id, on) {
    $(id).classList.toggle('show', on);
    this.audio.click();
  }

  #toggle(k) {
    const s = this.settings;
    if (k === 'cam') s.cam = s.cam === 'chase' ? 'onboard' : 'chase';
    if (k === 'assist') s.assist = s.assist === 'standard' ? 'pro' : 'standard';
    if (k === 'sound') { s.sound = !s.sound; this.audio.setEnabled(s.sound); }
    Store.save('settings', s);
    this.#syncToggles();
    this.audio.click();
  }

  #syncToggles() {
    const s = this.settings;
    $('togCam').querySelector('b').textContent = s.cam === 'chase' ? 'Chase' : 'Onboard';
    $('togAssist').querySelector('b').textContent = s.assist === 'standard' ? 'Standard' : 'Pro';
    $('togSound').querySelector('b').textContent = s.sound ? 'On' : 'Off';
    $('togGfx').querySelector('b').textContent = { ultra: 'Ultra', high: 'High', mid: 'Balanced', low: 'Performance' }[QUALITY.tier];
    this.audio && this.audio.setEnabled(s.sound);
  }

  #renderTargets() {
    const m = this.medals;
    const best = this.best ? `<span>Your best<b>${Store.fmtTime(this.best.t)}</b></span>` : '';
    $('targets').innerHTML =
      `<span><i class="medal-dot m-gold"></i>${Store.fmtTime(m.gold)}</span>` +
      `<span><i class="medal-dot m-silver"></i>${Store.fmtTime(m.silver)}</span>` +
      `<span><i class="medal-dot m-bronze"></i>${Store.fmtTime(m.bronze)}</span>` + best;
  }

  #ride() {
    if (!this.autoplay) this.audio.unlock();
    this.audio.click();
    this.#setState('intro');
  }

  // ------------------------------------------------------------------ results + leaderboard
  #showResults() {
    const r = this.result;
    if (!r) return;
    $('rTime').textContent = Store.fmtTime(r.t);
    const m = this.medals;
    const medal = r.t <= m.gold ? 'gold' : r.t <= m.silver ? 'silver' : r.t <= m.bronze ? 'bronze' : 'none';
    const medalTxt = { gold: 'Gold', silver: 'Silver', bronze: 'Bronze', none: `Bronze at ${Store.fmtTime(m.bronze)}` }[medal];
    let flags = `<span class="medal ${medal}">${medal !== 'none' ? '<i class="medal-dot m-' + medal + '"></i>' : ''}${medalTxt}</span>`;
    if (r.pb) flags += `<span class="pb">${r.prevBest == null ? 'First lap set' : 'Personal best ' + Store.fmtDelta(r.t - r.prevBest)}</span>`;
    $('rFlags').innerHTML = flags;
    $('rSectors').innerHTML = r.splits.map((v, i) => `<div class="${r.sectorCls[i]}"><small>Sector ${i + 1}</small><b>${v.toFixed(3)}</b></div>`).join('');
    $('rStats').innerHTML =
      `<div><small>Top speed</small><b>${Math.round(r.st.top)}</b> km/h</div>` +
      `<div><small>Max lean</small><b>${Math.round(r.st.lean * 180 / Math.PI)}&deg;</b></div>` +
      `<div><small>Off track</small><b>${r.st.off.toFixed(1)}</b> s</div>`;
    const qualifies = this.board.length < 10 || r.t < this.board[this.board.length - 1].t;
    this.initials = Store.load('lastInitials', 'AAA').split('');
    this.initCur = 0;
    $('rInit').classList.toggle('hidden', !qualifies);
    this.pendingEntry = qualifies ? { t: r.t } : null;
    this.#renderSlots();
    this.#renderBoard($('rBoard'), qualifies ? r.t : null, null, qualifies ? 6 : 10);
  }

  #renderSlots() {
    const wrap = $('rSlots');
    wrap.innerHTML = '';
    this.initials.forEach((ch, i) => {
      const d = document.createElement('div');
      d.className = 'slot' + (i === this.initCur ? ' cur' : '');
      d.innerHTML = `<button aria-label="Next letter">&#9650;</button><b>${ch}</b><button aria-label="Previous letter">&#9660;</button>`;
      const [up, , down] = d.children;
      up.addEventListener('click', () => { this.initCur = i; this.#cycle(1); });
      down.addEventListener('click', () => { this.initCur = i; this.#cycle(-1); });
      d.children[1].addEventListener('click', () => { this.initCur = i; this.#renderSlots(); });
      wrap.appendChild(d);
    });
  }

  #cycle(dir) {
    const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const c = this.initials[this.initCur];
    this.initials[this.initCur] = A[(A.indexOf(c) + dir + A.length) % A.length];
    this.#renderSlots();
  }

  #initialsKey(code, key) {
    if (/^[a-z0-9]$/i.test(key || '')) { this.initials[this.initCur] = key.toUpperCase(); this.initCur = Math.min(2, this.initCur + 1); this.#renderSlots(); return; }
    if (code === 'ArrowUp') this.#cycle(1);
    else if (code === 'ArrowDown') this.#cycle(-1);
    else if (code === 'ArrowRight') { this.initCur = Math.min(2, this.initCur + 1); this.#renderSlots(); }
    else if (code === 'ArrowLeft' || code === 'Backspace') { this.initCur = Math.max(0, this.initCur - 1); this.#renderSlots(); }
    else if (code === 'Enter') this.#saveInitials();
  }

  #saveInitials() {
    if (!this.pendingEntry) return;
    const n = this.initials.join('');
    Store.save('lastInitials', n);
    const entry = { n, t: this.pendingEntry.t, d: Date.now() };
    this.board.push(entry);
    this.board.sort((a, b) => a.t - b.t);
    this.board = this.board.slice(0, 10);
    Store.save('board', this.board);
    this.pendingEntry = null;
    $('rInit').classList.add('hidden');
    this.#renderBoard($('rBoard'), null, entry);
    this.audio.click();
  }

  #renderBoard(table, pendingT = null, highlight = null, limit = 10) {
    const list = this.board.map(e => ({ ...e, ref: e }));
    if (pendingT != null) {
      const pos = list.filter(e => e.t <= pendingT).length;
      list.splice(pos, 0, { n: 'YOU', t: pendingT, me: true });
    }
    const rows = list.slice(0, limit).map((e, i) => {
      const me = e.me || (highlight && e.ref === highlight);
      return `<tr class="${me ? 'me' : ''}"><td>${i + 1}</td><td class="n">${e.n}</td><td class="h">${e.house ? 'House' : ''}</td><td class="t">${Store.fmtTime(e.t)}</td></tr>`;
    });
    table.innerHTML = rows.join('');
  }

  // Debug helper: ?auto=race runs the autopilot as the player (for screenshots).
  #debugAuto(mode) {
    this.settings.cam = PARAMS.get('cam') || this.settings.cam;
    if (mode === 'title') { Store.sessionSet('gate', '1'); this.#setState('title'); return; }
    if (mode === 'attract') { this.#setState('attract'); return; }
    if (mode === 'bike') {
      Store.sessionSet('gate', '1'); this.#setState('title'); $('title').classList.remove('show');
      this.photo = +(PARAMS.get('ang') || 0);
      return;
    }
    Store.sessionSet('gate', '1');
    this.autoplay = true;
    this.#setState('intro');
  }
}

function guessRegion() {
  const l = (navigator.language || '').toUpperCase();
  if (l.endsWith('-US')) return 'US';
  if (l.endsWith('-GB')) return 'UK';
  if (l.endsWith('-NZ')) return 'NZ';
  if (l.endsWith('-CA')) return 'CA';
  if (l.startsWith('JA')) return 'JP';
  if (l.startsWith('KO')) return 'KR';
  return DEFAULT_REGION;
}

async function boot() {
  const bar = $('loadbar'), txt = $('loadtxt');
  const progress = (p, t) => { bar.style.width = (p * 100).toFixed(0) + '%'; if (t) txt.textContent = t; };
  const pack = $('product');
  if (pack && BRAND.product) { // title pack shot: shown only once the image has loaded
    const img = $('productImg');
    img.onload = () => pack.classList.add('on');
    img.alt = BRAND.product.alt;
    img.src = BRAND.product.img;
  }
  progress(0.03, 'Loading fonts');
  const fonts = ['700 40px "Zilla Slab"', '600 40px "Zilla Slab"', 'italic 800 40px "Barlow Condensed"', 'italic 600 40px "Barlow Condensed"', '700 40px "Barlow Condensed"'];
  await Promise.race([Promise.all(fonts.map(f => document.fonts.load(f))), new Promise(r => setTimeout(r, 4000))]);
  if (BRAND.logo) {
    const logo = new Image();
    logo.src = BRAND.logo;
    await Promise.race([logo.decode().then(() => TX.setLogo(logo), () => {}), new Promise(r => setTimeout(r, 3000))]);
  }
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: $('gl'), antialias: false, powerPreference: 'high-performance', stencil: false });
  } catch (e) {
    const f = $('fatal'); f.style.display = 'flex'; f.textContent = 'Red Line needs WebGL 2. Please try the latest Chrome, Safari or Edge.';
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, QUALITY.maxDpr));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  TX.setAnisotropy(Math.min(QUALITY.tier === 'ultra' || QUALITY.tier === 'high' ? 16 : 8, renderer.capabilities.getMaxAnisotropy()));
  const game = new Game(renderer);
  window.__game = game;
  await game.build(progress);
}

boot().catch((e) => {
  console.error(e);
  const f = $('fatal'); f.style.display = 'flex'; f.textContent = 'Something went wrong loading Red Line. ' + (e && e.message ? e.message : '');
});
