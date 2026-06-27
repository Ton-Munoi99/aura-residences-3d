import { create } from 'zustand';
import { UNITS, unitById } from './data.js';

// Single source of truth — mirrors the prototype's `state` object.
export const useStore = create((set, get) => ({
  floor: 8,
  unit: 'PH',
  tod: 'dusk',
  cutaway: false,
  view: 'exterior', // exterior | parking | lobby | pool | gym | sky | interior
  room: 'overview',

  setTod: (tod) => set({ tod }),
  toggleCutaway: () => set((s) => ({ cutaway: !s.cutaway })),

  // Choosing an EXPLORE destination
  selectView: (view) => set({ view, room: 'overview' }),

  // Choosing a floor (sidebar or 3D) auto-selects an available unit
  selectFloor: (floor) => {
    const us = UNITS.filter((u) => u.floor === floor);
    const a = us.find((u) => u.status === 'available') || us[0];
    set({ floor, unit: a ? a.id : null, view: 'exterior' });
  },

  // Choosing a specific unit
  selectUnit: (id) => {
    const u = unitById(id);
    set({ unit: id, floor: u ? u.floor : get().floor, view: 'exterior' });
  },

  enterUnit: () => set({ view: 'interior', room: 'overview' }),
  selectRoom: (room) => set({ room }),
  back: () => set({ view: 'exterior' }),
}));

export const selectedUnit = (s) => unitById(s.unit);
