/**
 * CPU culling for big instanced sets (palms, lamps, props). Every few frames
 * it keeps only instances in front of the camera and within range, then packs
 * them into the instance buffer. One draw call per mesh stays one draw call,
 * but far and behind-the-camera instances cost no triangles.
 *
 * All meshes added to one culler must share instance order and count.
 */
import * as THREE from 'three';

interface Entry {
  mesh: THREE.InstancedMesh;
  matrices: Float32Array;
  colors: Float32Array | null;
}

export class InstanceCuller {
  private readonly entries: Entry[] = [];
  private readonly xs: Float32Array;
  private readonly zs: Float32Array;
  private readonly visible: Int32Array;
  private readonly fwd = new THREE.Vector3();

  constructor(
    positions: { x: number; z: number }[],
    private readonly radius = 60,
  ) {
    this.xs = Float32Array.from(positions.map((p) => p.x));
    this.zs = Float32Array.from(positions.map((p) => p.z));
    this.visible = new Int32Array(positions.length);
  }

  get count(): number {
    return this.xs.length;
  }

  add(mesh: THREE.InstancedMesh): void {
    if (mesh.instanceMatrix.count !== this.xs.length) throw new Error(`InstanceCuller: ${mesh.name} has ${mesh.instanceMatrix.count} instances, expected ${this.xs.length}`);
    this.entries.push({
      mesh,
      matrices: Float32Array.from(mesh.instanceMatrix.array as Float32Array),
      colors: mesh.instanceColor ? Float32Array.from(mesh.instanceColor.array as Float32Array) : null,
    });
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  }

  update(camera: THREE.Camera, maxDist: number): number {
    camera.getWorldDirection(this.fwd);
    const cx = camera.position.x;
    const cz = camera.position.z;
    const fx = this.fwd.x;
    const fz = this.fwd.z;
    const fl = Math.hypot(fx, fz) || 1;
    const max2 = maxDist * maxDist;
    const r = this.radius;
    let n = 0;
    for (let i = 0; i < this.xs.length; i++) {
      const dx = this.xs[i] - cx;
      const dz = this.zs[i] - cz;
      const d2 = dx * dx + dz * dz;
      if (d2 > max2) continue;
      // wide cone in front of the camera, plus everything very close
      const along = (dx * fx + dz * fz) / fl;
      if (d2 > r * r * 4 && along < Math.sqrt(d2) * 0.2 - r) continue;
      this.visible[n++] = i;
    }
    for (const e of this.entries) {
      const dst = e.mesh.instanceMatrix.array as Float32Array;
      for (let k = 0; k < n; k++) dst.set(e.matrices.subarray(this.visible[k] * 16, this.visible[k] * 16 + 16), k * 16);
      e.mesh.count = n;
      e.mesh.instanceMatrix.needsUpdate = true;
      if (e.colors && e.mesh.instanceColor) {
        const cd = e.mesh.instanceColor.array as Float32Array;
        for (let k = 0; k < n; k++) cd.set(e.colors.subarray(this.visible[k] * 3, this.visible[k] * 3 + 3), k * 3);
        e.mesh.instanceColor.needsUpdate = true;
      }
    }
    return n;
  }
}
