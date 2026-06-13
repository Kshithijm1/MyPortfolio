'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Instanced-point starfield in three depth shells for true parallax as the
 * camera dollies between sections. Stars carry per-star size, brightness and
 * black-body color temperature (blue-white → yellow → red giant). A fraction
 * of each shell is biased toward a tilted galactic plane, forming a faint
 * Milky Way band that lines up with the 2D backdrop smear.
 *
 * Stars never twinkle — there is no atmosphere in vacuum to scintillate them.
 */

// Approximate black-body star colors, weighted toward white like a real sky.
const STAR_TEMPS: Array<[number, number, number, number]> = [
    // r, g, b, weight
    [1.00, 1.00, 1.00, 0.52], // white (A/F)
    [0.72, 0.82, 1.00, 0.20], // blue-white (B)
    [1.00, 0.95, 0.78, 0.16], // yellow (G)
    [1.00, 0.83, 0.62, 0.08], // orange (K)
    [1.00, 0.68, 0.58, 0.04], // red giant (M)
]

function pickTemp(rng: () => number): [number, number, number] {
    const r = rng()
    let acc = 0
    for (const [cr, cg, cb, w] of STAR_TEMPS) {
        acc += w
        if (r <= acc) return [cr, cg, cb]
    }
    return [1, 1, 1]
}

// Deterministic PRNG so the sky is stable across renders.
function mulberry32(seed: number) {
    return () => {
        seed |= 0; seed = (seed + 0x6d2b79f5) | 0
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

// Galactic plane: tilted ~28° to match the 2D backdrop's Milky Way smear.
const GALACTIC_NORMAL = new THREE.Vector3(0.2, 0.88, 0.42).normalize()

function buildShell(count: number, radius: number, seed: number) {
    const rng = mulberry32(seed)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const v = new THREE.Vector3()

    for (let i = 0; i < count; i++) {
        // Uniform direction on sphere
        const z = rng() * 2 - 1
        const phi = rng() * Math.PI * 2
        const s = Math.sqrt(1 - z * z)
        v.set(s * Math.cos(phi), z, s * Math.sin(phi))

        // ~38% of stars squeezed toward the galactic plane → soft dense band
        if (rng() < 0.38) {
            const d = v.dot(GALACTIC_NORMAL)
            v.addScaledVector(GALACTIC_NORMAL, -d * (0.78 + rng() * 0.14)).normalize()
        }

        const r = radius * (0.92 + rng() * 0.16)
        positions[i * 3] = v.x * r
        positions[i * 3 + 1] = v.y * r
        positions[i * 3 + 2] = v.z * r

        // Magnitude distribution: most stars faint, few bright
        const mag = Math.pow(rng(), 2.6)
        const brightness = 0.22 + mag * 0.95
        const [cr, cg, cb] = pickTemp(rng)
        colors[i * 3] = cr * brightness
        colors[i * 3 + 1] = cg * brightness
        colors[i * 3 + 2] = cb * brightness
        sizes[i] = 0.55 + mag * 1.9 + (rng() < 0.025 ? 1.4 : 0)
    }
    return { positions, colors, sizes }
}

const starVertex = `
attribute float aSize;
attribute vec3 aColor;
varying vec3 vColor;
uniform float uPixelRatio;
void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * (140.0 / -mv.z);
    gl_PointSize = clamp(gl_PointSize, 0.6, 5.5);
    gl_Position = projectionMatrix * mv;
}
`

const starFragment = `
varying vec3 vColor;
void main() {
    float d = length(gl_PointCoord - 0.5);
    // Soft gaussian-ish falloff: tiny bright core, faint halo
    float core = smoothstep(0.5, 0.04, d);
    float a = core * core;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
}
`

function StarShell({
    count,
    radius,
    seed,
    driftSpeed,
}: {
    count: number
    radius: number
    seed: number
    driftSpeed: number
}) {
    const pointsRef = useRef<THREE.Points>(null)

    const geometry = useMemo(() => {
        const { positions, colors, sizes } = buildShell(count, radius, seed)
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
        geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
        return geo
    }, [count, radius, seed])

    const material = useMemo(
        () =>
            new THREE.ShaderMaterial({
                vertexShader: starVertex,
                fragmentShader: starFragment,
                uniforms: {
                    uPixelRatio: { value: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5) },
                },
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
            }),
        [],
    )

    // Extremely slow rotational drift — the sky is alive but never busy.
    useFrame((_, delta) => {
        if (pointsRef.current) pointsRef.current.rotation.y += delta * driftSpeed
    })

    return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />
}

export default function Starfield({ quality }: { quality: 'high' | 'low' }) {
    const dense = quality === 'high'
    return (
        <group>
            {/* Far shell — dense, dim, nearly static */}
            <StarShell count={dense ? 1400 : 700} radius={150} seed={101} driftSpeed={0.0006} />
            {/* Mid shell */}
            <StarShell count={dense ? 900 : 450} radius={100} seed={202} driftSpeed={0.0010} />
            {/* Near shell — sparse, brighter, strongest parallax */}
            <StarShell count={dense ? 450 : 220} radius={62} seed={303} driftSpeed={0.0016} />
        </group>
    )
}
