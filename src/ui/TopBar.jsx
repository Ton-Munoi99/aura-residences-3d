import { useStore } from '../store.js';

const seg = (a) => ({
  cursor: 'pointer', padding: '6px 15px', borderRadius: 24, fontSize: 11, fontWeight: 600,
  letterSpacing: '.05em', transition: 'all .25s',
  color: a ? '#0a0d12' : '#9a948a', background: a ? '#c9a24b' : 'transparent',
});

const pill = (a) => ({
  display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', padding: '7px 13px',
  borderRadius: 24, fontSize: 11, fontWeight: 600, letterSpacing: '.06em', transition: 'all .25s',
  background: a ? 'rgba(201,162,75,.16)' : 'rgba(255,255,255,.03)',
  border: `1px solid ${a ? 'rgba(201,162,75,.4)' : 'rgba(255,255,255,.07)'}`,
  color: a ? '#e3c074' : '#9a948a',
});

export default function TopBar() {
  const tod = useStore((s) => s.tod);
  const setTod = useStore((s) => s.setTod);
  const cutaway = useStore((s) => s.cutaway);
  const toggleCutaway = useStore((s) => s.toggleCutaway);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'linear-gradient(180deg,rgba(7,10,16,.94),rgba(7,10,16,0))', zIndex: 8 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 13 }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 600, fontSize: 28, letterSpacing: '.4em', paddingLeft: '.4em', color: '#f3ecdd' }}>AURA</div>
        <div style={{ fontSize: 9.5, letterSpacing: '.44em', color: '#8d8b85', fontWeight: 500, paddingLeft: '.44em' }}>RESIDENCES</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 30, padding: 4 }}>
          <div onClick={() => setTod('day')} style={seg(tod === 'day')}>Day</div>
          <div onClick={() => setTod('dusk')} style={seg(tod === 'dusk')}>Dusk</div>
          <div onClick={() => setTod('night')} style={seg(tod === 'night')}>Night</div>
        </div>
        <div onClick={toggleCutaway} style={pill(cutaway)}>
          <span style={{ fontSize: 13, lineHeight: 1 }}>▦</span><span>Cutaway</span>
        </div>
      </div>
    </div>
  );
}
