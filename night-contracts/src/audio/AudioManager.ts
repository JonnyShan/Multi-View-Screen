/**
 * Howler-based audio. Uses files from assets/audio when present (sfx/<name>.ogg,
 * music/<name>.ogg), otherwise sounds synthesised at startup.
 */
import { Howl, Howler } from 'howler';
import { gameAssetFiles } from 'virtual:game-assets';
import type { SimEvent } from '../sim/events';
import type { Sim } from '../sim/Sim';
import { renderSound, SOUND_NAMES, type SoundName } from './synth';

const LOOPS: SoundName[] = ['engine', 'screech', 'rain', 'siren', 'music'];
const BASE = `${import.meta.env.BASE_URL}game-assets/`;

export class AudioManager {
  private readonly howls = new Map<SoundName, Howl>();
  private readonly loopIds = new Map<SoundName, number>();
  private ready = false;
  private sirenOn = false;
  private master = 0.8;
  private sfx = 0.9;
  private music = 0.5;
  private started = false;

  async init(): Promise<void> {
    if (this.started) return;
    this.started = true;
    try {
      await Promise.all(
        SOUND_NAMES.map(async (name) => {
          const file = name === 'music' ? `audio/music/${name}.ogg` : `audio/sfx/${name}.ogg`;
          const src = gameAssetFiles.includes(file) ? BASE + file : await renderSound(name);
          const loop = LOOPS.includes(name);
          this.howls.set(name, new Howl({ src: [src], format: [src.endsWith('.ogg') ? 'ogg' : 'wav'], loop, volume: 0, preload: true }));
        }),
      );
      for (const name of LOOPS) {
        const h = this.howls.get(name)!;
        this.loopIds.set(name, h.play());
        h.volume(0, this.loopIds.get(name)!);
      }
      this.ready = true;
      this.applyVolumes();
    } catch (err) {
      console.warn('Audio unavailable', err);
    }
  }

  setVolumes(master: number, sfx: number, music: number): void {
    this.master = master;
    this.sfx = sfx;
    this.music = music;
    this.applyVolumes();
  }

  private applyVolumes(): void {
    Howler.volume(this.master);
  }

  suspend(on: boolean): void {
    Howler.mute(on);
  }

  private play(name: SoundName, vol = 1, rate = 1, pan = 0): void {
    if (!this.ready) return;
    const h = this.howls.get(name);
    if (!h) return;
    const id = h.play();
    h.volume(Math.min(1, vol * this.sfx), id);
    h.rate(rate, id);
    if (pan) h.stereo(Math.max(-1, Math.min(1, pan)), id);
  }

  /** Distance attenuation and pan relative to the listener. */
  private spatial(sim: Sim, x: number, y: number, camYaw: number, range = 1400): { vol: number; pan: number } {
    const pl = sim.player;
    const dx = x - pl.x;
    const dy = y - pl.y;
    const d = Math.hypot(dx, dy);
    const vol = Math.max(0, 1 - d / range) ** 1.5;
    // right of the camera is (-sin, cos)
    const right = (dx * -Math.sin(camYaw) + dy * Math.cos(camYaw)) / (d || 1);
    return { vol, pan: right * 0.7 };
  }

  onEvent(e: SimEvent, sim: Sim, camYaw: number): void {
    if (!this.ready) return;
    switch (e.type) {
      case 'shot':
        if (e.by === 'player') this.play('gun', 0.55, 0.95 + Math.random() * 0.1);
        else {
          const s = this.spatial(sim, e.x, e.y, camYaw);
          this.play('enemyGun', 0.5 * s.vol, 0.9 + Math.random() * 0.2, s.pan);
        }
        break;
      case 'slash':
        this.play('slash', 0.7, 0.9 + Math.random() * 0.2);
        break;
      case 'wheelCut':
      case 'roofStrike':
        this.play('cut', 0.9);
        break;
      case 'tyreBlown': {
        const s = this.spatial(sim, e.x, e.y, camYaw);
        this.play('pop', 0.8 * s.vol, 1, s.pan);
        break;
      }
      case 'impact': {
        const s = this.spatial(sim, e.x, e.y, camYaw, 900);
        this.play('impact', Math.min(1, e.strength / 250) * s.vol, 0.8 + Math.random() * 0.3, s.pan);
        break;
      }
      case 'crash':
        this.play('crash', 1);
        break;
      case 'explosion': {
        const s = this.spatial(sim, e.x, e.y, camYaw, 2600);
        this.play('explosion', Math.max(0.15, s.vol), 0.9 + Math.random() * 0.15, s.pan);
        break;
      }
      case 'phoneRing':
        this.play('phone', 0.7);
        break;
      case 'phoneAnswer':
        this.play('click', 0.6);
        break;
      case 'targetDown':
        this.play('cash', 0.8);
        break;
      case 'lightning':
        setTimeout(() => this.play('thunder', 0.9, 0.8 + Math.random() * 0.3), 400 + Math.random() * 1400);
        break;
      case 'siren':
        this.sirenOn = e.on;
        break;
      case 'whistle':
        this.play('whistle', 0.75, 0.97 + Math.random() * 0.06);
        break;
      case 'bikeArrived': {
        const s = this.spatial(sim, e.x, e.y, camYaw, 600);
        this.play('horn', 0.6 * Math.max(0.3, s.vol), 1, s.pan);
        break;
      }
      case 'playerHurt':
        this.play('impact', 0.3, 1.6);
        break;
      default:
        break;
    }
  }

  update(sim: Sim, dt: number, paused: boolean): void {
    if (!this.ready) return;
    const set = (name: SoundName, vol: number, rate?: number): void => {
      const h = this.howls.get(name)!;
      const id = this.loopIds.get(name)!;
      const cur = h.volume(id) as number;
      h.volume(cur + (vol - cur) * Math.min(1, dt * 8), id);
      if (rate !== undefined) h.rate(rate, id);
    };
    const b = sim.bike;
    const riding = sim.player.mode === 'riding' && !paused;
    const k = Math.min(1, Math.abs(b.speed) / sim.t.bike.topSpeed);
    let engine = 0;
    if (riding) engine = 0.28 + b.throttle * 0.25 + k * 0.2;
    else if (paused) engine = 0;
    else if (b.auto) {
      // riding itself over: louder as it gets close
      const near = Math.max(0, 1 - Math.hypot(b.x - sim.player.x, b.y - sim.player.y) / 700);
      engine = 0.06 + near * (0.18 + b.throttle * 0.14);
    } else if (b.riderless && !b.fallen) engine = 0.1;
    set('engine', engine * this.sfx, 0.55 + k * 1.75 + b.throttle * 0.12);
    set('screech', !paused && b.skidding && !b.riderless ? 0.35 * this.sfx : 0);
    set('rain', !paused && sim.raining ? 0.55 * this.sfx : 0);
    const police = sim.police.units;
    let near = 0;
    for (const u of police) near = Math.max(near, 1 - Math.hypot(u.x - sim.player.x, u.y - sim.player.y) / 1400);
    set('siren', !paused && this.sirenOn ? 0.45 * near * this.sfx : 0);
    set('music', paused ? this.music * 0.25 : this.music * 0.4);
  }
}
