'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { NOISE_GLSL } from '@/components/glsl/noise'
import { scrollState, sectionInfluence } from './scrollState'

// ─── ORBIT SPEED TUNING ───────────────────────────────────────────────────
// Edit these three constants to change animation speed globally.
// PLANET_SPEED_SCALE = 4 → fastest planet laps in ~37 s, slowest in ~60 s.
// MOON_SPEED_SCALE   = 4 → fastest moon laps in ~7.5 s, slowest in ~16 s.
// SYSTEM_DRIFT_SPEED = whole-system Y-axis rotation rate (rad/s); was 0.008.
export const PLANET_SPEED_SCALE  = 4.0
export const MOON_SPEED_SCALE    = 4.0
const        SYSTEM_DRIFT_SPEED  = 0.016

// ─── Data ─────────────────────────────────────────────────────────────────
type TechNode = {
    id: string
    name: string
    color: string
    type: 'planet' | 'moon'
    orbitRadius: number
    orbitSpeed: number
    size: number
    description: string
    proficiency: string
    experience: string
    moons?: TechNode[]
}

// Orbital speeds are deliberately slow — real space photography feels still
// and vast. A moon takes ~30-60s per revolution; planets take minutes.
const PLANETS_ORBITING_SUN: TechNode[] = [
    {
        id: 'frontend',
        name: 'Frontend',
        color: '#3D5E9C',
        type: 'planet',
        orbitRadius: 8,
        orbitSpeed: 0.042,
        size: 1.2,
        description: 'UI/UX & Creative',
        proficiency: 'Expert',
        experience: 'Focus',
        moons: [
            { id: 'react',   name: 'React.js',    color: '#61DBFB', type: 'moon', orbitRadius: 2.5, orbitSpeed: 0.21,  size: 0.30, description: '', proficiency: '', experience: '' },
            { id: 'ts',      name: 'TypeScript',  color: '#3178C6', type: 'moon', orbitRadius: 3.3, orbitSpeed: 0.185, size: 0.25, description: '', proficiency: '', experience: '' },
            { id: 'js',      name: 'JavaScript',  color: '#F7DF1E', type: 'moon', orbitRadius: 4.1, orbitSpeed: 0.16,  size: 0.25, description: '', proficiency: '', experience: '' },
            { id: 'htmlcss', name: 'HTML / CSS',  color: '#E34F26', type: 'moon', orbitRadius: 5.0, orbitSpeed: 0.135, size: 0.25, description: '', proficiency: '', experience: '' },
            { id: 'blender', name: 'Blender',     color: '#F5792A', type: 'moon', orbitRadius: 5.9, orbitSpeed: 0.115, size: 0.28, description: '', proficiency: '', experience: '' },
        ],
    },
    {
        id: 'backend',
        name: 'Backend',
        color: '#A0421C',
        type: 'planet',
        orbitRadius: 16,
        orbitSpeed: 0.026,
        size: 1.4,
        description: 'Systems & Logic',
        proficiency: 'Expert',
        experience: 'Focus',
        moons: [
            { id: 'python',  name: 'Python',   color: '#3776AB', type: 'moon', orbitRadius: 3.0, orbitSpeed: 0.195, size: 0.30, description: '', proficiency: '', experience: '' },
            { id: 'nodejs',  name: 'Node.js',  color: '#68A063', type: 'moon', orbitRadius: 3.9, orbitSpeed: 0.17,  size: 0.28, description: '', proficiency: '', experience: '' },
            { id: 'cpp',     name: 'C++',      color: '#00599C', type: 'moon', orbitRadius: 4.8, orbitSpeed: 0.15,  size: 0.28, description: '', proficiency: '', experience: '' },
            { id: 'java',    name: 'Java',     color: '#5382A1', type: 'moon', orbitRadius: 5.7, orbitSpeed: 0.13,  size: 0.28, description: '', proficiency: '', experience: '' },
            { id: 'mysql',   name: 'MySQL',    color: '#4479A1', type: 'moon', orbitRadius: 6.6, orbitSpeed: 0.115, size: 0.24, description: '', proficiency: '', experience: '' },
            { id: 'rails',   name: 'Rails',    color: '#CC0000', type: 'moon', orbitRadius: 6.9, orbitSpeed: 0.11,  size: 0.24, description: '', proficiency: '', experience: '' },
            { id: 'ros',     name: 'ROS',      color: '#22314E', type: 'moon', orbitRadius: 7.4, orbitSpeed: 0.10,  size: 0.20, description: '', proficiency: '', experience: '' },
        ],
    },
]

const TOTAL_MOONS = PLANETS_ORBITING_SUN.reduce((acc, p) => acc + (p.moons?.length ?? 0), 0)

// Per-planet visual identity. NASA/Voyager/HiRISE-calibrated palettes drive a
// 5-stop palette ramp + planet-specific surface features (Great Dark Spot,
// Olympus Mons, polar caps, Valles Marineris). A real CC0 albedo map
// (Solar System Scope) is blended over the procedural surface when loaded.
const PLANET_IDENTITY: Record<string, {
    accent: string         // hex used for UI labels
    atmoInner: THREE.Color // inner atmosphere (close to surface)
    atmoOuter: THREE.Color // outer atmosphere (limb scatter)
    bandColor: THREE.Color // deepest band — dark belts / valleys / basalt
    colorZone: THREE.Color // main zone — typical surface tone
    colorMid:  THREE.Color // mid band — warmer / brighter zones
    colorHigh: THREE.Color // cloud tops / highland dust — brightest tone
    polarCap:  THREE.Color // ice / frost cap (rocky) or polar haze (gas)
    stormColor: THREE.Color // dark spot vortex (gas) / dust storm (rocky)
    mottle: number         // 0 = pure gas giant, 1 = rocky
    textureUrl: string     // CC0 equirectangular albedo
    textureMix: number     // how much of the real map shows through
    cloudCoverage: number  // 0..1 procedural cloud layer coverage
    cloudStretch: [number, number, number] // anisotropic noise → banding for gas
    cloudOpacity: number
    hasRing: boolean
}> = {
    // ── NEPTUNE-class ice giant ─────────────────────────────────────────────
    // Hubble-corrected Voyager: muted methane-blue, low chroma. Real Neptune
    // is grayer than the popular Voyager-1989 release suggests.
    frontend: {
        accent: '#5BA0E0',
        atmoInner: new THREE.Color('#0B1828'),  // muted midnight
        atmoOuter: new THREE.Color('#7090B4'),  // muted azure scatter
        bandColor: new THREE.Color('#162234'),  // dark belt (low chroma)
        colorZone: new THREE.Color('#4F6E94'),  // muted Neptune body
        colorMid:  new THREE.Color('#6E89A8'),  // soft mid-band
        colorHigh: new THREE.Color('#B8C6D2'),  // off-white methane cloud
        polarCap:  new THREE.Color('#94A6B8'),  // pale haze, gray-blue
        stormColor: new THREE.Color('#101828'), // GDS — near-black
        mottle: 0.15,
        textureUrl: '/textures/planets/2k_neptune.jpg',
        textureMix: 0.45,
        cloudCoverage: 0.42,
        cloudStretch: [1.0, 2.8, 1.0],          // latitudinal streaks
        cloudOpacity: 0.26,
        hasRing: false,                         // no ring
    },
    // ── MARS-class rocky world ──────────────────────────────────────────────
    // MRO HiRISE color-balanced: real Mars is warm BROWN-tan, not bright
    // orange. Average pixel ≈ RGB(150,110,85). Saturated reds in popular
    // images are heavy contrast/saturation processing.
    backend: {
        accent: '#C66838',
        atmoInner: new THREE.Color('#1F0E08'),  // deep shadow
        atmoOuter: new THREE.Color('#A26044'),  // muted dust scatter
        bandColor: new THREE.Color('#241410'),  // basalt dark, warm
        colorZone: new THREE.Color('#7A5440'),  // photoreal Mars regolith
        colorMid:  new THREE.Color('#9C7556'),  // dust plateau (warm tan)
        colorHigh: new THREE.Color('#BC9870'),  // bright dust region (muted)
        polarCap:  new THREE.Color('#D8C8B4'),  // dusty frost (not pure white)
        stormColor: new THREE.Color('#9C7858'), // dust storm haze
        mottle: 0.90,
        textureUrl: '/textures/planets/2k_mars.jpg',
        textureMix: 0.60,
        cloudCoverage: 0.24,                    // thin water-ice wisps
        cloudStretch: [1.0, 1.0, 1.0],
        cloudOpacity: 0.16,
        hasRing: false,
    },
}

const MOON_TEXTURE_URL = '/textures/planets/2k_moon.jpg'
const MOON_TEXTURE_MIX = 0.55

// The sun (central star) sits at world origin. Each planet/moon computes its
// own light direction every frame as (sunWorldPos - meshWorldPos), then
// transforms to view space — so the lit hemisphere actually faces the sun
// based on orbital position, not a fixed scene direction.
const SUN_WORLD_POS = new THREE.Vector3(0, 0, 0)
// Warm white-yellow tint of light reaching planets (G-type ~5800K).
const SUN_COLOR = new THREE.Color('#FFF4E0')
// Initial uniform fallback before first useFrame fires.
const INITIAL_LIGHT_DIR = new THREE.Vector3(-0.7, 0.55, 0.45).normalize()

// ─── Shared texture loading (cached, graceful fallback to procedural) ─────
const _texCache = new Map<string, Promise<THREE.Texture>>()

function loadSharedTexture(url: string): Promise<THREE.Texture> {
    let promise = _texCache.get(url)
    if (!promise) {
        promise = new THREE.TextureLoader().loadAsync(url).then((tex) => {
            tex.colorSpace = THREE.SRGBColorSpace
            tex.wrapS = THREE.RepeatWrapping
            tex.anisotropy = 4
            return tex
        })
        _texCache.set(url, promise)
    }
    return promise
}

let _placeholderTex: THREE.Texture | null = null
function placeholderTexture(): THREE.Texture {
    if (!_placeholderTex) {
        const data = new Uint8Array([128, 128, 128, 255])
        _placeholderTex = new THREE.DataTexture(data, 1, 1)
        _placeholderTex.needsUpdate = true
    }
    return _placeholderTex
}

// ─── PLANET SURFACE SHADER ───────────────────────────────────────────────
const planetVertex = `
varying vec3 vNormalLocal;
varying vec3 vNormalView;
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
    vNormalLocal = normalize(normal);
    vNormalView  = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mv.xyz;
    vUv = uv;
    gl_Position = projectionMatrix * mv;
}
`

// Hyperrealistic planet shader. Single fragment that branches between gas
// giant (Neptune-class) and rocky (Mars-class) via uMottle, with planet-
// specific features: Great Dark Spot vortex, methane storm streaks, polar
// caps, Tharsis bulge / Olympus Mons, Valles Marineris canyon. Uses
// wrapped diffuse for rough rocky surfaces, broader Rayleigh scattering,
// and warm sun-color tint on the lit hemisphere. A real albedo map (when
// loaded) is blended over the procedural surface via uMapMix.
const planetFragment = `
${NOISE_GLSL}

uniform vec3  uLightDirView;
uniform vec3  uSunColor;     // warm sunlight tint
uniform vec3  uBandColor;    // deepest belts / valleys / basalt
uniform vec3  uColorLit;     // main planet zone
uniform vec3  uColorMid;     // brighter mid-band / dust plateau
uniform vec3  uColorHigh;    // cloud tops / highland dust
uniform vec3  uColorAtmo;    // atmospheric scatter tint (limb)
uniform vec3  uAtmoInner;    // atmospheric inner tint (night-side ambient)
uniform vec3  uPolarCap;     // ice cap / polar haze
uniform vec3  uStormColor;   // Great Dark Spot / dust storm
uniform float uMottle;       // 0 = gas, 1 = rocky
uniform float uTime;
uniform sampler2D uMap;      // real albedo (CC0 Solar System Scope)
uniform float uMapMix;       // 0 until texture loads

varying vec3 vNormalLocal;
varying vec3 vNormalView;
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
    vec3 N = normalize(vNormalView);
    vec3 L = normalize(uLightDirView);
    vec3 V = normalize(vViewPosition);
    float lambert = dot(N, L);
    float NdotV = max(0.0, dot(N, V));

    float lat = vNormalLocal.y;
    vec3  sp  = vNormalLocal;
    float lon = atan(sp.z, sp.x);                        // -π..π
    float absLat = abs(lat);

    // ───────────────────────────────────────────────────────────────────────
    // GAS GIANT BAND/CLOUD GENERATION (Neptune-like)
    // ───────────────────────────────────────────────────────────────────────
    float warp = fbm3(vec3(sp.x * 4.5, sp.y * 2.4 + uTime * 0.0022, sp.z * 4.5)) * 0.16;
    float warpedLat = lat + warp;

    float bandT = fract(warpedLat * 5.0);
    float zone  = smoothstep(0.0, 0.12, bandT) * (1.0 - smoothstep(0.88, 1.0, bandT));

    float warp2  = fbm3(vec3(sp.x * 8.5, sp.y * 5.5 + uTime * 0.0012, sp.z * 8.5)) * 0.07;
    float bandT2 = fract((warpedLat + warp2) * 14.0);
    float subZone = smoothstep(0.0, 0.20, bandT2) * (1.0 - smoothstep(0.80, 1.0, bandT2));

    float turbFBM = fbm3(vec3(sp.x * 10.0, sp.y * 8.0 + uTime * 0.0030, sp.z * 10.0));
    float beltEdge = 1.0 - abs(zone * 2.0 - 1.0);
    float eddies   = beltEdge * turbFBM * 0.32;

    float gasSig = zone * (0.68 + subZone * 0.32) + eddies;
    // Polar darkening — real gas giants have calmer, darker poles
    float poleDark = 1.0 - smoothstep(0.55, 0.95, absLat) * 0.45;
    gasSig = clamp(gasSig * poleDark, 0.0, 1.20);

    // High-altitude white methane cloud streaks — bright, rare, curling
    float streakNoise = fbm3(sp * 14.0 + vec3(uTime * 0.005, 0.0, 0.0));
    float streakBand  = smoothstep(0.62, 0.88, abs(fract(warpedLat * 7.0 + warp * 2.0) - 0.5));
    float methaneClouds = smoothstep(0.55, 0.78, streakNoise) * streakBand;

    // ───────────────────────────────────────────────────────────────────────
    // ROCKY TERRAIN GENERATION (Mars-like)
    // ───────────────────────────────────────────────────────────────────────
    float dichotomy = fbm3(sp * 1.4 + vec3(2.1, 0.7, 1.3));
    float terrA = fbm3(sp * 4.0);
    float terrB = fbm3(sp * 9.0 + vec3(7.3, 1.9, 4.2));
    float terrC = fbm3(sp * 18.0 + vec3(3.7, 2.5, 0.8));
    float craterField = fbm3(sp * 6.0) * fbm3(sp * 13.0); // crater-density mask

    float terrainSig = dichotomy * 0.28
                     + terrA * 0.30
                     + terrB * 0.22
                     + terrC * 0.10
                     + craterField * 0.10;
    terrainSig = clamp(terrainSig, 0.0, 1.0);

    // ───────────────────────────────────────────────────────────────────────
    // SURFACE PALETTE — 5-stop ramp (band → midBelt → zone → mid → high)
    // ───────────────────────────────────────────────────────────────────────
    float surfaceSig = mix(gasSig, terrainSig, uMottle);
    surfaceSig = clamp(surfaceSig, 0.0, 1.0);

    vec3 colBand    = uBandColor;
    vec3 colMidBelt = mix(uBandColor, uColorLit, 0.55);
    vec3 colZone    = uColorLit;
    vec3 colMid     = uColorMid;
    vec3 colHigh    = uColorHigh;

    // Dither the ramp with high-freq noise so band boundaries aren't razor-clean
    float rampNoise = (fbm3(sp * 22.0) - 0.5) * 0.09 + (fbm3(sp * 48.0) - 0.5) * 0.04;
    float rampSig = clamp(surfaceSig + rampNoise, 0.0, 1.0);

    float t1 = smoothstep(0.06, 0.24, rampSig);
    float t2 = smoothstep(0.24, 0.46, rampSig);
    float t3 = smoothstep(0.46, 0.68, rampSig);
    float t4 = smoothstep(0.68, 0.92, rampSig);

    vec3 surface = mix(colBand, colMidBelt, t1);
    surface = mix(surface, colZone, t2);
    surface = mix(surface, colMid,  t3);
    surface = mix(surface, colHigh, t4);

    // Subtle high-freq surface grain — breaks up flat shading without looking noisy
    float grain = 0.92 + 0.16 * fbm3(sp * 38.0 + vec3(1.1, 5.3, 2.7));
    surface *= grain;

    // Differential AO: darken valley/basin floors (low rampSig) on rocky bodies.
    float aoDarken = 1.0 - (1.0 - rampSig) * 0.20 * uMottle;
    surface *= aoDarken;

    // Methane cloud streaks (gas only)
    surface = mix(surface, uColorHigh, methaneClouds * (1.0 - uMottle) * 0.85);

    // ───────────────────────────────────────────────────────────────────────
    // REAL ALBEDO MAP — NASA-derived equirectangular blended over procedural.
    // Procedural ramp keeps the brand palette and animated detail; the map
    // brings recognizable large-scale geography (Syrtis Major, Hellas, GDS).
    // ───────────────────────────────────────────────────────────────────────
    {
        vec3 texCol = texture2D(uMap, vUv).rgb;
        // Match texture luminance into the palette's tonal range
        surface = mix(surface, texCol * mix(vec3(1.0), uColorMid / max(vec3(0.18), vec3(0.55)), 0.25), uMapMix);
    }

    // ───────────────────────────────────────────────────────────────────────
    // GAS GIANT FEATURE: Great Dark Spot vortex
    // ───────────────────────────────────────────────────────────────────────
    {
        float spotCenterLon = 0.6 + sin(uTime * 0.012) * 0.4;
        float dLat = (lat + 0.42);
        float dLon = lon - spotCenterLon;
        dLon = mod(dLon + 3.14159265, 6.28318530) - 3.14159265;
        float ellipse = sqrt(dLat * dLat * 14.0 + dLon * dLon * 2.0);
        ellipse += (fbm3(sp * 6.0) - 0.5) * 0.18;
        float spotMask = (1.0 - smoothstep(0.20, 0.55, ellipse));
        spotMask *= (1.0 - uMottle);  // gas only
        surface = mix(surface, uStormColor, spotMask * 0.85);
    }

    // ───────────────────────────────────────────────────────────────────────
    // ROCKY FEATURE: Polar ice / dust caps
    // ───────────────────────────────────────────────────────────────────────
    {
        float capEdge = fbm3(sp * 7.0 + vec3(0.0, 12.0, 0.0)) * 0.55
                      + fbm3(sp * 18.0 + vec3(3.3, 0.7, 9.1)) * 0.25
                      + fbm3(sp * 40.0 + vec3(6.2, 4.4, 1.8)) * 0.10;
        capEdge = capEdge / 0.90;
        float capMask = smoothstep(0.76, 0.94, absLat + (capEdge - 0.5) * 0.18);
        capMask *= uMottle;
        surface = mix(surface, uPolarCap, capMask);
    }

    // ───────────────────────────────────────────────────────────────────────
    // ROCKY FEATURE: Tharsis bulge / Olympus Mons
    // ───────────────────────────────────────────────────────────────────────
    {
        vec3  monsCenter = normalize(vec3(0.55, 0.30, 0.78));
        float monsDot = dot(sp, monsCenter);
        float monsNoise = (fbm3(sp * 11.0) - 0.5) * 0.10 + (fbm3(sp * 26.0) - 0.5) * 0.04;
        float mons = smoothstep(0.78, 0.96, monsDot + monsNoise) * uMottle;
        float calderaNoise = (fbm3(sp * 40.0) - 0.5) * 0.004;
        float caldera = smoothstep(0.985, 0.998, monsDot + calderaNoise) * uMottle;
        surface = mix(surface, uColorHigh * 1.05, mons * 0.45);
        surface = mix(surface, uBandColor, caldera * 0.65);
    }

    // ───────────────────────────────────────────────────────────────────────
    // ROCKY FEATURE: Valles Marineris canyon
    // ───────────────────────────────────────────────────────────────────────
    {
        vec3  canyonAxis = normalize(vec3(-1.0, -0.05, 0.15));
        float axisDot = dot(sp, canyonAxis);
        float perpDist = length(sp - canyonAxis * axisDot);
        float canyonBand = smoothstep(0.06, 0.0, perpDist - 0.0)
                         * smoothstep(-0.05, 0.55, axisDot)
                         * smoothstep(0.85, 0.50, axisDot);
        canyonBand *= 0.6 + 0.4 * fbm3(sp * 25.0);
        canyonBand *= uMottle;
        surface = mix(surface, uBandColor, canyonBand * 0.78);
    }

    // ───────────────────────────────────────────────────────────────────────
    // LIGHTING — wrapped diffuse, soft Lambert for gas
    // ───────────────────────────────────────────────────────────────────────
    float litGas   = smoothstep(-0.40, 0.60, lambert);
    float litRocky = smoothstep(-0.40, 0.55, lambert);
    float lit = mix(litGas, litRocky, uMottle);

    float diffGas   = max(0.0, lambert);
    float wrap      = max(0.0, (lambert + 0.45) / 1.45);
    float diffRocky = wrap * wrap;
    float diffuse   = mix(diffGas, diffRocky, uMottle);

    vec3 sunlit = surface * uSunColor * (0.08 + 0.92 * diffuse);

    float nightTint = mix(0.22, 0.08, uMottle);
    vec3 nightAmbient = uAtmoInner * surface * nightTint;

    float litBlend = smoothstep(0.0, 1.0, smoothstep(0.0, 1.0, lit));
    vec3 color = mix(nightAmbient, sunlit, litBlend);

    // ───────────────────────────────────────────────────────────────────────
    // VOLCANIC LAVA GLOW — sparse, dim, on rocky night side only
    // ───────────────────────────────────────────────────────────────────────
    float lavaMask = fbm3(sp * 8.5) * fbm3(sp * 4.0);
    float lavaGlow = smoothstep(0.34, 0.42, lavaMask) * (1.0 - lit) * uMottle;
    vec3  lavaColor = mix(vec3(1.0, 0.22, 0.04), vec3(1.0, 0.58, 0.10), fbm3(sp * 12.0));
    color += lavaColor * lavaGlow * 0.18;

    // ───────────────────────────────────────────────────────────────────────
    // ATMOSPHERIC SCATTERING — Rayleigh-style band at terminator
    // ───────────────────────────────────────────────────────────────────────
    float scatter = smoothstep(-0.22, 0.06, lambert) * (1.0 - smoothstep(0.06, 0.38, lambert));
    float scatterScale = mix(0.26, 0.05, uMottle);
    color += uColorAtmo * scatter * scatterScale;

    // ───────────────────────────────────────────────────────────────────────
    // LIMB BRIGHTENING (atmosphere viewed edge-on from the lit side)
    // ───────────────────────────────────────────────────────────────────────
    float limb = pow(1.0 - NdotV, 5.5);
    float limbScale = mix(0.10, 0.04, uMottle);
    color += uColorAtmo * limb * max(0.0, lit) * limbScale;

    // No specular — at orbital scale, no real planet produces a coherent highlight.

    gl_FragColor = vec4(color, 1.0);
}
`

// ─── ATMOSPHERE SHELL SHADER (Rayleigh limb haze) ────────────────────────
const atmoVertex = `
varying vec3 vNormalView;
varying vec3 vViewPosition;

void main() {
    vNormalView  = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mv.xyz;
    gl_Position = projectionMatrix * mv;
}
`

// Atmospheric limb haze — Rayleigh-tinted scatter ring with proper
// day/night asymmetry. The lit crescent is bright with the planet's
// scatter color; the dark side keeps a faint airglow ring.
const atmoFragment = `
uniform vec3  uAtmoInner;
uniform vec3  uAtmoOuter;
uniform vec3  uLightDirView;
uniform vec3  uSunColor;
uniform float uMottle;

varying vec3 vNormalView;
varying vec3 vViewPosition;

void main() {
    vec3 N = normalize(vNormalView);
    vec3 V = normalize(vViewPosition);

    // BackSide: -N outward, facing→1 near center, 0 at tangent rim.
    float facing = max(0.0, dot(-N, V));
    float rim    = pow(1.0 - facing, 5.0);   // tighter — only the very edge glows

    float sunDot = dot(N, normalize(uLightDirView));
    float litBias = clamp(0.08 + 0.92 * sunDot, 0.04, 1.0);

    vec3 color = mix(uAtmoInner, uAtmoOuter, smoothstep(0.0, 1.0, rim));
    color = mix(color, color * uSunColor, litBias * 0.35);

    // Rocky planets (Mars) have essentially no visible atmosphere from orbit.
    float atmoStrength = mix(1.0, 0.12, uMottle);
    float alpha = rim * 0.16 * litBias * atmoStrength;

    gl_FragColor = vec4(color, alpha);
}
`

// ─── CLOUD LAYER SHADER ──────────────────────────────────────────────────
// Separate slightly-larger sphere with procedural transparent clouds and
// very slow independent rotation. 3D noise — no UV seam. Lit by the same
// per-frame sun direction as the surface so the cloud shadows feel correct.
const cloudFragment = `
${NOISE_GLSL}

uniform vec3  uLightDirView;
uniform vec3  uSunColor;
uniform float uTime;
uniform float uCoverage;
uniform vec3  uStretch;
uniform float uOpacity;

varying vec3 vNormalLocal;
varying vec3 vNormalView;
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
    vec3 N = normalize(vNormalView);
    vec3 L = normalize(uLightDirView);
    vec3 V = normalize(vViewPosition);

    vec3 sp = vNormalLocal * uStretch;
    float n  = fbm3(sp * 2.6 + vec3(uTime * 0.0030, 0.0, uTime * 0.0016));
    float n2 = fbm3(sp * 6.2 + vec3(13.1, 7.7, 3.3) + vec3(uTime * 0.0018, 0.0, 0.0));
    float sig = n * 0.72 + n2 * 0.28;

    float clouds = smoothstep(1.0 - uCoverage - 0.16, 1.0 - uCoverage + 0.20, sig);

    float lambert = dot(N, L);
    float wrap = max(0.0, (lambert + 0.40) / 1.40);
    float diffuse = wrap * wrap;

    // Thin haze at the limb reads as atmosphere depth, not a hard shell
    float rim = pow(1.0 - max(0.0, dot(N, V)), 2.0);

    vec3 color = uSunColor * (0.22 + 0.85 * diffuse);
    float alpha = clouds * (0.06 + 0.70 * diffuse) * (1.0 - rim * 0.45) * uOpacity;

    gl_FragColor = vec4(color, alpha);
}
`

// ─── PLANETARY RING SHADER ───────────────────────────────────────────────
// Flat annulus with procedural band structure, lit-side shading and an
// analytic planet shadow (the ring darkens where the planet blocks the sun).
const ringVertex = `
varying vec3 vPosObj;
void main() {
    vPosObj = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const ringFragment = `
${NOISE_GLSL}

uniform vec3  uLightDirObj;   // direction toward the sun, ring-local space
uniform vec3  uColor;
uniform float uInner;
uniform float uOuter;
uniform float uPlanetR;
uniform float uOpacity;

varying vec3 vPosObj;

void main() {
    float r = length(vPosObj.xy);
    float t = clamp((r - uInner) / (uOuter - uInner), 0.0, 1.0);

    // Band structure — narrow rings with gaps, like backlit ice debris
    float bands = vnoise(vec2(t * 26.0, 0.5)) * 0.55 + vnoise(vec2(t * 9.0, 7.3)) * 0.45;
    float density = smoothstep(0.30, 0.75, bands);

    // Radial profile: fade in from inner gap, out toward the edge
    float profile = smoothstep(0.0, 0.10, t) * (1.0 - smoothstep(0.78, 1.0, t));

    // Planet shadow: point is shadowed when it sits behind the planet
    // relative to the sun and within the planet's silhouette.
    float along = dot(vPosObj, uLightDirObj);
    vec3  perp  = vPosObj - uLightDirObj * along;
    float inShadow = (1.0 - smoothstep(uPlanetR * 0.85, uPlanetR * 1.25, length(perp)))
                   * smoothstep(0.0, 0.5, -along / uPlanetR);

    float light = 0.55 + 0.45 * abs(uLightDirObj.z);
    vec3 color = uColor * light * (1.0 - inShadow * 0.85);
    float alpha = density * profile * uOpacity * (1.0 - inShadow * 0.6);

    gl_FragColor = vec4(color, alpha);
}
`

// ─── MOON SURFACE SHADER ─────────────────────────────────────────────────
const moonVertex = planetVertex
// Physically-based moon: Minnaert k=0.70 (measured lunar regolith value),
// four-scale crater albedo (basins/craters/pits/grain), dark floors, bright
// rims, ejecta ray systems, highland/maria color differentiation, real CC0
// lunar albedo map blended in, analytic eclipse term (parent planet shadow),
// and scroll-driven activation glow for the skills tour.
const moonFragment = `
${NOISE_GLSL}

uniform vec3  uLightDirView;
uniform vec3  uColorLit;
uniform vec3  uPlanetshineColor;
uniform float uPlanetshineStrength;
uniform float uEclipse;     // 1 = fully inside parent planet's shadow
uniform float uActive;      // scroll-driven skill highlight
uniform sampler2D uMap;
uniform float uMapMix;
uniform float uUvShift;     // per-moon longitude offset into shared map

varying vec3 vNormalLocal;
varying vec3 vNormalView;
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
    vec3 N = normalize(vNormalView);
    vec3 L = normalize(uLightDirView);
    vec3 V = normalize(vViewPosition);

    float NdotL = max(0.0, dot(N, L));
    float NdotV = max(0.04, abs(dot(N, V)));

    // Minnaert k=0.70 — real lunar regolith value.
    float k = 0.70;
    float minnaert = pow(NdotL + 0.0001, k) * pow(NdotV, k - 1.0);

    float terminator = smoothstep(-0.02, 0.06, dot(N, L));
    float totalLight = clamp(minnaert * terminator, 0.0, 2.0);

    // Parent planet eclipse — the moon passes through the planet's shadow
    totalLight *= (1.0 - uEclipse * 0.92);

    // ── FOUR-SCALE CRATER ALBEDO (3D seamless) ────────────────────────────
    vec3 sp = vNormalLocal;
    float basin  = vnoise3(sp * 2.2);
    float crater = vnoise3(sp * 5.8  + vec3(3.17, 1.41, 2.73));
    float pits   = vnoise3(sp * 14.0 + vec3(0.83, 2.97, 1.54));
    float grain  = vnoise3(sp * 30.0 + vec3(1.57, 0.61, 3.21));

    float mariaT    = 1.0 - smoothstep(0.28, 0.55, basin);
    float mariaDark = mix(1.0, 0.22, mariaT);

    float floorMask   = smoothstep(0.12, 0.36, crater) * (1.0 - smoothstep(0.68, 0.88, crater));
    float craterFloor = 1.0 - floorMask * 0.62;

    float rimT      = smoothstep(0.62, 0.76, crater) * (1.0 - smoothstep(0.76, 0.92, crater));
    float rimBright = 1.0 + rimT * 1.5;

    float rays = step(0.82, crater) * step(0.78, pits) * 1.6;

    float albedoRaw = basin * 0.28 + crater * 0.38 + pits * 0.22 + grain * 0.12;
    float albedo    = clamp(albedoRaw * mariaDark * craterFloor * rimBright, 0.0, 1.0);
    albedo = mix(0.08, 0.88, albedo);
    albedo += rays * 0.22;

    // ── SURFACE COLOR ─────────────────────────────────────────────────────
    vec3 highland = vec3(0.74, 0.70, 0.61);
    vec3 maria    = vec3(0.36, 0.37, 0.44);
    vec3 moonBase = mix(maria, highland, smoothstep(0.28, 0.62, basin));

    // 72% physically accurate lunar gray, 28% tech brand color
    vec3 baseColor = mix(uColorLit, moonBase, 0.72);

    vec3 surface = baseColor * albedo;

    // Real lunar albedo map — shifted in longitude per moon so the twelve
    // moons sharing one texture don't read as identical clones.
    {
        vec2 uvShifted = vec2(fract(vUv.x + uUvShift), vUv.y);
        vec3 texCol = texture2D(uMap, uvShifted).rgb;
        surface = mix(surface, baseColor * texCol * 1.35, uMapMix);
    }

    vec3 color = surface * totalLight;

    // Minimal ambient — starlight only, no atmosphere
    color += surface * 0.016;

    // Planetshine: colored fill light from parent planet on night side
    float facingPlanet = pow(max(0.0, 0.40 - NdotL), 2.5);
    float nightMask    = 1.0 - smoothstep(0.0, 0.18, NdotL);
    color += uPlanetshineColor * uPlanetshineStrength * facingPlanet * nightMask * 0.65;

    // Skill activation: gentle self-illumination in the moon's brand color
    color += uColorLit * uActive * (0.16 + albedo * 0.22);
    color *= 1.0 + uActive * 0.22;

    gl_FragColor = vec4(color, 1.0);
}
`

// ─── Moon ────────────────────────────────────────────────────────────────
function Moon({
    data,
    timeOffset,
    parentSize,
    parentAtmo,
    globalIndex,
    quality,
}: {
    data: TechNode
    timeOffset: number
    parentSize: number
    parentAtmo: THREE.Color
    globalIndex: number
    quality: 'high' | 'low'
}) {
    const groupRef = useRef<THREE.Group>(null)
    const meshRef = useRef<THREE.Mesh>(null)
    const matRef = useRef<THREE.ShaderMaterial>(null)
    const labelRef = useRef<HTMLDivElement>(null)
    const angleRef = useRef(timeOffset)
    const activeRef = useRef(0)
    const segments = quality === 'high' ? 24 : 16
    const _viewMat3 = useRef(new THREE.Matrix3())
    const _lightView = useRef(new THREE.Vector3())
    const _moonWorld = useRef(new THREE.Vector3())
    const _planetWorld = useRef(new THREE.Vector3())
    const _shadowDir = useRef(new THREE.Vector3())
    const _rel = useRef(new THREE.Vector3())

    const planetshineStrength = parentSize > 0
        ? Math.min(0.18, 0.18 * (parentSize * 2.5) / Math.max(0.5, data.orbitRadius))
        : 0

    const uniforms = useMemo(() => ({
        uLightDirView:        { value: INITIAL_LIGHT_DIR.clone() },
        uColorLit:            { value: new THREE.Color(data.color) },
        uPlanetshineColor:    { value: parentAtmo.clone() },
        uPlanetshineStrength: { value: planetshineStrength },
        uEclipse:             { value: 0 },
        uActive:              { value: 0 },
        uMap:                 { value: placeholderTexture() },
        uMapMix:              { value: 0 },
        uUvShift:             { value: (globalIndex * 0.27) % 1 },
    }), [data.color, parentAtmo, planetshineStrength, globalIndex])

    // Shared lunar albedo map — loaded once, applied to every moon.
    useEffect(() => {
        let cancelled = false
        loadSharedTexture(MOON_TEXTURE_URL)
            .then((tex) => {
                if (cancelled) return
                uniforms.uMap.value = tex
                uniforms.uMapMix.value = MOON_TEXTURE_MIX
            })
            .catch(() => { /* procedural fallback */ })
        return () => { cancelled = true }
    }, [uniforms])

    // Orbit ring removed — colored orbit lines are not physically realistic

    useFrame((state, delta) => {
        if (!groupRef.current || !meshRef.current) return
        angleRef.current += delta * data.orbitSpeed * MOON_SPEED_SCALE
        const a = angleRef.current
        groupRef.current.position.set(Math.cos(a) * data.orbitRadius, 0, Math.sin(a) * data.orbitRadius)
        meshRef.current.rotation.y += delta * 0.05

        // Light direction: sun (world origin) → moon world position,
        // transformed to view space so each moon is lit from the correct angle.
        groupRef.current.getWorldPosition(_moonWorld.current)
        _lightView.current.subVectors(SUN_WORLD_POS, _moonWorld.current).normalize()
        _viewMat3.current.setFromMatrix4(state.camera.matrixWorldInverse)
        _lightView.current.applyMatrix3(_viewMat3.current).normalize()

        // Eclipse: is the moon inside the parent planet's shadow cylinder?
        let eclipse = 0
        const planetGroup = groupRef.current.parent
        if (planetGroup) {
            planetGroup.getWorldPosition(_planetWorld.current)
            // Shadow axis points from the sun through the planet, outward
            _shadowDir.current.copy(_planetWorld.current).sub(SUN_WORLD_POS).normalize()
            _rel.current.copy(_moonWorld.current).sub(_planetWorld.current)
            const along = _rel.current.dot(_shadowDir.current)
            if (along > 0) {
                const perp = _rel.current.addScaledVector(_shadowDir.current, -along).length()
                const soft = THREE.MathUtils.smoothstep(perp, parentSize * 1.25, parentSize * 0.8)
                eclipse = soft * THREE.MathUtils.smoothstep(along, 0, parentSize * 0.6)
            }
        }

        // Skill activation: during the projects section, moons take turns
        // "lighting up" as the user scrolls — one skill at a time.
        const pp = scrollState.sections.projects
        const sectionOn = Math.min(1, sectionInfluence(pp) * 2.2)
        const within = THREE.MathUtils.clamp((pp - 0.12) / 0.76, 0, 1)
        const f = within * TOTAL_MOONS
        const proximity = THREE.MathUtils.clamp(1.5 - Math.abs(f - (globalIndex + 0.5)), 0, 1)
        const target = proximity * sectionOn
        activeRef.current = THREE.MathUtils.damp(activeRef.current, target, 4, delta)
        const active = activeRef.current

        // Modest scale-up while active
        meshRef.current.scale.setScalar(1 + active * 0.22)

        if (matRef.current) {
            matRef.current.uniforms.uLightDirView.value.copy(_lightView.current)
            matRef.current.uniforms.uEclipse.value = eclipse
            matRef.current.uniforms.uActive.value = active
        }

        if (labelRef.current) {
            labelRef.current.style.opacity = String(0.38 + active * 0.62)
        }
    })

    return (
        <group>
            <group ref={groupRef}>
                <mesh ref={meshRef}>
                    <sphereGeometry args={[data.size, segments, segments]} />
                    <shaderMaterial
                        ref={matRef}
                        vertexShader={moonVertex}
                        fragmentShader={moonFragment}
                        uniforms={uniforms}
                    />
                </mesh>

                {/* Skill label — dim by default, full strength when active */}
                <Html
                    position={[0, data.size + 0.45, 0]}
                    center
                    distanceFactor={12}
                    zIndexRange={[100, 0]}
                    style={{ pointerEvents: 'none' }}
                >
                    <div ref={labelRef} style={{ opacity: 0.38, transition: 'opacity 0.2s linear' }}>
                        <MoonLabel name={data.name} accent={`#${parentAtmo.getHexString()}`} />
                    </div>
                </Html>
            </group>
        </group>
    )
}

function MoonLabel({ name, accent }: { name: string; accent: string }) {
    return (
        <div
            style={{
                fontFamily: 'var(--font-instrument), ui-monospace, monospace',
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(220, 230, 255, 0.75)',
                padding: '4px 10px',
                borderRadius: '999px',
                background: 'rgba(6, 8, 14, 0.72)',
                border: `1px solid ${accent}40`,
                whiteSpace: 'nowrap',
            }}
        >
            {name}
        </div>
    )
}

// ─── Planet ──────────────────────────────────────────────────────────────
function Planet({
    data,
    timeOffset = 0,
    quality,
}: {
    data: TechNode
    timeOffset?: number
    quality: 'high' | 'low'
}) {
    const groupRef = useRef<THREE.Group>(null)
    const planetRef = useRef<THREE.Mesh>(null)
    const cloudRef = useRef<THREE.Mesh>(null)
    const planetMatRef = useRef<THREE.ShaderMaterial>(null)
    const atmoMatRef = useRef<THREE.ShaderMaterial>(null)
    const cloudMatRef = useRef<THREE.ShaderMaterial>(null)
    const ringMatRef = useRef<THREE.ShaderMaterial>(null)
    const ringMeshRef = useRef<THREE.Mesh>(null)
    const angleRef = useRef(timeOffset)
    const mapMixTarget = useRef(0)

    const identity = PLANET_IDENTITY[data.id] ?? PLANET_IDENTITY.frontend
    const segments = quality === 'high' ? 48 : 28
    const _viewMat3 = useRef(new THREE.Matrix3())
    const _lightView = useRef(new THREE.Vector3())
    const _worldPos = useRef(new THREE.Vector3())
    const _ringQuat = useRef(new THREE.Quaternion())
    const _lightObj = useRef(new THREE.Vector3())

    const planetUniforms = useMemo(() => ({
        uLightDirView: { value: INITIAL_LIGHT_DIR.clone() },
        uSunColor:     { value: SUN_COLOR.clone() },
        uBandColor:    { value: identity.bandColor.clone() },
        uColorLit:     { value: identity.colorZone.clone() },
        uColorMid:     { value: identity.colorMid.clone() },
        uColorHigh:    { value: identity.colorHigh.clone() },
        uColorAtmo:    { value: identity.atmoOuter.clone() },
        uAtmoInner:    { value: identity.atmoInner.clone() },
        uPolarCap:     { value: identity.polarCap.clone() },
        uStormColor:   { value: identity.stormColor.clone() },
        uMottle:       { value: identity.mottle },
        uTime:         { value: 0 },
        uMap:          { value: placeholderTexture() },
        uMapMix:       { value: 0 },
    }), [identity])

    const atmoUniforms = useMemo(() => ({
        uAtmoInner:    { value: identity.atmoInner.clone() },
        uAtmoOuter:    { value: identity.atmoOuter.clone() },
        uLightDirView: { value: INITIAL_LIGHT_DIR.clone() },
        uSunColor:     { value: SUN_COLOR.clone() },
        uMottle:       { value: identity.mottle },
    }), [identity])

    const cloudUniforms = useMemo(() => ({
        uLightDirView: { value: INITIAL_LIGHT_DIR.clone() },
        uSunColor:     { value: SUN_COLOR.clone() },
        uTime:         { value: 0 },
        uCoverage:     { value: identity.cloudCoverage },
        uStretch:      { value: new THREE.Vector3(...identity.cloudStretch) },
        uOpacity:      { value: identity.cloudOpacity },
    }), [identity])

    const ringInner = data.size * 1.45
    const ringOuter = data.size * 2.35
    const ringUniforms = useMemo(() => ({
        uLightDirObj: { value: INITIAL_LIGHT_DIR.clone() },
        uColor:       { value: identity.atmoOuter.clone().multiplyScalar(0.85) },
        uInner:       { value: ringInner },
        uOuter:       { value: ringOuter },
        uPlanetR:     { value: data.size },
        uOpacity:     { value: 0.30 },
    }), [identity, ringInner, ringOuter, data.size])

    // Real albedo map — fades in over a few seconds once loaded; if the
    // fetch fails the planet simply stays fully procedural.
    useEffect(() => {
        let cancelled = false
        loadSharedTexture(identity.textureUrl)
            .then((tex) => {
                if (cancelled) return
                planetUniforms.uMap.value = tex
                mapMixTarget.current = identity.textureMix
            })
            .catch(() => { /* procedural fallback */ })
        return () => { cancelled = true }
    }, [identity, planetUniforms])

    useFrame((state, delta) => {
        if (!groupRef.current) return
        angleRef.current += delta * data.orbitSpeed * PLANET_SPEED_SCALE
        const a = angleRef.current
        groupRef.current.position.set(Math.cos(a) * data.orbitRadius, 0, Math.sin(a) * data.orbitRadius)

        // Slow, continuous self-rotation; clouds drift independently
        if (planetRef.current) planetRef.current.rotation.y += delta * 0.04
        if (cloudRef.current) cloudRef.current.rotation.y += delta * 0.052

        const t = state.clock.getElapsedTime()
        if (planetMatRef.current) {
            planetMatRef.current.uniforms.uTime.value = t
            // Ease the loaded texture in instead of popping
            const u = planetMatRef.current.uniforms.uMapMix
            u.value = THREE.MathUtils.damp(u.value, mapMixTarget.current, 0.8, delta)
        }
        if (cloudMatRef.current) cloudMatRef.current.uniforms.uTime.value = t

        // Publish world position for the camera director (projects tour)
        groupRef.current.getWorldPosition(_worldPos.current)
        if (data.id === 'frontend' || data.id === 'backend') {
            scrollState.anchors[data.id].copy(_worldPos.current)
        }

        // Light direction: sun (world origin) → planet world position.
        _lightView.current.subVectors(SUN_WORLD_POS, _worldPos.current).normalize()
        const lightWorld = _lightView.current
        if (ringMeshRef.current && ringMatRef.current) {
            // Sun direction in the ring's local frame, for the shadow term
            ringMeshRef.current.getWorldQuaternion(_ringQuat.current)
            _lightObj.current.copy(lightWorld).applyQuaternion(_ringQuat.current.invert()).normalize()
            ringMatRef.current.uniforms.uLightDirObj.value.copy(_lightObj.current)
        }
        _viewMat3.current.setFromMatrix4(state.camera.matrixWorldInverse)
        _lightView.current.applyMatrix3(_viewMat3.current).normalize()
        if (planetMatRef.current) planetMatRef.current.uniforms.uLightDirView.value.copy(_lightView.current)
        if (atmoMatRef.current)   atmoMatRef.current.uniforms.uLightDirView.value.copy(_lightView.current)
        if (cloudMatRef.current)  cloudMatRef.current.uniforms.uLightDirView.value.copy(_lightView.current)
    })

    return (
        <group>
            <group ref={groupRef}>
                {/* Atmosphere shell — airglow limb haze, 1.06× planet size */}
                <mesh scale={[1.06, 1.06, 1.06]}>
                    <sphereGeometry args={[data.size, segments, segments]} />
                    <shaderMaterial
                        ref={atmoMatRef}
                        vertexShader={atmoVertex}
                        fragmentShader={atmoFragment}
                        uniforms={atmoUniforms}
                        transparent
                        depthWrite={false}
                        side={THREE.BackSide}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>

                {/* Planet surface */}
                <mesh ref={planetRef}>
                    <sphereGeometry args={[data.size, segments, segments]} />
                    <shaderMaterial
                        ref={planetMatRef}
                        vertexShader={planetVertex}
                        fragmentShader={planetFragment}
                        uniforms={planetUniforms}
                    />
                </mesh>

                {/* Cloud deck — transparent, very slow independent rotation */}
                <mesh ref={cloudRef} scale={[1.035, 1.035, 1.035]}>
                    <sphereGeometry args={[data.size, segments, segments]} />
                    <shaderMaterial
                        ref={cloudMatRef}
                        vertexShader={planetVertex}
                        fragmentShader={cloudFragment}
                        uniforms={cloudUniforms}
                        transparent
                        depthWrite={false}
                    />
                </mesh>

                {/* Debris ring — gas giant only, gently tilted */}
                {identity.hasRing && (
                    <mesh ref={ringMeshRef} rotation={[-Math.PI / 2 + 0.22, 0, 0.08]}>
                        <ringGeometry args={[ringInner, ringOuter, 96, 1]} />
                        <shaderMaterial
                            ref={ringMatRef}
                            vertexShader={ringVertex}
                            fragmentShader={ringFragment}
                            uniforms={ringUniforms}
                            transparent
                            depthWrite={false}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                )}

                {/* Editorial planet readout */}
                <Html
                    position={[0, data.size + 0.85, 0]}
                    center
                    distanceFactor={16}
                    style={{ pointerEvents: 'none' }}
                >
                    <PlanetLabel name={data.name} accent={identity.accent} />
                </Html>

                {/* Moons orbit relative to this planet's local frame */}
                {data.moons?.map((moon, i) => (
                    <Moon
                        key={moon.id}
                        data={moon}
                        timeOffset={i * (Math.PI / 2)}
                        parentSize={data.size}
                        parentAtmo={identity.atmoOuter}
                        globalIndex={(data.id === 'backend' ? (PLANETS_ORBITING_SUN[0].moons?.length ?? 0) : 0) + i}
                        quality={quality}
                    />
                ))}
            </group>
        </group>
    )
}

function PlanetLabel({ name }: { name: string; accent: string }) {
    return (
        <div
            style={{
                fontFamily: 'var(--font-instrument), ui-monospace, monospace',
                fontSize: '9px',
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.82)',
                padding: '4px 10px 3px',
                background: 'rgba(3,5,10,0.78)',
                borderTop: '1px solid rgba(255,255,255,0.18)',
                whiteSpace: 'nowrap',
            }}
        >
            {name}
        </div>
    )
}

// ─── STAR SURFACE SHADER ─────────────────────────────────────────────────
// Photoreal G-type stellar surface: Eddington limb darkening, 3-octave
// granulation (drifting convection cells), sunspots, bright plage regions,
// slow stellar pulsation. HDR output crosses the bloom threshold so the
// disk glows; uBoost lets the About section intensify "the core" subtly.
const starFragment = `
${NOISE_GLSL}

uniform float uTime;
uniform float uBoost;      // scroll-driven intensity (About section)
uniform vec3  uColorHot;   // hot core (near-white)
uniform vec3  uColorMid;   // mid photosphere
uniform vec3  uColorEdge;  // cooler limb

varying vec3 vNormalLocal;
varying vec3 vNormalView;
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
    vec3 N = normalize(vNormalView);
    vec3 V = normalize(vViewPosition);
    float NdotV = max(0.0, dot(N, V));

    // Eddington limb darkening (real stellar physics: u ~ 0.5)
    float limb = pow(NdotV, 0.55);

    // Three-octave granulation — drifting convection cells.
    vec3 sp = vNormalLocal;
    float t = uTime;
    float gran1 = fbm3(sp * 3.5  + vec3(t * 0.022, 0.013 * t, t * 0.018));
    float gran2 = fbm3(sp * 8.5  + vec3(0.011 * t, t * 0.035, 0.0));
    float gran3 = fbm3(sp * 20.0 + vec3(t * 0.05, 0.0, t * 0.04));
    float granulation = gran1 * 0.55 + gran2 * 0.30 + gran3 * 0.15;

    // Sunspots — dark patches from low-freq noise (rare, ~12% of disk)
    float spotMask = smoothstep(0.70, 0.84, gran1);

    // Bright plage — hot, plage-like inverse of spots
    float plageMask = smoothstep(0.22, 0.06, gran1);

    vec3 hotMix = mix(uColorMid, uColorHot, smoothstep(0.30, 0.85, granulation));
    vec3 surfaceColor = mix(uColorEdge, hotMix, limb);

    surfaceColor *= mix(1.0, 0.32, spotMask);
    surfaceColor += uColorHot * plageMask * 0.40;

    // HDR lift — push brightest parts past bloom threshold (1.0)
    surfaceColor *= 1.55 * uBoost;

    // Slow two-mode stellar oscillation — gentle, never a flicker
    float pulse = 1.0 + sin(uTime * 0.30) * 0.025 + sin(uTime * 0.85) * 0.010;
    surfaceColor *= pulse;

    gl_FragColor = vec4(surfaceColor, 1.0);
}
`

// ─── Central star ────────────────────────────────────────────────────────
function CentralStar({ quality }: { quality: 'high' | 'low' }) {
    const starMatRef = useRef<THREE.ShaderMaterial>(null)
    const coronaRef = useRef<THREE.Sprite>(null)

    // Warm G-type photosphere (~5800K) — the way the sun actually photographs
    const starUniforms = useMemo(() => ({
        uTime:      { value: 0 },
        uBoost:     { value: 1 },
        uColorHot:  { value: new THREE.Color('#FFF7E8') },  // near-white core
        uColorMid:  { value: new THREE.Color('#FFD9A0') },  // golden photosphere
        uColorEdge: { value: new THREE.Color('#C26A2B') },  // cooler amber limb
    }), [])

    const coronaTexture = useMemo(() => {
        const size = 256
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')!
        const grad = ctx.createRadialGradient(size / 2, size / 2, size * 0.12, size / 2, size / 2, size / 2)
        grad.addColorStop(0, 'rgba(255, 236, 200, 0.55)')
        grad.addColorStop(0.35, 'rgba(255, 206, 140, 0.16)')
        grad.addColorStop(0.75, 'rgba(255, 180, 110, 0.04)')
        grad.addColorStop(1, 'rgba(255, 180, 110, 0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, size, size)
        const tex = new THREE.CanvasTexture(canvas)
        tex.needsUpdate = true
        return tex
    }, [])

    useFrame((state) => {
        const boost = 1 + sectionInfluence(scrollState.sections.about) * 0.22
        if (starMatRef.current) {
            starMatRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
            starMatRef.current.uniforms.uBoost.value = boost
        }
        if (coronaRef.current) {
            ;(coronaRef.current.material as THREE.SpriteMaterial).opacity = 0.34 * boost
        }
    })

    return (
        <group>
            {/* Star surface — high-resolution sphere so granulation reads clean */}
            <mesh>
                <sphereGeometry args={[2, 96, 96]} />
                <shaderMaterial
                    ref={starMatRef}
                    vertexShader={planetVertex}
                    fragmentShader={starFragment}
                    uniforms={starUniforms}
                    toneMapped={false}
                />
            </mesh>

            {/* Soft static corona haze around the disk */}
            <sprite ref={coronaRef} scale={[8.5, 8.5, 1]}>
                <spriteMaterial
                    map={coronaTexture}
                    transparent
                    opacity={0.34}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </sprite>

            {/* Primary light — warm, physically-correct falloff. Reaches the
                asteroid belt and both planets for the standard materials. */}
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
        </group>
    )
}

// ─── Public component ───────────────────────────────────────────────────
export function OrbitalSystem({ quality = 'high' }: { quality?: 'high' | 'low' }) {
    const groupRef = useRef<THREE.Group>(null)

    // Ambient system drift — one full revolution ≈ 13 minutes. Slow enough
    // to feel like a long-exposure timelapse, present enough to feel alive.
    useFrame((_, delta) => {
        if (groupRef.current && !scrollState.reducedMotion) {
            groupRef.current.rotation.y += delta * SYSTEM_DRIFT_SPEED
        }
    })

    return (
        <group ref={groupRef}>
            <CentralStar quality={quality} />

            {PLANETS_ORBITING_SUN.map((planet, i) => (
                <Planet
                    key={planet.id}
                    data={planet}
                    timeOffset={i * Math.PI}
                    quality={quality}
                />
            ))}
        </group>
    )
}
