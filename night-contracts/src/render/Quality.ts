/** Quality presets, auto-picked from the device. */
import type { QualityPref } from '../core/SaveService';

export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

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
  /** How far instanced props (lamps, palms, signs) are drawn. */
  cullRange: number;
  physicalPaint: boolean;
  /** FXAA on the final image, for presets without MSAA. */
  fxaa: boolean;
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

function rendererName(gl?: WebGLRenderingContext | WebGL2RenderingContext | null): string {
  try {
    const ext = gl?.getExtension('WEBGL_debug_renderer_info');
    if (gl && ext) return String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL));
  } catch {
    /* not available */
  }
  return '';
}

/** Pick a level from what we can learn about the device. */
export function detectLevel(gl?: WebGLRenderingContext | WebGL2RenderingContext | null): QualityLevel {
  const renderer = rendererName(gl);
  // Desktops: dedicated and Apple silicon GPUs get Ultra, the rest High.
  if (!isPhoneLike()) return /NVIDIA|GeForce|Radeon (RX|Pro)|Apple M\d/i.test(renderer) ? 'ultra' : 'high';
  // Recent Apple GPUs and flagship Adreno/Mali run High; resolution scaling keeps the frame rate.
  if (/Apple/i.test(renderer) || /iPhone|iPad/i.test(navigator.userAgent)) return 'high';
  if (/Adreno \(TM\) (7[3-9]\d|8\d\d)/i.test(renderer) || /Mali-G(7[1-9]0|[89]\d\d)|Immortalis/i.test(renderer)) return 'high';
  if (/Adreno \(TM\) (6[4-9]\d|7\d\d)/i.test(renderer) || /Mali-G(7[1-9]|[5-9]\d)/i.test(renderer)) return 'medium';
  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  if (cores >= 8 && mem >= 6) return 'medium';
  return 'low';
}

export function qualityFor(pref: QualityPref, gl?: WebGLRenderingContext | WebGL2RenderingContext | null, ao = false): QualitySettings {
  const level: QualityLevel = pref === 'auto' ? detectLevel(gl) : pref;
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const phone = isPhoneLike();
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
        rainDrops: 800,
        drawDistance: 2600,
        cullRange: 1430,
        physicalPaint: false,
        fxaa: false,
      };
    case 'medium':
      return {
        level,
        pixelRatio: Math.min(dpr, 1.75),
        shadows: false,
        shadowSize: 0,
        lampLights: 5,
        bloom: 'cheap',
        msaa: 0,
        ssao: false,
        lightCones: true,
        reflections: false,
        trafficScale: 1,
        pedScale: 0.85,
        rainDrops: 1400,
        drawDistance: 3800,
        cullRange: 2100,
        physicalPaint: false,
        fxaa: true,
      };
    case 'high':
      return {
        level,
        pixelRatio: Math.min(dpr, 2),
        shadows: true,
        shadowSize: phone ? 1024 : 2048,
        lampLights: phone ? 6 : 8,
        bloom: 'full',
        msaa: 4,
        ssao: ao && !phone,
        lightCones: true,
        reflections: true,
        trafficScale: 1,
        pedScale: 1,
        rainDrops: 2400,
        drawDistance: phone ? 4200 : 5000,
        cullRange: 2600,
        physicalPaint: true,
        fxaa: false,
      };
    default:
      return {
        level: 'ultra',
        pixelRatio: Math.min(dpr, 2.5),
        shadows: true,
        shadowSize: 4096,
        lampLights: 10,
        bloom: 'full',
        msaa: 4,
        ssao: true,
        lightCones: true,
        reflections: true,
        trafficScale: 1,
        pedScale: 1,
        rainDrops: 3000,
        drawDistance: 6500,
        cullRange: 3400,
        physicalPaint: true,
        fxaa: false,
      };
  }
}
