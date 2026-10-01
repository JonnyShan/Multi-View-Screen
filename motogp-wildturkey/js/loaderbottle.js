// Loading screen: a small product bottle turning slowly. The bottle is a lathe (a solid of revolution) shaped from the
// product photo's own silhouette, with the photo wrapped round it: front-on it looks exactly like the photo, and the
// back shows the same label the right way round. A soft studio sheen stays still while the bottle turns, which is what
// makes it read as glass. Works for any upright, round product shot with a transparent background.
import * as THREE from 'three';

const ROWS = 160;          // silhouette samples down the bottle
const TURN_S = 9;          // seconds per turn

// Silhouette of the photo: for each sampled row, the half-width and centre of the opaque pixels.
function silhouette(img) {
  const w = Math.min(img.naturalWidth, 256), h = Math.round(img.naturalHeight * w / img.naturalWidth);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0, w, h);
  const a = g.getImageData(0, 0, w, h).data;
  const rows = [];
  for (let i = 0; i <= ROWS; i++) {
    const y = Math.min(h - 1, Math.round(i / ROWS * (h - 1)));
    let l = -1, r = -1;
    for (let x = 0; x < w; x++) if (a[(y * w + x) * 4 + 3] > 128) { if (l < 0) l = x; r = x; }
    rows.push(l < 0 ? null : { v: 1 - y / (h - 1), hw: (r - l + 1) / 2 / w, cx: (l + r + 1) / 2 / w });
  }
  const live = rows.filter(Boolean);
  const cx = live.map(r => r.cx).sort((p, q) => p - q)[live.length >> 1];
  // light smoothing so the jaggies of the cut-out don't ripple the glass
  const hw = rows.map((r, i) => {
    if (!r) return 0;
    let s = 0, n = 0;
    for (let k = -2; k <= 2; k++) { const q = rows[i + k]; if (q) { s += q.hw; n++; } }
    return s / n;
  });
  return { rows, hw, cx, aspect: h / w };
}

// Lathe profile from the silhouette, bottom to top (so the faces point outwards), closed at the cap and the base.
function profile(sil) {
  const { rows, hw, aspect } = sil;
  const pts = [], meta = [];
  for (let i = rows.length - 1; i >= 0; i--) {
    if (!rows[i]) continue;
    pts.push(new THREE.Vector2(hw[i], rows[i].v * aspect - aspect / 2));
    meta.push(i);
  }
  const bot = pts[0].y, top = pts[pts.length - 1].y;
  pts.unshift(new THREE.Vector2(0.0001, bot)); meta.unshift(meta[0]);
  pts.push(new THREE.Vector2(0.0001, top)); meta.push(meta[meta.length - 1]);
  return { pts, meta };
}

// Half a lathe (front or back) with UVs that undo the photo's foreshortening, so straight-on it matches the photo.
// The halves don't share vertices, so the seam down each side doesn't smear the photo across one strip.
const SEGS = 48;
function half(sil, back) {
  const { pts, meta } = profile(sil);
  const phi0 = back ? Math.PI / 2 : -Math.PI / 2;
  const geo = new THREE.LatheGeometry(pts, SEGS, phi0, Math.PI);
  const uv = geo.attributes.uv;
  // LatheGeometry lays vertices out segment by segment, each segment running along the profile
  for (let s = 0; s <= SEGS; s++) {
    const side = (back ? -1 : 1) * Math.sin(phi0 + s / SEGS * Math.PI);
    for (let j = 0; j < pts.length; j++) uv.setXY(s * pts.length + j, sil.cx + side * sil.hw[meta[j]], sil.rows[meta[j]].v);
  }
  return geo;
}

// Vertical studio light strips, fixed to the camera.
function sheenTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 4;
  const g = c.getContext('2d');
  const band = (x, w, a) => {
    const gr = g.createLinearGradient(x - w, 0, x + w, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(x - w, 0, w * 2, 4);
  };
  band(70, 10, 0.55); band(84, 4, 0.5); band(196, 16, 0.22);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Mount the turning bottle into `host` (an empty element). Returns { stop() }, which tears it down.
export function startLoaderBottle(host, src) {
  let raf = 0, stopped = false, renderer = null;
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  img.decode().then(() => {
    if (stopped) return;
    const sil = silhouette(img);
    host.classList.add('on'); // takes its space now (still transparent), so it can be measured
    const cw = host.clientWidth || 72, ch = host.clientHeight || 150;
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(cw, ch);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(18, cw / ch, 0.1, 50);
    // fit the bottle's height with a little room, looking very slightly down
    const dist = (sil.aspect * 0.56) / Math.tan(THREE.MathUtils.degToRad(9));
    cam.position.set(0, dist * 0.05, dist);
    cam.lookAt(0, 0, 0);
    const tex = new THREE.Texture(img);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    const bottle = new THREE.Group();
    bottle.add(new THREE.Mesh(half(sil, false), mat), new THREE.Mesh(half(sil, true), mat));
    scene.add(bottle);
    // the sheen keeps the lathe's own UVs: u runs across the front half, left to right
    const sheen = new THREE.Mesh(new THREE.LatheGeometry(profile(sil).pts, SEGS, -Math.PI / 2, Math.PI), new THREE.MeshBasicMaterial({
      map: sheenTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.32,
    }));
    sheen.scale.setScalar(1.004);
    scene.add(sheen);
    const t0 = performance.now();
    const tick = (now) => {
      if (stopped) return;
      bottle.rotation.y = ((now - t0) / 1000 / TURN_S) * Math.PI * 2;
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
