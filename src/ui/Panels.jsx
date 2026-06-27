import { useStore, selectedUnit } from '../store.js';
import { ROOM_SETS, AMENITY, statusColor } from '../data.js';

const panelBase = {
  position: 'absolute', left: 300, right: 0, bottom: 0, zIndex: 6,
  background: 'linear-gradient(0deg,rgba(7,10,16,.97),rgba(7,10,16,0))',
  animation: 'aurafade .4s ease',
};

const backBtn = (onClick) => (
  <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '11px 18px', borderRadius: 5, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#cfc8bb', fontWeight: 600, fontSize: 11.5 }}>
    <span>←</span>Back to Building
  </div>
);

export function UnitPanel() {
  const view = useStore((s) => s.view);
  const su = useStore(selectedUnit);
  const enterUnit = useStore((s) => s.enterUnit);
  if (view !== 'exterior' || !su) return null;

  const sc = statusColor(su.status);
  const floorLabel = su.floor === 8 ? 'PENTHOUSE LEVEL' : `FLOOR 0${su.floor} · AURA`;
  const type = su.type + (su.kind === 'PH' ? ' · Private Sky Terrace' : ' Residence');

  return (
    <div style={{ ...panelBase, padding: '20px 30px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 26 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 30, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '.24em', color: '#7d7a73', marginBottom: 6 }}>{floorLabel}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 13 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 40, lineHeight: .9, color: '#f3ecdd' }}>{su.label}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 11px', borderRadius: 30, background: su.status === 'available' ? 'rgba(201,162,75,.12)' : 'rgba(255,255,255,.04)', border: `1px solid ${sc}66` }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: sc }} />
              <span style={{ fontSize: 9.5, letterSpacing: '.16em', color: sc, fontWeight: 600 }}>{su.status.toUpperCase()}</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#9a948a', marginTop: 8 }}>{type}</div>
        </div>
        <div style={{ display: 'flex', gap: 26, paddingBottom: 3 }}>
          {[['BEDS', su.beds], ['BATHS', su.baths]].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 9, letterSpacing: '.2em', color: '#7d7a73' }}>{l}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: '#e9e4d9', marginTop: 4 }}>{v}</div>
            </div>
          ))}
          <div>
            <div style={{ fontSize: 9, letterSpacing: '.2em', color: '#7d7a73' }}>AREA</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: '#e9e4d9', marginTop: 4 }}>{su.sqm}<span style={{ fontSize: 12, color: '#857f76' }}> ㎡</span></div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 26 }}>
        <div style={{ textAlign: 'right', paddingBottom: 2 }}>
          <div style={{ fontSize: 9, letterSpacing: '.2em', color: '#7d7a73', marginBottom: 5 }}>STARTING FROM</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 34, color: '#c9a24b', lineHeight: .9 }}>{su.priceStr}</div>
        </div>
        <div onClick={enterUnit} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', padding: '13px 22px', borderRadius: 5, background: '#c9a24b', color: '#0a0d12', fontWeight: 700, fontSize: 12, letterSpacing: '.06em', whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(201,162,75,.3)' }}>
          ENTER RESIDENCE<span style={{ fontSize: 14 }}>↗</span>
        </div>
      </div>
    </div>
  );
}

export function InteriorBar() {
  const view = useStore((s) => s.view);
  const room = useStore((s) => s.room);
  const su = useStore(selectedUnit);
  const selectRoom = useStore((s) => s.selectRoom);
  const back = useStore((s) => s.back);
  if (view !== 'interior') return null;

  const ik = su ? su.kind : '1BR';
  const chips = ROOM_SETS[ik] || ROOM_SETS['1BR'];
  const title = su ? (su.kind === 'PH' ? 'Penthouse Residence' : su.type + ' Residence ' + su.label) : '';
  const sub = su ? (su.floor === 8 ? 'PENTHOUSE LEVEL · ' + su.sqm + '㎡' : 'FLOOR 0' + su.floor + ' · ' + su.sqm + '㎡') : '';

  return (
    <div style={{ ...panelBase, padding: '18px 30px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '.22em', color: '#7d7a73', marginBottom: 5 }}>{sub}</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: '#f3ecdd' }}>{title}</div>
        </div>
        {backBtn(back)}
      </div>
      <div style={{ display: 'flex', gap: 9, marginTop: 15, flexWrap: 'wrap' }}>
        {chips.map(([a, l]) => {
          const on = room === a;
          return (
            <div key={a} onClick={() => selectRoom(a)} style={{ cursor: 'pointer', padding: '9px 16px', borderRadius: 24, fontSize: 11.5, fontWeight: 600, letterSpacing: '.04em', transition: 'all .2s', background: on ? '#c9a24b' : 'rgba(255,255,255,.05)', color: on ? '#0a0d12' : '#cfc8bb', border: `1px solid ${on ? '#c9a24b' : 'rgba(255,255,255,.1)'}` }}>{l}</div>
          );
        })}
      </div>
    </div>
  );
}

export function AmenityBar() {
  const view = useStore((s) => s.view);
  const back = useStore((s) => s.back);
  if (!['parking', 'lobby', 'pool', 'gym', 'sky'].includes(view)) return null;
  const [title, desc] = AMENITY[view] || ['', ''];

  return (
    <div style={{ ...panelBase, padding: '20px 30px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 10, letterSpacing: '.24em', color: '#7d7a73', marginBottom: 6 }}>AURA · AMENITIES</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 34, color: '#f3ecdd', lineHeight: .95 }}>{title}</div>
        <div style={{ fontSize: 12, color: '#9a948a', marginTop: 8, maxWidth: 520 }}>{desc}</div>
      </div>
      {backBtn(back)}
    </div>
  );
}
