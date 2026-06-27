import { Suspense, lazy } from 'react';
import TopBar from './ui/TopBar.jsx';
import Sidebar from './ui/Sidebar.jsx';
import { UnitPanel, InteriorBar, AmenityBar } from './ui/Panels.jsx';
import { useStore } from './store.js';
import { TOD, ENCLOSED_SKY } from './data.js';

const ENCLOSED = ['interior', 'parking', 'lobby', 'gym'];

// The 3D layer (three.js + r3f + drei + all geometry) is code-split into its
// own chunk and loaded on demand, so the UI chrome + loader paint immediately.
const Scene = lazy(() => import('./scene/Scene.jsx'));

function Loader() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#070a10', gap: 18 }}>
      <div style={{ width: 34, height: 34, border: '2px solid #2a3038', borderTopColor: '#c9a24b', borderRadius: '50%', animation: 'auraspin 1s linear infinite' }} />
      <div style={{ fontFamily: "'Cormorant Garamond',serif", letterSpacing: '.5em', fontSize: 15, color: '#9a948a', paddingLeft: '.5em' }}>AURA</div>
    </div>
  );
}

export default function App() {
  const tod = useStore((s) => s.tod);
  const view = useStore((s) => s.view);

  // CSS sky background — dark neutral radial for enclosed scenes, else the TOD
  // gradient. alpha:true on the renderer lets this show through the canvas.
  const sky = ENCLOSED.includes(view) ? ENCLOSED_SKY : TOD[tod].sky;

  return (
    <div style={{ position: 'fixed', inset: 0, fontFamily: "'Manrope',system-ui,sans-serif", color: '#e9e4d9', overflow: 'hidden', userSelect: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: sky, transition: 'background .9s ease' }} />
      <Suspense fallback={<Loader />}>
        <Scene />
      </Suspense>

      <TopBar />
      <Sidebar />
      <UnitPanel />
      <InteriorBar />
      <AmenityBar />

      <div style={{ position: 'absolute', bottom: 12, left: 312, zIndex: 4, fontSize: 9.5, letterSpacing: '.12em', color: '#5a574f', pointerEvents: 'none' }}>
        DRAG TO ORBIT · SCROLL TO ZOOM · 360°
      </div>
    </div>
  );
}
