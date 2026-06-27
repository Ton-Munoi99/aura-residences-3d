# Handoff: AURA Residences — Interactive 3D Condominium Viewer

## Overview
An interactive, orbitable 3D model of an 8‑storey luxury condominium ("AURA Residences"). Users can:
- Orbit/zoom the whole building (360°).
- Select a floor or a unit and see its details.
- **Enter** any residence and walk through a fully furnished 3D interior (360° orbit, jump between rooms).
- Tour shared amenities: basement **parking**, **grand lobby**, **pool deck**, **fitness studio**, **rooftop sky lounge**.
- Switch **Day / Dusk / Night** lighting and a **Cutaway** (dollhouse) mode.
- A glass elevator cab animates up/down the tower.

The building: **8 floors, 50 units**. Floors 1–7 each hold 7 units (a mix of 1‑bed and 2‑bed); floor 8 is a single penthouse. Each unit has price, area (sqm), beds/baths and an availability status (available / reserved / sold).

## About the Design Files
The bundled file `AURA Residences 3D Model.dc.html` is a **design reference / working prototype**, not production code to copy line‑for‑line. It is a single self‑contained HTML file built on **Three.js r128** (loaded from a CDN) plus a small in‑house "Design Component" runtime that wraps a React‑like class.

The task for the target codebase is to **recreate this experience using the project's own stack and patterns**. Recommended target: **React + [`@react-three/fiber`](https://docs.pmnd.rs/react-three-fiber) + `@react-three/drei`** (which gives you `<OrbitControls>`, camera helpers, etc.). If the project has no frontend yet, React + react-three-fiber + Vite is the suggested choice. All the geometry/lighting/camera logic in the prototype maps cleanly onto declarative R3F components.

You can open the HTML file directly in a browser to study the exact look and behaviour before re‑implementing.

## Fidelity
**High‑fidelity** for the UI chrome (final colours, type, spacing, copy) and **high‑fidelity in intent** for the 3D (massing, furnishing, lighting moods are all final design decisions). The 3D geometry is built procedurally from primitives (boxes/cylinders) — in a production build you may instead load real GLTF models for furniture/cars while keeping the same scene composition, camera framing and lighting described below.

---

## Architecture (how the prototype is organised)

Single component with two layers:
1. **3D scene** (Three.js) — created imperatively in `initThree()`, drawn every frame in `_animate()`.
2. **UI chrome** (DOM/React) — top bar, left sidebar, bottom panels, projected hotspot dots.

State drives both. Core state:
```
{ floor, unit, tod, cutaway, view, room }
```
- `floor` (1–8), `unit` (e.g. "305", "PH") — current selection.
- `tod` — 'day' | 'dusk' | 'night'.
- `cutaway` — boolean (exterior only).
- `view` — 'exterior' | 'parking' | 'lobby' | 'pool' | 'gym' | 'sky' | 'interior'.
- `room` — interior sub‑view anchor (e.g. 'overview' | 'living' | 'kitchen' | 'bedroom' | 'master' | 'bath' | 'balcony' | 'dining' | 'terrace').

### The "view" system (most important concept)
There is ONE Three.js scene. Different "views" are achieved by:
- **Visibility groups**: the exterior world is one group; each enclosed scene (parking, lobby, gym, and the three interior prototypes) is a separate group built lazily and parked far off‑origin (e.g. x = 300, 340, 380, 420, 460, 500) so they never overlap. Only the active group is `visible`.
- **Camera tweens**: changing `view`/`room` calls `_camTo(position, target, opts)`, which lerps `camera.position` and `controls.target` over ~45 frames (cubic ease), with `OrbitControls.enabled=false` during the tween, then restores orbit with new min/max distance + polar limits.
- `pool` and `sky` are NOT separate groups — they live in the exterior world; the view just moves the camera to them.

In R3F this becomes: a `<group visible={...}>` per scene, and a camera‑rig component that animates to a target pose when `view`/`room` changes (e.g. with `useFrame` lerp or a tween lib). Each scene exposes named **camera anchors** `{ name: [camPos, lookAt] }`.

### Enclosed‑scene lighting (critical)
The global sun/hemisphere lights are tuned for the exterior. When `view` is an enclosed scene (`interior`/`parking`/`lobby`/`gym`):
- The CSS sky background switches to a **dark neutral radial** (`radial-gradient(circle at 50% 40%, #1b1f27, #0a0c11 75%)`) so the white‑ish rooms read against a dark backdrop (this removed a washed‑out haze).
- Global directional light → intensity ~0.5, hemisphere ~0.32, fog density ~0.0012.
- Each enclosed scene also adds its own modest local lights: an `AmbientLight` (~0.22–0.32) plus 2–3 `PointLight`s with **`decay: 1`** and intensity ~0.6–1.1. (Note: `decay: 2` made everything black — use `decay: 1` or high intensity.)

### Renderer settings
`WebGLRenderer({ antialias:true, alpha:true, preserveDrawingBuffer:true })`, `outputEncoding = sRGBEncoding`, `toneMapping = ACESFilmicToneMapping`, `toneMappingExposure = 1.05`, `shadowMap.enabled = true` (PCFSoft). `alpha:true` lets the CSS gradient sky show through.

---

## Screens / Views

### 1. Exterior — "The Building"
- **Purpose**: Orbit the tower, pick floors/units.
- **Camera**: pos ≈ [40, 28, 46], target [0, 13, 0], minDist 22, maxDist 160, maxPolar ≈ 0.49π, **autoRotate** on (stops on user drag).
- **Geometry**: 8 stacked floors (floor height 3.2). Footprint 24 × 16; penthouse set back to 16 × 11 with a wrap terrace + railings + roof. Each floor = slab + 4 glass façade panels (dark blue glass, opacity ~0.5) + a spandrel "band" (the highlightable element) + corner mullions + per‑unit balconies (slab + glass railing) + interior floor "plates" (used for status colour + hotspot anchors). A glass **elevator shaft** with an animated gold cab sits on the left; a rooftop **sky lounge** sits on top; a **pool deck**, drop‑off canopy, outdoor cars and landscaping sit on the ground podium.
- **Interactions**:
  - Hover a floor → its band glows faint gold (raycast against invisible per‑floor pick boxes).
  - Click a floor (3D or sidebar) → selects it, lifts it forward (+0.8 z), dims other floors' glass, auto‑selects an available unit.
  - **Hotspot dots**: for the selected floor, a small dot is projected to screen at each unit (gold = available with a pulsing ring, bronze = reserved, charcoal = sold). Click → selects that unit.
  - **Cutaway** toggle: hides front glass, fades remaining glass, status‑colours the interior plates (dollhouse view).
  - **Day/Dusk/Night**: changes sky gradient, fog, sun colour/intensity, and glass emissive (night = warm lit windows).
- **Bottom panel** (when a unit is selected): floor label, unit number, status pill, type, beds/baths/area, price, **ENTER RESIDENCE** button.

### 2. Interior (Enter Residence) — 1BR / 2BR / Penthouse
- **Purpose**: Walk through the furnished unit, 360°.
- Three furnished prototypes keyed by unit type:
  - **1BR (~56 sqm)**: living (sofa, rug, coffee table, wall TV), kitchenette, 2‑seat dining, bedroom (queen bed + nightstands/lamps + wardrobe), bathroom (vanity+mirror, toilet, glass shower), balcony (railing, chair, plant).
  - **2BR (~89 sqm)**: larger living + accent chair, kitchen, 4‑seat dining, master bed + 2nd bed, 2 baths, balcony.
  - **Penthouse (240 sqm)**: open living, **island kitchen**, 8‑seat dining, master suite with walk‑in + ensuite, chandelier, **private sky terrace with a jacuzzi**.
- **Camera**: full 360° orbit (minDist ~2, maxDist ~30, polar up to ~1.5–1.55). Default anchor = `overview` (outside corner looking in through the glass façade).
- **Room chips** (bottom bar) jump the camera to named anchors. Chips per type:
  - 1BR: Overview · Living · Kitchen · Bedroom · Bathroom · Balcony
  - 2BR: Overview · Living · Kitchen · Master · 2nd Bed · Bathroom · Balcony
  - PH: Overview · Living · Kitchen · Dining · Master Suite · Sky Terrace
- **Bottom bar** also shows: unit title (e.g. "Penthouse Residence" / "2BR Residence 305"), floor·area subtitle, and a **Back to Building** button.

### 3. Parking (basement)
Dark floor, structural pillars on a grid, painted parking lines, several parked cars (procedural: body + cabin + glass + 4 wheels + headlights), EV‑charger posts, a down ramp, ceiling light strips. Camera ≈ pos [0,5,17] → target [0,1.5,0].

### 4. Grand Lobby
Double‑height (h ≈ 6.5), marble floor + inset rug, glass entrance front, **backlit timber feature wall**, reception desk, lounge (two sofas + marble coffee table + rug + planters), a **lift lobby with 3 brass elevator doors + call buttons**, and a hanging chandelier cluster. Camera ≈ [‑2,4.5,13] → [0,2.6,‑2].

### 5. Pool Deck
On the podium terrace: 25 m pool (translucent water), tiled coping, sun loungers, a timber cabana, perimeter planters, glass rail. Camera ≈ [30,7,20] → [26,0.6,3]. (Lives in the exterior world.)

### 6. Fitness Studio
Rubber floor, mirror wall, 3 treadmills (with emissive console screens), weight rack + plates, bench, dumbbell rack, yoga mats, glass façade, plant. Camera ≈ [0,3.5,12] → [0,1.5,‑1].

### 7. Sky Lounge (rooftop)
On top of the tower: timber deck, glass rail, bar counter + stools, lounge sofas, a glowing fire pit, pergola, planters, and distant city‑skyline silhouettes. Camera ≈ [14, topY+5, 16] → [0, topY+1, 0]. (Lives in the exterior world.)

---

## UI Chrome — exact spec

Fonts: **Cormorant Garamond** (display serif — numbers, titles) and **Manrope** (UI sans). Both from Google Fonts.

### Top bar (height 64px)
- Left: wordmark `AURA` (Cormorant Garamond, 28px, weight 600, letter‑spacing .4em, colour `#f3ecdd`) + `RESIDENCES` (9.5px, letter‑spacing .44em, `#8d8b85`).
- Right: a segmented **Day / Dusk / Night** control (pill, 30px radius; active segment background `#c9a24b`, text `#0a0d12`; inactive text `#9a948a`) and a **Cutaway** pill toggle.
- Background: `linear-gradient(180deg, rgba(7,10,16,.94), rgba(7,10,16,0))`.

### Left sidebar (width 300px)
- Glass panel: `linear-gradient(90deg, rgba(9,12,18,.95), rgba(9,12,18,.6))`, `backdrop-filter: blur(8px)`, right border `1px solid rgba(255,255,255,.05)`.
- **Stats row**: 8 FLOORS · 50 UNITS · {available} AVAILABLE (Cormorant numbers 23px; available number is gold `#c9a24b`; labels 8px, letter‑spacing .2em, `#7d7a73`).
- **EXPLORE** section: 6 rows (The Building, Parking, Grand Lobby, Pool Deck, Fitness Studio, Sky Lounge). Each row = 30px rounded icon tile + title (12.5px/600) + subtitle (9.5px `#7d7a73`). Active row: background `rgba(201,162,75,.10)`, border `rgba(201,162,75,.22)`, icon tile `rgba(201,162,75,.18)`/`#e3c074`, title `#f3ecdd`.
- **RESIDENCES** section: floors listed 8→1. Row = serif floor number (PH or 0n) + title + subtitle, and on the right a gold dot + available count. Selected floor expands to show its unit rows (status square + unit no. + "type · sqm" + price). Selected highlight same gold treatment.

### Bottom panels (left edge at 300px, full width to right)
- **Unit panel** (exterior + unit selected): see Screen 1. Price in Cormorant 34px gold; ENTER RESIDENCE button is solid gold `#c9a24b`, text `#0a0d12`, weight 700, radius 5px, shadow `0 8px 24px rgba(201,162,75,.3)`.
- **Interior bar** (view = interior): title + subtitle on the left, **Back to Building** on the right, room chips below. Chips: radius 24px; active = gold fill, text `#0a0d12`; inactive = `rgba(255,255,255,.05)` bg, `#cfc8bb` text, `rgba(255,255,255,.1)` border.
- **Amenity bar** (parking/lobby/pool/gym/sky): "AURA · AMENITIES" eyebrow + amenity title (Cormorant 34px) + 1‑line description + Back to Building.
- All panels fade/slide in (`@keyframes` opacity 0→1 + translateY 6→0, .4s ease) and sit over a `linear-gradient(0deg, rgba(7,10,16,.97), transparent)` scrim.

### Hotspot dots (projected from 3D)
14px circle, colour by status, 2px border (`#fff` if selected else `#0a0d12`), glow `0 0 10px {status}cc`; available dots add a pulsing ring (`@keyframes` scale .6→2.4, opacity .9→0, 2s).

---

## Design Tokens

**Colours**
- Background / ink: `#070a10`, panel `#0a0d12` / `#090c12`.
- Text: primary `#e9e4d9` / `#f3ecdd`, muted `#9a948a` / `#857f76`, faint `#7d7a73` / `#5a574f`.
- **Gold accent**: `#c9a24b` (highlights, price, available); lighter `#e3c074`.
- **Status**: available `#c9a24b` (gold), reserved `#8a6f3e` (bronze), sold `#3a3f47` (charcoal).
- Glass façade material colour `#1a2230`; bands `#14181e`.

**Interior material palette** (procedural)
- Walls `#d9cfbd`, secondary wall `#cabfac`, ceiling `#e2dbcb`.
- Wood `#9c6c40` / light `#c89a68` / dark `#5e3f28`; marble `#e7e3da`, dark counter `#2a2d33`.
- Sofa/fabric `#b7af9f` / `#6f6a62` / `#8a8276`; brushed brass metal `#b8924e`, steel `#9aa0a6`, dark metal `#23262c`.
- Clear glass `#9fc3d6` (opacity .16); water `#2f7e92`; greenery `#356b42`; warm lamp emissive `#fff0d2` / `#ffca6e`.

**Time‑of‑day presets** (exterior sky / fog / hemi / sun)
- **Day**: sky `linear-gradient(180deg,#dfe4ea,#aeb7c0)`, sun `#fff3e0` @1.3, hemi `#eef3f8` @1.0.
- **Dusk** (default): sky `linear-gradient(180deg,#36283a,#6e4b3a 58%,#caa069)`, sun `#ff8a4d` @1.1, hemi `#ffb27a` @0.55.
- **Night**: sky `radial-gradient(circle at 50% 16%,#16212f,#06090f 70%)`, sun `#6f8bd0` @0.35, hemi `#29344f` @0.32, windows emissive warm.

**Type scale**: Cormorant Garamond for numbers/titles (22–42px); Manrope for UI (8–13px, frequent letter‑spacing .04–.46em on labels).

**Geometry constants**: floor height 3.2; tower footprint 24×16; penthouse 16×11; 7 units/floor on 1–7 (front row 4× "1BR" cells 6 wide, back row 3× "2BR" cells 8 wide, corridor gap in the middle); 1 penthouse on floor 8.

---

## Data Model (50 units)
Generate deterministically (the prototype does this in `buildUnits()`):
- For floors 1–7, 7 cells each: front 4 = **1BR** (1 bed/1 bath, 56–58 sqm), back 3 = **2BR** (2 bed/2 bath, 89–94 sqm).
- Pricing (THB): 1BR = 4,200,000 + (floor−1)×180,000 (+250,000 corner); 2BR = 7,400,000 + (floor−1)×300,000 (+450,000 corner). Penthouse = 42,000,000 (3 bed/3 bath, 240 sqm).
- `id` = `"{floor}{nn}"` (e.g. "305"); penthouse id `"PH"`.
- **Status** is pseudo‑random but stable: `r = |sin(index*12.9898)*43758.5453 mod 1|`; `< .42` available, `< .68` reserved, else sold. Penthouse forced available.
- Price display: `฿{(price/1e6).toFixed(2)}M`.

## Interactions & Behaviour summary
- Orbit: drag = rotate, scroll = zoom (OrbitControls with damping 0.08). Exterior auto‑rotates until first drag.
- Selecting floor/unit, entering a residence, choosing a room, choosing an amenity → all animate the camera (~0.75 s cubic ease) and swap visibility groups.
- Elevator cab oscillates between floor 1 and 8 continuously.
- Floor highlight, hover glow, hotspot pulse, panel fade‑in as described above.

## State Management
- Single source of truth object (above). UI is a pure function of state; the 3D scene reacts to state changes (apply lighting/selection/cutaway on every change; tween camera + toggle group visibility on `view`/`room` changes).
- Scenes are **built lazily on first visit** and cached (don't build all 50 unit interiors — there are only 3 prototype interiors keyed by unit type).

## Assets
- No external image/model assets — all geometry is procedural Three.js primitives. Fonts: Google Fonts (Cormorant Garamond, Manrope). Three.js r128 + OrbitControls via unpkg CDN.
- For a production build, consider swapping procedural furniture/cars for GLTF models (e.g. via `useGLTF` in drei) while preserving the scene layout, camera anchors and lighting in this doc.

## Files
- `AURA Residences 3D Model.dc.html` — the complete working prototype (3D scene + all UI). Open in a browser to study exact behaviour; read the `Component` class for the full geometry/lighting/camera/data source.
- `screenshots/` — reference renders of every view: `01-exterior`, `02-penthouse-overview`, `03-penthouse-living`, `04-penthouse-kitchen`, `05-2br-overview`, `06-1br-living`, `07-parking`, `08-lobby`, `09-pool-deck`, `10-fitness`, `11-sky-lounge`.
