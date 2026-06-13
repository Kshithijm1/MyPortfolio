'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState, sectionInfluence } from './scrollState'

/**
 * Sense-of-scale debris: a sparse instanced asteroid belt drifting between
 * the two planetary orbits, plus a faint shell of interplanetary dust points.
 * Both are easy to miss on a quick glance — that is the point.
 */

const BELT_RADIUS = 12
const BELT_SPREAD = 1.6

export function AsteroidBelt({ count = 70 }: { count?: number }) {
    const groupRef = useRef<THREE.Group>(null)

    const matrices = useMemo(() => {
        const dummy = new THREE.Object3D()
        const result: THREE.Matrix4[] = []
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2
            const r = BELT_RADIUS + (Math.random() - 0.5) * BELT_SPREAD * 2
            dummy.position.set(
                Math.cos(angle) * r,
                (Math.random() - 0.5) * 1.1,
                Math.sin(angle) * r,
            )
            dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
            const s = 0.03 + Math.pow(Math.random(), 2) * 0.085
            dummy.scale.setScalar(s)
            dummy.updateMatrix()
            result.push(dummy.matrix.clone())
        }
        return result
    }, [count])

    useFrame((_, delta) => {
        // Whole belt creeps around the sun — one revolution ≈ 26 minutes
        if (groupRef.current) groupRef.current.rotation.y += delta * 0.004
    })

    return (
        <group ref={groupRef}>
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
                <dodecahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color="#5d564c" roughness={0.95} metalness={0.05} />
            </instancedMesh>
        </group>
    )
}

const dustVertex = `
attribute float aSize;
uniform float uPixelRatio;
void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * (60.0 / -mv.z);
    gl_PointSize = clamp(gl_PointSize, 0.4, 2.2);
    gl_Position = projectionMatrix * mv;
}
`

const dustFragment = `
void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.08, d) * 0.16;
    if (a < 0.01) discard;
    gl_FragColor = vec4(0.82, 0.86, 0.95, a);
}
`

export function DustField({ count = 140 }: { count?: number }) {
    const pointsRef = useRef<THREE.Points>(null)

    const geometry = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const sizes = new Float32Array(count)
        for (let i = 0; i < count; i++) {
            // Shell between the orbits, flattened toward the ecliptic
            const angle = Math.random() * Math.PI * 2
            const r = 5 + Math.random() * 17
            positions[i * 3] = Math.cos(angle) * r
            positions[i * 3 + 1] = (Math.random() - 0.5) * 7
            positions[i * 3 + 2] = Math.sin(angle) * r
            sizes[i] = 0.5 + Math.random() * 1.1
        }
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
        return geo
    }, [count])

    const material = useMemo(
        () =>
            new THREE.ShaderMaterial({
                vertexShader: dustVertex,
                fragmentShader: dustFragment,
                uniforms: {
                    uPixelRatio: { value: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5) },
                },
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
            }),
        [],
    )

    useFrame((_, delta) => {
        if (pointsRef.current) pointsRef.current.rotation.y -= delta * 0.0025
    })

    return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />
}

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
