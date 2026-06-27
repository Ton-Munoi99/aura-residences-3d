// ============ DATA MODEL (50 units) ============
// Ported verbatim from the prototype's buildUnits(): deterministic + stable.

export const FH = 3.2; // floor height

const fmt = (v) => '฿' + (v / 1e6).toFixed(2) + 'M';

// Pseudo-random but stable status keyed by unit index.
export function statusFor(idx) {
  const r = Math.abs((Math.sin(idx * 12.9898) * 43758.5453) % 1);
  return r < 0.42 ? 'available' : r < 0.68 ? 'reserved' : 'sold';
}

export function statusColor(s) {
  return s === 'available' ? '#c9a24b' : s === 'reserved' ? '#8a6f3e' : '#3a3f47';
}

export function buildUnits() {
  const out = [];
  for (let f = 1; f <= 7; f++) {
    // front row: four 1BR cells (6 wide); back row: three 2BR cells (8 wide)
    const cells = [
      { cx: -9, zc: 4.5, w: 6, d: 7, t: '1BR' },
      { cx: -3, zc: 4.5, w: 6, d: 7, t: '1BR' },
      { cx: 3, zc: 4.5, w: 6, d: 7, t: '1BR' },
      { cx: 9, zc: 4.5, w: 6, d: 7, t: '1BR' },
      { cx: -8, zc: -4.5, w: 8, d: 7, t: '2BR' },
      { cx: 0, zc: -4.5, w: 8, d: 7, t: '2BR' },
      { cx: 8, zc: -4.5, w: 8, d: 7, t: '2BR' },
    ];
    cells.forEach((c, i) => {
      const n = i + 1;
      const id = `${f}${String(n).padStart(2, '0')}`;
      const idx = f * 7 + i;
      const corner = Math.abs(c.cx) > 6;
      let price, sqm, beds, baths;
      if (c.t === '1BR') {
        price = 4200000 + (f - 1) * 180000 + (corner ? 250000 : 0);
        sqm = 56 + (i % 2 ? 2 : 0);
        beds = 1;
        baths = 1;
      } else {
        price = 7400000 + (f - 1) * 300000 + (corner ? 450000 : 0);
        sqm = 89 + (i % 2 ? 4 : 0);
        beds = 2;
        baths = 2;
      }
      out.push({
        id, floor: f, n, label: id, type: c.t, kind: c.t,
        beds, baths, sqm, price, priceStr: fmt(price),
        status: statusFor(idx), cell: c,
      });
    });
  }
  out.push({
    id: 'PH', floor: 8, n: 1, label: 'PH', type: 'Penthouse', kind: 'PH',
    beds: 3, baths: 3, sqm: 240, price: 42000000, priceStr: fmt(42000000),
    status: 'available', cell: { cx: 0, zc: 0, w: 16, d: 11, t: 'PH' },
  });
  return out;
}

export const UNITS = buildUnits();
export const unitById = (id) => UNITS.find((u) => u.id === id) || null;

// ============ TIME-OF-DAY PRESETS ============
export const TOD = {
  day:   { sky: 'linear-gradient(180deg,#dfe4ea,#aeb7c0)', fog: 0xc3cbd2, fogD: 0.0045, hemiSky: 0xeef3f8, hemiGnd: 0x6b7178, hemiI: 1.0, dirC: 0xfff3e0, dirI: 1.3, dirPos: [42, 62, 34], gEmis: 0x000000, gEmisI: 0, plateI: 0 },
  dusk:  { sky: 'linear-gradient(180deg,#36283a,#6e4b3a 58%,#caa069)', fog: 0x33282f, fogD: 0.0075, hemiSky: 0xffb27a, hemiGnd: 0x2a2430, hemiI: 0.55, dirC: 0xff8a4d, dirI: 1.1, dirPos: [-52, 26, 30], gEmis: 0x3a2410, gEmisI: 0.55, plateI: 0.18 },
  night: { sky: 'radial-gradient(circle at 50% 16%,#16212f,#06090f 70%)', fog: 0x080c12, fogD: 0.011, hemiSky: 0x29344f, hemiGnd: 0x05070a, hemiI: 0.32, dirC: 0x6f8bd0, dirI: 0.35, dirPos: [-42, 44, 22], gEmis: 0x281706, gEmisI: 1.0, plateI: 0.7 },
};

export const ENCLOSED_SKY = 'radial-gradient(circle at 50% 40%,#1b1f27,#0a0c11 75%)';

// ============ AMENITY COPY ============
export const AMENITY = {
  parking: ['Resident Parking', 'Secure two-level basement parking with EV charging bays, clear wayfinding and direct lift access to every floor.'],
  lobby:   ['The Grand Lobby', 'A double-height arrival with marble floors, a backlit feature wall, concierge desk and three high-speed passenger lifts.'],
  pool:    ['Infinity Pool Deck', 'A 25-metre edge pool framed by timber decking, sun loungers and a private cabana on the elevated amenity terrace.'],
  gym:     ['Fitness Studio', 'Fully-equipped gym with cardio, free weights and a dedicated yoga zone behind a floor-to-ceiling glass façade.'],
  sky:     ['Sky Lounge', 'Rooftop social lounge with bar, fire pit, pergola seating and an unbroken 360° city skyline.'],
};

// Sidebar EXPLORE rows
export const EXPLORE = [
  ['exterior', '◈', 'The Building', '8 storeys · exterior'],
  ['parking', '▤', 'Parking', 'Basement · 2 levels'],
  ['lobby', '✦', 'Grand Lobby', 'Double-height arrival'],
  ['pool', '≋', 'Pool Deck', '25m infinity edge'],
  ['gym', '◬', 'Fitness Studio', 'Equipped + yoga'],
  ['sky', '☆', 'Sky Lounge', 'Rooftop · 360° city'],
];

// Room chips per unit kind
export const ROOM_SETS = {
  '1BR': [['overview', 'Overview'], ['living', 'Living'], ['kitchen', 'Kitchen'], ['bedroom', 'Bedroom'], ['bath', 'Bathroom'], ['balcony', 'Balcony']],
  '2BR': [['overview', 'Overview'], ['living', 'Living'], ['kitchen', 'Kitchen'], ['master', 'Master'], ['bed2', '2nd Bed'], ['bath', 'Bathroom'], ['balcony', 'Balcony']],
  'PH':  [['overview', 'Overview'], ['living', 'Living'], ['kitchen', 'Kitchen'], ['dining', 'Dining'], ['master', 'Master Suite'], ['terrace', 'Sky Terrace']],
};

export const titleFor = (f) => (f === 8 ? 'Penthouse Level' : `Floor 0${f}`);
export const subFor = (f) => (f === 8 ? 'Sky Residence' : f === 1 ? 'Garden Residences' : 'Signature Residences');
