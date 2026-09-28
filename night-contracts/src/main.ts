import * as THREE from 'three';
import { tuning } from './config/tuning';
import { Loop } from './core/Loop';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e0f11);
const camera = new THREE.PerspectiveCamera(tuning.camera.fov, 1, 1, tuning.camera.far);
camera.position.set(0, 40, 80);
camera.lookAt(0, 0, 0);

function resize(): void {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

let frames = 0;
const loop = new Loop(tuning.sim.hz, tuning.sim.maxStepsPerFrame, {
  step: () => {
    frames++;
  },
  render: () => renderer.render(scene, camera),
});
loop.start();

declare global {
  interface Window {
    __nc?: { frames: () => number };
  }
}
window.__nc = { frames: () => frames };
