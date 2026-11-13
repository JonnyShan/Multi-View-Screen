/**
 * What the player wants this tick. Produced by input/InputMap, consumed by the
 * sim. Edge-triggered actions (slash, jump, interact, answer) are true only on
 * the tick they were pressed, so an input log replays deterministically.
 */
export interface Intent {
  /** Bike steering, -1 left to 1 right. */
  steer: number;
  throttle: number;
  /** Brake, and reverse once stopped. */
  brake: number;
  drift: boolean;
  /** On-foot movement in world space (already camera relative), length <= 1. */
  moveX: number;
  moveY: number;
  fire: boolean;
  /** Mouse aim point on the ground in world space. */
  hasAim: boolean;
  aimX: number;
  aimY: number;
  slash: boolean;
  jump: boolean;
  interact: boolean;
  answer: boolean;
}

export const emptyIntent = (): Intent => ({
  steer: 0,
  throttle: 0,
  brake: 0,
  drift: false,
  moveX: 0,
  moveY: 0,
  fire: false,
  hasAim: false,
  aimX: 0,
  aimY: 0,
  slash: false,
  jump: false,
  interact: false,
  answer: false,
});

export function copyIntent(src: Intent, dst: Intent = emptyIntent()): Intent {
  return Object.assign(dst, src);
}
