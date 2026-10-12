import * as THREE from './vendor/three.module.js';

// Dimensions are metres. Every prefab stands on y=0 and faces +z.
// Pass width/height/depth to keep an existing room's furniture footprint.
export const FURNITURE_DIMENSIONS = Object.freeze({
  sofa: [2.8, 1.08, 1.04], armchair: [1.08, 1.08, 1.04],
  'terrace-chair': [1.12, 1.04, 1.1], lounger: [1.12, 1.04, 1.1],
  'coffee-table': [1.65, .48, .9], table: [1.65, .48, .9],
  desk: [2.25, .82, .92], chair: [.76, 1.28, .76],
  bed: [2.36, 1.34, 2.85], nightstand: [.58, .59, .46],
  lamp: [.48, 1.94, .48], 'table-lamp': [.3, .55, .3],
  piano: [2.18, 1.34, .76], bookcase: [3.5, 2.62, .58],
  arcade: [1.08, 2.18, 1.02], monitor: [1.32, 1.01, .3],
  planter: [.55, 1.5, .55],
  cup: [.22, .16, .16], book: [.34, .056, .24], books: [.37, .174, .27],
  keyboard: [.64, .038, .24], mouse: [.09, .064, .145],
  pen: [.016, .018, .17], pens: [.06, .018, .17],
  frame: [.38, .48, .13], cushion: [.46, .46, .16], crate: [.64, .64, .64],
});

const geometryCache = new Map(), materials = new Map();
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
function cached(key, make) {
  if (!geometryCache.has(key)) geometryCache.set(key, make());
  return geometryCache.get(key);
}
function canvasTexture(draw, width = 256, height = 256) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  draw(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}
const grain = canvasTexture((c, w, h) => {
  c.fillStyle = '#e4ccaa'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 110; i++) {
    c.strokeStyle = `rgba(91,58,31,${.026 + i % 5 * .012})`;
    c.lineWidth = i % 6 === 0 ? 1.4 : .65;
    c.beginPath();
    const y = (i * 73) % h;
    for (let x = 0; x <= w; x += 8) {
      const yy = y + Math.sin(x * .027 + i) * 2 + Math.sin(x * .071 + i * 3) * .5;
      if (!x) c.moveTo(x, yy); else c.lineTo(x, yy);
    }
    c.stroke();
  }
});
const weave = canvasTexture((c, w, h) => {
  c.fillStyle = '#e7e5df'; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 3) for (let x = 0; x < w; x += 3) {
    const variation = Math.sin(x * 17 + y * 31) * 5;
    c.fillStyle = `rgb(${211 + variation},${210 + variation},${204 + variation})`;
    c.fillRect(x + (y % 6 ? 1 : 0), y, 1, 2);
  }
});
const ceramicSpeckles = canvasTexture((c, w, h) => {
  c.fillStyle = '#f4eddf'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 630; i++) {
    c.fillStyle = i % 4 ? '#a2978233' : '#74695150';
    c.fillRect((i * 73.13) % w, (i * 127.7) % h, .7, .7);
  }
});
function material(name, color, options = {}) {
  if (!materials.has(name)) materials.set(name, new THREE.MeshStandardMaterial({ color, roughness: .68, ...options }));
  return materials.get(name);
}
export const furnitureMaterials = Object.freeze({
  oak: material('oak', '#c09a70', { map: grain, roughness: .5 }),
  oakEdge: material('oak-edge', '#a67e51', { map: grain, roughness: .56 }),
  cream: material('cream', '#f0e8d8', { map: weave, roughness: .96, bumpMap: weave, bumpScale: .002 }),
  creamSeam: material('cream-seam', '#c3b79f', { roughness: 1 }),
  olive: material('olive', '#899078', { map: weave, roughness: 1, bumpMap: weave, bumpScale: .002 }),
  oliveSeam: material('olive-seam', '#626e53', { roughness: 1 }),
  charcoal: material('charcoal', '#282e2d', { roughness: .53 }),
  black: material('black-enamel', '#151c1b', { roughness: .22, metalness: .1 }),
  green: material('arcade-green', '#233e34', { roughness: .38 }),
  brass: material('brass', '#bb975b', { roughness: .3, metalness: .82 }),
  steel: material('steel', '#778184', { roughness: .38, metalness: .72 }),
  ceramic: material('ceramic', '#efe8dc', { map: ceramicSpeckles, roughness: .36 }),
  paper: material('paper', '#e0d8c0', { roughness: .95 }),
  soil: material('soil', '#463a2c', { roughness: 1 }),
  leaf: material('leaf', '#47784a', { roughness: .8, side: THREE.DoubleSide }),
  leafLight: material('leaf-light', '#709051', { roughness: .86, side: THREE.DoubleSide }),
  rope: material('rope', '#b3a07d', { roughness: .96 }),
  glass: material('prop-glass', '#cde0d9', { transparent: true, opacity: .12, roughness: .08, metalness: .08, depthWrite: false }),
});
const m = furnitureMaterials;
const bookMats = ['#617460', '#9d8e73', '#374c45', '#d4c7aa', '#765d49'].map((color, i) => material(`book-${i}`, color));
const shadeMat = material('lamp-shade', '#f2e4c9', { side: THREE.DoubleSide, roughness: .98, emissive: '#d9a768', emissiveIntensity: .055 });

// A small, nonuniform corner grid gives actual curved bevels, rather than
// relying on normal smoothing of a sharp box. The geometry is cached by size.
function roundedBox(w, h, d, radius = .025, segments = 2) {
  const r = Math.min(radius, w / 2 - .0001, h / 2 - .0001, d / 2 - .0001);
  return cached(`rb:${w},${h},${d},${r},${segments}`, () => {
    const cuts = segments * 2 + 1;
    const geometry = new THREE.BoxGeometry(1, 1, 1, cuts, cuts, cuts);
    const p = geometry.attributes.position, n = geometry.attributes.normal;
    const axis = (v, extent) => {
      const i = Math.round((v + .5) * cuts), core = extent / 2 - r;
      return i <= segments ? -core - r * Math.cos(i / segments * Math.PI / 2)
        : core + r * Math.sin((i - segments - 1) / segments * Math.PI / 2);
    };
    const point = new THREE.Vector3(), normal = new THREE.Vector3(), core = new THREE.Vector3(w / 2 - r, h / 2 - r, d / 2 - r);
    for (let i = 0; i < p.count; i++) {
      point.set(axis(p.getX(i), w), axis(p.getY(i), h), axis(p.getZ(i), d));
      const center = new THREE.Vector3(clamp(point.x, -core.x, core.x), clamp(point.y, -core.y, core.y), clamp(point.z, -core.z, core.z));
      normal.copy(point).sub(center).normalize();
      point.copy(center).addScaledVector(normal, r);
      p.setXYZ(i, point.x, point.y, point.z); n.setXYZ(i, normal.x, normal.y, normal.z);
    }
    geometry.computeBoundingBox(); geometry.computeBoundingSphere();
    return geometry;
  });
}
function cylinder(top, bottom, height, segments = 16, open = false) {
  return cached(`cy:${top},${bottom},${height},${segments},${open}`, () => new THREE.CylinderGeometry(top, bottom, height, segments, 1, open));
}
function sphere(radius, width = 16, height = 10) {
  return cached(`sp:${radius},${width},${height}`, () => new THREE.SphereGeometry(radius, width, height));
}
function torus(radius, tube = .004, arc = Math.PI * 2) {
  return cached(`to:${radius},${tube},${arc}`, () => new THREE.TorusGeometry(radius, tube, 5, 24, arc));
}
function add(root, geometry, material, x = 0, y = 0, z = 0, rotation = null, name = '') {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  if (rotation) mesh.rotation.set(...rotation);
  mesh.name = name; mesh.castShadow = true; mesh.receiveShadow = true;
  root.add(mesh); return mesh;
}
function box(root, w, h, d, x, y, z, material = m.oak, radius = .02, rotation = null) {
  return add(root, roundedBox(w, h, d, radius, Math.min(w, h, d) < .03 ? 1 : 2), material, x, y, z, rotation);
}
function flatBox(root, w, h, d, x, y, z, material) {
  return add(root, cached(`box:${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d)), material, x, y, z);
}
function rod(root, from, to, radius, material = m.brass, top = radius) {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to), delta = b.clone().sub(a);
  const mesh = add(root, cylinder(top, radius, delta.length(), 10), material);
  mesh.position.copy(a).add(b).multiplyScalar(.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
  return mesh;
}
function collisionBoxFor(mesh) {
  mesh.updateWorldMatrix(true, false);
  const bounds = new THREE.Box3().setFromObject(mesh, true);
  return { center: bounds.getCenter(new THREE.Vector3()).toArray(), halfExtents: bounds.getSize(new THREE.Vector3()).multiplyScalar(.5).toArray() };
}
function tubing(root, points, radius, material, closed = false) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), closed);
  return add(root, new THREE.TubeGeometry(curve, Math.max(12, points.length * 2), radius, 4, closed), material);
}
function outline(root, width, height, radius, x, y, z, material, plane = 'xy', thickness = .005) {
  const points = [];
  for (let corner = 0; corner < 4; corner++) {
    const signX = corner === 0 || corner === 3 ? 1 : -1, signY = corner < 2 ? 1 : -1;
    for (let step = 0; step < 4; step++) {
      const angle = corner * Math.PI / 2 + step * Math.PI / 6;
      const u = signX * (width / 2 - radius) + Math.cos(angle) * radius;
      const v = signY * (height / 2 - radius) + Math.sin(angle) * radius;
      points.push(plane === 'xz' ? [x + u, y, z + v] : [x + u, y + v, z]);
    }
  }
  return tubing(root, points, thickness, material, true);
}

// Furniture detail is static, so collapse meshes that share a material into
// one draw. Interactive screens, bulbs and piano keys opt out of this batch.
function mergeStatic(root) {
  root.updateMatrixWorld(true);
  const buckets = new Map();
  root.traverse(mesh => {
    if (!mesh.isMesh || mesh.isInstancedMesh || mesh.userData.keepSeparate) return;
    if (!buckets.has(mesh.material)) buckets.set(mesh.material, []);
    buckets.get(mesh.material).push(mesh);
  });
  for (const [material, list] of buckets) {
    if (list.length < 2) continue;
    const positions = [], normals = [], uvs = [];
    for (const mesh of list) {
      const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
      geometry.applyMatrix4(mesh.matrixWorld);
      positions.push(...geometry.attributes.position.array);
      normals.push(...geometry.attributes.normal.array);
      if (geometry.attributes.uv) uvs.push(...geometry.attributes.uv.array);
      else for (let i = 0; i < geometry.attributes.position.count; i++) uvs.push(0, 0);
      geometry.dispose(); mesh.removeFromParent();
    }
    const merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    merged.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    merged.computeBoundingBox(); merged.computeBoundingSphere();
    add(root, merged, material, 0, 0, 0, null, 'batched-detail');
  }
}
function finish(root, kind, options = {}, extra = {}) {
  mergeStatic(root);
  const nominal = FURNITURE_DIMENSIONS[kind];
  const requested = [options.width ?? nominal[0], options.height ?? nominal[1], options.depth ?? nominal[2]];
  if (requested.some(n => !Number.isFinite(n) || n <= 0)) throw new RangeError('Prefab dimensions must be positive finite numbers.');
  const bounds = new THREE.Box3().setFromObject(root), size = bounds.getSize(new THREE.Vector3());
  // Normalizing the visible bounds makes the dimensions an exact integration
  // contract, including overhangs, seams, handles and lamp shades.
  root.position.y -= bounds.min.y;
  const centered = new THREE.Group(); centered.add(root);
  root.position.x -= (bounds.min.x + bounds.max.x) / 2;
  root.position.z -= (bounds.min.z + bounds.max.z) / 2;
  centered.scale.set(requested[0] / size.x, requested[1] / size.y, requested[2] / size.z);
  centered.name = `furniture-${kind}`;
  const scale = centered.scale.toArray(), centerX = (bounds.min.x + bounds.max.x) / 2, centerZ = (bounds.min.z + bounds.max.z) / 2;
  const localPoint = point => [(point[0] - centerX) * scale[0], (point[1] - bounds.min.y) * scale[1], (point[2] - centerZ) * scale[2]];
  const boundsData = { width: requested[0], height: requested[1], depth: requested[2] };
  const collisionBoxes = extra.collisionBoxes?.map(part => ({
    center: localPoint(part.center), halfExtents: part.halfExtents.map((n, i) => n * scale[i]),
  })) || [{ center: [0, requested[1] / 2, 0], halfExtents: requested.map(n => n / 2) }];
  const details = { ...extra, collisionBoxes };
  for (const key of ['seatLocal', 'lightSocket']) if (details[key]) details[key] = localPoint(details[key]);
  for (const key of ['seatHeight', 'surfaceHeight', 'mattressHeight', 'shelfHeight', 'soilHeight', 'keyHeight']) {
    if (Number.isFinite(details[key])) details[key] = (details[key] - bounds.min.y) * scale[1];
  }
  if (details.debrisParts) details.debrisParts = details.debrisParts.map(part => ({ position: localPoint(part.position), size: part.size.map((n, i) => n * scale[i]) }));
  centered.userData = { kind, dimensions: boundsData, bounds: boundsData,
    halfExtents: [requested[0] / 2, requested[1] / 2, requested[2] / 2],
    bodyOffset: [0, requested[1] / 2, 0], parts: root.userData.parts || {}, ...details };
  return centered;
}
function pillowGeometry(w, h, d) {
  return cached(`pillow:${w},${h},${d}`, () => {
    const pos = [], uv = [], indices = [], cuts = 12, row = cuts + 1, sideCount = row * row;
    for (const side of [1, -1]) for (let j = 0; j <= cuts; j++) for (let i = 0; i <= cuts; i++) {
      const u = i / cuts * 2 - 1, v = j / cuts * 2 - 1;
      const puff = Math.sqrt(Math.max(0, 1 - u * u)) * Math.sqrt(Math.max(0, 1 - v * v));
      const fold = Math.sin(v * 25) * Math.pow(Math.abs(u), 7) + Math.sin(u * 23) * Math.pow(Math.abs(v), 7);
      pos.push(u * w / 2 * (.94 + .06 * v * v), v * h / 2 * (.94 + .06 * u * u), side * (d / 2 * (.18 + .82 * puff) + d * .014 * fold));
      uv.push(i / cuts, j / cuts);
      if (i < cuts && j < cuts) {
        const a = (side === 1 ? 0 : sideCount) + j * row + i;
        if (side === 1) indices.push(a, a + 1, a + row, a + 1, a + row + 1, a + row);
        else indices.push(a, a + row, a + 1, a + 1, a + row, a + row + 1);
      }
    }
    const boundary = [];
    for (let i = 0; i <= cuts; i++) boundary.push(i);
    for (let j = 1; j <= cuts; j++) boundary.push(j * row + cuts);
    for (let i = cuts - 1; i >= 0; i--) boundary.push(cuts * row + i);
    for (let j = cuts - 1; j >= 1; j--) boundary.push(j * row);
    for (let i = 0; i < boundary.length; i++) {
      const a = boundary[i], b = boundary[(i + 1) % boundary.length];
      indices.push(a, a + sideCount, b, b, a + sideCount, b + sideCount);
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry;
  });
}
function addPillow(root, x, y, z, olive = true, angle = 0, w = .46, h = .46, d = .16) {
  const pillow = new THREE.Group(); pillow.position.set(x, y, z); pillow.rotation.z = angle; root.add(pillow);
  add(pillow, pillowGeometry(w, h, d), olive ? m.olive : m.cream);
  const seam = [];
  for (let edge = 0; edge < 4; edge++) for (let i = 0; i < 8; i++) {
    const t = -1 + i / 4;
    const u = edge === 0 ? t : edge === 1 ? 1 : edge === 2 ? -t : -1;
    const v = edge === 0 ? -1 : edge === 1 ? t : edge === 2 ? 1 : -t;
    seam.push([u * w / 2 * (.94 + .06 * v * v), v * h / 2 * (.94 + .06 * u * u), 0]);
  }
  tubing(pillow, seam, .003, olive ? m.oliveSeam : m.creamSeam, true);
}
function seating(kind, options) {
  const root = new THREE.Group(), w = kind === 'sofa' ? 2.8 : 1.08, d = 1.04, floorSupports = [];
  for (const x of [-w / 2 + .13, w / 2 - .13]) for (const z of [-d / 2 + .13, d / 2 - .13]) {
    floorSupports.push(collisionBoxFor(rod(root, [x, .015, z + .03], [x, .2, z], .035, m.oakEdge, .047)));
  }
  box(root, w - .06, .23, d - .06, 0, .28, 0, m.cream, .055);
  box(root, w - .11, .7, .21, 0, .68, -.38, m.cream, .065, [-.055, 0, 0]);
  for (const x of [-w / 2 + .1, w / 2 - .1]) box(root, .2, .64, d - .06, x, .57, .025, m.cream, .055);
  const count = kind === 'sofa' ? 3 : 1, seatWidth = (w - .45) / count;
  for (let i = 0; i < count; i++) {
    const x = (i - (count - 1) / 2) * seatWidth;
    box(root, seatWidth - .018, .175, .78, x, .48, .085, m.cream, .055);
    outline(root, seatWidth - .055, .74, .065, x, .491, .085, m.creamSeam, 'xz', .004);
    box(root, seatWidth - .025, .51, .175, x, .79, -.255, m.cream, .055, [-.1, 0, 0]);
    outline(root, seatWidth - .07, .455, .065, x, .79, -.155, m.creamSeam, 'xy', .004);
  }
  if (options.cushions !== false) {
    addPillow(root, -w / 2 + .45, .76, -.06, true, .11, .40, .41, .14);
    if (kind === 'sofa') addPillow(root, w / 2 - .47, .77, -.07, true, -.13, .42, .42, .14);
  }
  return finish(root, kind, options, { seatHeight: .5675, seatLocal: [0, .5675, .1], heading: 0, seatFacing: [0, 0, 1],
    collisionBoxes: [{ center: [0, .31, .015], halfExtents: [w / 2, .245, .495] }, { center: [0, .75, -.38], halfExtents: [w / 2, .33, .13] },
      ...[-1, 1].map(side => ({ center: [side * (w / 2 - .1), .58, .025], halfExtents: [.1, .32, .49] })), ...floorSupports] });
}
function terraceChair(kind, options) {
  const root = new THREE.Group(), floorSupports = [];
  for (const x of [-.43, .43]) for (const z of [-.4, .42]) floorSupports.push(collisionBoxFor(rod(root, [x * 1.07, .01, z * 1.05], [x, .66, z], .035, m.oak, .045)));
  box(root, .92, .085, .88, 0, .34, .02, m.oak, .025);
  box(root, .91, .15, .84, 0, .46, .035, m.cream, .055);
  box(root, .88, .53, .16, 0, .76, -.36, m.cream, .055, [-.1, 0, 0]);
  for (const side of [-1, 1]) {
    tubing(root, [[side * .51, .67, .43], [side * .51, .85, .23], [side * .50, .91, -.18], [side * .49, .94, -.43]], .03, m.oak);
    for (let i = 0; i < 13; i++) {
      const z = -.39 + i * .062, high = .92 - Math.max(0, z) * .46;
      rod(root, [side * .50, .37, z], [side * .51, high, z], .009, m.rope);
    }
  }
  if (options.cushions !== false) addPillow(root, 0, .69, -.12, true, .045, .4, .32, .13);
  return finish(root, kind, options, { seatHeight: .54, seatLocal: [0, .54, .13], heading: 0, seatFacing: [0, 0, 1],
    collisionBoxes: [{ center: [0, .43, .02], halfExtents: [.46, .12, .44] }, { center: [0, .76, -.36], halfExtents: [.44, .265, .11] },
      ...[-1, 1].map(side => ({ center: [side * .50, .63, 0], halfExtents: [.04, .29, .46] })), ...floorSupports] });
}
function table(kind, options) {
  const root = new THREE.Group(), coffee = kind === 'coffee-table' || kind === 'table';
  const w = coffee ? 1.65 : 2.25, d = coffee ? .9 : .92, h = coffee ? .48 : .82;
  box(root, w, .1, d, 0, h - .05, 0, m.oak, .035);
  for (const x of [-w / 2 + .20, w / 2 - .20]) {
    box(root, coffee ? .14 : .16, h - .10, d - .1, x, (h - .1) / 2, 0, m.oak, .02);
    box(root, .02, .025, d - .16, x, .025, 0, m.charcoal, .004);
  }
  if (!coffee) {
    box(root, w - .55, .095, .06, 0, h - .145, -.28, m.oakEdge, .012);
    box(root, .53, .105, .38, w / 2 - .5, h - .165, .06, m.oak, .012);
    box(root, .18, .009, .018, w / 2 - .5, h - .155, .257, m.brass, .004);
  }
  return finish(root, kind, options, { surfaceHeight: h, fixed: true,
    collisionBoxes: [{ center: [0, h - .05, 0], halfExtents: [w / 2, .05, d / 2] },
      ...[-1, 1].map(side => ({ center: [side * (w / 2 - .20), (h - .1) / 2, 0], halfExtents: [coffee ? .07 : .08, (h - .1) / 2, (d - .1) / 2] }))] });
}
function officeChair(options) {
  const root = new THREE.Group(), floorSupports = [];
  add(root, cylinder(.033, .046, .34, 12), m.steel, 0, .25, 0);
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5, x = Math.sin(a) * .31, z = Math.cos(a) * .31;
    floorSupports.push(collisionBoxFor(rod(root, [0, .16, 0], [x, .075, z], .024, m.charcoal)));
    const caster = add(root, cylinder(.046, .046, .045, 12), m.charcoal, x, .045, z);
    caster.rotation.z = Math.PI / 2; caster.rotation.y = -a;
    floorSupports.push(collisionBoxFor(caster));
  }
  box(root, .55, .13, .51, 0, .49, .025, m.charcoal, .055);
  box(root, .51, .52, .10, 0, .87, -.215, m.charcoal, .042, [-.14, 0, 0]);
  box(root, .41, .46, .025, 0, .88, -.15, material('chair-mesh', '#4a4f4c', { map: weave, roughness: .95 }), .035, [-.14, 0, 0]);
  box(root, .33, .17, .095, 0, 1.18, -.27, m.charcoal, .035, [-.09, 0, 0]);
  tubing(root, [[0, .39, -.20], [0, .69, -.32], [0, 1.12, -.30]], .025, m.charcoal);
  for (const side of [-1, 1]) {
    rod(root, [side * .27, .43, 0], [side * .315, .68, -.03], .021, m.charcoal);
    box(root, .068, .033, .29, side * .32, .70, .005, m.charcoal, .016);
  }
  return finish(root, 'chair', options, { seatHeight: .53, seatLocal: [0, .53, .075], heading: 0, mass: 7, seatFacing: [0, 0, 1],
    collisionBoxes: [{ center: [0, .49, .025], halfExtents: [.285, .075, .26] }, { center: [0, .88, -.24], halfExtents: [.26, .29, .075] },
      { center: [0, .26, 0], halfExtents: [.052, .20, .052] }, ...floorSupports] });
}
function bed(options) {
  const root = new THREE.Group(), floorSupports = [];
  for (const x of [-1.045, 1.045]) for (const z of [-1.235, 1.23]) floorSupports.push(collisionBoxFor(box(root, .12, .26, .12, x, .13, z, m.oak, .012)));
  box(root, 2.36, .24, 2.72, 0, .31, .065, m.oak, .025);
  box(root, 2.23, .31, 2.62, 0, .565, .045, m.cream, .075);
  box(root, 2.36, 1.31, .14, 0, .68, -1.355, m.oak, .025);
  box(root, 2.24, .72, .095, 0, .93, -1.257, m.cream, .035);
  box(root, .008, .7, .007, 0, .93, -1.205, m.creamSeam, .002);
  box(root, 2.22, .095, 2.16, 0, .744, .275, m.cream, .042);
  const cover = new THREE.PlaneGeometry(2.23, 1.65, 14, 10), p = cover.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getY(i), edge = Math.max(0, Math.abs(x) - .96);
    p.setXYZ(i, x, -.22 * Math.pow(edge / .15, 1.5) + Math.sin(z * 8 + x * 3) * .008, z);
  }
  cover.computeVertexNormals();
  const coverMat = material('bed-cover', '#93a19b', { map: weave, side: THREE.DoubleSide, roughness: 1 });
  add(root, cover, coverMat, 0, .805, .58);
  if (options.cushions !== false) for (const x of [-.57, .57]) {
    box(root, .98, .19, .54, x, .85, -.91, m.cream, .08, [.02, 0, x < 0 ? .028 : -.028]);
    outline(root, .91, .48, .06, x, .868, -.91, m.creamSeam, 'xz', .004);
  }
  if (options.cushions !== false) addPillow(root, 0, .89, -.65, true, 0, .72, .26, .13);
  return finish(root, 'bed', options, { mattressHeight: .75, fixed: true,
    collisionBoxes: [{ center: [0, .465, .045], halfExtents: [1.18, .32, 1.36] }, { center: [0, .68, -1.355], halfExtents: [1.18, .655, .075] }, ...floorSupports] });
}
function nightstand(options) {
  const root = new THREE.Group(), floorSupports = [];
  for (const x of [-.245, .245]) for (const z of [-.18, .18]) floorSupports.push(collisionBoxFor(box(root, .058, .10, .055, x, .05, z, m.oakEdge, .007)));
  box(root, .56, .49, .44, 0, .335, 0, m.oak, .017);
  box(root, .58, .045, .46, 0, .5675, 0, m.oak, .014);
  for (let i = 0; i < 2; i++) {
    box(root, .514, .211, .016, 0, .215 + i * .227, .225, m.oak, .007);
    box(root, .12, .014, .024, 0, .235 + i * .227, .241, m.brass, .005);
  }
  return finish(root, 'nightstand', options, { surfaceHeight: .59, mass: 12,
    collisionBoxes: [{ center: [0, .335, 0], halfExtents: [.28, .245, .22] }, { center: [0, .5675, 0], halfExtents: [.29, .0225, .23] }, ...floorSupports] });
}
function lamp(kind, options) {
  const root = new THREE.Group(), table = kind === 'table-lamp';
  const baseR = table ? .11 : .24, height = table ? .55 : 1.94, shadeH = table ? .19 : .36, shadeR = table ? .15 : .24;
  const baseH = table ? .17 : .045;
  add(root, cylinder(baseR * .93, baseR, baseH, 24), table ? m.brass : m.black, 0, baseH / 2, 0);
  rod(root, [0, baseH, 0], [0, height - shadeH / 2, 0], table ? .018 : .0185, m.brass);
  const shade = add(root, cylinder(shadeR * .90, shadeR, shadeH, 28, true), shadeMat, 0, height - shadeH / 2, 0);
  shade.userData.keepSeparate = true; shade.name = 'lamp-shade';
  for (const [y, r] of [[height - shadeH, shadeR], [height, shadeR * .9]]) add(root, torus(r, .0035), m.creamSeam, 0, y, 0, [Math.PI / 2, 0, 0]);
  const bulbMaterial = new THREE.MeshStandardMaterial({ color: '#fff1c8', roughness: .28, emissive: '#ffd28b', emissiveIntensity: .65 });
  const bulb = add(root, sphere(table ? .027 : .045), bulbMaterial, 0, height - shadeH * .60, 0);
  bulb.userData.keepSeparate = true; bulb.name = 'lamp-bulb';
  root.userData.parts = { shade, bulb };
  return finish(root, kind, options, { breakable: 'lamp', mass: table ? 1.5 : 4, lightSocket: [0, height - shadeH / 2, 0],
    collisionBoxes: [{ center: [0, baseH / 2, 0], halfExtents: [baseR, baseH / 2, baseR] },
      { center: [0, (height - shadeH) / 2, 0], halfExtents: [.022, (height - shadeH) / 2, .022] },
      { center: [0, height - shadeH / 2, 0], halfExtents: [shadeR, shadeH / 2, shadeR] }] });
}
function uprightPiano(options) {
  const root = new THREE.Group();
  box(root, 2.12, .13, .61, 0, .08, -.035, m.black, .012);
  box(root, 2.08, .65, .36, 0, .475, -.145, m.black, .017);
  box(root, 1.84, .51, .012, 0, .467, .045, m.charcoal, .008);
  for (const x of [-.977, .977]) box(root, .082, .6, .43, x, .38, .025, m.black, .012);
  box(root, 2.04, .48, .34, 0, 1.08, -.165, m.black, .016);
  box(root, 1.88, .35, .018, 0, 1.086, .018, m.charcoal, .008);
  box(root, 2.18, .061, .43, 0, 1.3095, -.15, m.black, .016);
  box(root, 2.14, .08, .41, 0, .742, .176, m.black, .013);
  box(root, 1.98, .026, .048, 0, .983, .028, m.black, .006);
  box(root, 1.96, .007, .007, 0, .951, .055, m.brass, .001);
  const span = 1.91, keyW = span / 52, whiteGeometry = roundedBox(keyW - .0012, .035, .31, .0028, 1);
  const blackGeometry = roundedBox(keyW * .61, .045, .178, .003, 1);
  const white = new THREE.InstancedMesh(whiteGeometry, m.paper, 52), black = new THREE.InstancedMesh(blackGeometry, m.black, 36);
  white.name = 'piano-white-keys'; black.name = 'piano-black-keys';
  white.castShadow = black.castShadow = true; white.receiveShadow = black.receiveShadow = true;
  root.add(white, black);
  const transform = new THREE.Object3D(), keys = []; let wi = 0, bi = 0;
  for (let note = 0; note < 88; note++) {
    const isBlack = [1, 3, 6, 8, 10].includes((note + 9) % 12);
    const x = -span / 2 + (isBlack ? wi : wi + .5) * keyW;
    transform.position.set(x, isBlack ? .806 : .781, isBlack ? .165 : .232);
    transform.updateMatrix();
    (isBlack ? black : white).setMatrixAt(isBlack ? bi : wi, transform.matrix);
    keys.push({ mesh: isBlack ? black : white, instance: isBlack ? bi++ : wi++, rest: transform.matrix.clone() });
  }
  for (const x of [-.11, 0, .11]) {
    rod(root, [x, .073, .08], [x, .052, .28], .009, m.brass);
    box(root, .055, .018, .10, x, .052, .29, m.brass, .008);
  }
  root.userData.parts = { whiteKeys: white, blackKeys: black, keys };
  return finish(root, 'piano', options, { fixed: true, keyHeight: .80, keyCount: 88 });
}
export function setPianoKeyPressed(piano, note, amount = 1) {
  const key = piano.userData.parts?.keys?.[note];
  if (!key) return false;
  const matrix = key.rest.clone();
  matrix.elements[13] -= .012 * clamp(amount, 0, 1);
  key.mesh.setMatrixAt(key.instance, matrix); key.mesh.instanceMatrix.needsUpdate = true;
  return true;
}
function addBook(root, x, y, z, w, h, d, colorIndex = 0, upright = false, angle = 0) {
  const book = new THREE.Group(); root.add(book); book.position.set(x, y, z); book.rotation.y = angle;
  const cover = bookMats[colorIndex % bookMats.length];
  if (upright) {
    flatBox(book, w, h, d, 0, h / 2, 0, m.paper);
    for (const side of [-1, 1]) flatBox(book, .008, h + .014, d + .018, side * w / 2, h / 2, 0, cover);
    box(book, w + .009, h + .014, .021, 0, h / 2, d / 2 + .003, cover, .005);
    for (const yy of [.075, h - .075]) flatBox(book, w - .01, .008, .003, 0, yy, d / 2 + .015, m.brass);
  } else {
    flatBox(book, w - .018, h - .01, d - .018, 0, h / 2, .002, m.paper);
    for (const yy of [.004, h - .004]) flatBox(book, w, .008, d, 0, yy, 0, cover);
    box(book, .013, h, d, -w / 2 + .006, h / 2, 0, cover, .004);
    for (let i = 1; i < 4; i++) flatBox(book, w - .026, .0008, .001, .003, h * i / 4, d / 2 - .008, m.creamSeam);
  }
}
function bookcase(options) {
  const root = new THREE.Group(), w = 3.5, h = 2.62, d = .58;
  box(root, w, h, .055, 0, h / 2, -.262, m.oakEdge, .007);
  for (const x of [-w / 2 + .05, w / 2 - .05]) box(root, .10, h, d, x, h / 2, 0, m.oak, .013);
  for (let level = 0; level < 6; level++) box(root, w - .1, .061, d, 0, .06 + level * .506, 0, m.oak, .01);
  for (let panel = 0; panel < 4; panel++) {
    const x = (panel - 1.5) * .823;
    box(root, .807, .398, .04, x, .278, .295, m.oak, .008);
    box(root, .105, .012, .025, x, .36, .32, m.brass, .004);
  }
  for (let row = 1; row < 5; row++) {
    for (let i = 0; i < 24; i++) {
      if ((row === 2 && i > 17) || (row === 4 && i > 18)) continue;
      const bw = .076 + (i % 3) * .022, bh = .32 + (i % 4) * .031;
      addBook(root, -1.52 + i * .131, .091 + row * .506, .052, bw, bh, .31, (i + row) % 5, true);
    }
  }
  return finish(root, 'bookcase', options, { fixed: true, shelfHeight: .566,
    collisionBoxes: [{ center: [0, h / 2, -.262], halfExtents: [w / 2, h / 2, .028] },
      ...[-1, 1].map(side => ({ center: [side * (w / 2 - .05), h / 2, 0], halfExtents: [.05, h / 2, d / 2] })),
      ...Array.from({ length: 6 }, (_, level) => ({ center: [0, .06 + level * .506, 0], halfExtents: [(w - .1) / 2, .0305, d / 2] })),
      { center: [0, .278, .28], halfExtents: [w / 2, .199, .02] }] });
}
const landscapeTexture = canvasTexture((c, w, h) => {
  const sky = c.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#acc4cb'); sky.addColorStop(1, '#f4ead0');
  c.fillStyle = sky; c.fillRect(0, 0, w, h);
  for (const [color, scale, phase] of [['#839494', .38, 0], ['#516e6d', .49, 1], ['#375747', .63, 2]]) {
    c.fillStyle = color; c.beginPath(); c.moveTo(0, h);
    for (let x = 0; x <= w; x += 4) c.lineTo(x, h * scale + Math.sin(x * .014 + phase) * h * .09 + Math.sin(x * .037 + phase) * h * .045);
    c.lineTo(w, h); c.closePath(); c.fill();
  }
  c.fillStyle = '#829c9a'; c.fillRect(0, h * .74, w, h * .26);
  c.strokeStyle = '#bac3b090'; c.lineWidth = 1;
  for (let i = 0; i < 17; i++) { c.beginPath(); c.moveTo((i * 67) % w, h * .76 + i * 3); c.lineTo(((i * 67) % w) + 100, h * .76 + i * 3); c.stroke(); }
}, 512, 320);
const screenMaterial = new THREE.MeshBasicMaterial({ map: landscapeTexture, color: landscapeTexture ? '#ffffff' : '#4c726c' });
function monitor(options) {
  const root = new THREE.Group();
  box(root, .50, .028, .29, 0, .014, 0, m.charcoal, .018);
  box(root, .085, .27, .052, 0, .15, -.065, m.charcoal, .012);
  box(root, 1.32, .77, .052, 0, .625, -.038, m.charcoal, .018);
  const screen = box(root, 1.252, .692, .003, 0, .633, -.009, options.screenMaterial || screenMaterial, .008);
  screen.userData.keepSeparate = true; screen.name = 'monitor-screen';
  box(root, .035, .004, .001, 0, .255, -.009, m.brass, .001);
  tubing(root, [[0, .35, -.085], [.04, .2, -.1], [.14, .045, -.1], [.22, .025, -.08]], .006, m.charcoal);
  root.userData.parts = { screen };
  return finish(root, 'monitor', options, { breakable: 'screen', mass: 3.2,
    collisionBoxes: [{ center: [0, .014, 0], halfExtents: [.25, .014, .145] }, { center: [0, .15, -.065], halfExtents: [.043, .135, .027] },
      { center: [0, .625, -.038], halfExtents: [.66, .385, .027] }] });
}
function arcade(options) {
  const root = new THREE.Group();
  const profile = [[-.45, .015], [.34, .015], [.35, .82], [.50, 1.03], [.29, 1.19], [.19, 1.32], [.26, 1.80], [.39, 1.94], [.39, 2.17], [-.45, 2.17]];
  const shape = new THREE.Shape(); profile.forEach(([z, y], i) => i ? shape.lineTo(z, y) : shape.moveTo(z, y)); shape.closePath();
  const panel = new THREE.ExtrudeGeometry(shape, { depth: .044, bevelEnabled: true, bevelSize: .008, bevelThickness: .008, bevelSegments: 2, steps: 1 });
  for (const side of [-1, 1]) {
    add(root, panel, m.oak, side * .492 + (side > 0 ? .044 : 0), 0, 0, [0, -Math.PI / 2, 0]);
    tubing(root, profile.map(([z, y]) => [side * .532, y, z]), .011, m.brass, true);
  }
  box(root, .96, .87, .80, 0, .477, -.03, m.green, .018);
  box(root, .82, .72, .055, 0, 1.50, .265, m.charcoal, .017, [-.16, 0, 0]);
  const screen = box(root, .73, .58, .008, 0, 1.506, .303, options.screenMaterial || screenMaterial, .012, [-.16, 0, 0]);
  screen.userData.keepSeparate = true; screen.name = 'arcade-screen';
  box(root, .968, .10, .43, 0, 1.049, .285, m.green, .022, [.075, 0, 0]);
  box(root, .97, .235, .09, 0, 2.045, .344, m.green, .016);
  const marqueeMap = canvasTexture((c, w, h) => { c.fillStyle = '#21372d'; c.fillRect(0, 0, w, h); c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '600 56px Georgia'; c.fillStyle = '#efd9a3'; c.fillText('MEMORY', w / 2, h / 2); }, 512, 128);
  const marqueeMat = new THREE.MeshBasicMaterial({ map: marqueeMap, color: marqueeMap ? '#ffffff' : '#21372d' });
  box(root, .88, .175, .002, 0, 2.046, .392, marqueeMat, .008);
  add(root, cylinder(.071, .075, .014, 18), m.black, -.235, 1.114, .29);
  rod(root, [-.235, 1.11, .29], [-.235, 1.235, .29], .012, m.steel);
  const joystick = add(root, sphere(.052), m.olive, -.235, 1.25, .29);
  joystick.userData.keepSeparate = true;
  const buttons = [];
  for (const x of [.12, .29]) {
    add(root, cylinder(.052, .056, .014, 18), m.black, x, 1.108, .36);
    const button = add(root, cylinder(.045, .045, .018, 18), m.brass, x, 1.12, .36);
    button.userData.keepSeparate = true; buttons.push(button);
  }
  box(root, .15, .29, .015, 0, .45, .377, m.black, .007);
  box(root, .047, .007, .006, 0, .52, .387, m.brass, .002);
  box(root, .30, .065, .025, 0, .15, .382, m.black, .008);
  root.userData.parts = { screen, joystick, buttons };
  return finish(root, 'arcade', options, { fixed: true });
}
function leafGeometry(length, width) {
  return cached(`leaf:${length},${width}`, () => {
    const pos = [], uv = [], indices = [], segments = 8;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments, halfWidth = Math.pow(Math.sin(t * Math.PI), .75) * width / 2;
      for (const side of [-1, 0, 1]) {
        pos.push(side * halfWidth, t * length, Math.sin(t * Math.PI) * length * .12 + t * t * length * .17 + Math.abs(side) * halfWidth * .17);
        uv.push((side + 1) / 2, t);
      }
      if (i < segments) for (let side = 0; side < 2; side++) {
        const a = i * 3 + side; indices.push(a, a + 3, a + 1, a + 1, a + 3, a + 4);
      }
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry;
  });
}
function addPot(root, radius = .25, height = .44) {
  const profile = [[radius * .69, 0], [radius * .88, .025], [radius, height * .81], [radius * .98, height], [radius * .89, height], [radius * .89, height * .92], [radius * .77, .037], [0, .037]];
  const geometry = cached(`pot:${radius},${height}`, () => new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x, y)), 24));
  add(root, geometry, m.ceramic);
  add(root, cylinder(radius * .875, radius * .875, .018, 20), m.soil, 0, height - .042, 0);
}
function planter(options, small = false) {
  const root = new THREE.Group(), radius = small ? .12 : .25, height = small ? .18 : .44;
  addPot(root, radius, height);
  const leafCount = small ? 9 : 13, reach = small ? .28 : 1.05;
  for (let i = 0; i < leafCount; i++) {
    const angle = i * 2.399, stem = reach * (.37 + (i % 4) * .115), s = small ? .025 : .055;
    const x = Math.sin(angle) * s, z = Math.cos(angle) * s;
    rod(root, [x * .4, height - .045, z * .4], [x, height + stem * .69, z], small ? .0025 : .005, m.leaf);
    const length = reach * (.38 + (i % 3) * .12), width = length * .39;
    add(root, leafGeometry(length, width), i % 3 === 0 ? m.leafLight : m.leaf, x, height + stem * .47, z, [.16 + i % 3 * .22, angle, -.48 - i % 4 * .17]);
  }
  return finish(root, 'planter', small ? { width: .28, height: .47, depth: .28, ...options } : options, { breakable: 'ceramic', fixed: !small, mass: small ? .8 : 9, soilHeight: height - .035,
    collisionBoxes: [{ center: [0, height / 2, 0], halfExtents: [radius, height / 2, radius] }] });
}
function cup(options) {
  const root = new THREE.Group(), profile = [[0, .008], [.059, .008], [.073, .014], [.08, .13], [.078, .155], [.072, .155], [.068, .032], [0, .032]];
  const geometry = cached('cup-lathe', () => new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x, y)), 28));
  add(root, geometry, m.ceramic);
  add(root, torus(.041, .011), m.ceramic, .095, .088, 0, [0, 0, 0]);
  add(root, torus(.076, .0017), m.brass, 0, .154, 0, [Math.PI / 2, 0, 0]);
  const liquid = add(root, cylinder(.07, .07, .0015, 24), material('tea', '#906e3d', { roughness: .12 }), 0, .125, 0);
  liquid.userData.keepSeparate = true; root.userData.parts = { liquid };
  return finish(root, 'cup', options, { breakable: 'ceramic', mass: .24, spill: 'tea' });
}
function books(kind, options) {
  const root = new THREE.Group();
  if (kind === 'book') addBook(root, 0, 0, 0, .34, .056, .24, options.colorIndex ?? 0);
  else for (let i = 0; i < 3; i++) addBook(root, (i - 1) * .009, i * .057, 0, .35 - i * .012, .056, .25 - i * .012, (options.colorIndex ?? 0) + i, false, (i - 1) * .07);
  return finish(root, kind, options, { mass: kind === 'book' ? .55 : 1.6 });
}
function keyboard(options) {
  const root = new THREE.Group();
  box(root, .64, .023, .24, 0, .012, 0, m.charcoal, .014);
  const keyMat = material('keyboard-keys', '#464d49', { roughness: .63 });
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 15; col++) {
      if (row === 4 && col > 3 && col < 10) continue;
      box(root, .036, .009, row === 0 ? .022 : .034, -.293 + col * .042, .027 + (4 - row) * .0012, -.093 + row * .043, keyMat, .004, [.025, 0, 0]);
    }
  }
  box(root, .246, .009, .034, -.008, .027, .079, keyMat, .004);
  const labels = [
    ['Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Del', 'Ins'],
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Back', 'Home'],
    ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\', 'End'],
    ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter', 'PgUp', 'PgDn'],
    ['Ctrl', 'Alt', 'Fn', '', '', '', '', '', '', '', '', 'Alt', '<', 'v', '>'],
  ];
  const legend = canvasTexture((c, width, height) => {
    c.clearRect(0, 0, width, height); c.fillStyle = '#d2d6cd'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = '14px Arial';
    labels.forEach((row, j) => row.forEach((label, i) => {
      c.fillText(label, ((-.293 + i * .042) / .64 + .5) * width, ((-.093 + j * .043) / .24 + .5) * height, 25);
    }));
  }, 1024, 384);
  if (legend) add(root, new THREE.PlaneGeometry(.64, .24), new THREE.MeshBasicMaterial({ map: legend, transparent: true, depthWrite: false, opacity: .88 }), 0, .034, 0, [-Math.PI / 2, 0, 0]);
  return finish(root, 'keyboard', options, { mass: .7 });
}
function mouse(options) {
  const root = new THREE.Group(), geometry = cached('mouse-body', () => {
    const g = new THREE.SphereGeometry(1, 24, 14), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * .0445, Math.max(0, p.getY(i) * .050 + .014), p.getZ(i) * .0725);
    g.computeVertexNormals(); return g;
  });
  add(root, geometry, m.charcoal);
  tubing(root, [[0, .046, -.066], [0, .062, -.034], [0, .064, 0]], .0008, m.black);
  add(root, cylinder(.007, .007, .008, 12), m.black, 0, .061, -.027, [0, 0, Math.PI / 2]);
  return finish(root, 'mouse', options, { mass: .09 });
}
function addPen(root, x, angle = 0) {
  const pen = new THREE.Group(); pen.position.x = x; pen.rotation.y = angle; root.add(pen);
  add(pen, cylinder(.0055, .0055, .125, 10), m.charcoal, 0, .007, -.008, [Math.PI / 2, 0, 0]);
  add(pen, cylinder(.0015, .0055, .021, 10), m.brass, 0, .007, .065, [Math.PI / 2, 0, 0]);
  add(pen, cylinder(.0057, .0057, .028, 10), m.brass, 0, .007, -.074, [Math.PI / 2, 0, 0]);
  rod(pen, [.004, .013, -.085], [.004, .014, -.045], .0013, m.brass);
}
function pens(kind, options) {
  const root = new THREE.Group(); addPen(root, kind === 'pen' ? 0 : -.017, kind === 'pen' ? 0 : -.03);
  if (kind === 'pens') addPen(root, .022, .08);
  return finish(root, kind, options, { mass: kind === 'pen' ? .02 : .04 });
}
function frame(options) {
  const root = new THREE.Group();
  box(root, .34, .44, .013, 0, .246, -.012, m.cream, .004);
  for (const x of [-.176, .176]) box(root, .028, .48, .035, x, .24, .004, m.oak, .006);
  for (const y of [.014, .466]) box(root, .38, .028, .035, 0, y, .004, m.oak, .006);
  const art = box(root, .286, .365, .002, 0, .246, -.002, options.screenMaterial || screenMaterial, .002);
  const glass = box(root, .324, .414, .002, 0, .246, .010, m.glass, .003);
  glass.userData.keepSeparate = true; glass.name = 'frame-glass';
  art.userData.keepSeparate = true;
  rod(root, [0, .012, -.097], [0, .29, -.028], .008, m.oakEdge);
  root.userData.parts = { glass, art };
  return finish(root, 'frame', options, { breakable: 'frame', mass: .65 });
}
function cushion(options) {
  const root = new THREE.Group(); addPillow(root, 0, .23, 0, options.olive !== false);
  return finish(root, 'cushion', options, { mass: .35, soft: true });
}
function rectangleShape(w, h, r) {
  const shape = new THREE.Shape(); shape.moveTo(-w / 2 + r, -h / 2);
  shape.lineTo(w / 2 - r, -h / 2); shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  shape.lineTo(w / 2, h / 2 - r); shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  shape.lineTo(-w / 2 + r, h / 2); shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  shape.lineTo(-w / 2, -h / 2 + r); shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); return shape;
}
function crate(options) {
  const root = new THREE.Group(), plankParts = [];
  for (const x of [-.275, .275]) for (const z of [-.275, .275]) box(root, .052, .61, .052, x, .315, z, m.oakEdge, .006);
  const shape = rectangleShape(.63, .177, .006), hole = new THREE.Path();
  hole.moveTo(-.081, -.026); hole.lineTo(.081, -.026); hole.absarc(.081, 0, .026, -Math.PI / 2, Math.PI / 2, false); hole.lineTo(-.081, .026); hole.absarc(-.081, 0, .026, Math.PI / 2, Math.PI * 1.5, false); hole.closePath(); shape.holes.push(hole);
  const handleGeometry = cached('crate-handle-plank', () => new THREE.ExtrudeGeometry(shape, { depth: .028, bevelEnabled: true, bevelThickness: .003, bevelSize: .003, bevelSegments: 1, curveSegments: 8 }));
  for (const side of [-1, 1]) for (let row = 0; row < 3; row++) {
    const y = .128 + row * .192;
    const a = row === 2 ? add(root, handleGeometry, m.oak, 0, y, side * .305, side < 0 ? [0, Math.PI, 0] : null)
      : box(root, .63, .177, .03, 0, y, side * .31, m.oak, .006);
    const b = box(root, .03, .177, .586, side * .305, y, 0, m.oak, .006);
    plankParts.push({ position: a.position.toArray(), size: [.63, .177, .03] }, { position: b.position.toArray(), size: [.03, .177, .586] });
  }
  for (let i = 0; i < 4; i++) box(root, .139, .035, .59, -.219 + i * .146, .025, 0, m.oak, .005);
  for (const x of [-.273, .273]) for (const z of [-.329, .329]) for (const y of [.13, .322, .514]) add(root, cylinder(.0035, .0035, .002, 6), m.steel, x, y, z, [Math.PI / 2, 0, 0]);
  return finish(root, 'crate', options, { breakable: 'wood', mass: 2, debrisParts: plankParts,
    collisionBoxes: [...plankParts.map(part => ({ center: part.position, halfExtents: part.size.map(n => n / 2) })), { center: [0, .025, 0], halfExtents: [.3, .0175, .295] }] });
}

export function createFurniture(kind, options = {}) {
  switch (kind) {
    case 'sofa': case 'armchair': return seating(kind, options);
    case 'terrace-chair': case 'lounger': return terraceChair(kind, options);
    case 'coffee-table': case 'table': case 'desk': return table(kind, options);
    case 'chair': return officeChair(options);
    case 'bed': return bed(options);
    case 'nightstand': return nightstand(options);
    case 'lamp': case 'table-lamp': return lamp(kind, options);
    case 'piano': return uprightPiano(options);
    case 'bookcase': return bookcase(options);
    case 'arcade': return arcade(options);
    case 'monitor': return monitor(options);
    case 'planter': return planter(options);
    default: return createSmallProp(kind, options);
  }
}
export function createSmallProp(kind, options = {}) {
  switch (kind) {
    case 'cup': return cup(options);
    case 'book': case 'books': return books(kind, options);
    case 'keyboard': return keyboard(options);
    case 'mouse': return mouse(options);
    case 'pen': case 'pens': return pens(kind, options);
    case 'frame': return frame(options);
    case 'cushion': return cushion(options);
    case 'crate': return crate(options);
    case 'planter': return planter(options, true);
    case 'lamp': case 'table-lamp': return lamp('table-lamp', options);
    default: throw new RangeError(`Unknown furniture prefab: ${kind}`);
  }
}
