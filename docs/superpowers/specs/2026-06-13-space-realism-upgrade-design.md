# Space Scene Realism Upgrade — Design Spec
*Date: 2026-06-13 | Approach: Option B (full spec, pragmatic shadows)*

---

## Scope

Upgrade the existing Three.js / React Three Fiber space scene in `src/components/3d/` from its current state (already sophisticated GLSL shaders, instanced starfield, atmospheric scattering) to maximum photographic realism matching NASA/Cassini/JWST astrophotography. Changes are additive where possible; no shader rewrites unless a specific gap is identified.

---

## 1. Renderer & Color Foundation

**File:** `src/components/3d/CanvasContainer.tsx`

### What changes
- Move tone mapping configuration from the `gl` constructor prop into `onCreated` where it actually takes effect on the live `WebGLRenderer` instance.
- Set `gl.outputColorSpace = THREE.SRGBColorSpace` so textures are decoded correctly (albedo maps are sRGB; currently no explicit color space is set).
- Set `gl.toneMappingExposure = 0.88` — slightly under 1.0 for a slightly moody, deep-space feel without clipping star highlights.
- Set `gl.shadowMap.enabled = quality === 'high'` and `gl.shadowMap.type = THREE.PCFSoftShadowMap` in `onCreated`.
- Add `shadows` prop to `<Canvas>` (enables the shadow system; actual casting/receiving per-object controlled separately).

### What does NOT change
- `antialias: true`, DPR capping, `powerPreference: 'high-performance'` — already correct.
- `alpha: true` / transparent background — required for 2D backdrop compositing.

---

## 2. HDR Environment Map (Image-Based Lighting)

**File:** New `SpaceEnvironment` component, mounted inside `<Scene>` in `CanvasContainer.tsx`

### Approach
Procedural 512×256 Float32 equirectangular `DataTexture` → `PMREMGenerator` → `scene.environment`. No external HDRI file required.

### Texture content
- **Base:** Very dark near-black with faint blue-purple tint (`~0.001–0.003` linear per channel) — represents the cosmic microwave background + scattered starlight.
- **Sun lobe:** Gaussian warm spot placed at `phi=0, theta=PI/2` (right-side equator in equirectangular space), peak `~8× linear`, falloff radius `~0.12 rad`. Tint: `(1.0, 0.9, 0.7)` = ~5800K.
- **Opposite hemisphere:** Slightly elevated cool ambient (`~0.004` extra in blue) to simulate backscattered interstellar medium.

### Effect
Metallic surfaces (new telescope/station solar panels, asteroid minerals) pick up a warm highlight on the sun-facing side and near-zero on the dark side. Rocky/rough surfaces are largely unaffected (roughness kills specular IBL). Planet surfaces use shader-based lighting, so the env map is additive rather than replacing their illumination.

### Mobile path
Env map creation is skipped entirely on `quality === 'low'` (no VRAM cost, no shader variant).

---

## 3. Orbit Speed Constants

**File:** `src/components/3d/OrbitalSystem.tsx`

### Constants added at top of file
```ts
// ─── ORBIT SPEED TUNING ───────────────────────────────────────────────────
export const PLANET_SPEED_SCALE = 4.0   // multiply each planet's base orbitSpeed
export const MOON_SPEED_SCALE   = 4.0   // multiply each moon's base orbitSpeed
const SYSTEM_DRIFT_SPEED        = 0.016 // whole-system Y-axis rotation (rad/s)
```

### Resulting cadence (approx at 60fps)
| Body | Base speed | ×4 result | Lap time |
|------|-----------|-----------|----------|
| Frontend (Neptune) | 0.042 | 0.168 rad/s | ~37 s |
| Backend (Mars) | 0.026 | 0.104 rad/s | ~60 s |
| Fastest moon | 0.21 | 0.84 rad/s | ~7.5 s |
| Slowest moon | 0.10 | 0.40 rad/s | ~16 s |

These produce clearly visible, smooth motion without feeling frantic. Tune `PLANET_SPEED_SCALE` up/down to taste after reviewing.

### Implementation
Multiplier applied in each `useFrame` at the `angleRef.current += delta * data.orbitSpeed * PLANET_SPEED_SCALE` line. Delta-time is already used throughout so frame-rate independence is preserved. No data object changes needed.

---

## 4. PostFX / Bloom Tuning

**File:** `src/components/3d/CanvasContainer.tsx` — `PostFX` component

### Changes
| Property | Before | After |
|---------|--------|-------|
| `luminanceThreshold` | `1.0` | `0.85` |
| `intensity` (high) | `0.5` | `0.72` |
| `intensity` (low) | `0.32` | `0.40` |
| `luminanceSmoothing` | `0.25` | `0.30` |

### Rationale
Threshold `1.0` means only pixels in HDR range bloom. The sun shader pushes `1.55×` at core so the disk blooms, but the corona gradient near the disk edge (`~0.9–1.0`) currently just misses. Dropping to `0.85` catches the outer corona and the ContactBeacon without blooming the planet surfaces (which are `< 1.0`). `mipmapBlur` is already enabled — this is the multi-scale (UnrealBloom-style) pass.

---

## 5. Shadow Interaction

### What gets shadows (GPU shadow maps)
- `CentralStar.pointLight`: `castShadow = true`, `shadow.mapSize = 512×512` (high) or disabled (low), `shadow.bias = -0.001`, `shadow.radius = 3` (PCFSoft softens the edge)
- All three new foreground models: `castShadow + receiveShadow`
- `AsteroidBelt` instancedMesh: `receiveShadow = true`

### What does NOT use GPU shadow maps
Planet and moon meshes. The planet shader already computes per-fragment sun direction and produces a precise analytic terminator. The eclipse (moon in planet shadow) is already implemented analytically in `moonFragment` via the shadow cylinder math. Three.js shadow maps at orbital scale (frustum ~200 units) would require enormous resolution to show anything useful and produce visible texel stepping.

---

## 6. New Foreground Models

### 6.1 SpaceTelescope
**File:** `src/components/3d/SpaceTelescope.tsx` (new)  
**Section:** `hero`  
**Visibility driver:** `sectionInfluence(scrollState.sections.hero)`

#### Geometry (primitives)
| Part | Primitive | Notes |
|------|-----------|-------|
| Main tube | `CylinderGeometry(0.22, 0.22, 1.4)` | Primary mirror housing |
| Forward shroud | `CylinderGeometry(0.20, 0.22, 0.5)` | Tapered nose |
| Aperture door | `CylinderGeometry(0.185, 0.185, 0.08)` | Open end |
| Solar panel ×4 | `BoxGeometry(1.2, 0.02, 0.45)` | Two pairs, ±X and ±Z |
| Panel strut ×4 | `BoxGeometry(0.28, 0.02, 0.06)` | Connects body to panel |
| High-gain antenna | `CylinderGeometry(0.01, 0.01, 0.55)` | Thin rod on top |
| Antenna dish | `SphereGeometry(0.08, 8, 6, 0, PI*2, 0, PI/2)` | Half-sphere |

#### Materials
- Body: `MeshStandardMaterial` silver-gray, `metalness=0.6, roughness=0.4` (MLI thermal blanket look)
- Solar panels: `MeshStandardMaterial` dark navy + slight blue iridescence, `metalness=0.9, roughness=0.15`
- Panel struts: gold foil `MeshStandardMaterial color=#c8a040, metalness=0.85, roughness=0.25`
- Antenna: matte white `roughness=0.7, metalness=0.1`

#### Scroll motion
```
scrollT = sections.hero (0→1)
position.x = lerp(8, -6, smoothstep(0.2, 0.9, scrollT))
position.y = lerp(3.5, 2.2, scrollT)
position.z = lerp(5, 3.5, scrollT)
rotation.y += delta * 0.08   // slow tumble
rotation.z = sin(elapsed * 0.15) * 0.12  // gentle wobble
```
Group scale: `1 + sectionInfluence * 0` (full size when hero is active, fades via opacity on MeshBasicMaterial overlay or group opacity via material `transparent`).

---

### 6.2 SpaceStation
**File:** `src/components/3d/SpaceStation.tsx` (new)  
**Section:** `about`  
**Visibility driver:** `sectionInfluence(scrollState.sections.about)`

#### Geometry
| Part | Primitive |
|------|-----------|
| Central hub | `CylinderGeometry(0.35, 0.35, 1.2, 16)` |
| Truss arm ×4 | `CylinderGeometry(0.05, 0.05, 2.0)` — X and Z axes |
| Habitat module ×4 | `SphereGeometry(0.28, 12, 10)` — at arm ends |
| Solar panel ×8 | `BoxGeometry(0.9, 0.015, 0.35)` — pairs per module |
| Docking ring | `TorusGeometry(0.38, 0.04, 8, 24)` |

#### Materials
- Hub/arms: `metalness=0.65, roughness=0.45`, silver-white
- Habitats: `metalness=0.5, roughness=0.55`, off-white
- Solar panels: dark navy, `metalness=0.92, roughness=0.12`
- Docking ring: `metalness=0.8, roughness=0.2`, aluminum

#### Scroll motion
```
influence = sectionInfluence(sections.about)
position = [4, 0.5, -10]  (fixed, midground)
group.rotation.y += delta * 0.12   // station spin
group.opacity ≈ influence (fade in/out via material opacity)
group.scale ≈ damp toward 0.9 + influence * 0.2
```

---

### 6.3 CloseAsteroid
**File:** `src/components/3d/Asteroids.tsx` — new export `CloseAsteroid`  
**Section:** `projects`  
**Visibility driver:** `sectionInfluence(scrollState.sections.projects)`

#### Geometry
`IcosahedronGeometry(1, 1)` (detail=1, 80 triangles) with per-vertex position displacement at build time:
```ts
for each vertex: pos += normal * (noise(pos * 2.3) - 0.5) * 0.38
```
Produces a convincingly jagged, non-spherical silhouette. Scale: `0.42`.

#### Material
`MeshStandardMaterial color=#6a6055, roughness=0.94, metalness=0.03` — dusty chondrite.

#### Scroll motion
```
scrollT = sections.projects (0→1)
position.x = lerp(6, -4, scrollT)
position.y = lerp(1.8, 3.2, scrollT)
position.z = lerp(4.5, 6.0, scrollT)  // drifts slightly closer
rotation += delta * 0.18 on Y, 0.12 on X  // constant tumble
```

---

## 7. CanvasContainer Wiring

`<Scene>` gets three new children:
```tsx
<SpaceEnvironment quality={quality} />
<SpaceTelescope quality={quality} />
<SpaceStation quality={quality} />
```

`CloseAsteroid` is imported from `Asteroids.tsx` and added alongside `AsteroidBelt` / `DustField`:
```tsx
<CloseAsteroid quality={quality} />
```

Both new components accept `quality: 'high' | 'low'` to halve geometry segment counts on low.

Material fading (telescope/station) is done by setting `material.opacity` each frame and `material.transparent = true` — not via group-level opacity (which doesn't exist in Three.js). Each sub-mesh material is updated in `useFrame` via a ref array.

The existing `toneMapping: THREE.ACESFilmicToneMapping` key in the `gl` constructor prop is removed to avoid a no-op that creates confusion; all renderer state is set exclusively in `onCreated`.

---

## 8. Performance Summary

| Feature | High quality | Low quality |
|---------|-------------|------------|
| Shadow maps | PCFSoft, 512px | Disabled |
| HDR env map | 512×256 Float32 PMREMGen | Skipped |
| SpaceTelescope | Full segments | Halved cylinder/sphere segs |
| SpaceStation | Full segments | Halved segs |
| CloseAsteroid | IcosahedronDetail=1 | IcosahedronDetail=0 |
| PostFX Bloom intensity | 0.72 | 0.40 |
| Starfield count | 2750 pts | 1370 pts (unchanged) |

---

## 9. Files Touched

| File | Action |
|------|--------|
| `src/components/3d/CanvasContainer.tsx` | Modify: renderer setup, env component, new model imports, PostFX params |
| `src/components/3d/OrbitalSystem.tsx` | Modify: speed constants + multipliers, shadow on pointLight |
| `src/components/3d/Asteroids.tsx` | Modify: add `CloseAsteroid` export |
| `src/components/3d/SpaceTelescope.tsx` | Create |
| `src/components/3d/SpaceStation.tsx` | Create |

---

## 10. Out of Scope

- Rewriting the planet / moon / star / nebula GLSL shaders (already at target quality)
- Sourcing or converting real HDRI files (procedural env map covers the IBL need)
- Loading glTF models (primitive-based models chosen)
- Modifying page.tsx or UI components
- Adding new texture assets (existing albedo/normal maps stay)
