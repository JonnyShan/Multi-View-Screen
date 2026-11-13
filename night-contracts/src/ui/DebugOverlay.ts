/** F3 overlay: fps, frame time, draw calls, triangles and entity counts. */
import type * as THREE from 'three';
import type { Sim } from '../sim/Sim';

export class DebugOverlay {
  readonly root = document.createElement('div');
  private frames = 0;
  private acc = 0;
  private fps = 0;
  private worst = 0;
  visible = false;

  constructor() {
    this.root.className = 'debug';
  }

  toggle(on = !this.visible): void {
    this.visible = on;
    this.root.classList.toggle('on', on);
  }

  update(dt: number, renderer: THREE.WebGLRenderer, sim: Sim, quality: string): void {
    this.frames++;
    this.acc += dt;
    this.worst = Math.max(this.worst, dt);
    if (this.acc < 0.5) return;
    this.fps = this.frames / this.acc;
    const worst = this.worst;
    this.frames = 0;
    this.acc = 0;
    this.worst = 0;
    if (!this.visible) return;
    const info = renderer.info;
    const cars = sim.cars.length;
    const police = sim.cars.filter((c) => c.kind === 'police').length;
    this.root.textContent = [
      `fps      ${this.fps.toFixed(0)}  (worst ${(worst * 1000).toFixed(0)} ms)`,
      `calls    ${info.render.calls}`,
      `tris     ${(info.render.triangles / 1000).toFixed(0)}k`,
      `geoms    ${info.memory.geometries}  tex ${info.memory.textures}`,
      `quality  ${quality}  dpr ${renderer.getPixelRatio().toFixed(2)}`,
      `cars     ${cars}  police ${police}`,
      `peds     ${sim.peds.list.filter((p) => p.alive).length}`,
      `bullets  ${sim.combat.bullets.length}`,
      `player   ${sim.player.mode}  ${sim.player.x.toFixed(0)}, ${sim.player.y.toFixed(0)}`,
      `contract ${sim.contracts.state}  heat ${sim.heat.value.toFixed(2)}`,
      `clock    ${sim.clock.toFixed(2)}  wet ${sim.wet.toFixed(2)}`,
    ].join('\n');
  }
}
