/** Contract payouts. Pure functions. */
import type { KillMethod, Tuning } from '../config/tuning';

export const METHOD_NAMES: Record<KillMethod, string> = {
  gun: 'Gunned down',
  blade: 'Blade work',
  crash: 'Crashed out',
  roof: 'Roof strike',
};

export interface Payout {
  fee: number;
  method: KillMethod;
  multiplier: number;
  civilians: number;
  penalty: number;
  total: number;
}

export function payout(t: Tuning, fee: number, method: KillMethod, civiliansDestroyed: number): Payout {
  const multiplier = t.scoring.multipliers[method];
  const penalty = civiliansDestroyed * t.scoring.civilianPenalty;
  const total = Math.max(0, Math.round(fee * multiplier - penalty));
  return { fee, method, multiplier, civilians: civiliansDestroyed, penalty, total };
}

/** Fee and HP scale up each time the three contracts loop. */
export function loopScale(t: Tuning, loop: number): number {
  return Math.pow(t.contracts.loopMultiplier, loop);
}

export function formatCash(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}
