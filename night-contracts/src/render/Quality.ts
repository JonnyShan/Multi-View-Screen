/** Quality presets, auto-picked from the device. */
import type { QualityPref } from '../core/SaveService';

export type QualityLevel = 'low' | 'medium' | 'high';

export interface QualitySettings {
  level: QualityLevel;
  pixelRatio: number;
  shadows: boolean;
  shadowSize: number;
  lampLights: number;
  bloom: 'off' | 'cheap' | 'full';
  msaa: number;
  ssao: boolean;
  lightCones: boolean;
  reflections: boolean;
  trafficScale: number;
  pedScale: number;
  rainDrops: number;
  drawDistance: number;
  physicalPaint: boolean;
}

export function isTouchDevice(): boolean {
  return typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
}

export function isPhoneLike(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  const mobileUa = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const small = Math.min(window.screen.width, window.screen.height) < 820;
  return mobileUa || (isTouchDevice() && small);
}

/** Pick a level from what we can learn about the device. */
export function detectLevel(gl?: WebGLRenderingContext | WebGL2RenderingContext | null): QualityLevel {
  if (!isPhoneLike()) return 'high';
  let renderer = '';
  try {
    const ext = gl?.getExtension('WEBGL_debug_renderer_info');
    if (gl && ext) renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL));
  } catch {
    /* not available */
  }
  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  // Recent Apple GPUs and flagship Adreno/Mali handle medium comfortably.
  if (/Apple/i.test(renderer) || /Adreno \(TM\) (7[3-9]\d|8\d\d)/i.test(renderer) || /Mali-G(7[1-9]|[89]\d|\d{3})/i.test(renderer)) return 'medium';
  if (/iPhone|iPad/i.test(navigator.userAgent)) return 'medium';
  if (cores >= 8 && mem >= 6) return 'medium';
  return 'low';
}

export function qualityFor(pref: QualityPref, gl?: WebGLRenderingContext | WebGL2RenderingContext | null, ao = false): QualitySettings {
  const level: QualityLevel = pref === 'auto' ? detectLevel(gl) : pref;
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  switch (level) {
    case 'low':
      return {
        level,
        pixelRatio: Math.min(dpr, 1.25),
        shadows: false,
        shadowSize: 0,
        lampLights: 2,
        bloom: 'cheap',
        msaa: 0,
        ssao: false,
        lightCones: false,
        reflections: false,
        trafficScale: 0.75,
        pedScale: 0.6,
        rainDrops: 1200,
        drawDistance: 2600,
        physicalPaint: false,
      };
    case 'medium':
      return {
        level,
        pixelRatio: Math.min(dpr, 1.5),
        shadows: false,
        shadowSize: 0,
        lampLights: 4,
        bloom: 'cheap',
        msaa: 0,
        ssao: false,
        lightCones: true,
        reflections: false,
        trafficScale: 1,
        pedScale: 0.85,
        rainDrops: 2200,
        drawDistance: 3400,
        physicalPaint: false,
      };
    default:
      return {
        level: 'high',
        pixelRatio: Math.min(dpr, 2),
        shadows: true,
        shadowSize: 2048,
        lampLights: 8,
        bloom: 'full',
        msaa: 4,
        ssao: ao,
        lightCones: true,
        reflections: true,
        trafficScale: 1,
        pedScale: 1,
        rainDrops: 4000,
        drawDistance: 5000,
        physicalPaint: true,
      };
  }
}
