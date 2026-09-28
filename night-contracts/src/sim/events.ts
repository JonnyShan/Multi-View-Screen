/** Events the sim emits each step for UI, audio and FX. Pure data. */
import type { KillMethod } from '../config/tuning';

export type Tone = 'red' | 'gold' | 'green' | 'bone';

export type SimEvent =
  | { type: 'crash'; x: number; y: number; z: number; speed: number }
  | { type: 'land'; x: number; y: number; hard: boolean }
  | { type: 'shot'; x: number; y: number; z: number; tx: number; ty: number; tz: number; hit: 'car' | 'wall' | 'ped' | 'player' | 'none'; by: 'player' | 'enemy' }
  | { type: 'reload' }
  | { type: 'slash'; x: number; y: number; a: number; hit: boolean }
  | { type: 'wheelCut'; car: number; x: number; y: number; spin: boolean }
  | { type: 'tyreBlown'; car: number; x: number; y: number }
  | { type: 'impact'; x: number; y: number; z: number; strength: number }
  | { type: 'sparks'; x: number; y: number; z: number; count: number }
  | { type: 'explosion'; x: number; y: number; z: number }
  | { type: 'roofLand'; car: number }
  | { type: 'roofStrike'; car: number }
  | { type: 'roofFail' }
  | { type: 'playerHurt'; amount: number }
  | { type: 'playerDied' }
  | { type: 'respawn' }
  | { type: 'mount' }
  | { type: 'dismount' }
  | { type: 'bikeSummoned' }
  | { type: 'phoneRing' }
  | { type: 'phoneAnswer' }
  | { type: 'contractBrief'; index: number }
  | { type: 'targetSpawned' }
  | { type: 'targetAlerted' }
  | { type: 'targetDown'; method: KillMethod; payout: number }
  | { type: 'contractFailed'; reason: string }
  | { type: 'toast'; text: string; tone: Tone; sub?: string }
  | { type: 'heat'; stars: number }
  | { type: 'siren'; on: boolean }
  | { type: 'pedHit'; x: number; y: number }
  | { type: 'lightning' };
