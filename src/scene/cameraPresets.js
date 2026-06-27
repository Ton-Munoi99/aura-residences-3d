import { FH, unitById } from '../data.js';

// Interior camera anchors per unit kind: { name: [camPos, lookAt] }.
// Kept here (not derived from geometry) so camera logic needs no scene build.
export const INTERIOR_ANCHORS = {
  '1BR': { overview: [[6.5, 4.2, 7.5], [0, 1.4, 0]], living: [[1.9, 1.7, 4.6], [2.4, 1.0, 0.5]], kitchen: [[0.4, 1.8, -0.5], [3.0, 0.9, -3.0]], bedroom: [[0.0, 1.7, 2.0], [-2.6, 0.8, 0.5]], bath: [[-0.5, 1.8, -1.2], [-2.8, 0.9, -2.9]], balcony: [[1.5, 1.6, 3.2], [1.0, 1.0, 6.0]] },
  '2BR': { overview: [[9.5, 5.0, 10], [0, 1.4, 0]], living: [[2.6, 1.8, 6.0], [3.2, 1.0, 0.8]], kitchen: [[1.0, 2.0, -0.5], [3.4, 0.9, -3.9]], master: [[-1.0, 1.8, 3.0], [-4.0, 0.8, 1.0]], bed2: [[-2.2, 1.8, -0.6], [-4.6, 0.8, -2.6]], bath: [[0.6, 1.9, -1.6], [-1.0, 0.9, -3.6]], balcony: [[2.0, 1.6, 4.5], [2.0, 1.0, 7.5]] },
  'PH': { overview: [[13, 6.5, 14], [0, 1.6, 0]], living: [[3.0, 2.0, 8.0], [2.0, 1.0, 2.0]], kitchen: [[1.5, 2.4, -0.5], [4.6, 0.9, -3.6]], dining: [[2.0, 2.2, 1.5], [5.0, 0.9, -0.6]], master: [[-2.0, 2.2, 4.0], [-6.0, 0.9, 0.5]], terrace: [[2.0, 2.0, 5.5], [3.0, 1.0, 9.5]] },
};

export const intKey = (unitId) => {
  const u = unitById(unitId);
  return u ? u.kind : '1BR';
};

// Returns { pos, target, min, max, polar, auto } for the current view/room.
// R3F renders each scene group at the origin (visibility-toggled rather than
// parked off-axis like the prototype), so anchors are used directly.
export function cameraForState(view, room, unitId) {
  const PI = Math.PI;
  if (view === 'parking') return { pos: [0, 5, 17], target: [0, 1.5, 0], min: 5, max: 40, polar: 1.45 };
  if (view === 'lobby') return { pos: [-2, 4.5, 13], target: [0, 2.6, -2], min: 4, max: 36, polar: 1.45 };
  if (view === 'gym') return { pos: [0, 3.5, 12], target: [0, 1.5, -1], min: 4, max: 32, polar: 1.45 };
  if (view === 'pool') return { pos: [30, 7, 20], target: [26, 0.6, 3], min: 6, max: 80, polar: 1.4 };
  if (view === 'sky') { const o = 8 * FH; return { pos: [14, o + 5, 16], target: [0, o + 1, 0], min: 6, max: 90, polar: 1.45 }; }
  if (view === 'interior') {
    const set = INTERIOR_ANCHORS[intKey(unitId)] || INTERIOR_ANCHORS['1BR'];
    const a = set[room] || set.overview;
    return { pos: a[0], target: a[1], min: 1.5, max: 30, polar: 1.55 };
  }
  return { pos: [40, 28, 46], target: [0, 13, 0], min: 22, max: 160, polar: PI * 0.49, auto: true };
}
