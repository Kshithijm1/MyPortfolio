# Space Scene Realism Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing Three.js portfolio space scene to maximum photographic realism — faster orbits, PCFSoft shadows, ACES exposure, sRGB colour space, procedural HDR IBL, tuned bloom, and three new scroll-reactive primitive-based foreground models.

**Architecture:** All changes are additive or targeted edits; the existing GLSL planet/moon/star shaders are already at target quality and are not rewritten. New components (`SpaceEnvironment`, `SpaceTelescope`, `SpaceStation`, `CloseAsteroid`) are wired into the existing `scrollState` singleton and `sectionInfluence` helper for scroll-driven behaviour. Renderer properties are moved from the WebGL constructor prop to `onCreated` where they actually take effect.

**Tech Stack:** Next.js 16, React 19, Three.js 0.182, @react-three/fiber 9, @react-three/postprocessing 3, postprocessing 6, GSAP ScrollTrigger (existing)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/3d/CanvasContainer.tsx` | Modify | Renderer setup, SpaceEnvironment, PostFX params, wiring new components |
| `src/components/3d/OrbitalSystem.tsx` | Modify | Speed constants + multipliers, shadow on pointLight |
| `src/components/3d/Asteroids.tsx` | Modify | Add `CloseAsteroid` export, add `receiveShadow` to belt |
| `src/components/3d/SpaceTelescope.tsx` | Create | Primitive Hubble-style satellite, hero section |
| `src/components/3d/SpaceStation.tsx` | Create | Primitive ring station, about section |

---

## Task 1: Renderer Foundation

**Files:**
- Modify: `src/components/3d/CanvasContainer.tsx`

The Canvas `gl` constructor prop silently ignores renderer properties like `toneMapping` — those must be set on the live renderer in `onCreated`. This task fixes that and enables the shadow map system.

- [ ] **Step 1: Open CanvasContainer.tsx and locate the Canvas element (line ~157)**

The current `<Canvas>` block looks like:
```tsx
<Canvas
    camera={{ position: [0, 6, 17.5], fov: 42 }}
    dpr={[1, quality === 'high' ? 1.5 : 1]}
    gl={{
        antialias: true,
        powerPreference: 'high-performance',
        alpha: true,
        premultipliedAlpha: true,
        stencil: false,
        depth: true,
        toneMapping: THREE.ACESFilmicToneMapping,
    }}
    style={{ background: 'transparent' }}
    shadows={false}
    onCreated={() => setReady(true)}
>
```

- [ ] **Step 2: Add `useThree` to the `@react-three/fiber` import**

Change the top import line from:
```tsx
import { Canvas } from '@react-three/fiber'
```
to:
```tsx
import { Canvas, useThree } from '@react-three/fiber'
```

- [ ] **Step 3: Replace the Canvas element with the corrected version**

Replace the entire `<Canvas ...>` opening tag (keep the children untouched) with:
```tsx
<Canvas
    camera={{ position: [0, 6, 17.5], fov: 42 }}
    dpr={[1, quality === 'high' ? 1.5 : 1]}
    gl={{
        antialias: true,
        powerPreference: 'high-performance',
        alpha: true,
        premultipliedAlpha: true,
        stencil: false,
        depth: true,
    }}
    style={{ background: 'transparent' }}
    shadows={quality === 'high'}
    onCreated={({ gl }) => {
        gl.shadowMap.type = THREE.PCFSoftShadowMap
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 0.88
        gl.outputColorSpace = THREE.SRGBColorSpace
        setReady(true)
    }}
>
```

Key changes: removed `toneMapping` from constructor prop, changed `shadows={false}` → `shadows={quality === 'high'}`, expanded `onCreated` to configure renderer state.

- [ ] **Step 4: Verify the dev server starts without errors**

```bash
npm run dev
```

Expected: no TypeScript errors, page loads, scene renders (should look the same as before — this task only fixes the renderer config).

- [ ] **Step 5: Commit**

```bash
git add src/components/3d/CanvasContainer.tsx
git commit -m "fix: move renderer tone-mapping/shadow config to onCreated"
```

---

## Task 2: Orbit Speed Constants

**Files:**
- Modify: `src/components/3d/OrbitalSystem.tsx`

Adds three tunable constants at the top of the file and applies them as multipliers in the existing `useFrame` loops. Does not change the underlying `orbitSpeed` data values, so individual per-body tuning still works.

- [ ] **Step 1: Add the speed constants immediately after the imports block in OrbitalSystem.tsx**

After the last import line, before the `type TechNode` declaration, insert:
```tsx
// ─── ORBIT SPEED TUNING ───────────────────────────────────────────────────
// Edit these three constants to change animation speed globally.
// PLANET_SPEED_SCALE = 4 → fastest planet laps in ~37 s, slowest in ~60 s.
// MOON_SPEED_SCALE   = 4 → fastest moon laps in ~7.5 s, slowest in ~16 s.
// SYSTEM_DRIFT_SPEED = whole-system Y-axis rotation rate (rad/s).
export const PLANET_SPEED_SCALE  = 4.0
export const MOON_SPEED_SCALE    = 4.0
const        SYSTEM_DRIFT_SPEED  = 0.016
```

- [ ] **Step 2: Apply MOON_SPEED_SCALE in the Moon component's useFrame**

In `Moon`'s `useFrame`, find:
```tsx
angleRef.current += delta * data.orbitSpeed
```
Replace with:
```tsx
angleRef.current += delta * data.orbitSpeed * MOON_SPEED_SCALE
```

- [ ] **Step 3: Apply PLANET_SPEED_SCALE in the Planet component's useFrame**

In `Planet`'s `useFrame`, find:
```tsx
angleRef.current += delta * data.orbitSpeed
```
Replace with:
```tsx
angleRef.current += delta * data.orbitSpeed * PLANET_SPEED_SCALE
```

- [ ] **Step 4: Apply SYSTEM_DRIFT_SPEED in the OrbitalSystem component's useFrame**

In `OrbitalSystem`'s `useFrame`, find:
```tsx
groupRef.current.rotation.y += delta * 0.008
```
Replace with:
```tsx
groupRef.current.rotation.y += delta * SYSTEM_DRIFT_SPEED
```

- [ ] **Step 5: Verify in browser**

Run `npm run dev`. Open the page. Planets should now visibly sweep their orbits within seconds of watching — clearly in motion but not frantic. Moons should lap noticeably faster than planets.

- [ ] **Step 6: Commit**

```bash
git add src/components/3d/OrbitalSystem.tsx
git commit -m "feat: add orbit speed constants, 4× default (planets ~37-60s lap)"
```

---

## Task 3: PostFX Bloom Tuning

**Files:**
- Modify: `src/components/3d/CanvasContainer.tsx`

Lowers the bloom luminance threshold from 1.0 to 0.85 so the sun corona's outer gradient catches the effect, and raises intensity to make the star actually glow. No other PostFX effects are touched.

- [ ] **Step 1: Locate the Bloom element inside PostFX in CanvasContainer.tsx**

Current:
```tsx
<Bloom
    luminanceThreshold={1.0}
    luminanceSmoothing={0.25}
    mipmapBlur
    intensity={quality === 'high' ? 0.5 : 0.32}
/>
```

- [ ] **Step 2: Replace with tuned values**

```tsx
<Bloom
    luminanceThreshold={0.85}
    luminanceSmoothing={0.30}
    mipmapBlur
    intensity={quality === 'high' ? 0.72 : 0.40}
/>
```

- [ ] **Step 3: Verify in browser**

The sun disk should have a noticeably wider, softer glow halo. Planets must NOT glow (their surface stays below 1.0). The ContactBeacon star in the contact section should bloom when scrolled to.

- [ ] **Step 4: Commit**

```bash
git add src/components/3d/CanvasContainer.tsx
git commit -m "feat: tune bloom threshold 1.0→0.85, intensity 0.5→0.72"
```

---

## Task 4: Procedural Space HDR Environment (IBL)

**Files:**
- Modify: `src/components/3d/CanvasContainer.tsx`

Adds a `SpaceEnvironment` component that builds a 512×256 Float32 equirectangular texture in code — very dark space base plus a warm sun lobe — and uses `PMREMGenerator` to convert it into a scene environment map. This gives metallic surfaces (solar panels, antenna, asteroid minerals) directional IBL reflections without any external HDRI file.

The component must live inside `<Canvas>` so it can call `useThree()`.

- [ ] **Step 1: Add the SpaceEnvironment component to CanvasContainer.tsx**

Add this function above the `Scene` function (before line ~51 where `function Scene` begins):

```tsx
function SpaceEnvironment({ quality }: { quality: 'high' | 'low' }) {
    const { gl, scene } = useThree()

    useEffect(() => {
        if (quality === 'low') return

        const W = 512, H = 256
        const data = new Float32Array(W * H * 4)

        for (let j = 0; j < H; j++) {
            for (let i = 0; i < W; i++) {
                const idx = (j * W + i) * 4
                // Deep space base — near-black with blue-purple tint
                data[idx]     = 0.001
                data[idx + 1] = 0.001
                data[idx + 2] = 0.003
                data[idx + 3] = 1.0

                // Sun lobe — warm, placed at phi=0, theta=PI/2 (equatorial right)
                const phi    = (i / W) * Math.PI * 2 - Math.PI   // -π..π
                const theta  = (j / H) * Math.PI                  // 0..π
                const dPhi   = phi
                const dTheta = theta - Math.PI / 2
                const sun    = Math.exp(-(dPhi * dPhi + dTheta * dTheta) / 0.018) * 8.0
                data[idx]     += sun * 1.00
                data[idx + 1] += sun * 0.90
                data[idx + 2] += sun * 0.70

                // Faint cool ambient on the hemisphere opposite the sun
                const dPhiOpp = Math.abs(phi) - Math.PI
                const scatter  = Math.exp(-(dPhiOpp * dPhiOpp + dTheta * dTheta) / 2.0) * 0.006
                data[idx]     += scatter * 0.4
                data[idx + 1] += scatter * 0.5
                data[idx + 2] += scatter * 0.8
            }
        }

        const tex = new THREE.DataTexture(data, W, H, THREE.RGBAFormat, THREE.FloatType)
        tex.mapping    = THREE.EquirectangularReflectionMapping
        tex.colorSpace = THREE.LinearSRGBColorSpace
        tex.needsUpdate = true

        const pmrem = new THREE.PMREMGenerator(gl)
        pmrem.compileEquirectangularShader()
        const env = pmrem.fromEquirectangular(tex).texture
        pmrem.dispose()
        tex.dispose()

        scene.environment = env
        return () => { env.dispose(); scene.environment = null }
    }, [gl, scene, quality])

    return null
}
```

- [ ] **Step 2: Mount SpaceEnvironment inside the Scene function**

In the `Scene` function, add it as the first child after `<CameraDirector />`:

```tsx
function Scene({ quality }: { quality: 'high' | 'low' }) {
    return (
        <>
            <CameraDirector />
            <SpaceEnvironment quality={quality} />
            {/* ... rest unchanged ... */}
        </>
    )
}
```

- [ ] **Step 3: Verify in browser**

The metallic parts of the scene (asteroid belt rocks, any shiny surface) should pick up a faint warm highlight on the sun-facing side. Planet surfaces will be largely unaffected (shader-based lighting dominates; IBL is additive). No visible artifacts or black flashes on load.

- [ ] **Step 4: Commit**

```bash
git add src/components/3d/CanvasContainer.tsx
git commit -m "feat: add procedural deep-space HDR env map via PMREMGenerator"
```

---

## Task 5: Shadow Casting on the Central Star

**Files:**
- Modify: `src/components/3d/OrbitalSystem.tsx`

Enables shadow casting on the sun's `pointLight` at high quality. Threads the `quality` prop down to `CentralStar` so it can gate the shadow map.

Point light shadows use six cube-face renders — expensive but limited to `quality === 'high'` and contained to objects that explicitly set `castShadow`/`receiveShadow` (the new foreground models added in later tasks).

- [ ] **Step 1: Update CentralStar to accept and use quality**

Find the `CentralStar` function declaration:
```tsx
function CentralStar() {
```

Change it to:
```tsx
function CentralStar({ quality }: { quality: 'high' | 'low' }) {
```

- [ ] **Step 2: Add shadow props to the pointLight inside CentralStar**

Find:
```tsx
<pointLight distance={70} decay={2} intensity={26} color="#FFE3B8" />
```

Replace with:
```tsx
<pointLight
    distance={70}
    decay={2}
    intensity={26}
    color="#FFE3B8"
    castShadow={quality === 'high'}
    shadow-mapSize-width={512}
    shadow-mapSize-height={512}
    shadow-bias={-0.001}
    shadow-radius={3}
/>
```

- [ ] **Step 3: Pass quality to CentralStar from OrbitalSystem**

In the `OrbitalSystem` component's JSX, change:
```tsx
<CentralStar />
```
to:
```tsx
<CentralStar quality={quality} />
```

- [ ] **Step 4: Verify in browser**

No visible errors or black artifacts. The shadow only has visible effect once objects with `castShadow` are added in later tasks — this task just sets up the light.

- [ ] **Step 5: Commit**

```bash
git add src/components/3d/OrbitalSystem.tsx
git commit -m "feat: enable PCFSoft shadow casting on sun pointLight (high quality only)"
```

---

## Task 6: SpaceTelescope Component

**Files:**
- Create: `src/components/3d/SpaceTelescope.tsx`

A Hubble-inspired space telescope built from Three.js primitives. Visible during the **hero** section: drifts left-to-right across the midground as the hero scroll progresses, with a gentle tumble. All materials use `MeshStandardMaterial` with PBR metalness/roughness. Fades in/out via per-material opacity damped to section influence.

- [ ] **Step 1: Create the file with full implementation**

Create `src/components/3d/SpaceTelescope.tsx` with this content:

```tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState, sectionInfluence } from './scrollState'

export default function SpaceTelescope({ quality }: { quality: 'high' | 'low' }) {
    const groupRef = useRef<THREE.Group>(null)
    const seg = quality === 'high' ? 16 : 8

    // All materials start opacity=0; useFrame fades them with sectionInfluence.
    const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#b8bec8', metalness: 0.6, roughness: 0.4, transparent: true, opacity: 0,
    }), [])
    const panelMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#1a2a4a', metalness: 0.9, roughness: 0.15, transparent: true, opacity: 0,
    }), [])
    const strutMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#c8a040', metalness: 0.85, roughness: 0.25, transparent: true, opacity: 0,
    }), [])
    const antMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#d0d4dc', metalness: 0.5, roughness: 0.5, transparent: true, opacity: 0,
    }), [])
    const allMats = useMemo(
        () => [bodyMat, panelMat, strutMat, antMat],
        [bodyMat, panelMat, strutMat, antMat],
    )

    useFrame((state, delta) => {
        const group = groupRef.current
        if (!group) return

        const progress  = scrollState.sections.hero
        const influence = sectionInfluence(progress)
        group.visible   = influence > 0.005
        if (!group.visible) return

        // Drift left as hero section scrolls; smoothstep so motion begins gently
        const t = THREE.MathUtils.smoothstep(progress, 0.2, 0.9)
        group.position.x = THREE.MathUtils.lerp(8.0, -6.0, t)
        group.position.y = THREE.MathUtils.lerp(3.5,  2.2, progress)
        group.position.z = THREE.MathUtils.lerp(5.0,  3.5, progress)

        // Slow continuous tumble + gentle sinusoidal wobble
        group.rotation.y += delta * 0.08
        group.rotation.z  = Math.sin(state.clock.getElapsedTime() * 0.15) * 0.12

        // Fade all materials together
        for (const m of allMats) {
            m.opacity = THREE.MathUtils.damp(m.opacity, influence, 4, delta)
        }
    })

    return (
        <group ref={groupRef} visible={false}>
            {/* Main tube — primary mirror housing */}
            <mesh castShadow receiveShadow material={bodyMat}>
                <cylinderGeometry args={[0.22, 0.22, 1.4, seg]} />
            </mesh>

            {/* Forward shroud — tapered nose */}
            <mesh castShadow receiveShadow material={bodyMat} position={[0, 0.95, 0]}>
                <cylinderGeometry args={[0.185, 0.22, 0.5, seg]} />
            </mesh>

            {/* Aperture ring */}
            <mesh castShadow receiveShadow material={bodyMat} position={[0, 1.245, 0]}>
                <cylinderGeometry args={[0.185, 0.185, 0.08, seg]} />
            </mesh>

            {/* Solar panel pair — ±X axis */}
            {([-1, 1] as const).map((side) => (
                <group key={side}>
                    {/* Gold strut connecting body to panel */}
                    <mesh castShadow receiveShadow material={strutMat}
                        position={[side * 0.36, 0, 0]}>
                        <boxGeometry args={[0.28, 0.025, 0.06]} />
                    </mesh>
                    {/* Panel */}
                    <mesh castShadow receiveShadow material={panelMat}
                        position={[side * 1.1, 0, 0]}>
                        <boxGeometry args={[1.2, 0.018, 0.45]} />
                    </mesh>
                </group>
            ))}

            {/* High-gain antenna rod */}
            <mesh castShadow material={antMat} position={[0, -0.82, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.55, 6]} />
            </mesh>

            {/* Antenna dish (open hemisphere) */}
            <mesh castShadow material={antMat} position={[0, -1.12, 0]}
                rotation={[Math.PI, 0, 0]}>
                <sphereGeometry args={[0.09, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
        </group>
    )
}
```

- [ ] **Step 2: Verify the file compiles (no import errors)**

```bash
npx tsc --noEmit
```

Expected: no errors related to `SpaceTelescope.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/3d/SpaceTelescope.tsx
git commit -m "feat: add SpaceTelescope primitive model (hero section, scroll-driven)"
```

---

## Task 7: SpaceStation Component

**Files:**
- Create: `src/components/3d/SpaceStation.tsx`

A ring-type space station (hub + 4 radial arms + habitat spheres + solar panels). Visible during the **about** section. Fixed position in the midground, continuously rotating on Y. Fades with section influence.

- [ ] **Step 1: Create the file**

Create `src/components/3d/SpaceStation.tsx`:

```tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState, sectionInfluence } from './scrollState'

// World-space position — sits in the midground, slightly off-axis from the sun
const STATION_POS = new THREE.Vector3(4, 0.5, -10)

export default function SpaceStation({ quality }: { quality: 'high' | 'low' }) {
    const groupRef = useRef<THREE.Group>(null)
    const spinRef  = useRef<THREE.Group>(null)
    const seg = quality === 'high' ? 14 : 7

    const hubMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#c8cdd4', metalness: 0.65, roughness: 0.45, transparent: true, opacity: 0,
    }), [])
    const habitMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#dde0e5', metalness: 0.50, roughness: 0.55, transparent: true, opacity: 0,
    }), [])
    const panelMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#0f1e38', metalness: 0.92, roughness: 0.12, transparent: true, opacity: 0,
    }), [])
    const ringMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#a8b0ba', metalness: 0.80, roughness: 0.20, transparent: true, opacity: 0,
    }), [])
    const allMats = useMemo(
        () => [hubMat, habitMat, panelMat, ringMat],
        [hubMat, habitMat, panelMat, ringMat],
    )

    // Four arm directions: +X, -X, +Z, -Z rotated to point along Y (arm geometry is a cylinder along Y)
    const armRotations = useMemo<[number, number, number][]>(() => [
        [0, 0, -Math.PI / 2],    // +X arm
        [0, 0,  Math.PI / 2],    // -X arm
        [ Math.PI / 2, 0, 0],    // +Z arm
        [-Math.PI / 2, 0, 0],    // -Z arm
    ], [])

    useFrame((_, delta) => {
        const group = groupRef.current
        if (!group) return

        const influence = sectionInfluence(scrollState.sections.about)
        group.visible = influence > 0.005
        if (!group.visible) return

        // Slow station rotation
        if (spinRef.current) spinRef.current.rotation.y += delta * 0.12

        for (const m of allMats) {
            m.opacity = THREE.MathUtils.damp(m.opacity, influence, 4, delta)
        }
    })

    return (
        <group ref={groupRef} position={STATION_POS} visible={false}>
            <group ref={spinRef}>
                {/* Central hub cylinder */}
                <mesh castShadow receiveShadow material={hubMat}>
                    <cylinderGeometry args={[0.35, 0.35, 1.2, seg]} />
                </mesh>

                {/* Docking ring at top */}
                <mesh castShadow receiveShadow material={ringMat} position={[0, 0.65, 0]}>
                    <torusGeometry args={[0.38, 0.04, 8, 24]} />
                </mesh>

                {/* 4 radial truss arms, each with habitat + solar panels */}
                {armRotations.map((rot, i) => (
                    <group key={i} rotation={rot}>
                        {/* Truss arm (cylinder along rotated Y) */}
                        <mesh castShadow receiveShadow material={hubMat} position={[0, 1.2, 0]}>
                            <cylinderGeometry args={[0.05, 0.05, 2.0, 6]} />
                        </mesh>

                        {/* Habitat sphere at arm end */}
                        <mesh castShadow receiveShadow material={habitMat} position={[0, 2.35, 0]}>
                            <sphereGeometry args={[0.28, seg, Math.ceil(seg * 0.7)]} />
                        </mesh>

                        {/* Solar panel pair per habitat, ±X of the arm */}
                        {([-1, 1] as const).map((s) => (
                            <mesh key={s} castShadow receiveShadow material={panelMat}
                                position={[s * 0.72, 2.35, 0]}>
                                <boxGeometry args={[0.9, 0.015, 0.35]} />
                            </mesh>
                        ))}
                    </group>
                ))}
            </group>
        </group>
    )
}
```

- [ ] **Step 2: Verify the file compiles**

```bash
npx tsc --noEmit
```

Expected: no errors related to `SpaceStation.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/3d/SpaceStation.tsx
git commit -m "feat: add SpaceStation primitive model (about section, scroll-driven)"
```

---

## Task 8: CloseAsteroid + AsteroidBelt Shadow

**Files:**
- Modify: `src/components/3d/Asteroids.tsx`

Adds a new `CloseAsteroid` export — a single jagged icosahedron with procedural vertex displacement, visible during the **projects** section, sweeping left across the midground. Also adds `receiveShadow` to the existing `AsteroidBelt` instancedMesh.

- [ ] **Step 1: Add required imports to Asteroids.tsx**

The file currently imports `useMemo`, `useRef`, `useFrame`, `THREE`. Add the `scrollState` and `sectionInfluence` imports, which are needed by `CloseAsteroid`.

At the top of `Asteroids.tsx`, add after the existing imports:
```tsx
import { scrollState, sectionInfluence } from './scrollState'
```

- [ ] **Step 2: Add receiveShadow to the AsteroidBelt instancedMesh**

Find the `<instancedMesh` in `AsteroidBelt`:
```tsx
<instancedMesh
    ref={(node: THREE.InstancedMesh | null) => {
        if (node) {
            matrices.forEach((m, i) => node.setMatrixAt(i, m))
            node.instanceMatrix.needsUpdate = true
        }
    }}
    args={[undefined, undefined, count]}
    frustumCulled={false}
>
```

Add `castShadow receiveShadow`:
```tsx
<instancedMesh
    ref={(node: THREE.InstancedMesh | null) => {
        if (node) {
            matrices.forEach((m, i) => node.setMatrixAt(i, m))
            node.instanceMatrix.needsUpdate = true
        }
    }}
    args={[undefined, undefined, count]}
    frustumCulled={false}
    castShadow
    receiveShadow
>
```

- [ ] **Step 3: Append the CloseAsteroid component at the bottom of Asteroids.tsx**

Add after the closing brace of `DustField`:

```tsx
export function CloseAsteroid({ quality }: { quality: 'high' | 'low' }) {
    const meshRef = useRef<THREE.Mesh>(null)
    const matRef  = useRef<THREE.MeshStandardMaterial>(null)

    // IcosahedronGeometry with deterministic per-vertex displacement for jagged silhouette
    const geometry = useMemo(() => {
        const detail = quality === 'high' ? 1 : 0
        const geo    = new THREE.IcosahedronGeometry(1, detail)
        const pos    = geo.attributes.position as THREE.BufferAttribute
        for (let i = 0; i < pos.count; i++) {
            const nx = pos.getX(i)
            const ny = pos.getY(i)
            const nz = pos.getZ(i)
            // Deterministic displacement based on vertex position (no random — stable across frames)
            const disp = (Math.sin(nx * 7.3 + ny * 4.1) * Math.cos(nz * 5.7 + nx * 3.2)) * 0.34
            pos.setXYZ(i, nx + nx * disp, ny + ny * disp, nz + nz * disp)
        }
        geo.computeVertexNormals()
        return geo
    }, [quality])

    useFrame((_, delta) => {
        const mesh = meshRef.current
        const mat  = matRef.current
        if (!mesh || !mat) return

        const progress  = scrollState.sections.projects
        const influence = sectionInfluence(progress)
        mesh.visible = influence > 0.005
        if (!mesh.visible) return

        // Sweep left and slightly toward camera as projects section scrolls
        const t = THREE.MathUtils.smoothstep(progress, 0.1, 0.9)
        mesh.position.x = THREE.MathUtils.lerp(6.0, -4.0, t)
        mesh.position.y = THREE.MathUtils.lerp(1.8,  3.2, t)
        mesh.position.z = THREE.MathUtils.lerp(4.5,  6.0, t)

        // Constant tumble — two axes for natural random-looking rotation
        mesh.rotation.y += delta * 0.18
        mesh.rotation.x += delta * 0.12

        mat.opacity = THREE.MathUtils.damp(mat.opacity, influence, 4, delta)
    })

    return (
        <mesh
            ref={meshRef}
            geometry={geometry}
            scale={0.42}
            castShadow
            receiveShadow
            visible={false}
        >
            <meshStandardMaterial
                ref={matRef}
                color="#6a6055"
                roughness={0.94}
                metalness={0.03}
                transparent
                opacity={0}
            />
        </mesh>
    )
}
```

- [ ] **Step 4: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: no errors in `Asteroids.tsx`.

- [ ] **Step 5: Commit**

```bash
git add src/components/3d/Asteroids.tsx
git commit -m "feat: add CloseAsteroid (projects section) and AsteroidBelt shadow"
```

---

## Task 9: Wire All New Components into CanvasContainer

**Files:**
- Modify: `src/components/3d/CanvasContainer.tsx`

Imports the three new components and mounts them in `Scene`. `SpaceEnvironment` was already added in Task 4; this task adds the model imports.

- [ ] **Step 1: Add imports for new components**

At the top of `CanvasContainer.tsx`, after the existing component imports, add:
```tsx
import SpaceTelescope from './SpaceTelescope'
import SpaceStation from './SpaceStation'
import { CloseAsteroid } from './Asteroids'
```

The `Asteroids` import line currently reads:
```tsx
import { AsteroidBelt, DustField } from './Asteroids'
```

Change it to:
```tsx
import { AsteroidBelt, DustField, CloseAsteroid } from './Asteroids'
```

- [ ] **Step 2: Mount the three new models inside Scene**

The current `Scene` function's `<Suspense>` block:
```tsx
<Suspense fallback={null}>
    <OrbitalSystem quality={quality} />
    {quality === 'high' && <AsteroidBelt count={70} />}
    <DustField count={quality === 'high' ? 140 : 70} />
    <Preload all />
</Suspense>
```

Replace with:
```tsx
<Suspense fallback={null}>
    <OrbitalSystem quality={quality} />
    {quality === 'high' && <AsteroidBelt count={70} />}
    <DustField count={quality === 'high' ? 140 : 70} />
    <CloseAsteroid quality={quality} />
    <Preload all />
</Suspense>
```

Then, after the `<SunFlare />` line and before the closing `</>`, add:
```tsx
<SpaceTelescope quality={quality} />
<SpaceStation quality={quality} />
```

The full `Scene` function should now read:
```tsx
function Scene({ quality }: { quality: 'high' | 'low' }) {
    return (
        <>
            <CameraDirector />
            <SpaceEnvironment quality={quality} />

            {/* Cool, very low fill so dark sides aren't pure black */}
            <ambientLight intensity={0.16} color="#9fb4d4" />

            {/* Deep-field backdrop — parallax stars + faint nebulae */}
            <Nebula />
            <Starfield quality={quality} />

            <Suspense fallback={null}>
                <OrbitalSystem quality={quality} />
                {quality === 'high' && <AsteroidBelt count={70} />}
                <DustField count={quality === 'high' ? 140 : 70} />
                <CloseAsteroid quality={quality} />
                <Preload all />
            </Suspense>

            {/* Per-section travelers + signal beacon */}
            <Comet section="experience" waypointCount={6} pathPoints={EXPERIENCE_PATH} anchor="comet" color="#bfe3ff" />
            <Comet section="education" waypointCount={5} pathPoints={EDUCATION_PATH} anchor="probe" color="#ffd9a8" headSize={0.09} />
            <ContactBeacon />

            <SunFlare />

            {/* Foreground models */}
            <SpaceTelescope quality={quality} />
            <SpaceStation quality={quality} />
        </>
    )
}
```

- [ ] **Step 3: Run the dev server and do a full visual pass**

```bash
npm run dev
```

Open the page and scroll through all sections. Verify:

| Section | Expected |
|---------|----------|
| Hero | Telescope visible on right, drifts left as you scroll; slow tumble |
| About | Space station visible in midground (slightly to the right), rotating |
| Projects | Close jagged asteroid sweeps left across frame during planet flyby |
| Experience | Comet trail (unchanged) |
| Education | Probe trail (unchanged) |
| Contact | ContactBeacon blooms (unchanged) |
| All sections | Sun has wider soft glow; orbits clearly in motion |
| Mobile | Shadows off, env map off, everything still renders |

- [ ] **Step 4: Check browser console for WebGL errors**

Open DevTools → Console. Expected: no `THREE.WebGLRenderer` errors. Acceptable: deprecation warnings from older drei/postprocessing versions.

- [ ] **Step 5: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 6: Final commit**

```bash
git add src/components/3d/CanvasContainer.tsx
git commit -m "feat: wire SpaceTelescope, SpaceStation, CloseAsteroid into scene"
```

---

## Self-Review Checklist

- [x] **Renderer setup** (Task 1): PCFSoft, ACES exposure 0.88, sRGB, shadows prop ✓
- [x] **Orbit speed constants** (Task 2): PLANET_SPEED_SCALE, MOON_SPEED_SCALE, SYSTEM_DRIFT_SPEED at top of OrbitalSystem.tsx ✓
- [x] **Bloom tuning** (Task 3): threshold 0.85, intensity 0.72/0.40 ✓
- [x] **HDR env map** (Task 4): PMREMGenerator, dark space + warm sun lobe, skipped on low quality ✓
- [x] **Shadow on sun** (Task 5): pointLight castShadow, 512×512, bias −0.001, radius 3, quality-gated ✓
- [x] **SpaceTelescope** (Task 6): hero section, left-drift scroll motion, tumble, PBR materials, castShadow ✓
- [x] **SpaceStation** (Task 7): about section, fixed position, Y rotation, PBR materials, castShadow ✓
- [x] **CloseAsteroid** (Task 8): projects section, sweep motion, vertex displacement, castShadow ✓
- [x] **AsteroidBelt shadows** (Task 8): receiveShadow added ✓
- [x] **Wiring** (Task 9): all three models + env map mounted in Scene with quality prop ✓
- [x] **Mobile path**: env map skipped (low), shadows disabled (low), geometry segments halved (low) ✓
- [x] **No placeholders**: all steps contain complete, copy-pasteable code ✓
- [x] **Type consistency**: `quality: 'high' | 'low'` prop threaded consistently across all new components and CentralStar ✓
