'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { NOISE_GLSL } from '@/components/glsl/noise'

/**
 * Two very faint procedural nebula sheets far behind the planetary system.
 * They read as background atmosphere — subtle color variation in the void —
 * never as eye-catching shapes. Drift is glacial (full pattern cycle ≈ 20 min).
 */

const nebulaVertex = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const nebulaFragment = `
${NOISE_GLSL}

uniform float uTime;
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform float uOpacity;
uniform float uSeed;

varying vec2 vUv;

void main() {
    vec2 p = (vUv - 0.5) * vec2(2.6, 1.5) + uSeed;

    // Domain-warped fbm — wispy filament structure, drifting imperceptibly
    vec2 warp = vec2(
        fbm(p * 1.4 + uTime * 0.0019),
        fbm(p * 1.4 + 7.3 - uTime * 0.0014)
    );
    float n = fbm(p * 2.1 + warp * 1.3);
    float n2 = fbm(p * 4.7 + warp * 0.6 + 13.1);

    // Sparse cloud body with soft threshold
    float body = smoothstep(0.42, 0.86, n);
    // Fade hard toward plane edges so the quad is invisible
    float edge = smoothstep(0.0, 0.28, vUv.x) * smoothstep(1.0, 0.72, vUv.x)
               * smoothstep(0.0, 0.30, vUv.y) * smoothstep(1.0, 0.70, vUv.y);

    vec3 color = mix(uColorA, uColorB, n2);
    float alpha = body * edge * uOpacity;

    gl_FragColor = vec4(color, alpha);
}
`

function NebulaSheet({
    position,
    rotation,
    scale,
    colorA,
    colorB,
    opacity,
    seed,
}: {
    position: [number, number, number]
    rotation: [number, number, number]
    scale: [number, number]
    colorA: string
    colorB: string
    opacity: number
    seed: number
}) {
    const matRef = useRef<THREE.ShaderMaterial>(null)

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uColorA: { value: new THREE.Color(colorA) },
            uColorB: { value: new THREE.Color(colorB) },
            uOpacity: { value: opacity },
            uSeed: { value: seed },
        }),
        [colorA, colorB, opacity, seed],
    )

    useFrame((state) => {
        if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
    })

    return (
        <mesh position={position} rotation={rotation}>
            <planeGeometry args={[scale[0], scale[1]]} />
            <shaderMaterial
                ref={matRef}
                vertexShader={nebulaVertex}
                fragmentShader={nebulaFragment}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    )
}

export default function Nebula() {
    return (
        <group>
            {/* Cool indigo-teal drift, upper left of the deep field */}
            <NebulaSheet
                position={[-35, 22, -95]}
                rotation={[0, 0.25, 0.3]}
                scale={[160, 90]}
                colorA="#1B2C4E"
                colorB="#274B55"
                opacity={0.085}
                seed={3.7}
            />
            {/* Faint dust-rose veil, lower right — barely above perception */}
            <NebulaSheet
                position={[40, -18, -120]}
                rotation={[0, -0.2, -0.35]}
                scale={[180, 100]}
                colorA="#3A2438"
                colorB="#1E2240"
                opacity={0.06}
                seed={11.2}
            />
        </group>
    )
}
