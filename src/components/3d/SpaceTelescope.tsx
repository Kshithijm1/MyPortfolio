'use client'

import { useMemo, useRef, useEffect } from 'react'
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

    useEffect(() => {
        return () => { allMats.forEach(m => m.dispose()) }
    }, [allMats])

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
        group.rotation.y = (group.rotation.y + delta * 0.08) % (Math.PI * 2)
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
            <mesh castShadow receiveShadow material={antMat} position={[0, -0.82, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.55, 6]} />
            </mesh>

            {/* Antenna dish (open hemisphere) */}
            <mesh castShadow receiveShadow material={antMat} position={[0, -1.12, 0]}
                rotation={[Math.PI, 0, 0]}>
                <sphereGeometry args={[0.09, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
        </group>
    )
}
