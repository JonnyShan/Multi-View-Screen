/** The handler's phone lines (audio/voice) and the art handoff inlining that carries them. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { VOICE_LINES, type VoiceId } from '../../src/audio/voice';
import { cloneTuning } from '../../src/config/tuning';
import { gameAssets } from '../../tools/gameAssets';

describe('Handler voice lines', () => {
  const t = cloneTuning();
  it('has a brief for every contract naming the target and both places', () => {
    for (const c of t.contracts.list) {
      const line: string = VOICE_LINES[`brief-${c.id}` as VoiceId];
      expect(line).toBeDefined();
      expect(line).toContain(c.target);
      expect(line).toContain(c.from);
      expect(line).toContain(c.to);
    }
  });
  it('keeps to plain punctuation', () => {
    for (const line of Object.values(VOICE_LINES)) expect(line).not.toMatch(/[–—]/);
  });
});

describe('Art handoff files', () => {
  it('are inlined as data URIs in the single-page build and copied otherwise', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nc-assets-'));
    fs.mkdirSync(path.join(dir, 'audio/voice'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'audio/voice/done-1.mp3'), Buffer.from([1, 2, 3]));
    fs.mkdirSync(path.join(dir, 'concept'));
    fs.writeFileSync(path.join(dir, 'concept/board.png'), Buffer.from([9]));
    const load = (ship: boolean): string => (gameAssets(dir, { ship }).load as (id: string) => string)('\0virtual:game-assets');
    const single = load(false);
    expect(single).toContain('"audio/voice/done-1.mp3"');
    expect(single).toContain('"audio/voice/done-1.mp3":"data:audio/mpeg;base64,AQID"');
    expect(single).not.toContain('concept');
    const normal = load(true);
    expect(normal).toContain('"audio/voice/done-1.mp3"');
    expect(normal).toContain('gameAssetInline = {}');
    fs.rmSync(dir, { recursive: true });
  });
});
