'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

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

const PLANETS_ORBITING_SUN: TechNode[] = [
    {
        id: 'frontend',
        name: 'Frontend',
        color: '#3D5E9C',
        type: 'planet',
        orbitRadius: 8,
        orbitSpeed: 0.4,
        size: 1.2,
        description: 'UI/UX & Creative',
        proficiency: 'Expert',
        experience: 'Focus',
        moons: [
            { id: 'react',   name: 'React.js',    color: '#61DBFB', type: 'moon', orbitRadius: 2.5, orbitSpeed: 1.2, size: 0.30, description: '', proficiency: '', experience: '' },
            { id: 'ts',      name: 'TypeScript',  color: '#3178C6', type: 'moon', orbitRadius: 3.3, orbitSpeed: 1.05, size: 0.25, description: '', proficiency: '', experience: '' },
            { id: 'js',      name: 'JavaScript',  color: '#F7DF1E', type: 'moon', orbitRadius: 4.1, orbitSpeed: 0.9, size: 0.25, description: '', proficiency: '', experience: '' },
            { id: 'htmlcss', name: 'HTML / CSS',  color: '#E34F26', type: 'moon', orbitRadius: 5.0, orbitSpeed: 0.75, size: 0.25, description: '', proficiency: '', experience: '' },
            { id: 'blender', name: 'Blender',     color: '#F5792A', type: 'moon', orbitRadius: 5.9, orbitSpeed: 0.65, size: 0.28, description: '', proficiency: '', experience: '' },
        ],
    },
    {
        id: 'backend',
        name: 'Backend',
        color: '#A0421C',
        type: 'planet',
        orbitRadius: 16,
        orbitSpeed: 0.25,
        size: 1.4,
        description: 'Systems & Logic',
        proficiency: 'Expert',
        experience: 'Focus',
        moons: [
            { id: 'python',  name: 'Python',   color: '#3776AB', type: 'moon', orbitRadius: 3.0, orbitSpeed: 1.1, size: 0.30, description: '', proficiency: '', experience: '' },
            { id: 'nodejs',  name: 'Node.js',  color: '#68A063', type: 'moon', orbitRadius: 3.9, orbitSpeed: 0.95, size: 0.28, description: '', proficiency: '', experience: '' },
            { id: 'cpp',     name: 'C++',      color: '#00599C', type: 'moon', orbitRadius: 4.8, orbitSpeed: 0.82, size: 0.28, description: '', proficiency: '', experience: '' },
            { id: 'java',    name: 'Java',     color: '#5382A1', type: 'moon', orbitRadius: 5.7, orbitSpeed: 0.72, size: 0.28, description: '', proficiency: '', experience: '' },
            { id: 'mysql',   name: 'MySQL',    color: '#4479A1', type: 'moon', orbitRadius: 6.6, orbitSpeed: 0.63, size: 0.24, description: '', proficiency: '', experience: '' },
            { id: 'rails',   name: 'Rails',    color: '#CC0000', type: 'moon', orbitRadius: 6.9, orbitSpeed: 0.62, size: 0.24, description: '', proficiency: '', experience: '' },
            { id: 'ros',     name: 'ROS',      color: '#22314E', type: 'moon', orbitRadius: 7.4, orbitSpeed: 0.58, size: 0.20, description: '', proficiency: '', experience: '' },
        ],
    },
]

// Per-planet visual identity. NASA/Voyager/HiRISE-calibrated palettes drive a
// 5-stop palette ramp + planet-specific surface features (Great Dark Spot,
// Olympus Mons, polar caps, Valles Marineris).
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
    },
}

// The sun (central star) sits at world origin. Each planet/moon computes its
// own light direction every frame as (sunWorldPos - meshWorldPos), then
// transforms to view space — so the lit hemisphere actually faces the sun
// based on orbital position, not a fixed scene direction.
const SUN_WORLD_POS = new THREE.Vector3(0, 0, 0)
// Warm white-yellow tint of light reaching planets (G-type ~5800K).
const SUN_COLOR = new THREE.Color('#FFF4E0')
// Initial uniform fallback before first useFrame fires.
const INITIAL_LIGHT_DIR = new THREE.Vector3(-0.7, 0.55, 0.45).normalize()

// ─── Shared GLSL helpers ─────────────────────────────────────────────────
const NOISE_GLSL = `
float hash21(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}
float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
    return vnoise(p)        * 0.500
         + vnoise(p * 2.03) * 0.250
         + vnoise(p * 4.11) * 0.125
         + vnoise(p * 8.17) * 0.063;
}

// 3D value noise — seamless on sphere surface (no UV seam / pole pinch artifacts)
float hash31(vec3 p) {
    p = fract(p * vec3(127.1, 311.7, 74.7));
    p += dot(p, p.yzx + 45.32);
    return fract((p.x + p.y) * p.z);
}
float vnoise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(mix(hash31(i),               hash31(i + vec3(1,0,0)), u.x),
            mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), u.x), u.y),
        mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), u.x),
            mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), u.x), u.y),
        u.z
    );
}
float fbm3(vec3 p) {
    return vnoise3(p)        * 0.500
         + vnoise3(p * 2.03) * 0.250
         + vnoise3(p * 4.11) * 0.125
         + vnoise3(p * 8.17) * 0.063;
}
`

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
// Oren-Nayar diffuse for rough rocky surfaces, broader Rayleigh scattering,
// and warm sun-color tint on the lit hemisphere.
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

varying vec3 vNormalLocal;
varying vec3 vNormalView;
varying vec3 vViewPosition;
varying vec2 vUv;

// Oren-Nayar diffuse — rough surfaces (regolith, dust) reflect more uniformly
// than Lambert predicts. Matches photographs of Mars / Moon at all phases.
float orenNayar(vec3 L, vec3 N, vec3 V, float roughness) {
    float NdotL = max(0.0, dot(N, L));
    float NdotV = max(0.0, dot(N, V));
    if (NdotL <= 0.0) return 0.0;
    float s2 = roughness * roughness;
    float A = 1.0 - 0.5 * s2 / (s2 + 0.33);
    float B = 0.45 * s2 / (s2 + 0.09);
    vec3 Lp = normalize(L - N * NdotL);
    vec3 Vp = normalize(V - N * NdotV);
    float cosPhi = max(0.0, dot(Lp, Vp));
    float sinAlpha = sqrt(1.0 - NdotV * NdotV);
    float tanBeta  = sqrt(1.0 - NdotL * NdotL) / max(NdotL, 0.001);
    return NdotL * (A + B * cosPhi * sinAlpha * tanBeta);
}

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
    // Three-frequency latitude warping — turbulence at multiple scales.
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
    // Hemispheric dichotomy — large-scale north/south asymmetry like Mars.
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
    // Mimics the dark regolith pooling in crater floors and canyon depths.
    float aoDarken = 1.0 - (1.0 - rampSig) * 0.20 * uMottle;
    surface *= aoDarken;

    // Methane cloud streaks (gas only)
    surface = mix(surface, uColorHigh, methaneClouds * (1.0 - uMottle) * 0.85);

    // ───────────────────────────────────────────────────────────────────────
    // GAS GIANT FEATURE: Great Dark Spot vortex
    // ───────────────────────────────────────────────────────────────────────
    // Anticyclonic dark vortex at lat ≈ -0.42, drifting slowly in longitude.
    {
        float spotCenterLon = 0.6 + sin(uTime * 0.012) * 0.4;
        float dLat = (lat + 0.42);
        float dLon = lon - spotCenterLon;
        // wrap longitude to [-π, π]
        dLon = mod(dLon + 3.14159265, 6.28318530) - 3.14159265;
        // ellipse: wider in longitude than latitude
        float ellipse = sqrt(dLat * dLat * 14.0 + dLon * dLon * 2.0);
        // distort the spot edge with noise so it's not a perfect ellipse
        ellipse += (fbm3(sp * 6.0) - 0.5) * 0.18;
        float spotMask = (1.0 - smoothstep(0.20, 0.55, ellipse));
        spotMask *= (1.0 - uMottle);  // gas only
        surface = mix(surface, uStormColor, spotMask * 0.85);
    }

    // ───────────────────────────────────────────────────────────────────────
    // ROCKY FEATURE: Polar ice / dust caps
    // ───────────────────────────────────────────────────────────────────────
    {
        // Ragged-edged caps: two octaves of noise give peninsula-like fractal edge
        float capEdge = fbm3(sp * 7.0 + vec3(0.0, 12.0, 0.0)) * 0.55
                      + fbm3(sp * 18.0 + vec3(3.3, 0.7, 9.1)) * 0.25
                      + fbm3(sp * 40.0 + vec3(6.2, 4.4, 1.8)) * 0.10;
        capEdge = capEdge / 0.90; // renormalize to [0,1]
        float capMask = smoothstep(0.76, 0.94, absLat + (capEdge - 0.5) * 0.18);
        capMask *= uMottle;
        surface = mix(surface, uPolarCap, capMask);
    }

    // ───────────────────────────────────────────────────────────────────────
    // ROCKY FEATURE: Tharsis bulge / Olympus Mons
    // ───────────────────────────────────────────────────────────────────────
    {
        // Volcanic plateau — rough noise-eroded boundary, not a clean sphere cap
        vec3  monsCenter = normalize(vec3(0.55, 0.30, 0.78));
        float monsDot = dot(sp, monsCenter);
        float monsNoise = (fbm3(sp * 11.0) - 0.5) * 0.10 + (fbm3(sp * 26.0) - 0.5) * 0.04;
        float mons = smoothstep(0.78, 0.96, monsDot + monsNoise) * uMottle;
        // small dark caldera — also noise-eroded
        float calderaNoise = (fbm3(sp * 40.0) - 0.5) * 0.004;
        float caldera = smoothstep(0.985, 0.998, monsDot + calderaNoise) * uMottle;
        surface = mix(surface, uColorHigh * 1.05, mons * 0.45);
        surface = mix(surface, uBandColor, caldera * 0.65);
    }

    // ───────────────────────────────────────────────────────────────────────
    // ROCKY FEATURE: Valles Marineris canyon
    // ───────────────────────────────────────────────────────────────────────
    {
        // Long thin equatorial dark scar on the opposite hemisphere from Mons
        vec3  canyonAxis = normalize(vec3(-1.0, -0.05, 0.15));
        float axisDot = dot(sp, canyonAxis);
        // narrow band perpendicular to axis
        float perpDist = length(sp - canyonAxis * axisDot);
        float canyonBand = smoothstep(0.06, 0.0, perpDist - 0.0)
                         * smoothstep(-0.05, 0.55, axisDot)
                         * smoothstep(0.85, 0.50, axisDot);
        // jaggedness
        canyonBand *= 0.6 + 0.4 * fbm3(sp * 25.0);
        canyonBand *= uMottle;
        surface = mix(surface, uBandColor, canyonBand * 0.78);
    }

    // ───────────────────────────────────────────────────────────────────────
    // LIGHTING — Oren-Nayar for rocky, soft Lambert for gas
    // ───────────────────────────────────────────────────────────────────────
    // Wide terminator windows so the dark→light transition flows gradually.
    float litGas   = smoothstep(-0.40, 0.60, lambert);
    float litRocky = smoothstep(-0.40, 0.55, lambert);
    float lit = mix(litGas, litRocky, uMottle);

    // Diffuse for gas: standard Lambert.
    // Diffuse for rocky: WRAPPED half-Lambert squared — falls off as a smooth
    // S-curve from sub-solar bright to zero ~30 degrees past the geometric
    // terminator. Avoids the hard cliff Oren-Nayar produces at NdotL = 0.
    float diffGas   = max(0.0, lambert);
    float wrap      = max(0.0, (lambert + 0.45) / 1.45);
    float diffRocky = wrap * wrap;
    float diffuse   = mix(diffGas, diffRocky, uMottle);

    // Bright-side floor keeps surface readable at the terminator.
    vec3 sunlit = surface * uSunColor * (0.08 + 0.92 * diffuse);

    // Night ambient: faint baseline so the terminator has somewhere to fade into.
    float nightTint = mix(0.22, 0.08, uMottle);
    vec3 nightAmbient = uAtmoInner * surface * nightTint;

    // Double-smoothstep blend so night→day handoff is gradual (no visible seam).
    float litBlend = smoothstep(0.0, 1.0, smoothstep(0.0, 1.0, lit));
    vec3 color = mix(nightAmbient, sunlit, litBlend);

    // ───────────────────────────────────────────────────────────────────────
    // VOLCANIC LAVA GLOW — sparse, bright, on rocky night side only
    // ───────────────────────────────────────────────────────────────────────
    float lavaMask = fbm3(sp * 8.5) * fbm3(sp * 4.0);
    float lavaGlow = smoothstep(0.34, 0.42, lavaMask) * (1.0 - lit) * uMottle;
    vec3  lavaColor = mix(vec3(1.0, 0.22, 0.04), vec3(1.0, 0.58, 0.10), fbm3(sp * 12.0));
    color += lavaColor * lavaGlow * 0.18;

    // ───────────────────────────────────────────────────────────────────────
    // ATMOSPHERIC SCATTERING — Rayleigh-style band at terminator, broader
    // and wavelength-tinted
    // ───────────────────────────────────────────────────────────────────────
    float scatter = smoothstep(-0.22, 0.06, lambert) * (1.0 - smoothstep(0.06, 0.38, lambert));
    // Gas planets get Rayleigh scatter at terminator; rocky (Mars) atmosphere barely visible
    float scatterScale = mix(0.26, 0.05, uMottle);
    color += uColorAtmo * scatter * scatterScale;

    // ───────────────────────────────────────────────────────────────────────
    // LIMB BRIGHTENING (atmosphere viewed edge-on from the lit side)
    // ───────────────────────────────────────────────────────────────────────
    float limb = pow(1.0 - NdotV, 5.5);
    // Rocky: almost no limb halo (thin atmosphere). Gas: gentle Rayleigh edge.
    float limbScale = mix(0.28, 0.04, uMottle);
    color += uColorAtmo * limb * max(0.0, lit) * limbScale;

    // No specular — at orbital scale, no real planet produces a coherent highlight.

    gl_FragColor = vec4(color, 1.0);
}
`

// ─── ATMOSPHERE SHELL SHADER (limb glow + airglow ring + aurora wisps) ──
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
    // Lit side bright; dark side nearly invisible (no bright airglow for solid bodies)
    float litBias = clamp(0.08 + 0.92 * sunDot, 0.04, 1.0);

    // Shift toward outer scatter color at the very limb edge
    vec3 color = mix(uAtmoInner, uAtmoOuter, smoothstep(0.0, 1.0, rim));
    // Warm with sunlight on the lit crescent
    color = mix(color, color * uSunColor, litBias * 0.35);

    // Rocky planets (Mars, 0.90 mottle) have essentially no visible atmosphere from orbit.
    // Gas giants (Neptune, 0.15 mottle) keep the full Rayleigh halo.
    float atmoStrength = mix(1.0, 0.12, uMottle);
    float alpha = rim * 0.55 * litBias * atmoStrength;

    gl_FragColor = vec4(color, alpha);
}
`

// ─── MOON SURFACE SHADER ─────────────────────────────────────────────────
const moonVertex = planetVertex
// Physically-based moon: Minnaert k=0.70 (measured lunar regolith value),
// four-scale crater albedo (basins/craters/pits/grain), dark floors, bright
// rims, ejecta ray systems, highland/maria color differentiation.
// Uses 3D normal-based noise — no UV seam or pole-pinch artifacts.
const moonFragment = `
${NOISE_GLSL}

uniform vec3  uLightDirView;
uniform vec3  uColorLit;
uniform vec3  uPlanetshineColor;
uniform float uPlanetshineStrength;

varying vec3 vNormalLocal;
varying vec3 vNormalView;
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
    vec3 N = normalize(vNormalView);
    vec3 L = normalize(uLightDirView);
    vec3 V = normalize(vViewPosition);

    float NdotL = max(0.0, dot(N, L));
    // Clamp NdotV away from zero — prevents pow(NdotV, -0.3) blowup at limb
    float NdotV = max(0.04, abs(dot(N, V)));

    // Minnaert k=0.70 — real lunar regolith value.
    // Near-uniform disk at full moon, crisper falloff than Lambert at crescent.
    float k = 0.70;
    float minnaert = pow(NdotL + 0.0001, k) * pow(NdotV, k - 1.0);

    float terminator = smoothstep(-0.02, 0.06, dot(N, L));
    float totalLight = clamp(minnaert * terminator, 0.0, 2.0);

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

    // Ray systems: only where crater AND pits are simultaneously high
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
    vec3 color   = surface * totalLight;

    // Minimal ambient — starlight only, no atmosphere
    color += baseColor * albedo * 0.016;

    // Planetshine: colored fill light from parent planet on night side
    float facingPlanet = pow(max(0.0, 0.40 - NdotL), 2.5);
    float nightMask    = 1.0 - smoothstep(0.0, 0.18, NdotL);
    color += uPlanetshineColor * uPlanetshineStrength * facingPlanet * nightMask * 0.65;

    gl_FragColor = vec4(color, 1.0);
}
`

// ─── Moon ────────────────────────────────────────────────────────────────
function Moon({
    data,
    timeOffset,
    parentSize,
    parentAtmo,
}: {
    data: TechNode
    timeOffset: number
    parentSize: number
    parentAtmo: THREE.Color
}) {
    const groupRef = useRef<THREE.Group>(null)
    const meshRef = useRef<THREE.Mesh>(null)
    const matRef = useRef<THREE.ShaderMaterial>(null)
    const angleRef = useRef(timeOffset)
    const segments = 18
    const _viewMat3 = useRef(new THREE.Matrix3())
    const _lightView = useRef(new THREE.Vector3())

    const planetshineStrength = parentSize > 0
        ? Math.min(0.18, 0.18 * (parentSize * 2.5) / Math.max(0.5, data.orbitRadius))
        : 0

    const uniforms = useMemo(() => ({
        uLightDirView:        { value: INITIAL_LIGHT_DIR.clone() },
        uColorLit:            { value: new THREE.Color(data.color) },
        uPlanetshineColor:    { value: parentAtmo.clone() },
        uPlanetshineStrength: { value: planetshineStrength },
    }), [data.color, parentAtmo, planetshineStrength])

    useFrame((state, delta) => {
        if (!groupRef.current || !meshRef.current) return
        angleRef.current += delta * data.orbitSpeed
        const a = angleRef.current
        groupRef.current.position.set(Math.cos(a) * data.orbitRadius, 0, Math.sin(a) * data.orbitRadius)
        meshRef.current.rotation.y += delta * 0.4

        // Light direction: sun (world origin) → moon world position,
        // then transform to view space so each moon is lit from the correct angle.
        groupRef.current.getWorldPosition(_lightView.current)
        _lightView.current.subVectors(SUN_WORLD_POS, _lightView.current).normalize()
        _viewMat3.current.setFromMatrix4(state.camera.matrixWorldInverse)
        _lightView.current.applyMatrix3(_viewMat3.current).normalize()
        if (matRef.current) {
            matRef.current.uniforms.uLightDirView.value.copy(_lightView.current)
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

                {/* Always-visible skill label */}
                <Html
                    position={[0, data.size + 0.45, 0]}
                    center
                    distanceFactor={12}
                    zIndexRange={[100, 0]}
                    style={{ pointerEvents: 'none' }}
                >
                    <MoonLabel name={data.name} accent={`#${parentAtmo.getHexString()}`} />
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
function Planet({ data, timeOffset = 0 }: { data: TechNode; timeOffset?: number }) {
    const groupRef = useRef<THREE.Group>(null)
    const planetRef = useRef<THREE.Mesh>(null)
    const planetMatRef = useRef<THREE.ShaderMaterial>(null)
    const atmoMatRef = useRef<THREE.ShaderMaterial>(null)
    const angleRef = useRef(timeOffset)

    const identity = PLANET_IDENTITY[data.id] ?? PLANET_IDENTITY.frontend
    const segments = 32
    const _viewMat3 = useRef(new THREE.Matrix3())
    const _lightView = useRef(new THREE.Vector3())

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
    }), [identity])

    const atmoUniforms = useMemo(() => ({
        uAtmoInner:    { value: identity.atmoInner.clone() },
        uAtmoOuter:    { value: identity.atmoOuter.clone() },
        uLightDirView: { value: INITIAL_LIGHT_DIR.clone() },
        uSunColor:     { value: SUN_COLOR.clone() },
        uMottle:       { value: identity.mottle },
    }), [identity])

    useFrame((state, delta) => {
        if (!groupRef.current) return
        angleRef.current += delta * data.orbitSpeed
        const a = angleRef.current
        groupRef.current.position.set(Math.cos(a) * data.orbitRadius, 0, Math.sin(a) * data.orbitRadius)

        if (planetRef.current) planetRef.current.rotation.y += delta * 0.18

        const t = state.clock.getElapsedTime()
        if (planetMatRef.current) planetMatRef.current.uniforms.uTime.value = t

        // Light direction: sun (world origin) → planet world position.
        // Each planet gets its own direction so the lit hemisphere faces the
        // central star based on orbital position — not a fixed scene angle.
        groupRef.current.getWorldPosition(_lightView.current)
        _lightView.current.subVectors(SUN_WORLD_POS, _lightView.current).normalize()
        _viewMat3.current.setFromMatrix4(state.camera.matrixWorldInverse)
        _lightView.current.applyMatrix3(_viewMat3.current).normalize()
        if (planetMatRef.current) planetMatRef.current.uniforms.uLightDirView.value.copy(_lightView.current)
        if (atmoMatRef.current)   atmoMatRef.current.uniforms.uLightDirView.value.copy(_lightView.current)

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
                    />
                ))}
            </group>
        </group>
    )
}

function PlanetLabel({ name, accent }: { name: string; accent: string }) {
    return (
        <div
            style={{
                fontFamily: 'var(--font-instrument), ui-monospace, monospace',
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: '#f4f7fc',
                padding: '6px 14px',
                borderRadius: '4px',
                background: 'rgba(6, 8, 14, 0.75)',
                border: `1px solid ${accent}55`,
                boxShadow: `0 0 18px ${accent}22, 0 8px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)`,
                whiteSpace: 'nowrap',
                opacity: 0.92,
                position: 'relative',
            }}
        >
            <span style={{
                position: 'absolute',
                top: '50%',
                left: '-14px',
                width: '8px',
                height: '1px',
                background: accent,
                opacity: 0.7,
                transform: 'translateY(-50%)',
            }} />
            <span style={{ color: accent, marginRight: '8px' }}>◇</span>
            {name}
            <span style={{
                position: 'absolute',
                top: '50%',
                right: '-14px',
                width: '8px',
                height: '1px',
                background: accent,
                opacity: 0.7,
                transform: 'translateY(-50%)',
            }} />
        </div>
    )
}

// ─── STAR SURFACE SHADER ─────────────────────────────────────────────────
// Photoreal stellar surface: Eddington limb darkening, 3-octave granulation
// (drifting convection cells), sunspots (dark plage), bright plage regions,
// stellar pulsation. HDR output crosses bloom threshold so the disk glows.
const starFragment = `
${NOISE_GLSL}

uniform float uTime;
uniform vec3  uColorHot;   // hot core (near-white violet)
uniform vec3  uColorMid;   // mid plasma
uniform vec3  uColorEdge;  // cooler limb (deep violet)

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
    // Low-freq large cells, mid-freq supergranulation, high-freq texture.
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

    // Hot core color blended through mid to cooler edge (limb darkening)
    vec3 hotMix = mix(uColorMid, uColorHot, smoothstep(0.30, 0.85, granulation));
    vec3 surfaceColor = mix(uColorEdge, hotMix, limb);

    // Dark sunspots + bright plage
    surfaceColor *= mix(1.0, 0.32, spotMask);
    surfaceColor += uColorHot * plageMask * 0.40;

    // HDR lift — push brightest parts past bloom threshold (1.0)
    surfaceColor *= 1.55;

    // Two-mode stellar oscillation
    float pulse = 1.0 + sin(uTime * 0.45) * 0.04 + sin(uTime * 1.3) * 0.015;
    surfaceColor *= pulse;

    gl_FragColor = vec4(surfaceColor, 1.0);
}
`

// ─── Central star ────────────────────────────────────────────────────────
function CentralStar() {
    const starMatRef = useRef<THREE.ShaderMaterial>(null)

    const starUniforms = useMemo(() => ({
        uTime:      { value: 0 },
        uColorHot:  { value: new THREE.Color('#F5E8FF') },  // hot photosphere, violet-white
        uColorMid:  { value: new THREE.Color('#B89BFF') },  // mid plasma
        uColorEdge: { value: new THREE.Color('#5A3FB5') },  // cooler limb
    }), [])

    useFrame((state) => {
        if (starMatRef.current) {
            starMatRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
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

            <pointLight distance={42} decay={2} intensity={22} color="#b29dff" />
        </group>
    )
}

// ─── Public component ───────────────────────────────────────────────────
export function OrbitalSystem() {
    const groupRef = useRef<THREE.Group>(null)

    // Equivalent to OrbitControls autoRotateSpeed=0.5: 2π/60*0.5 rad/s
    useFrame((_, delta) => {
        if (groupRef.current) groupRef.current.rotation.y += delta * Math.PI / 60
    })

    return (
        <group ref={groupRef}>
            <CentralStar />

            {PLANETS_ORBITING_SUN.map((planet, i) => (
                <Planet
                    key={planet.id}
                    data={planet}
                    timeOffset={i * Math.PI}
                />
            ))}
        </group>
    )
}
