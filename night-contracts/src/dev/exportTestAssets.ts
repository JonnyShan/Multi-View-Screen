/**
 * Dev only (never imported by the game): exports the code-built placeholders
 * as GLB files in the handoff conventions (metres, +Z forward) so the asset
 * swap-in path can be tested end to end.
 */
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { tuning, UNITS_PER_METRE } from '../config/tuning';
import { buildBikeModel } from '../render/BikeView';
import { buildCarBody } from '../render/CarView';
import { buildRiderModel } from '../render/RiderView';

async function toGlb(obj: THREE.Object3D, animations: THREE.AnimationClip[] = []): Promise<ArrayBuffer> {
  const exporter = new GLTFExporter();
  return (await exporter.parseAsync(obj, { binary: true, animations })) as ArrayBuffer;
}

function toMetres(obj: THREE.Object3D): THREE.Group {
  const g = new THREE.Group();
  g.add(obj);
  obj.scale.multiplyScalar(1 / UNITS_PER_METRE);
  return g;
}

export async function exportTestAssets(): Promise<Record<string, number[]>> {
  const out: Record<string, number[]> = {};
  // bike: rename the wheels so the GLB path finds them
  const bike = buildBikeModel(false);
  bike.frontWheel.name = 'wheel_f';
  bike.rearWheel.name = 'wheel_r';
  bike.steer.name = 'fork';
  out['models/bike/bike.glb'] = Array.from(new Uint8Array(await toGlb(toMetres(bike.root))));
  // a sedan with a distinctive gold paint so the swap is obvious
  const sedan = new THREE.Mesh(buildCarBody('sedan', tuning.car.specs.sedan), new THREE.MeshStandardMaterial({ color: 0xd9a441, vertexColors: true, metalness: 0.4, roughness: 0.3 }));
  out['models/cars/sedan.glb'] = Array.from(new Uint8Array(await toGlb(toMetres(sedan))));
  // rider with one simple idle clip
  const rider = buildRiderModel();
  const chest = rider.bones.chest;
  const track = new THREE.QuaternionKeyframeTrack(`${chest.name}.quaternion`, [0, 1, 2], [0, 0, 0, 1, 0.1, 0, 0, 0.995, 0, 0, 0, 1]);
  const idle = new THREE.AnimationClip('idle', 2, [track]);
  out['models/rider/rider.glb'] = Array.from(new Uint8Array(await toGlb(toMetres(rider.root), [idle])));
  return out;
}
