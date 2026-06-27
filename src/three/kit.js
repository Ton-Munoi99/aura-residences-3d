// ============================================================================
// Geometry kit — procedural Three.js builders ported from the design prototype.
//
// These return plain THREE.Group objects. R3F mounts them via <primitive>.
// Keeping the proven primitive-assembly here (rather than re-expressing every
// box in JSX) preserves the exact massing/furnishing the design team signed off
// on, while React/R3F owns composition, lighting, camera, controls and events.
// ============================================================================
import { UNITS, statusColor, FH } from '../data.js';

export function makeKit(THREE) {
  const T = THREE;

  // ---- materials (shared singletons, created once) ----
  const M = (c, r, m, o) =>
    new T.MeshStandardMaterial({
      color: c,
      roughness: r == null ? 0.8 : r,
      metalness: m || 0,
      transparent: o != null,
      opacity: o == null ? 1 : o,
    });
  const MAT = {
    wall: M(0xd9cfbd, 0.92), wall2: M(0xcabfac, 0.9), ceil: M(0xe2dbcb, 0.95),
    wood: M(0x9c6c40, 0.55), woodL: M(0xc89a68, 0.5), woodD: M(0x5e3f28, 0.5),
    marble: M(0xe7e3da, 0.25, 0.15), marbleD: M(0x2a2d33, 0.3, 0.2), stone: M(0x6f6a60, 0.7),
    sofa: M(0xb7af9f, 0.85), sofa2: M(0x6f6a62, 0.85), fabric: M(0x8a8276, 0.85),
    metal: M(0xb8924e, 0.35, 0.85), steel: M(0x9aa0a6, 0.4, 0.7), dark: M(0x23262c, 0.5, 0.5),
    glass: M(0x9fc3d6, 0.05, 0.1, 0.16), glassExt: M(0x1a2230, 0.12, 0.2, 0.5),
    white: M(0xf3f1ea, 0.5), black: M(0x1c1d20, 0.6),
    screen: new T.MeshStandardMaterial({ color: 0x0a0c10, emissive: 0x14304a, emissiveIntensity: 0.8, roughness: 0.2 }),
    water: M(0x2f7e92, 0.1, 0.2, 0.82), grass: M(0x2f5d3a, 0.9), plant: M(0x356b42, 0.85), pot: M(0x3a3530, 0.7),
    warm: new T.MeshStandardMaterial({ color: 0xfff0d2, emissive: 0xffca6e, emissiveIntensity: 1.1, roughness: 0.4 }),
    rug: M(0xb6a78f, 0.95), rugD: M(0x7d6f5c, 0.95), tile: M(0xeae6dd, 0.4, 0.05),
    car1: M(0x2a2e35, 0.4, 0.6), car2: M(0x6b1f24, 0.4, 0.6), car3: M(0xc9c4ba, 0.4, 0.6), carGlass: M(0x10151c, 0.2, 0.4, 0.7),
    gold: M(0xc9a24b, 0.4, 0.7), road: M(0x14171c, 0.85), brass: M(0xcaa15a, 0.3, 0.9),
  };

  // ---- low-level helpers ----
  const b = (w, h, d, mat) => new T.Mesh(new T.BoxGeometry(w, h, d), mat);
  const cy = (r1, r2, h, mat, seg) => new T.Mesh(new T.CylinderGeometry(r1, r2, h, seg || 16), mat);
  const p = (g, m, x, y, z, sh) => { m.position.set(x, y, z); if (sh) m.castShadow = true; g.add(m); return m; };

  // ---- furniture ----
  function fSofa(w, col) {
    const g = new T.Group(); const mat = col || MAT.sofa;
    p(g, b(w, 0.4, 1.0, mat), 0, 0.35, 0);
    p(g, b(w, 0.55, 0.22, mat), 0, 0.62, -0.39);
    p(g, b(0.22, 0.45, 1.0, mat), -w / 2 + 0.11, 0.55, 0);
    p(g, b(0.22, 0.45, 1.0, mat), w / 2 - 0.11, 0.55, 0);
    const n = Math.max(2, Math.round(w / 0.9));
    for (let i = 0; i < n; i++) p(g, b(w / n - 0.06, 0.16, 0.85, MAT.fabric), -w / 2 + (w / n) * (i + 0.5), 0.6, 0.02);
    [-w / 2 + 0.18, w / 2 - 0.18].forEach((x) => [-0.42, 0.42].forEach((z) => p(g, b(0.08, 0.18, 0.08, MAT.woodD), x, 0.09, z)));
    return g;
  }
  function fTable(w, d, h, top) {
    const g = new T.Group();
    p(g, b(w, 0.08, d, top || MAT.wood), 0, h, 0);
    [[-w / 2 + 0.1, -d / 2 + 0.1], [w / 2 - 0.1, -d / 2 + 0.1], [-w / 2 + 0.1, d / 2 - 0.1], [w / 2 - 0.1, d / 2 - 0.1]]
      .forEach(([x, z]) => p(g, b(0.08, h, 0.08, MAT.woodD), x, h / 2, z));
    return g;
  }
  function fChair() {
    const g = new T.Group();
    p(g, b(0.46, 0.06, 0.46, MAT.woodL), 0, 0.46, 0);
    p(g, b(0.46, 0.5, 0.06, MAT.woodL), 0, 0.72, -0.2);
    [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].forEach(([x, z]) => p(g, b(0.05, 0.46, 0.05, MAT.woodD), x, 0.23, z));
    return g;
  }
  function fDining(seats) {
    const g = new T.Group(); const w = seats >= 6 ? 2.6 : 1.4, d = 0.95;
    g.add(fTable(w, d, 0.74));
    const per = Math.ceil(seats / 2);
    for (let i = 0; i < per; i++) {
      const x = -w / 2 + (w / per) * (i + 0.5);
      const c = fChair(); c.position.set(x, 0, d / 2 + 0.32); c.rotation.y = Math.PI; g.add(c);
      if (i * 2 + 1 < seats) { const c2 = fChair(); c2.position.set(x, 0, -d / 2 - 0.32); g.add(c2); }
    }
    return g;
  }
  function fLamp() {
    const g = new T.Group();
    p(g, cy(0.04, 0.05, 0.3, MAT.metal), 0, 0.15, 0);
    p(g, cy(0.13, 0.1, 0.16, MAT.warm), 0, 0.36, 0);
    return g;
  }
  function fBed(w) {
    const g = new T.Group();
    p(g, b(w, 0.3, 2.1, MAT.woodD), 0, 0.2, 0);
    p(g, b(w - 0.1, 0.22, 2.0, MAT.white), 0, 0.42, 0.02);
    p(g, b(w - 0.1, 0.12, 1.3, MAT.fabric), 0, 0.55, 0.35);
    p(g, b(w, 0.8, 0.12, MAT.fabric), 0, 0.55, -1.0);
    [-w / 2 + 0.35, w / 2 - 0.35].forEach((x) => p(g, b(0.5, 0.18, 0.32, MAT.white), x, 0.52, -0.78));
    [-w / 2 - 0.32, w / 2 + 0.32].forEach((x) => { p(g, b(0.5, 0.42, 0.42, MAT.woodL), x, 0.21, -0.7); p(g, fLamp(), x, 0.42, -0.7); });
    return g;
  }
  function fWardrobe(w) {
    const g = new T.Group();
    p(g, b(w, 2.2, 0.55, MAT.woodL), 0, 1.1, 0);
    const cnt = Math.round(w / 0.6);
    for (let i = 0; i < cnt; i++) p(g, b(0.02, 1.8, 0.02, MAT.metal), -w / 2 + 0.05 + (w / cnt) * (i + 0.5), 1.1, 0.28);
    return g;
  }
  function fTV(w) {
    const g = new T.Group();
    p(g, b(w, 0.4, 0.4, MAT.woodD), 0, 0.2, 0);
    p(g, b(Math.min(w, 1.7), 0.96, 0.06, MAT.screen), 0, 1.15, -0.1);
    return g;
  }
  function fKitchen(len, island) {
    const g = new T.Group();
    p(g, b(len, 0.9, 0.62, MAT.woodL), 0, 0.45, 0);
    p(g, b(len + 0.06, 0.06, 0.66, MAT.marbleD), 0, 0.92, 0);
    p(g, b(0.45, 0.04, 0.34, MAT.steel), len * 0.18, 0.95, 0);
    p(g, b(0.5, 0.02, 0.5, MAT.dark), -len * 0.2, 0.95, 0);
    p(g, b(len * 0.8, 0.5, 0.34, MAT.woodL), 0, 1.85, -0.14);
    p(g, b(0.6, 1.6, 0.6, MAT.steel), len / 2 - 0.3, 0.8, 0);
    p(g, b(0.5, 0.5, 0.34, MAT.dark), len * 0.2, 1.85, -0.14);
    if (island) {
      const is = new T.Group();
      p(is, b(2.2, 0.9, 0.95, MAT.woodD), 0, 0.45, 0);
      p(is, b(2.3, 0.07, 1.05, MAT.marble), 0, 0.93, 0);
      is.position.set(0, 0, island); g.add(is);
    }
    return g;
  }
  function fBath() {
    const g = new T.Group();
    p(g, b(1.0, 0.85, 0.5, MAT.woodL), -0.5, 0.42, 0);
    p(g, b(1.05, 0.05, 0.55, MAT.marble), -0.5, 0.87, 0);
    p(g, b(0.4, 0.12, 0.32, MAT.white), -0.5, 0.9, 0);
    p(g, b(0.7, 0.7, 0.04, MAT.glass), -0.5, 1.5, -0.24);
    p(g, b(0.55, 0.7, 0.55, MAT.white), 0.5, 0.35, 0.2);
    p(g, b(0.04, 1.9, 1.0, MAT.glass), 0.0, 0.95, -0.2);
    return g;
  }
  function fPlant(h) {
    const g = new T.Group();
    p(g, cy(0.16, 0.2, 0.3, MAT.pot), 0, 0.15, 0);
    p(g, new T.Mesh(new T.SphereGeometry(h * 0.4, 10, 10), MAT.plant), 0, 0.3 + h * 0.4, 0);
    return g;
  }
  function fRug(w, d, col) { return b(w, 0.02, d, col || MAT.rug); }
  function fArt(w, h) {
    const g = new T.Group();
    p(g, b(w, h, 0.04, MAT.woodD), 0, 0, 0);
    p(g, b(w - 0.08, h - 0.08, 0.05, MAT.fabric), 0, 0, 0.01);
    return g;
  }
  function fCar(col) {
    const g = new T.Group();
    p(g, b(4.2, 0.7, 1.8, col), 0, 0.55, 0, true);
    p(g, b(2.6, 0.6, 1.6, col), -0.1, 1.05, 0, true);
    p(g, b(2.4, 0.5, 1.5, MAT.carGlass), -0.1, 1.05, 0);
    [[-1.3, 0.9], [1.3, 0.9], [-1.3, -0.9], [1.3, -0.9]].forEach(([x, z]) => { const w = cy(0.34, 0.34, 0.25, MAT.black, 18); w.rotation.x = Math.PI / 2; p(g, w, x, 0.34, z); });
    p(g, b(0.1, 0.18, 0.5, MAT.warm), 2.1, 0.55, 0.55);
    p(g, b(0.1, 0.18, 0.5, MAT.warm), 2.1, 0.55, -0.55);
    return g;
  }

  // ---- room shell + balcony ----
  function room(g, X, Z, h, glassZ) {
    p(g, b(X * 2, 0.12, Z * 2, MAT.wood), 0, 0, 0).receiveShadow = true;
    p(g, b(X * 2, 0.1, Z * 2, MAT.ceil), 0, h, 0);
    p(g, b(X * 2, h, 0.12, MAT.wall), 0, h / 2, -Z);
    p(g, b(0.12, h, Z * 2, MAT.wall), -X, h / 2, 0);
    p(g, b(0.12, h, Z * 2, MAT.wall), X, h / 2, 0);
    if (glassZ) {
      const gw = b(X * 2, h, 0.08, MAT.glass); p(g, gw, 0, h / 2, Z);
      p(g, b(X * 2, 0.16, 0.16, MAT.dark), 0, 0.08, Z);
      p(g, b(X * 2, 0.16, 0.16, MAT.dark), 0, h - 0.08, Z);
      const cnt = Math.round((X * 2) / 1.4);
      for (let i = 0; i <= cnt; i++) p(g, b(0.1, h, 0.1, MAT.dark), -X + ((X * 2) / cnt) * i, h / 2, Z);
    } else {
      p(g, b(X * 2, h, 0.12, MAT.wall), 0, h / 2, Z);
    }
  }
  function fBalconyInt(g, X, Z) {
    p(g, b(X * 2, 0.12, 2.0, MAT.stone), 0, 0, Z + 1.0).receiveShadow = true;
    p(g, b(X * 2, 0.06, 0.06, MAT.metal), 0, 1.0, Z + 2.0);
    const cnt = Math.round((X * 2) / 0.9);
    for (let i = 0; i <= cnt; i++) p(g, b(0.05, 1.0, 0.05, MAT.metal), -X + ((X * 2) / cnt) * i, 0.5, Z + 2.0);
    p(g, fPlant(0.7), X - 0.5, 0.06, Z + 1.4);
    const ch = fChair(); ch.position.set(-X + 0.6, 0.0, Z + 1.3); g.add(ch);
  }

  // ---- interiors ----
  function buildInterior(kind) {
    const g = new T.Group(); let h = 2.85; let X, Z, anchors;
    if (kind === '1BR') {
      X = 4; Z = 3.5; room(g, X, Z, h, true); fBalconyInt(g, X, Z);
      p(g, b(0.1, h, Z * 1.3, MAT.wall2), -0.4, h / 2, -1.0);
      let s = fSofa(2.4); s.position.set(1.9, 0, 1.7); s.rotation.y = Math.PI; g.add(s);
      p(g, fRug(2.6, 2.0), 1.9, 0.01, 1.4); p(g, fTable(1.0, 0.5, 0.34), 1.9, 0, 0.9);
      let tv = fTV(1.8); tv.position.set(3.6, 0, 1.2); tv.rotation.y = -Math.PI / 2; g.add(tv);
      let k = fKitchen(2.6); k.position.set(2.4, 0, -3.0); g.add(k);
      let d = fDining(2); d.position.set(1.6, 0, -0.8); g.add(d);
      let bed = fBed(1.6); bed.position.set(-2.2, 0, 1.6); bed.rotation.y = Math.PI; g.add(bed);
      let wd = fWardrobe(1.6); wd.position.set(-3.5, 0, -1.5); wd.rotation.y = Math.PI / 2; g.add(wd);
      let ba = fBath(); ba.position.set(-2.8, 0, -2.9); g.add(ba);
      p(g, b(2.4, h, 0.1, MAT.wall2), -2.6, h / 2, -1.7); p(g, b(0.1, h, 1.5, MAT.wall2), -1.4, h / 2, -2.6);
      p(g, fArt(1.0, 0.7), 1.9, 1.7, -3.9); p(g, fPlant(1.0), 3.4, 0.06, -0.2);
      anchors = { overview: [[6.5, 4.2, 7.5], [0, 1.4, 0]], living: [[1.9, 1.7, 4.6], [2.4, 1.0, 0.5]], kitchen: [[0.4, 1.8, -0.5], [3.0, 0.9, -3.0]], bedroom: [[0.0, 1.7, 2.0], [-2.6, 0.8, 0.5]], bath: [[-0.5, 1.8, -1.2], [-2.8, 0.9, -2.9]], balcony: [[1.5, 1.6, 3.2], [1.0, 1.0, 6.0]] };
    } else if (kind === '2BR') {
      X = 6; Z = 4.5; room(g, X, Z, h, true); fBalconyInt(g, X, Z);
      p(g, b(0.1, h, Z * 1.4, MAT.wall2), -1.6, h / 2, -0.6);
      let s = fSofa(3.0); s.position.set(2.4, 0, 2.4); s.rotation.y = Math.PI; g.add(s);
      let s2 = fSofa(1.6, MAT.sofa2); s2.position.set(4.6, 0, 0.7); s2.rotation.y = -Math.PI / 2; g.add(s2);
      p(g, fRug(3.2, 2.6), 2.8, 0.01, 1.6); p(g, fTable(1.3, 0.6, 0.34), 2.8, 0, 1.4);
      let tv = fTV(2.0); tv.position.set(5.7, 0, 1.8); tv.rotation.y = -Math.PI / 2; g.add(tv);
      let k = fKitchen(3.2); k.position.set(3.2, 0, -3.9); g.add(k);
      let d = fDining(4); d.position.set(3.0, 0, -1.6); g.add(d);
      let bed = fBed(2.0); bed.position.set(-3.6, 0, 2.2); bed.rotation.y = Math.PI; g.add(bed);
      let wd = fWardrobe(2.2); wd.position.set(-5.3, 0, 0.2); wd.rotation.y = Math.PI / 2; g.add(wd);
      p(g, b(0.1, h, 4.0, MAT.wall2), -3.4, h / 2, -1.0);
      let bed2 = fBed(1.4); bed2.position.set(-4.6, 0, -2.6); g.add(bed2);
      let ba = fBath(); ba.position.set(-1.0, 0, -3.6); g.add(ba);
      p(g, b(2.2, h, 0.1, MAT.wall2), -1.4, h / 2, -2.4);
      p(g, fArt(1.4, 0.9), 2.8, 1.8, -4.9); p(g, fPlant(1.2), 5.4, 0.06, -0.6); p(g, fPlant(0.9), -5.4, 0.06, 3.6);
      anchors = { overview: [[9.5, 5.0, 10], [0, 1.4, 0]], living: [[2.6, 1.8, 6.0], [3.2, 1.0, 0.8]], kitchen: [[1.0, 2.0, -0.5], [3.4, 0.9, -3.9]], master: [[-1.0, 1.8, 3.0], [-4.0, 0.8, 1.0]], bed2: [[-2.2, 1.8, -0.6], [-4.6, 0.8, -2.6]], bath: [[0.6, 1.9, -1.6], [-1.0, 0.9, -3.6]], balcony: [[2.0, 1.6, 4.5], [2.0, 1.0, 7.5]] };
    } else {
      X = 9; Z = 6; h = 3.3; room(g, X, Z, h, true);
      p(g, b(X * 2, 0.12, 3.4, MAT.stone), 0, 0, Z + 1.7).receiveShadow = true;
      p(g, b(2.4, 0.5, 2.0, MAT.tile), X - 2.4, 0.25, Z + 1.7);
      p(g, b(2.1, 0.4, 1.7, MAT.water), X - 2.4, 0.45, Z + 1.7);
      p(g, b(X * 2, 0.06, 0.06, MAT.glass), 0, 1.0, Z + 3.4);
      { const cnt = Math.round((X * 2) / 1.2); for (let i = 0; i <= cnt; i++) p(g, b(0.04, 1.0, 0.04, MAT.steel), -X + ((X * 2) / cnt) * i, 0.5, Z + 3.4); }
      let lo = fSofa(2.0, MAT.sofa2); lo.position.set(-X + 2.5, 0, Z + 1.6); g.add(lo);
      let s = fSofa(3.4); s.position.set(2.5, 0, 3.0); s.rotation.y = Math.PI; g.add(s);
      let s2 = fSofa(2.4, MAT.sofa2); s2.position.set(-1.0, 0, 2.6); s2.rotation.y = Math.PI / 2; g.add(s2);
      p(g, fRug(4.4, 3.2, MAT.rugD), 1.6, 0.01, 2.0); p(g, fTable(1.6, 0.8, 0.32, MAT.marble), 1.6, 0, 2.2);
      let tv = fTV(2.6); tv.position.set(2.6, 0, 4.9); tv.rotation.y = Math.PI; g.add(tv);
      let k = fKitchen(4.0, 1.6); k.position.set(4.5, 0, -4.0); g.add(k);
      let d = fDining(8); d.position.set(5.0, 0, -0.6); g.add(d);
      p(g, b(0.12, h, 7.0, MAT.wall2), -2.5, h / 2, -1.0);
      let bed = fBed(2.2); bed.position.set(-5.6, 0, 1.2); bed.rotation.y = Math.PI; g.add(bed);
      let wd = fWardrobe(3.0); wd.position.set(-8.2, 0, -1.0); wd.rotation.y = Math.PI / 2; g.add(wd);
      let ba = fBath(); ba.position.set(-5.0, 0, -4.4); g.add(ba);
      p(g, b(5.0, h, 0.1, MAT.wall2), -6.0, h / 2, -2.6);
      p(g, fArt(2.0, 1.2), 2.0, 2.0, -5.9); p(g, fPlant(1.6), 8.2, 0.06, 4.0); p(g, fPlant(1.3), -1.0, 0.06, -4.0);
      const ch = new T.Group();
      for (let i = 0; i < 5; i++) p(ch, new T.Mesh(new T.SphereGeometry(0.12, 10, 10), MAT.warm), (i - 2) * 0.4, -Math.random() * 0.4, 0);
      p(g, ch, 5.0, h - 0.4, -0.6);
      anchors = { overview: [[13, 6.5, 14], [0, 1.6, 0]], living: [[3.0, 2.0, 8.0], [2.0, 1.0, 2.0]], kitchen: [[1.5, 2.4, -0.5], [4.6, 0.9, -3.6]], dining: [[2.0, 2.2, 1.5], [5.0, 0.9, -0.6]], master: [[-2.0, 2.2, 4.0], [-6.0, 0.9, 0.5]], terrace: [[2.0, 2.0, 5.5], [3.0, 1.0, 9.5]] };
    }
    g.add(new T.AmbientLight(0xfff1e2, 0.22));
    const L = new T.PointLight(0xffe6c0, 0.85, kind === 'PH' ? 40 : 26, 1); L.position.set(0, h - 0.3, 0.3); g.add(L);
    const L2 = new T.PointLight(0xffe6c0, 0.55, 22, 1); L2.position.set(X * 0.4, h - 0.3, -Z * 0.4); g.add(L2);
    for (let i = 0; i < 3; i++) { const c = new T.Mesh(new T.CircleGeometry(0.18, 16), MAT.warm); c.rotation.x = Math.PI / 2; p(g, c, (i - 1) * X * 0.5, h - 0.06, 0); }
    g.userData.anchors = anchors;
    return g;
  }

  // ---- amenities ----
  function buildParking() {
    const g = new T.Group(); const W = 30, D = 20, h = 3.2;
    p(g, b(W, 0.2, D, MAT.dark), 0, 0, 0).receiveShadow = true;
    p(g, b(W, 0.1, D, MAT.marbleD), 0, h, 0);
    for (let x = -12; x <= 12; x += 8) for (let z = -7; z <= 7; z += 7) p(g, b(0.6, h, 0.6, MAT.stone), x, h / 2, z, true);
    const cols = [MAT.car1, MAT.car2, MAT.car3, MAT.car1, MAT.car2]; let ci = 0;
    for (let z = -8; z <= 8; z += 16) {
      for (let x = -13; x <= 13; x += 2.6) p(g, b(0.08, 0.02, 4.6, MAT.white), x, 0.12, z < 0 ? -6 : 6);
      for (let x = -12; x <= 12; x += 5.2) {
        const car = fCar(cols[ci++ % cols.length]); car.position.set(x, 0, z < 0 ? -6 : 6);
        if (z > 0) car.rotation.y = Math.PI; if (Math.random() > 0.7) continue; g.add(car);
      }
    }
    for (let x = -12; x <= -6; x += 5.2) p(g, b(0.3, 1.4, 0.3, MAT.gold), x, 0.7, -9.4);
    p(g, b(6, 0.15, 8, MAT.road), 16, 1.4, 0).rotation.z = 0.25;
    for (let i = 0; i < 6; i++) { const c = new T.Mesh(new T.CircleGeometry(0.3, 12), MAT.warm); c.rotation.x = Math.PI / 2; p(g, c, -12 + i * 5, h - 0.07, 0); }
    g.add(new T.AmbientLight(0xdfe6f0, 0.28));
    const al = new T.PointLight(0xcfe0ff, 0.85, 60, 1); al.position.set(0, h - 0.4, 0); g.add(al);
    const al2 = new T.PointLight(0xcfe0ff, 0.6, 45, 1); al2.position.set(-10, h - 0.4, 4); g.add(al2);
    const al3 = new T.PointLight(0xcfe0ff, 0.6, 45, 1); al3.position.set(10, h - 0.4, -4); g.add(al3);
    g.userData.cam = [[0, 5, 17], [0, 1.5, 0]];
    return g;
  }
  function buildLobby() {
    const g = new T.Group(); const W = 18, D = 16, h = 6.5;
    p(g, b(W, 0.15, D, MAT.marble), 0, 0, 0).receiveShadow = true;
    p(g, b(8, 0.02, 8, MAT.marbleD), 0, 0.09, 0);
    p(g, b(W, 0.2, D, MAT.ceil), 0, h, 0);
    p(g, b(W, h, 0.2, MAT.wall), 0, h / 2, -D / 2);
    p(g, b(0.2, h, D, MAT.wall), -W / 2, h / 2, 0);
    p(g, b(W, h, 0.1, MAT.glass), 0, h / 2, D / 2);
    for (let i = -3; i <= 3; i++) p(g, b(0.14, h, 0.14, MAT.dark), i * 2.6, h / 2, D / 2);
    p(g, b(7, 4.6, 0.3, MAT.woodD), 0, 2.6, -D / 2 + 0.2);
    for (let i = 0; i < 7; i++) p(g, b(0.1, 4.2, 0.12, MAT.warm), -3 + i, 2.6, -D / 2 + 0.36);
    p(g, b(4.2, 1.1, 1.0, MAT.woodL), 0, 0.55, -3.5);
    p(g, b(4.4, 0.08, 1.1, MAT.marbleD), 0, 1.12, -3.5);
    p(g, b(0.2, h, D, MAT.marbleD), W / 2, h / 2, 0);
    for (let i = -1; i <= 1; i++) {
      p(g, b(0.12, 2.6, 1.5, MAT.brass), W / 2 - 0.1, 1.4, i * 3);
      p(g, b(0.06, 0.2, 1.5, MAT.dark), W / 2 - 0.18, 2.7, i * 3);
      const c = new T.Mesh(new T.CircleGeometry(0.08, 12), MAT.warm); c.rotation.y = -Math.PI / 2; p(g, c, W / 2 - 0.22, 1.6, i * 3 + 0.85);
    }
    let s = fSofa(3.0); s.position.set(-5, 0, 3); s.rotation.y = 0; g.add(s);
    let s2 = fSofa(3.0, MAT.sofa2); s2.position.set(-5, 0, 5.6); s2.rotation.y = Math.PI; g.add(s2);
    p(g, fTable(1.4, 0.7, 0.34, MAT.marble), -5, 0, 4.3);
    p(g, fPlant(1.8), -7.5, 0.08, -2); p(g, fPlant(1.6), 6, 0.08, 5.5); p(g, fRug(5, 4, MAT.rugD), -5, 0.1, 4.3);
    const ch = new T.Group();
    for (let i = 0; i < 14; i++) p(ch, new T.Mesh(new T.SphereGeometry(0.13, 10, 10), MAT.warm), (Math.random() - 0.5) * 3.2, -Math.random() * 1.8, (Math.random() - 0.5) * 2.4);
    p(g, ch, 0, h - 0.6, 1);
    g.add(new T.AmbientLight(0xfff0d8, 0.3));
    g.add(new T.HemisphereLight(0xfff2dc, 0x3a3026, 0.22));
    const l = new T.PointLight(0xffe2b0, 1.1, 70, 1); l.position.set(0, h - 1, 1); g.add(l);
    const l2 = new T.PointLight(0xffe2b0, 0.7, 45, 1); l2.position.set(-5, 3, 4); g.add(l2);
    g.userData.cam = [[-2, 4.5, 13], [0, 2.6, -2]];
    return g;
  }
  function buildGym() {
    const g = new T.Group(); const W = 16, D = 12, h = 3.6;
    p(g, b(W, 0.15, D, MAT.dark), 0, 0, 0).receiveShadow = true;
    p(g, b(W, 0.15, D, MAT.ceil), 0, h, 0);
    p(g, b(W, h, 0.1, MAT.glass), 0, h / 2, D / 2);
    p(g, b(W, h, 0.12, MAT.marbleD), 0, h / 2, -D / 2);
    p(g, b(0.12, h, D, MAT.wall), -W / 2, h / 2, 0);
    p(g, b(W - 1, h - 0.6, 0.04, MAT.glassExt), 0, h / 2, -D / 2 + 0.1);
    for (let i = -1; i <= 1; i++) {
      const t = new T.Group();
      p(t, b(0.8, 0.25, 1.8, MAT.dark), 0, 0.13, 0);
      p(t, b(0.8, 1.2, 0.1, MAT.black), 0, 0.7, -0.8);
      p(t, b(0.6, 0.5, 0.05, MAT.screen), 0, 1.1, -0.78);
      t.position.set(i * 1.4, 0, -3.5); g.add(t);
    }
    p(g, b(2.6, 1.4, 0.4, MAT.steel), -4, 0.7, 2.5);
    for (let i = 0; i < 4; i++) { const w = cy(0.18, 0.18, 0.5, MAT.dark, 16); w.rotation.z = Math.PI / 2; p(g, w, -5 + i * 0.7, 0.5, 2.7); }
    p(g, b(0.5, 0.5, 1.8, MAT.black), 3, 0.45, 2);
    p(g, b(1.8, 1.6, 0.3, MAT.steel), 5, 0.8, 3);
    for (let i = 0; i < 3; i++) p(g, b(0.7, 0.04, 1.8, i % 2 ? MAT.sofa2 : MAT.gold), -5 + i * 0.9, 0.04, 5);
    p(g, fPlant(1.4), 6, 0.08, -3);
    g.add(new T.AmbientLight(0xeef2fb, 0.32));
    g.add(new T.HemisphereLight(0xeef4ff, 0x30363e, 0.22));
    const l = new T.PointLight(0xeaf0ff, 1.0, 60, 1); l.position.set(0, h - 0.4, 0); g.add(l);
    const l2 = new T.PointLight(0xeaf0ff, 0.6, 45, 1); l2.position.set(4, h - 0.4, 3); g.add(l2);
    g.userData.cam = [[0, 3.5, 12], [0, 1.5, -1]];
    return g;
  }

  // ---- exterior world (tower + podium + pool + sky + elevator) ----
  function exteriorBalcony(g, x, y, z, w, _back) {
    const s = Math.sign(z), zz = z + s * 1.0;
    p(g, b(w, 0.14, 2.0, MAT.stone), x, y, zz, true);
    p(g, b(w, 0.05, 0.05, MAT.metal), x, y + 1.0, z + s * 2.0);
    const cnt = Math.round(w / 0.8);
    for (let i = 0; i <= cnt; i++) p(g, b(0.04, 1.0, 0.04, MAT.metal), x - w / 2 + (w / cnt) * i, y + 0.5, z + s * 2.0);
    p(g, b(w - 0.6, 0.9, 0.04, MAT.glass), x, y + 0.5, z + s * 2.0);
  }

  function buildTower(building) {
    const slabMat = MAT.dark;
    const bandBase = () => new T.MeshStandardMaterial({ color: 0x14181e, roughness: 0.45, metalness: 0.65, emissive: 0x000000, emissiveIntensity: 0 });
    const mkGlass = () => new T.MeshStandardMaterial({ color: 0x1a2230, roughness: 0.12, metalness: 0.15, transparent: true, opacity: 0.5, emissive: 0x000000, emissiveIntensity: 0 });
    const floorsGfx = {}, pickBoxes = [];
    const buildFloor = (f) => {
      const isPH = f === 8, base = (f - 1) * FH, g = new T.Group(); building.add(g);
      const hx = isPH ? 8 : 12, hz = isPH ? 5.5 : 8;
      p(g, b(24.6, 0.32, 16.6, slabMat), 0, base + 0.16, 0, true).receiveShadow = true;
      const gh = FH - 0.6, gy = base + 0.16 + gh / 2 + 0.12, gMat = mkGlass(), glassPanels = {};
      const front = p(g, b(hx * 2, gh, 0.12, gMat), 0, gy, hz); glassPanels.front = front;
      p(g, b(hx * 2, gh, 0.12, gMat), 0, gy, -hz);
      p(g, b(0.12, gh, hz * 2, gMat), -hx, gy, 0);
      p(g, b(0.12, gh, hz * 2, gMat), hx, gy, 0);
      const bMat = bandBase();
      p(g, b(hx * 2 + 0.5, 0.5, hz * 2 + 0.5, bMat), 0, base + FH - 0.05, 0, true);
      const mul = new T.MeshStandardMaterial({ color: 0x0d1116, roughness: 0.5, metalness: 0.7 });
      for (let i = -Math.floor(hx); i <= Math.floor(hx); i += 3) p(g, b(0.12, gh + 0.4, 0.12, mul), i, gy, hz);
      [[-hx, hz], [hx, hz], [-hx, -hz], [hx, -hz]].forEach(([mx, mz]) => p(g, b(0.28, gh + 0.5, 0.28, mul), mx, gy, mz, true));
      if (!isPH) {
        [[-9, 4.5], [-3, 4.5], [3, 4.5], [9, 4.5]].forEach(([bx]) => exteriorBalcony(g, bx, base + 0.16, hz, 2.5));
        [[-8, -4.5], [0, -4.5], [8, -4.5]].forEach(([bx]) => exteriorBalcony(g, bx, base + 0.16, -hz, 3.0, true));
      }
      const plates = {};
      UNITS.filter((u) => u.floor === f).forEach((u) => {
        const pMat = new T.MeshStandardMaterial({ color: new T.Color(statusColor(u.status)), roughness: 0.5, metalness: 0.2, emissive: new T.Color(0xff9d40), emissiveIntensity: 0 });
        const pl = p(g, b(u.cell.w - 0.5, 0.14, u.cell.d - 0.5, pMat), u.cell.cx, base + 0.34, u.cell.zc);
        plates[u.id] = { mesh: pl, mat: pMat, worldY: base + 0.9, u };
      });
      if (isPH) {
        const railMat = MAT.steel;
        [[24.2, 0.1, 0, 8.2], [24.2, 0.1, 0, -8.2], [0.1, 16.2, 12.1, 0], [0.1, 16.2, -12.1, 0]]
          .forEach(([w, d, x, z]) => p(g, b(w, 1.1, d, railMat), x, base + 0.9, z, true));
        p(g, b(17, 0.3, 12, slabMat), 0, base + FH + 0.05, 0, true);
      }
      const pb = p(g, new T.Mesh(new T.BoxGeometry(hx * 2 + 0.6, FH, hz * 2 + 0.6), new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })), 0, base + FH / 2, 0);
      pb.userData.floor = f; pickBoxes.push(pb);
      floorsGfx[f] = { group: g, glassMat: gMat, bandMat: bMat, glassPanels, plates, base, isPH };
    };
    for (let f = 1; f <= 8; f++) buildFloor(f);
    return { floorsGfx, pickBoxes };
  }

  function buildSky() {
    const g = new T.Group();
    p(g, b(17, 0.2, 12, MAT.wood), 0, 0, 0);
    p(g, b(17, 0.06, 0.06, MAT.steel), 0, 1.0, 6);
    p(g, b(17, 0.9, 0.04, MAT.glass), 0, 0.5, 6);
    p(g, b(0.04, 0.9, 12, MAT.glass), 8.5, 0.5, 0);
    p(g, b(0.04, 0.9, 12, MAT.glass), -8.5, 0.5, 0);
    p(g, b(5, 1.1, 1.0, MAT.woodD), -4, 0.55, -4);
    p(g, b(5.2, 0.08, 1.1, MAT.marbleD), -4, 1.12, -4);
    for (let i = -1; i <= 1; i++) p(g, cy(0.18, 0.2, 0.7, MAT.dark, 14), -5 + i * 1.4, 0.35, -3.0);
    let s = fSofa(3.0, MAT.sofa2); s.position.set(3, 0, 2); s.rotation.y = Math.PI; g.add(s);
    let s2 = fSofa(2.4); s2.position.set(5.5, 0, 0); s2.rotation.y = -Math.PI / 2; g.add(s2);
    p(g, cy(0.7, 0.7, 0.4, MAT.marbleD, 20), 4, 0.2, 0.5);
    p(g, cy(0.5, 0.5, 0.2, MAT.warm, 16), 4, 0.45, 0.5);
    p(g, b(8, 0.15, 5, MAT.woodD), 3, 3.0, 1);
    for (let x = 0; x <= 6; x += 6) for (let z = -1; z <= 3; z += 4) p(g, b(0.16, 3, 0.16, MAT.woodD), x, 1.5, z);
    for (let i = 0; i < 5; i++) p(g, fPlant(1.4), -8 + i * 1.6, 0.1, 5.4);
    for (let i = 0; i < 14; i++) { const bh = 8 + Math.random() * 22, a = (i / 14) * Math.PI * 2; p(g, b(4 + Math.random() * 4, bh, 4, MAT.dark), Math.cos(a) * 70, bh / 2 - 6, Math.sin(a) * 60); }
    const fp = new T.PointLight(0xff8a3a, 0.7, 10, 2); fp.position.set(4, 0.8, 0.5); g.add(fp);
    g.userData.cam = [[14, 5, 16], [0, 1, 0]];
    return g;
  }

  function buildExterior() {
    const root = new T.Group();
    const ground = p(root, new T.Mesh(new T.CircleGeometry(160, 64), MAT.road), 0, -0.02, 0); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
    const plaza = p(root, new T.Mesh(new T.CircleGeometry(34, 64), MAT.marbleD), 0, 0, 0); plaza.rotation.x = -Math.PI / 2; plaza.receiveShadow = true;
    p(root, b(30, 2.4, 22, MAT.stone), 0, -1.2, 0, true);
    p(root, b(31, 0.3, 23, MAT.marbleD), 0, 0.05, 0);
    p(root, b(11, 0.3, 5, MAT.dark), 0, 3.0, 12.4, true);
    for (let x = -4; x <= 4; x += 4) p(root, cy(0.18, 0.18, 3, MAT.steel), x, 1.5, 11.2);
    [[-18, 16, MAT.car3], [-12, 18, MAT.car1]].forEach(([x, z, c]) => { const car = fCar(c); car.position.set(x, 0, z); car.rotation.y = 0.4; root.add(car); });
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; p(root, fPlant(1.6), Math.cos(a) * 30, 0.05, Math.sin(a) * 22).scale.setScalar(1.3); }
    p(root, fPlant(2.4), 24, 0.05, 8).scale.setScalar(1.6);
    p(root, fPlant(2.4), -24, 0.05, 6).scale.setScalar(1.6);
    // pool deck
    const pool = new T.Group();
    p(pool, b(20, 0.3, 16, MAT.marble), 0, 0.16, 0);
    p(pool, b(11, 0.4, 5.5, MAT.water), 0, 0.3, 0);
    p(pool, b(11.4, 0.05, 5.9, MAT.tile), 0, 0.06, 0);
    for (let i = -1; i <= 1; i++) { const ln = new T.Group(); p(ln, b(0.7, 0.2, 2.0, MAT.white), 0, 0.32, 0); p(ln, b(0.7, 0.5, 0.7, MAT.white), 0, 0.5, -0.8); ln.position.set(-4 + i * 1.4, 0, 4.6); pool.add(ln); }
    p(pool, b(4, 2.4, 3, MAT.woodL), 6.5, 1.2, -4);
    p(pool, b(4.4, 0.2, 3.4, MAT.woodD), 6.5, 2.4, -4);
    for (let i = 0; i < 6; i++) p(pool, fPlant(1.2), -9 + i * 3.6, 0.16, 7.4);
    pool.position.set(26, 0, 4); root.add(pool);
    // tower
    const tower = new T.Group(); root.add(tower);
    const { floorsGfx, pickBoxes } = buildTower(tower);
    // glass elevator + cab
    const shaft = new T.Group(); const totalH = 8 * FH;
    p(shaft, b(2.6, totalH + 0.6, 3.0, MAT.glassExt), 0, totalH / 2, 0);
    for (let y = 0; y <= 8; y++) p(shaft, b(2.7, 0.18, 3.1, MAT.dark), 0, y * FH, 0);
    for (let i = 0; i < 4; i++) p(shaft, b(0.12, totalH, 0.12, MAT.dark), (i < 2 ? -1 : 1) * 1.3, totalH / 2, (i % 2 ? -1 : 1) * 1.5);
    const cab = b(2.0, 2.6, 2.2, MAT.gold); p(shaft, cab, 0, 1.6, 0);
    const cabL = new T.PointLight(0xffe6b0, 0.8, 8, 2); cab.add(cabL);
    shaft.position.set(-13.5, 0, 0); tower.add(shaft);
    // sky lounge crown
    const sky = buildSky(); sky.position.set(0, totalH + 0.1, 0); root.add(sky);
    return { root, floorsGfx, pickBoxes, cab, totalH };
  }

  return { MAT, buildExterior, buildInterior, buildParking, buildLobby, buildGym };
}
