// Loading screen: the bike, small, turning slowly on a dark turntable. It uses the bike model the game is already
// downloading (no extra download), shown as soon as it arrives, and lets its WebGL context go once the game is up.
import * as THREE from 'three';

const TURN_S = 10; // seconds per turn

// A soft studio for the paint to reflect: dark room, one wide softbox overhead and a strip light to the side.
function studio(renderer) {
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.MeshBasicMaterial({ color: 0x1a1a1a, side: THREE.BackSide })));
  const box = (w, h, pos, c) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); s.add(m);
  };
  box(8, 3, [0, 7, 0], 0xffffff);
  box(1.2, 6, [6, 2, 3], 0xd8e8ff);
  box(1.2, 6, [-6, 1, -3], 0x606060);
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromScene(s, 0.04).texture;
  pm.dispose();
  return env;
}

// Mount into `host` (an empty element) once `bikePromise` resolves to the loaded glTF. Returns { stop() }.
export function startLoaderBike(host, bikePromise) {
  let raf = 0, stopped = false, renderer = null;
  bikePromise.then((gltf) => {
    if (stopped || !gltf) return;
    host.classList.add('on'); // takes its space now (still transparent), so it can be measured
    const cw = host.clientWidth || 220, ch = host.clientHeight || 120;
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(cw, ch);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.environment = studio(renderer);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x303030, 1.2));
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(2, 3, 3); scene.add(key);
    const rim = new THREE.DirectionalLight(0xcbfe00, 1.4); rim.position.set(-3, 2, -3); scene.add(rim);
    // the model shares geometry and materials with the game's copy; only the node tree is cloned
    const bike = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(bike), c = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
    bike.position.sub(c);
    const spin = new THREE.Group();
    spin.add(bike);
    scene.add(spin);
    const cam = new THREE.PerspectiveCamera(22, cw / ch, 0.1, 50);
    // fit the bike's length across the box (side-on) and its height top to bottom, with a little room
    const len = Math.max(size.x, size.z), tanH = Math.tan(THREE.MathUtils.degToRad(11));
    const dist = Math.max((len * 0.6) / (tanH * cw / ch), (size.y * 0.62) / tanH);
    cam.position.set(0, dist * 0.22, dist);
    cam.lookAt(0, -size.y * 0.05, 0);
    const t0 = performance.now();
    const tick = (now) => {
      if (stopped) return;
      spin.rotation.y = 0.6 + ((now - t0) / 1000 / TURN_S) * Math.PI * 2;
      renderer.render(scene, cam);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    requestAnimationFrame(() => host.classList.add('lit'));
  }).catch(() => {});
  return {
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
      if (renderer) { renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); }
    },
  };
}
