/**
 * The few neon signs in the city: text drawn once into a canvas atlas, shown
 * on additive quads in front of dark backing boards.
 */
import * as THREE from 'three';
import type { City } from '../world/CityGenerator';
import { GeoBuilder } from './GeoBuilder';
import { srgb, yawToThree } from './Shared';

export class NeonView {
  readonly group = new THREE.Group();
  private readonly mats: THREE.MeshBasicMaterial[] = [];
  private readonly base: THREE.Color[] = [];
  private flickerIdx = -1;
  private flickerT = 0;

  constructor(city: City) {
    this.group.name = 'neon';
    const backing = new GeoBuilder();
    for (const n of city.neon) {
      const tex = NeonView.textTexture(n.text, n.color, n.vertical);
      const mat = new THREE.MeshBasicMaterial({ map: tex, color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
      this.mats.push(mat);
      this.base.push(new THREE.Color(1, 1, 1));
      const quad = new THREE.Mesh(new THREE.PlaneGeometry(n.w, n.h), mat);
      const nx = Math.cos(n.a);
      const ny = Math.sin(n.a);
      quad.position.set(n.x + nx * 1.6, n.z, n.y + ny * 1.6);
      quad.rotation.y = yawToThree(n.a);
      quad.name = `neon-${n.text}`;
      this.group.add(quad);
      // backing board: a thin box a little bigger than the sign
      const bw = n.w / 2 + 3;
      const bh = n.h / 2 + 3;
      const px = -ny;
      const py = nx;
      const cx = n.x + nx * 0.5;
      const cy = n.y + ny * 0.5;
      const x0 = Math.min(cx - px * bw, cx + px * bw) - Math.abs(nx) * 1;
      const x1 = Math.max(cx - px * bw, cx + px * bw) + Math.abs(nx) * 1;
      const y0 = Math.min(cy - py * bw, cy + py * bw) - Math.abs(ny) * 1;
      const y1 = Math.max(cy - py * bw, cy + py * bw) + Math.abs(ny) * 1;
      backing.box(x0, n.z - bh, y0, x1, n.z + bh, y1, 0x141518, null, 0b111111);
    }
    const back = new THREE.Mesh(backing.build(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6 }));
    back.name = 'neon-backing';
    this.group.add(back);
  }

  static textTexture(text: string, color: number, vertical: boolean): THREE.CanvasTexture {
    const c = document.createElement('canvas');
    const charW = 56;
    const len = text.length;
    c.width = vertical ? 96 : Math.max(128, len * charW + 48);
    c.height = vertical ? Math.max(128, len * 60 + 40) : 112;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, c.width, c.height);
    const col = srgb(color);
    const css = `rgb(${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '600 64px "Teko", "Chakra Petch", sans-serif';
    const draw = (blur: number, style: string, width: number): void => {
      ctx.shadowColor = css;
      ctx.shadowBlur = blur;
      ctx.strokeStyle = style;
      ctx.lineWidth = width;
      if (vertical) {
        for (let i = 0; i < len; i++) ctx.strokeText(text[i], c.width / 2, 40 + i * 60);
      } else ctx.strokeText(text, c.width / 2, c.height / 2 + 4);
    };
    draw(24, css, 7);
    draw(8, css, 5);
    draw(0, '#fff8ee', 1.6);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  update(dt: number, night: number, time: number): void {
    const on = 0.35 + 0.65 * THREE.MathUtils.smoothstep(night, 0.1, 0.6);
    this.flickerT -= dt;
    if (this.flickerT <= 0) {
      this.flickerIdx = this.mats.length ? Math.floor((Math.sin(time * 12.9898) * 43758.5453 - Math.floor(Math.sin(time * 12.9898) * 43758.5453)) * this.mats.length) : -1;
      this.flickerT = 2 + ((time * 7.3) % 5);
    }
    this.mats.forEach((m, i) => {
      let k = on * 1.8;
      if (i === this.flickerIdx && this.flickerT > 1.5) k *= Math.sin(time * 60) > 0.2 ? 1 : 0.15;
      m.color.setScalar(k);
    });
  }
}
