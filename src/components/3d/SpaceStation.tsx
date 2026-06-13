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
