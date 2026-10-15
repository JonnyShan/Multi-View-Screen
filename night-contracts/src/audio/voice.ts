/**
 * The handler's voice on the phone. Lines play from assets/audio/voice/<id>.mp3
 * when those files exist (see ASSETS.md) through a telephone filter; without
 * them the calls stay silent, as before.
 */
import { Howler } from 'howler';
import { assetBytes, hasAsset } from '../core/assetUrl';

/** What each file says. Brief lines name the contract's target and places (tests check this). */
export const VOICE_LINES = {
  'brief-rane': 'Got a job for you. Viktor Rane. They call him the Accountant. Black sedan, meeting at the Casino Strip. Take him before he reaches the Harbour Docks.',
  'brief-kasai': "Next one. Lena Kasai. Mother Hen. Armoured white SUV, and her escort shoots. She meets at the Neon Market. Don't let her reach the Old Temple.",
  'brief-ormond': "This is the big one. Judge Ormond. The Magistrate. Stretch limo, two escorts, and they'll try to ram you. He meets at the Old Temple. Stop him before the Rail Yard.",
  'done-1': "Clean work. Money's on its way.",
  'done-2': "It's done. You've been paid.",
  'fail-escaped': 'They got away. Stay by the phone.',
  'fail-died': "You went down out there. Job's off. I'll call you.",
} as const;

export type VoiceId = keyof typeof VOICE_LINES;

const EXTS = ['mp3', 'm4a', 'ogg'];

export function voiceFile(id: VoiceId): string | null {
  for (const ext of EXTS) {
    const f = `audio/voice/${id}.${ext}`;
    if (hasAsset(f)) return f;
  }
  return null;
}

export class VoicePlayer {
  private readonly buffers = new Map<VoiceId, AudioBuffer>();
  private input: AudioNode | null = null;
  private out: GainNode | null = null;
  private current: AudioBufferSourceNode | null = null;
  private endsAt = 0;

  /** Decode whichever lines exist. Needs Howler's Web Audio context (it has one once a Howl exists). */
  async init(): Promise<void> {
    const ctx = Howler.ctx;
    if (!ctx || !Howler.usingWebAudio || !Howler.masterGain) return;
    const ids = (Object.keys(VOICE_LINES) as VoiceId[]).filter((id) => voiceFile(id));
    if (!ids.length) return;
    this.buildPhoneLine(ctx);
    await Promise.all(
      ids.map(async (id) => {
        try {
          const bytes = await assetBytes(voiceFile(id)!);
          // callback form: older Safari has no promise version
          const buf = await new Promise<AudioBuffer>((res, rej) => ctx.decodeAudioData(bytes, res, rej));
          this.buffers.set(id, buf);
        } catch (err) {
          console.warn(`Voice line failed to load: ${id}`, err);
        }
      }),
    );
  }

  /** Band-limited like a phone call, with a touch of grit. */
  private buildPhoneLine(ctx: AudioContext): void {
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 320;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3400;
    const mid = ctx.createBiquadFilter();
    mid.type = 'peaking';
    mid.frequency.value = 1700;
    mid.gain.value = 4;
    const grit = ctx.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) {
      const x = (i / (curve.length - 1)) * 2 - 1;
      curve[i] = Math.tanh(x * 1.8) / Math.tanh(1.8);
    }
    grit.curve = curve;
    this.out = ctx.createGain();
    hp.connect(lp).connect(mid).connect(grit).connect(this.out).connect(Howler.masterGain);
    this.input = hp;
  }

  has(id: VoiceId): boolean {
    return this.buffers.has(id);
  }

  /** Speak a line after `delay` seconds, cutting off any line still playing. */
  say(id: VoiceId, volume: number, delay = 0): void {
    const buf = this.buffers.get(id);
    const ctx = Howler.ctx;
    if (!buf || !ctx || !this.input || !this.out) return;
    this.stop();
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.input);
    this.out.gain.value = volume;
    const at = ctx.currentTime + delay;
    src.start(at);
    this.current = src;
    this.endsAt = at + buf.duration;
  }

  stop(): void {
    if (!this.current) return;
    try {
      this.current.stop();
    } catch {
      // already stopped
    }
    this.current.disconnect();
    this.current = null;
    this.endsAt = 0;
  }

  /** True while a line is playing (or about to), for ducking the music. */
  speaking(): boolean {
    const ctx = Howler.ctx;
    return !!ctx && this.endsAt > ctx.currentTime;
  }
}
