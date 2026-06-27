import { useStore } from '../store.js';
import { UNITS, EXPLORE, statusColor, titleFor, subFor } from '../data.js';

const availableCount = UNITS.filter((u) => u.status === 'available').length;

function Stat({ value, label, gold, border }) {
  return (
    <div style={{ flex: 1, padding: '14px 0', textAlign: 'center', borderRight: border ? '1px solid rgba(255,255,255,.05)' : undefined }}>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 23, color: gold ? '#c9a24b' : '#f3ecdd', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 8, letterSpacing: '.2em', color: '#7d7a73', marginTop: 5 }}>{label}</div>
    </div>
  );
}

export default function Sidebar() {
  const view = useStore((s) => s.view);
  const floor = useStore((s) => s.floor);
  const unit = useStore((s) => s.unit);
  const selectView = useStore((s) => s.selectView);
  const selectFloor = useStore((s) => s.selectFloor);
  const selectUnit = useStore((s) => s.selectUnit);

  return (
    <div style={{ position: 'absolute', top: 64, left: 0, bottom: 0, width: 300, zIndex: 7, background: 'linear-gradient(90deg,rgba(9,12,18,.95),rgba(9,12,18,.6))', backdropFilter: 'blur(8px)', borderRight: '1px solid rgba(255,255,255,.05)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <Stat value="8" label="FLOORS" border />
        <Stat value="50" label="UNITS" border />
        <Stat value={availableCount} label="AVAILABLE" gold />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 24px' }}>
        <div style={{ padding: '14px 6px 8px', fontSize: 9, letterSpacing: '.26em', color: '#7d7a73' }}>EXPLORE</div>
        {EXPLORE.map(([v, glyph, title, sub]) => {
          const a = view === v;
          return (
            <div key={v} onClick={() => selectView(v)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 9px', borderRadius: 8, cursor: 'pointer', marginBottom: 3, transition: 'background .2s', background: a ? 'rgba(201,162,75,.10)' : 'transparent', border: `1px solid ${a ? 'rgba(201,162,75,.22)' : 'transparent'}` }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, background: a ? 'rgba(201,162,75,.18)' : 'rgba(255,255,255,.04)', color: a ? '#e3c074' : '#8d8b85', flexShrink: 0 }}>{glyph}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: a ? '#f3ecdd' : '#c8c2b6' }}>{title}</div>
                <div style={{ fontSize: 9.5, color: '#7d7a73', marginTop: 1 }}>{sub}</div>
              </div>
            </div>
          );
        })}

        <div style={{ padding: '16px 6px 8px', fontSize: 9, letterSpacing: '.26em', color: '#7d7a73', borderTop: '1px solid rgba(255,255,255,.05)', marginTop: 10 }}>RESIDENCES</div>
        {[8, 7, 6, 5, 4, 3, 2, 1].map((f) => {
          const us = UNITS.filter((u) => u.floor === f);
          const avail = us.filter((u) => u.status === 'available').length;
          const isSel = floor === f && view !== 'interior';
          const expanded = floor === f;
          return (
            <div key={f}>
              <div onClick={() => selectFloor(f)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 12px', borderRadius: 7, cursor: 'pointer', marginBottom: 3, transition: 'background .2s', background: isSel ? 'rgba(201,162,75,.10)' : 'transparent', border: `1px solid ${isSel ? 'rgba(201,162,75,.22)' : 'transparent'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, width: 30, color: isSel ? '#c9a24b' : '#6f6c64' }}>{f === 8 ? 'PH' : '0' + f}</div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: isSel ? '#f3ecdd' : '#c8c2b6' }}>{titleFor(f)}</div>
                    <div style={{ fontSize: 9.5, color: '#7d7a73', marginTop: 2 }}>{subFor(f)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#c9a24b', boxShadow: '0 0 7px #c9a24b88' }} />
                  <div style={{ fontSize: 11, color: '#b9b2a4', fontWeight: 600, minWidth: 14, textAlign: 'right' }}>{avail}</div>
                </div>
              </div>
              {expanded && (
                <div style={{ padding: '2px 4px 12px 6px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {us.map((u) => {
                    const usel = unit === u.id;
                    return (
                      <div key={u.id} onClick={() => selectUnit(u.id)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', transition: 'background .18s', background: usel ? 'rgba(201,162,75,.10)' : 'rgba(255,255,255,.015)' }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: statusColor(u.status), flexShrink: 0 }} />
                        <div style={{ fontWeight: 600, fontSize: 11.5, letterSpacing: '.05em', color: usel ? '#c9a24b' : '#c8c2b6', minWidth: 30 }}>{u.label}</div>
                        <div style={{ fontSize: 10, color: '#857f76', flex: 1 }}>{u.type} · {u.sqm}㎡</div>
                        <div style={{ fontSize: 11, color: '#b9b2a4', fontWeight: 600 }}>{u.priceStr}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
