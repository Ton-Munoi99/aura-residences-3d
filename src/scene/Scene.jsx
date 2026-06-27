import { useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { makeKit } from '../three/kit.js';
import { useStore } from '../store.js';
import { UNITS, TOD, FH, statusColor } from '../data.js';
import { cameraForState, intKey } from './cameraPresets.js';

const ENCLOSED = ['interior', 'parking', 'lobby', 'gym'];

// ---------------------------------------------------------------------------
// Lights + fog. Imperatively retuned per time-of-day and per enclosed view,
// mirroring the prototype's _applyTod().
// ---------------------------------------------------------------------------
function Lights() {
  const { scene } = useThree();
  const hemi = useRef(), dir = useRef(), fill = useRef();
  const floorsGfx = useStore((s) => s._floorsGfx);
  const tod = useStore((s) => s.tod);
  const view = useStore((s) => s.view);

  useEffect(() => {
    scene.fog = new THREE.FogExp2(0x080c12, 0.008);
    return () => { scene.fog = null; };
  }, [scene]);

  useEffect(() => {
    const p = TOD[tod];
    const enclosed = ENCLOSED.includes(view);
    if (!scene.fog) scene.fog = new THREE.FogExp2(0x080c12, 0.008);
    if (enclosed) {
      scene.fog.color.setHex(0x141820); scene.fog.density = 0.0012;
      hemi.current?.color.setHex(0xeef0f8); hemi.current.groundColor.setHex(0x3a3640); hemi.current.intensity = 0.32;
      dir.current?.color.setHex(0xfff2e2); if (dir.current) { dir.current.intensity = 0.5; dir.current.position.set(24, 42, 20); }
      if (fill.current) fill.current.intensity = 0.12;
    } else {
      scene.fog.color.setHex(p.fog); scene.fog.density = p.fogD;
      if (hemi.current) { hemi.current.color.setHex(p.hemiSky); hemi.current.groundColor.setHex(p.hemiGnd); hemi.current.intensity = Math.max(p.hemiI, 0.5); }
      if (dir.current) { dir.current.color.setHex(p.dirC); dir.current.intensity = p.dirI; dir.current.position.set(...p.dirPos); }
      if (fill.current) fill.current.intensity = 0.25;
    }
    if (floorsGfx) for (let f = 1; f <= 8; f++) { const g = floorsGfx[f]; g.glassMat.emissive.setHex(p.gEmis); g.glassMat.emissiveIntensity = p.gEmisI; }
  }, [tod, view, floorsGfx, scene]);

  return (
    <>
      <hemisphereLight ref={hemi} args={[0x29344f, 0x05070a, 0.5]} />
      <directionalLight
        ref={dir} args={[0xffffff, 1.0]} position={[-42, 44, 22]} castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-left={-50} shadow-camera-right={50} shadow-camera-top={64}
        shadow-camera-bottom={-14} shadow-camera-near={1} shadow-camera-far={220} shadow-bias={-0.0004}
      />
      <directionalLight ref={fill} args={[0x4a5a78, 0.25]} position={[40, 20, -30]} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Exterior world: the prebuilt tower/podium/pool/sky group, plus JSX pick
// boxes (R3F-native picking) and projected hotspot dots.
// ---------------------------------------------------------------------------
function Exterior({ ext }) {
  const view = useStore((s) => s.view);
  const tod = useStore((s) => s.tod);
  const floor = useStore((s) => s.floor);
  const unit = useStore((s) => s.unit);
  const cutaway = useStore((s) => s.cutaway);
  const selectUnit = useStore((s) => s.selectUnit);
  const selectFloor = useStore((s) => s.selectFloor);
  const [hover, setHover] = useState(null);

  const visible = view === 'exterior' || view === 'pool' || view === 'sky';

  // Apply selection / cutaway / tod plate emissive to tower materials.
  useEffect(() => {
    const fg = ext.floorsGfx; if (!fg) return;
    const p = TOD[tod];
    for (let f = 1; f <= 8; f++) {
      const g = fg[f]; const isSel = floor === f; const isHov = hover === f;
      if (isSel) { g.bandMat.color.setHex(0xc9a24b); g.bandMat.emissive.setHex(0xc9a24b); g.bandMat.emissiveIntensity = 0.55; }
      else if (isHov) { g.bandMat.color.setHex(0x6a5a38); g.bandMat.emissive.setHex(0xc9a24b); g.bandMat.emissiveIntensity = 0.2; }
      else { g.bandMat.color.setHex(0x14181e); g.bandMat.emissive.setHex(0x000000); g.bandMat.emissiveIntensity = 0; }
      g.group.position.z = isSel ? 0.8 : 0;
      // cutaway overrides glass; else selection-based opacity
      g.glassPanels.front.visible = !cutaway;
      if (cutaway) g.glassMat.opacity = 0.07;
      else g.glassMat.opacity = floor ? (isSel ? 0.55 : 0.34) : 0.5;
      Object.values(g.plates).forEach((pl) => {
        const su = isSel && pl.u.id === unit;
        if (cutaway) {
          pl.mat.color.setStyle(statusColor(pl.u.status));
          pl.mat.emissive.setHex(su ? 0xc9a24b : 0xff9d40);
          pl.mat.emissiveIntensity = su ? 0.9 : pl.u.status === 'available' ? 0.35 : 0.12;
        } else {
          pl.mat.color.setHex(su ? 0x4a3a16 : 0x111620);
          let inten = p.plateI * (pl.u.status === 'available' ? 0.7 : 0.3);
          if (su) { pl.mat.emissive.setHex(0xc9a24b); inten = Math.max(inten, 0.55); }
          else pl.mat.emissive.setHex(0xff9d40);
          pl.mat.emissiveIntensity = inten;
        }
      });
    }
  }, [ext, tod, floor, unit, cutaway, hover]);

  // Elevator cab oscillation.
  useFrame(() => {
    if (!ext.cab) return;
    ext._cabT = (ext._cabT || 0) + 0.004;
    ext.cab.position.y = 1.6 + (Math.sin(ext._cabT) * 0.5 + 0.5) * (7 * FH - 0.4);
  });

  // Pick boxes (one per floor) — declarative, R3F handles raycasting.
  const pickBoxes = [];
  for (let f = 1; f <= 8; f++) {
    const isPH = f === 8, base = (f - 1) * FH;
    const hx = isPH ? 8 : 12, hz = isPH ? 5.5 : 8;
    pickBoxes.push(
      <mesh
        key={f}
        position={[0, base + FH / 2, isPH ? 0 : floor === f ? 0.8 : 0]}
        onPointerOver={(e) => { e.stopPropagation(); setHover(f); }}
        onPointerOut={() => setHover((h) => (h === f ? null : h))}
        onClick={(e) => { e.stopPropagation(); selectFloor(f); }}
      >
        <boxGeometry args={[hx * 2 + 0.6, FH, hz * 2 + 0.6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    );
  }

  // Hotspot dots for the selected floor.
  const hotspots = view === 'exterior' && floor
    ? UNITS.filter((u) => u.floor === floor).map((u) => {
        const base = (u.floor - 1) * FH;
        const sc = statusColor(u.status);
        const isSel = u.id === unit;
        return (
          <Html
            key={u.id}
            position={[u.cell.cx, base + 0.9, u.cell.zc + (floor === u.floor ? 0.8 : 0)]}
            center
            zIndexRange={[5, 0]}
            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
          >
            <div
              title={`${u.label} · ${u.type} · ${u.priceStr}`}
              onClick={(e) => { e.stopPropagation(); selectUnit(u.id); }}
              style={{ position: 'relative', width: 14, height: 14 }}
            >
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: sc, border: `2px solid ${isSel ? '#fff' : '#0a0d12'}`, boxShadow: `0 0 10px ${sc}cc` }} />
              {u.status === 'available' && (
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1.5px solid ${sc}`, animation: 'auraping 2s ease-out infinite' }} />
              )}
            </div>
          </Html>
        );
      })
    : null;

  return (
    <group visible={visible}>
      <primitive object={ext.root} />
      {pickBoxes}
      {hotspots}
    </group>
  );
}

// ---------------------------------------------------------------------------
// A lazily-built, cached scene group toggled by visibility.
// ---------------------------------------------------------------------------
function Stage({ active, factory }) {
  const ref = useRef(null);
  if (active && !ref.current) ref.current = factory();
  if (!ref.current) return null;
  return <primitive object={ref.current} visible={active} />;
}

function Stages({ kit }) {
  const view = useStore((s) => s.view);
  const unit = useStore((s) => s.unit);
  const ik = intKey(unit);
  return (
    <>
      <Stage active={view === 'parking'} factory={() => kit.buildParking()} />
      <Stage active={view === 'lobby'} factory={() => kit.buildLobby()} />
      <Stage active={view === 'gym'} factory={() => kit.buildGym()} />
      <Stage active={view === 'interior' && ik === '1BR'} factory={() => kit.buildInterior('1BR')} />
      <Stage active={view === 'interior' && ik === '2BR'} factory={() => kit.buildInterior('2BR')} />
      <Stage active={view === 'interior' && ik === 'PH'} factory={() => kit.buildInterior('PH')} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Camera rig: owns OrbitControls, tweens between view/room anchors (the R3F
// equivalent of _camTo + the _animate tween loop).
// ---------------------------------------------------------------------------
function CameraRig() {
  const { camera, gl } = useThree();
  const controls = useMemo(() => new OrbitControls(camera, gl.domElement), [camera, gl]);
  const tw = useRef(null);
  const view = useStore((s) => s.view);
  const room = useStore((s) => s.room);
  const unit = useStore((s) => s.unit);
  const floor = useStore((s) => s.floor);

  useEffect(() => {
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 22;
    controls.maxDistance = 160;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.target.set(0, 13, 0);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    const onStart = () => { if (useStore.getState().view === 'exterior') controls.autoRotate = false; };
    controls.addEventListener('start', onStart);
    gl.domElement.style.cursor = 'grab';
    return () => { controls.removeEventListener('start', onStart); controls.dispose(); };
  }, [controls, gl]);

  // Start a tween whenever the destination pose changes.
  useEffect(() => {
    const c = cameraForState(view, room, unit);
    tw.current = {
      p0: camera.position.clone(), p1: new THREE.Vector3(...c.pos),
      t0: controls.target.clone(), t1: new THREE.Vector3(...c.target),
      k: 0, opts: c,
    };
    controls.enabled = false;
    controls.autoRotate = false;
  }, [view, room, unit, camera, controls]);

  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

  useFrame(() => {
    if (tw.current) {
      const t = tw.current;
      t.k = Math.min(1, t.k + 0.022);
      const e = ease(t.k);
      camera.position.lerpVectors(t.p0, t.p1, e);
      controls.target.lerpVectors(t.t0, t.t1, e);
      camera.lookAt(controls.target);
      if (t.k >= 1) {
        const a = t.opts;
        controls.enabled = true;
        controls.minDistance = a.min || 2;
        controls.maxDistance = a.max || 200;
        controls.maxPolarAngle = a.polar || Math.PI * 0.49;
        controls.autoRotate = !!a.auto;
        tw.current = null;
      }
    } else {
      // gentle target follow to selected floor height while orbiting exterior
      if (view === 'exterior' && !controls.autoRotate) {
        const y = floor ? (floor - 1) * FH + FH / 2 : 13;
        controls.target.lerp(new THREE.Vector3(0, y, 0), 0.05);
      }
      controls.update();
    }
  });

  return null;
}

// Bridges the prebuilt floorsGfx into the store so Lights can reach it.
function RegisterExterior({ ext }) {
  useEffect(() => {
    useStore.setState({ _floorsGfx: ext.floorsGfx });
  }, [ext]);
  return null;
}

export default function Scene() {
  const kit = useMemo(() => makeKit(THREE), []);
  const ext = useMemo(() => kit.buildExterior(), [kit]);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      camera={{ fov: 42, near: 0.4, far: 500, position: [40, 28, 46] }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <RegisterExterior ext={ext} />
      <Lights />
      <Exterior ext={ext} />
      <Stages kit={kit} />
      <CameraRig />
    </Canvas>
  );
}
