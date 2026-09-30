// Bootstrap: renderer, quality tiers, menus, match setup, main loop.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { TEAMS, DIFFICULTY, overall, heightLabel } from './data.js';
import { buildArena, RIM } from './arena.js';
import { Player } from './player.js';
import { Ball, Net } from './ball.js';
import { Game } from './game.js';
import { Sound } from './audio.js';
import { Input } from './input.js';

const $ = (id) => document.getElementById(id);

// ---------- settings ----------
const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
const settings = { quality: 'auto', sound: true, vib: true, diff: 'pro', to: 11, you: 0, opp: 1 };
try { Object.assign(settings, JSON.parse(localStorage.getItem('hardwood.settings') || '{}')); } catch (e) { /* storage blocked */ }
const save = () => { try { localStorage.setItem('hardwood.settings', JSON.stringify(settings)); } catch (e) { /* storage blocked */ } };
const qualityTier = () => settings.quality === 'auto' ? (isTouch ? 'med' : 'high') : settings.quality;

// ---------- renderer ----------
const canvas = $('gl');
let renderer, composer, bloom;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 120);
camera.position.set(0, 4.5, 17);
camera.layers.enable(1);
const resolution = new THREE.Vector2(1, 1);

function makeRenderer() {
  const q = qualityTier();
  if (renderer) renderer.dispose();
  renderer = new THREE.WebGLRenderer({ canvas, antialias: q !== 'low', powerPreference: 'high-performance', stencil: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, q === 'high' ? 2 : q === 'med' ? 1.6 : 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = q !== 'low';
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  pmrem.dispose();
  composer = null;
  if (q === 'high') {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.32, 0.55, 0.88);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }
  resize();
}

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  if (composer) composer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  resolution.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
  if (net) net.mat.resolution.copy(resolution);
  $('rotateHint').hidden = !(w < h && !$('hud').hidden);
}
window.addEventListener('resize', () => renderer && resize());

// ---------- match objects ----------
let arena = null, players = [], ball = null, net = null, game = null;
const sound = new Sound();
let input = null;

async function buildMatch(home, away) {
  // clear previous
  if (arena) scene.remove(arena.group);
  for (const p of players) scene.remove(p.group);
  if (ball) { scene.remove(ball.mesh); scene.remove(ball.blob); }
  if (net) scene.remove(net.lines);
  arena = await buildArena(scene, renderer, { home, away, quality: qualityTier() });
  // the away side switches to white only when kits clash and it has no photoreal model
  const awayWhite = colorClash(home.jersey, away.jersey) && !(away.model && settings.models !== false);
  players = [new Player(home), new Player(away, { away: awayWhite })];
  for (const p of players) scene.add(p.group);
  // photoreal bodies where a model exists (falls back to the built-in body)
  await Promise.all(players.map((p) => (p.team.model && !p.away && settings.models !== false
    ? p.attachSkin(p.team.model).catch((e) => console.warn('model failed, using built-in body', e)) : null)));
  ball = new Ball(scene);
  net = new Net(scene, resolution);
  resize();
}

function colorClash(a, b) {
  const ca = new THREE.Color(a), cb = new THREE.Color(b);
  const la = ca.r * 0.3 + ca.g * 0.59 + ca.b * 0.11, lb = cb.r * 0.3 + cb.g * 0.59 + cb.b * 0.11;
  const d = Math.abs(ca.r - cb.r) + Math.abs(ca.g - cb.g) + Math.abs(ca.b - cb.b);
  return d < 0.55 || (la < 0.12 && lb < 0.12);
}

// ---------- camera ----------
const cam = { pos: new THREE.Vector3(0, 4.6, 17), look: new THREE.Vector3(0, 1.6, 5), shake: 0, mode: 'play', t: 0 };
function updateCamera(dt, focus, snap = false) {
  const portrait = camera.aspect < 1;
  const hFov = portrait ? 80 : 62;
  const vFov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(hFov / 2)) / camera.aspect));
  camera.fov = Math.min(portrait ? 62 : 46, Math.max(30, vFov));
  camera.updateProjectionMatrix();
  // frame both players and the ball, broadcast-style from behind the play
  let fx = focus.x, fz = focus.z, zmax = focus.z;
  if (game) {
    const [a, b] = game.players;
    const bw = game.ball.free ? 0.8 : 0.3;
    fx = (a.pos.x + b.pos.x + game.ball.pos.x * bw * 2) / (2 + bw * 2);
    fz = (a.pos.z + b.pos.z + game.ball.pos.z * bw * 2) / (2 + bw * 2);
    zmax = Math.max(a.pos.z, b.pos.z);
  }
  fz = Math.min(fz, 11);
  const back = portrait ? 10.5 : 7.4;
  const cz = Math.max(fz + back, zmax + (portrait ? 6 : 4.3), 10.5);
  const cy = (portrait ? 7.2 : 3.9) + (cz - fz) * 0.1;
  const tgtPos = new THREE.Vector3(fx * 0.55, cy, cz);
  const lookZ = THREE.MathUtils.lerp(fz - 1.3, RIM.z + 1.2, 0.3);
  const tgtLook = new THREE.Vector3(fx * 0.75, portrait ? 0.9 : 1.75, portrait ? lookZ - 0.5 : lookZ);
  const k = snap ? 1 : 1 - Math.exp(-dt * 3.0);
  cam.pos.lerp(tgtPos, k);
  cam.look.lerp(tgtLook, k);
  camera.position.copy(cam.pos);
  if (cam.shake > 0) {
    cam.shake = Math.max(0, cam.shake - dt * 2.5);
    const a = cam.shake * cam.shake * 0.08;
    camera.position.x += (Math.random() - 0.5) * a;
    camera.position.y += (Math.random() - 0.5) * a;
  }
  camera.lookAt(cam.look);
}

// ---------- menus ----------
const screens = ['scrTitle', 'scrPick'];
function show(id) { for (const s of screens) $(s).hidden = s !== id; }

function seg(el, opts, get, set) {
  el.innerHTML = '';
  for (const [val, label] of opts) {
    const b = document.createElement('button');
    b.textContent = label;
    b.className = get() === val ? 'on' : '';
    b.addEventListener('click', () => { set(val); save(); seg(el, opts, get, set); });
    el.appendChild(b);
  }
}

let pickStep = 'you';
function renderPick() {
  const grid = $('pickGrid');
  grid.innerHTML = '';
  const cur = pickStep === 'you' ? settings.you : settings.opp;
  TEAMS.forEach((t, i) => {
    const c = document.createElement('button');
    c.className = 'card' + (i === cur ? ' sel' : '') + (pickStep === 'opp' && i === settings.you ? ' taken' : '');
    c.style.backgroundImage = `url("${t.portrait}")`;
    c.innerHTML = `<img class="lg" alt="" src="${t.logo}"><span class="cn">${t.player.last}<b>${t.abbr} · ${overall(t.player)} OVR</b></span>`;
    c.addEventListener('click', () => {
      if (pickStep === 'you') { settings.you = i; if (settings.opp === i) settings.opp = (i + 1) % TEAMS.length; } else settings.opp = i;
      save();
      renderPick();
    });
    grid.appendChild(c);
  });
  const t = TEAMS[cur], p = t.player;
  $('featPh').style.backgroundImage = `url("${t.portrait}")`;
  $('featLogo').src = t.logo;
  $('featOvr').innerHTML = `${overall(p)}<small>OVR</small>`;
  $('featName').textContent = `${p.first} ${p.last}`;
  $('featTeam').textContent = `${t.city} ${t.name} · ${p.pos} · ${heightLabel(p.height)}`;
  const rows = [['3PT', p.r.three], ['Mid-range', p.r.mid], ['Finishing', p.r.finish], ['Dunking', p.r.dunk], ['Handles', p.r.handle], ['Speed', p.r.speed], ['Defense', p.r.defense], ['Blocks', p.r.block], ['Steals', p.r.steal]];
  $('featBars').innerHTML = rows.map(([k, v]) => `<span>${k}</span><span class="b"><i style="width:${v}%;background:${v >= 85 ? 'var(--green)' : 'var(--leather)'}"></i></span><span class="v">${v}</span>`).join('');
  $('pickTitle').innerHTML = pickStep === 'you' ? 'Choose <em>your</em> player' : 'Choose your <em>opponent</em>';
  $('pickNext').textContent = pickStep === 'you' ? 'Next' : 'Tip off';
  $('pickOpts').hidden = pickStep !== 'opp';
  seg($('segDiff'), Object.entries(DIFFICULTY).map(([k, d]) => [k, d.label]), () => settings.diff, (v) => { settings.diff = v; });
  seg($('segTo'), [[11, '11'], [21, '21']], () => settings.to, (v) => { settings.to = v; });
}

function renderSettings() {
  seg($('segQ'), [['auto', 'Auto'], ['high', 'High'], ['med', 'Medium'], ['low', 'Low']], () => settings.quality, (v) => { settings.quality = v; needsRebuild = true; });
  seg($('segSnd'), [[true, 'On'], [false, 'Off']], () => settings.sound, (v) => { settings.sound = v; sound.setEnabled(v); });
  seg($('segVib'), [[true, 'On'], [false, 'Off']], () => settings.vib, (v) => { settings.vib = v; });
}
let needsRebuild = false;

for (const m of ['modHow', 'modSettings']) {
  $(m).addEventListener('click', (e) => {
    if (e.target.hasAttribute('data-close') || e.target === $(m)) {
      $(m).hidden = true;
      if (m === 'modSettings' && needsRebuild) { needsRebuild = false; rebuildRenderer(); }
    }
  });
}
$('goHow').onclick = () => { $('modHow').hidden = false; };
$('goSettings').onclick = () => { renderSettings(); $('modSettings').hidden = false; };
$('goPlay').onclick = () => { sound.unlock(); sound.setEnabled(settings.sound); pickStep = 'you'; renderPick(); show('scrPick'); };
$('pickBack').onclick = () => { if (pickStep === 'opp') { pickStep = 'you'; renderPick(); } else show('scrTitle'); };
$('pickNext').onclick = () => { if (pickStep === 'you') { pickStep = 'opp'; renderPick(); } else startMatch(); };
$('pauseBtn').onclick = () => pause(true);
$('resume').onclick = () => pause(false);
$('pHow').onclick = () => { $('modHow').hidden = false; };
$('pSettings').onclick = () => { renderSettings(); $('modSettings').hidden = false; };
$('quit').onclick = () => { pause(false); endToMenu(); };
$('rematch').onclick = () => { $('modEnd').hidden = true; startMatch(); };
$('toMenu').onclick = () => { $('modEnd').hidden = true; endToMenu(); };

let paused = false;
function pause(on) {
  if (!game) return;
  paused = on;
  $('modPause').hidden = !on;
  sound.duck(on);
}
document.addEventListener('visibilitychange', () => { if (document.hidden && game && !game.over) pause(true); });

async function rebuildRenderer() {
  makeRenderer();
  if (game) {
    const [h, a] = [TEAMS[settings.you], TEAMS[settings.opp]];
    const snap = game.snapshot();
    await buildMatch(h, a);
    game.rebind({ arena, players, ball, net });
    game.restore(snap);
  }
}

async function startMatch() {
  $('loading').hidden = false;
  show(null);
  const home = TEAMS[settings.you], away = TEAMS[settings.opp];
  await buildMatch(home, away);
  $('bugLogoL').src = home.logo; $('bugLogoR').src = away.logo;
  $('bugAbbrL').textContent = home.abbr; $('bugAbbrR').textContent = away.abbr;
  $('bugL').style.setProperty('--team', home.primary);
  $('bugR').style.setProperty('--team', away.primary);
  $('gameTo').textContent = `TO ${settings.to}`;
  $('hud').hidden = false;
  $('pad').hidden = false;
  $('loading').hidden = true;
  if (game) game.dispose();
  if (!input) input = new Input();
  input.parkStick();
  game = new Game({
    arena, players, ball, net, sound, input, cam, threeCamera: camera, scene,
    diff: DIFFICULTY[settings.diff], to: settings.to, vib: () => settings.vib,
    onEnd: showEnd,
  });
  resize();
  updateCamera(0, game.focus(), true);
}

function endToMenu() {
  if (game) game.dispose();
  game = null;
  $('hud').hidden = true;
  $('pad').hidden = true;
  show('scrTitle');
  resize();
}

function showEnd(res) {
  const you = TEAMS[settings.you], opp = TEAMS[settings.opp];
  const winner = res.youWon ? you : opp;
  $('endPh').style.backgroundImage = `url("${winner.portrait}")`;
  $('endEyebrow').textContent = res.youWon ? 'Final · Victory' : 'Final · Defeat';
  $('endRes').textContent = res.youWon ? 'You win' : `${opp.player.last} wins`;
  $('endScore').textContent = `${you.abbr} ${res.score[0]} – ${res.score[1]} ${opp.abbr}`;
  const s = res.stats;
  const row = (k, a, b) => `<span>${k}</span><span>${a}</span><span>${b}</span>`;
  $('endStats').innerHTML = `<span class="h"></span><span class="h">${you.abbr}</span><span class="h">${opp.abbr}</span>` +
    row('Field goals', `${s[0].fgm}/${s[0].fga}`, `${s[1].fgm}/${s[1].fga}`) +
    row('Threes', `${s[0].tpm}/${s[0].tpa}`, `${s[1].tpm}/${s[1].tpa}`) +
    row('Dunks', s[0].dunks, s[1].dunks) +
    row('Blocks', s[0].blk, s[1].blk) +
    row('Steals', s[0].stl, s[1].stl) +
    row('Perfect releases', s[0].green, s[1].green);
  setTimeout(() => { $('modEnd').hidden = false; $('pad').hidden = true; }, 1800);
}

// ---------- loop ----------
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (window.__hw && window.__hw.manual) return;   // stepped externally (capture/testing)
  tick(dt);
}

function tick(dt) {
  if (arena) arena.update(dt);
  if (game && !paused) {
    const sdt = dt * game.timeScale;
    game.update(sdt, dt);
    updateCamera(dt, game.focus());
    const ov = window.__hw && window.__hw.camOverride;
    if (ov) { camera.position.set(...ov.pos); camera.lookAt(...ov.look); }
  } else if (!game) {
    // menu backdrop: slow orbit around the hoop
    cam.t += dt * 0.06;
    camera.position.set(Math.sin(cam.t) * 9, 4.2, 6 + Math.cos(cam.t) * 9);
    camera.lookAt(0, 2.2, 2.5);
  }
  if (composer) composer.render(); else renderer.render(scene, camera);
}

// ---------- boot ----------
async function boot() {
  makeRenderer();
  sound.setEnabled(settings.sound);
  const mode = location.hash.replace('#', '');
  await buildMatch(TEAMS[settings.you], TEAMS[settings.opp]);
  $('loading').hidden = true;
  if (mode === 'play') { await startMatch(); }
  else if (mode === 'pick') { renderPick(); show('scrPick'); }
  else if (mode === 'pick2') { pickStep = 'opp'; renderPick(); show('scrPick'); }
  else show('scrTitle');
  requestAnimationFrame(frame);
}
boot();

// debug hooks for automated checks
window.__hw = { get game() { return game; }, get renderer() { return renderer; }, get arena() { return arena; }, camera, scene, settings, step: (dt) => tick(dt), manual: false, start: () => startMatch() };
