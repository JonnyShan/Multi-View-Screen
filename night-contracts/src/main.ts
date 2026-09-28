/**
 * Boot, main loop and glue between sim, renderer, UI, audio and input.
 * Fixed 60 Hz sim, interpolated rendering.
 */
import '@fontsource/teko/latin-500.css';
import '@fontsource/teko/latin-600.css';
import '@fontsource/chakra-petch/latin-600.css';
import '@fontsource/chakra-petch/latin-700.css';
import '@fontsource/barlow/latin-400.css';
import '@fontsource/barlow/latin-600.css';
import './ui/styles.css';
import * as THREE from 'three';
import { AudioManager } from './audio/AudioManager';
import { tuning } from './config/tuning';
import { EventBus } from './core/EventBus';
import { Loop } from './core/Loop';
import { SaveService, type SaveData, type Settings } from './core/SaveService';
import { TimeScale } from './core/Time';
import { InputMap } from './input/InputMap';
import { AssetRegistry } from './render/AssetRegistry';
import { GameRenderer } from './render/GameRenderer';
import { isTouchDevice, qualityFor } from './render/Quality';
import type { SimEvent } from './sim/events';
import { emptyIntent, type Intent } from './sim/Intent';
import { initPhysics } from './sim/Physics';
import { Sim } from './sim/Sim';
import { DebugOverlay } from './ui/DebugOverlay';
import { Hud } from './ui/Hud';
import { Menus } from './ui/Menus';
import { TouchControls } from './ui/TouchControls';

type Events = { sim: SimEvent };

declare global {
  interface Window {
    __nc?: {
      ready: () => boolean;
      frames: () => number;
      state: () => Record<string, unknown>;
      input: InputMap;
      sim: () => Sim | null;
      setClock: (h: number) => void;
      setWeather: (w: 'auto' | 'clear' | 'rain') => void;
      teleport: (x: number, y: number, a: number) => void;
      /** Debug: scale all time (sim and effects), e.g. 0.05 to inspect FX. */
      slow: (k: number) => void;
      camera: (c: { x: number; y: number; z: number; tx: number; ty: number; tz: number } | null) => void;
    };
  }
}

async function haptic(kind: 'light' | 'medium' | 'heavy'): Promise<void> {
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: kind === 'light' ? ImpactStyle.Light : kind === 'medium' ? ImpactStyle.Medium : ImpactStyle.Heavy });
  } catch {
    /* no haptics on this device */
  }
}

async function boot(): Promise<void> {
  const canvas = document.getElementById('game') as HTMLCanvasElement;
  const uiRoot = document.getElementById('ui')!;
  const saves = new SaveService();
  const save: SaveData = saves.load();
  const settings: Settings = save.settings;
  const touch = isTouchDevice();
  const bus = new EventBus<Events>();

  let playing = false;
  let paused = false;
  let frames = 0;
  let ready = false;

  const menus = new Menus(
    settings,
    {
      ride: () => startRide(),
      resume: () => setPaused(false),
      quitToTitle: () => quitToTitle(),
      settingsChanged: (s, reload) => applySettings(s, reload),
      editControls: () => editControls(),
      resetProgress: () => {
        saves.reset();
        location.reload();
      },
    },
    touch,
  );
  uiRoot.append(menus.root);
  const rideBtn = menus.root.querySelector('[data-act="ride"]') as HTMLButtonElement;
  rideBtn.disabled = true;
  rideBtn.querySelector('span')!.textContent = 'LOADING';

  // heavy init while the title shows
  const probe = document.createElement('canvas').getContext('webgl2');
  const qParam = new URLSearchParams(location.search).get('q') as 'low' | 'medium' | 'high' | null;
  const quality = qualityFor(qParam ?? settings.quality, probe, settings.ao);
  await Promise.all([initPhysics(), document.fonts?.ready ?? Promise.resolve()]);
  try {
    await Promise.all(['600 64px Teko', '600 14px "Chakra Petch"', '400 14px Barlow'].map((f) => document.fonts.load(f)));
  } catch {
    /* fonts are optional */
  }
  const assets = new AssetRegistry();
  await assets.load();

  const t = tuning;
  const sim = new Sim(t, {
    trafficScale: quality.trafficScale,
    pedScale: quality.pedScale,
    startHour: save.gameHour >= 0 ? save.gameHour : t.time.startHour,
    cash: save.cash,
    contractIndex: save.contractIndex,
    loop: save.loop,
  });
  sim.contracts.enabled = false;
  sim.clockPaused = settings.pauseClock;
  sim.weather.mode = settings.weather;

  const gr = new GameRenderer(canvas, sim, t, quality, assets);
  const input = new InputMap(canvas);
  const hud = new Hud(sim, gr.rig.camera, () => gr.rig.yaw, () => input.mouse);
  hud.touch = touch;
  hud.onAnswer = () => input.press('answer');
  const touchUi = new TouchControls(input, settings.layout);
  touchUi.onHaptic = (k) => settings.haptics && void haptic(k);
  touchUi.onPause = () => setPaused(true);
  touchUi.onLayoutChange = (l) => {
    settings.layout = l;
    persist();
  };
  const debug = new DebugOverlay();
  debug.toggle(settings.showDebug);
  const audio = new AudioManager();
  audio.setVolumes(settings.master, settings.sfx, settings.music);
  uiRoot.prepend(touchUi.root, hud.root, debug.root);
  const timeScale = new TimeScale();

  const resize = (): void => gr.resize(window.innerWidth, window.innerHeight);
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 200));
  resize();

  const persist = (): void => {
    save.cash = Math.round(sim.player.cash);
    save.contractIndex = sim.contracts.index;
    save.loop = sim.contracts.loop;
    save.gameHour = sim.clock;
    save.settings = settings;
    saves.save(save);
  };

  function applySettings(s: Settings, reload: boolean): void {
    Object.assign(settings, s);
    sim.clockPaused = s.pauseClock;
    sim.weather.mode = s.weather;
    audio.setVolumes(s.master, s.sfx, s.music);
    debug.toggle(s.showDebug);
    persist();
    if (reload) location.reload();
  }

  function editControls(): void {
    touchUi.show(true);
    touchUi.setEditing(true);
    hud.toast('DRAG THE BUTTONS', 'gold', 'Tap pause when done');
    touchUi.onPause = () => {
      touchUi.setEditing(false);
      touchUi.onPause = () => setPaused(true);
      setPaused(true);
    };
  }

  function setPaused(p: boolean): void {
    if (!playing) return;
    paused = p;
    loop.paused = p;
    input.reset();
    touchUi.release();
    if (p) {
      menus.showPause();
      persist();
    } else menus.hide();
    audio.suspend(false);
  }

  function startRide(): void {
    if (!ready) return;
    playing = true;
    paused = false;
    loop.paused = false;
    sim.contracts.enabled = true;
    gr.rig.orbit = 0;
    hud.show(true);
    touchUi.show(touch);
    input.enabled = true;
    input.reset();
    void audio.init();
    // go fullscreen and lock landscape on phones when allowed
    if (touch) {
      const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
      try {
        if (el.requestFullscreen) void el.requestFullscreen().catch(() => undefined);
        const o = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
        void o.lock?.('landscape').catch(() => undefined);
      } catch {
        /* not supported */
      }
    }
  }

  function quitToTitle(): void {
    persist();
    playing = false;
    paused = false;
    loop.paused = false;
    sim.contracts.enabled = false;
    hud.show(false);
    touchUi.show(false);
  }

  input.onAction = (a) => {
    if (a === 'pause') {
      if (!playing) return;
      if (paused) setPaused(false);
      else setPaused(true);
    }
    if (a === 'debug') {
      settings.showDebug = !debug.visible;
      debug.toggle(settings.showDebug);
    }
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (playing && !paused) setPaused(true);
      audio.suspend(true);
    } else audio.suspend(false);
  });

  bus.on('sim', (e) => {
    hud.onEvent(e);
    gr.onEvent(e);
    audio.onEvent(e, sim, gr.rig.yaw);
    switch (e.type) {
      case 'wheelCut':
      case 'roofStrike':
        timeScale.slowMo(t.fx.slowMoScale, t.fx.slowMoTime);
        if (settings.haptics) void haptic('heavy');
        break;
      case 'roofLand':
        timeScale.slowMo(0.5, 0.35);
        if (settings.haptics) void haptic('medium');
        break;
      case 'crash':
      case 'explosion':
        timeScale.hitStop(t.fx.hitStopTime * 1.5);
        if (settings.haptics) void haptic('heavy');
        break;
      case 'slash':
        if (e.hit) timeScale.hitStop(t.fx.hitStopTime);
        break;
      case 'playerHurt':
        if (settings.haptics) void haptic('medium');
        break;
      case 'targetDown':
      case 'contractFailed':
      case 'respawn':
        persist();
        break;
      default:
        break;
    }
  });

  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3();
  const ndc = new THREE.Vector2();
  let saveT = 0;
  let debugSlow = 1;
  let intent: Intent = emptyIntent();

  const loop = new Loop(t.sim.hz, t.sim.maxStepsPerFrame, {
    step: (dt) => {
      intent = playing ? input.sample(dt, gr.rig.yaw) : emptyIntent();
      sim.step(intent);
      for (const e of sim.events) bus.emit('sim', e);
    },
    render: (alpha, realDt) => {
      frames++;
      const frameDt = realDt * debugSlow;
      loop.timeScale = (paused ? 1 : timeScale.update(frameDt)) * debugSlow;
      if (!playing) gr.rig.addOrbit(frameDt * 0.12);
      else if (!paused) gr.rig.addOrbit(input.orbit(frameDt));
      // mouse aim on the ground plane at the player's height
      const m = input.mouse;
      if (m && playing) {
        ndc.set((m.x / window.innerWidth) * 2 - 1, -(m.y / window.innerHeight) * 2 + 1);
        raycaster.setFromCamera(ndc, gr.rig.camera);
        plane.constant = -(sim.player.z + 6);
        if (raycaster.ray.intersectPlane(plane, hit)) input.aimPoint = { x: hit.x, y: hit.z };
        else input.aimPoint = null;
      } else input.aimPoint = null;
      gr.render(alpha, frameDt);
      if (playing) hud.update(frameDt);
      audio.update(sim, frameDt, paused || !playing);
      debug.update(frameDt, gr.renderer, sim, quality.level);
      saveT += frameDt;
      if (playing && saveT > 30) {
        saveT = 0;
        persist();
      }
    },
  });
  if (new URLSearchParams(location.search).has('e2e')) {
    // software rendering in CI is slow: let the sim keep real time anyway
    loop.maxSteps = 120;
    loop.maxFrameDt = 2;
  }
  loop.start();

  window.__nc = {
    ready: () => ready,
    frames: () => frames,
    input,
    sim: () => sim,
    state: () => ({
      playing,
      paused,
      mode: sim.player.mode,
      speed: sim.bike.speed,
      x: sim.player.x,
      y: sim.player.y,
      health: sim.player.health,
      cash: sim.player.cash,
      contract: sim.contracts.state,
      stars: sim.heat.stars,
      cars: sim.cars.length,
      calls: gr.renderer.info.render.calls,
      triangles: gr.renderer.info.render.triangles,
      quality: quality.level,
      clock: sim.clock,
    }),
    setClock: (h: number) => {
      sim.clock = h;
    },
    setWeather: (w) => {
      sim.weather.mode = w;
      if (w === 'rain') sim.weather.wet = 1;
      if (w === 'clear') sim.weather.wet = 0;
    },
    slow: (k: number) => {
      debugSlow = k;
    },
    camera: (c) => {
      gr.debugCamera = c;
    },
    teleport: (x: number, y: number, a: number) => {
      sim.bike.place(x, y, sim.city.heightAt(x, y), a);
      sim.bikeBody.setTranslation({ x, y, z: 0 }, true);
      sim.bikeBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
    },
  };

  ready = true;
  rideBtn.disabled = false;
  rideBtn.querySelector('span')!.textContent = 'RIDE';
  document.body.dataset.ready = '1';
}

void boot().catch((err) => {
  console.error('Boot failed', err);
  const ui = document.getElementById('ui');
  if (ui) ui.innerHTML = `<div class="screen on"><div class="panel"><h2>COULD NOT START</h2><p>${String(err?.message ?? err)}</p></div></div>`;
});
