'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState, sectionInfluence, type SectionId } from './scrollState'

/**
 * A comet/probe that travels a smooth CatmullRom path through the scene,
 * its position scrubbed to a section's scroll progress. Waypoints along the
 * path correspond to timeline entries (jobs / milestones): as the traveler
 * passes each one it brightens gently, then settles back.
 *
 * The whole object fades in only while its section is near the viewport,
 * so it never pollutes other parts of the page.
 */

const TRAIL_LENGTH = 56

const trailVertex = `
attribute float aT;     // 0 = head, 1 = oldest
varying float vT;
uniform float uPixelRatio;
void main() {
    vT = aT;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float size = mix(3.4, 0.4, aT);
    gl_PointSize = size * uPixelRatio * (90.0 / -mv.z);
    gl_PointSize = clamp(gl_PointSize, 0.5, 9.0);
    gl_Position = projectionMatrix * mv;
}
`

const trailFragment = `
varying float vT;
uniform vec3  uColor;
uniform float uOpacity;
void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d) * (1.0 - vT) * (1.0 - vT) * uOpacity;
    if (a < 0.008) discard;
    gl_FragColor = vec4(uColor, a);
}
`

export default function Comet({
    section,
    waypointCount,
    pathPoints,
    color = '#bfe3ff',
    headSize = 0.11,
    anchor,
}: {
    /** Which page section scrubs this traveler */
    section: SectionId
    /** Number of timeline entries → glow waypoints along the path */
    waypointCount: number
    /** Control points for the flight path (world space) */
    pathPoints: [number, number, number][]
    color?: string
    headSize?: number
    /** Key in scrollState.anchors to publish the head position to */
    anchor: 'comet' | 'probe'
}) {
    const groupRef = useRef<THREE.Group>(null)
    const headMatRef = useRef<THREE.MeshBasicMaterial>(null)
    const glowRef = useRef<THREE.Sprite>(null)
    const trailMatRef = useRef<THREE.ShaderMaterial>(null)
    const trailGeoRef = useRef<THREE.BufferGeometry>(null)
    const smoothedT = useRef(0)

    const curve = useMemo(
        () => new THREE.CatmullRomCurve3(pathPoints.map((p) => new THREE.Vector3(...p)), false, 'centripetal', 0.5),
        [pathPoints],
    )

    const glowTexture = useMemo(() => makeGlowTexture(color), [color])

    const trail = useMemo(() => {
        const positions = new Float32Array(TRAIL_LENGTH * 3)
        const ts = new Float32Array(TRAIL_LENGTH)
        for (let i = 0; i < TRAIL_LENGTH; i++) ts[i] = i / (TRAIL_LENGTH - 1)
        return { positions, ts }
    }, [])

    const trailUniforms = useMemo(
        () => ({
            uColor: { value: new THREE.Color(color) },
            uOpacity: { value: 0 },
            uPixelRatio: { value: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5) },
        }),
        [color],
    )

    useFrame((state, delta) => {
        const group = groupRef.current
        if (!group) return

        const progress = scrollState.sections[section]
        const visibility = sectionInfluence(progress)

        // Hide entirely when far from the section — skip all work
        const wasVisible = group.visible
        group.visible = visibility > 0.005
        if (!group.visible) {
            if (trailMatRef.current) trailMatRef.current.uniforms.uOpacity.value = 0
            return
        }

        // Map section progress (with margins so the journey completes while
        // the section is still on screen) onto the curve, smoothly damped.
        const targetT = THREE.MathUtils.clamp((progress - 0.12) / 0.76, 0, 1)
        smoothedT.current = THREE.MathUtils.damp(smoothedT.current, targetT, 3.2, delta)
        const t = smoothedT.current

        const pos = curve.getPoint(t)
        group.position.copy(pos)
        scrollState.anchors[anchor].copy(pos)

        // Waypoint proximity: pulse gently while passing each timeline entry
        let waypointGlow = 0
        for (let k = 0; k < waypointCount; k++) {
            const wt = waypointCount > 1 ? k / (waypointCount - 1) : 0.5
            const d = Math.abs(t - wt) * (waypointCount - 1) * 2.2
            waypointGlow = Math.max(waypointGlow, 1 - Math.min(1, d))
        }
        const glowAmt = visibility * (0.45 + waypointGlow * 0.55)

        if (headMatRef.current) headMatRef.current.opacity = visibility
        if (glowRef.current) {
            const mat = glowRef.current.material as THREE.SpriteMaterial
            mat.opacity = glowAmt * 0.65
            const s = headSize * (9 + waypointGlow * 5)
            glowRef.current.scale.set(s, s, 1)
        }

        // Trail: ring-buffer of recent world positions, points fade by age.
        // On (re)appearance, collapse the whole trail onto the head so it
        // never streaks across the scene from a stale position.
        const { positions } = trail
        if (!wasVisible) {
            for (let i = 0; i < TRAIL_LENGTH; i++) {
                positions[i * 3] = pos.x
                positions[i * 3 + 1] = pos.y
                positions[i * 3 + 2] = pos.z
            }
        }
        for (let i = TRAIL_LENGTH - 1; i > 0; i--) {
            positions[i * 3] = positions[(i - 1) * 3]
            positions[i * 3 + 1] = positions[(i - 1) * 3 + 1]
            positions[i * 3 + 2] = positions[(i - 1) * 3 + 2]
        }
        positions[0] = pos.x
        positions[1] = pos.y
        positions[2] = pos.z
        if (trailGeoRef.current) {
            trailGeoRef.current.attributes.position.needsUpdate = true
        }
        if (trailMatRef.current) trailMatRef.current.uniforms.uOpacity.value = visibility * 0.8
    })

    return (
        <>
            <group ref={groupRef} visible={false}>
                {/* Bright head — HDR-ish so it catches a little bloom */}
                <mesh>
                    <sphereGeometry args={[headSize, 16, 16]} />
                    <meshBasicMaterial ref={headMatRef} color={color} transparent toneMapped={false} />
                </mesh>
                {/* Soft coma glow */}
                <sprite ref={glowRef}>
                    <spriteMaterial
                        map={glowTexture}
                        transparent
                        opacity={0}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                    />
                </sprite>
            </group>

            {/* Trail lives in world space (positions are absolute) */}
            <points frustumCulled={false}>
                <bufferGeometry ref={trailGeoRef}>
                    <bufferAttribute attach="attributes-position" args={[trail.positions, 3]} />
                    <bufferAttribute attach="attributes-aT" args={[trail.ts, 1]} />
                </bufferGeometry>
                <shaderMaterial
                    ref={trailMatRef}
                    vertexShader={trailVertex}
                    fragmentShader={trailFragment}
                    uniforms={trailUniforms}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </>
    )
}

function makeGlowTexture(color: string): THREE.Texture {
    const size = 128
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    grad.addColorStop(0, 'rgba(255,255,255,0.9)')
    grad.addColorStop(0.25, hexToRgba(color, 0.5))
    grad.addColorStop(1, hexToRgba(color, 0))
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
}

function hexToRgba(hex: string, alpha: number): string {
    const h = hex.replace('#', '')
    const r = parseInt(h.substring(0, 2), 16)
    const g = parseInt(h.substring(2, 4), 16)
    const b = parseInt(h.substring(4, 6), 16)
    return `rgba(${r},${g},${b},${alpha})`
}
