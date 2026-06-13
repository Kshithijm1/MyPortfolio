'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState, sectionInfluence } from './scrollState'

/**
 * A distant bright star, far beyond the planetary system — the "send a
 * signal" destination for the Contact section. Nearly invisible during the
 * rest of the page; as Contact centers, it brightens to a calm, steady
 * beacon while the camera pulls back toward it.
 */
export default function ContactBeacon() {
    const coreRef = useRef<THREE.Mesh>(null)
    const haloRef = useRef<THREE.Sprite>(null)

    const haloTexture = useMemo(() => {
        const size = 256
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')!
        const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
        grad.addColorStop(0, 'rgba(255,255,255,0.85)')
        grad.addColorStop(0.18, 'rgba(190,215,255,0.32)')
        grad.addColorStop(0.55, 'rgba(150,185,255,0.08)')
        grad.addColorStop(1, 'rgba(150,185,255,0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, size, size)
        // Subtle diffraction cross
        const cross = ctx.createLinearGradient(0, size / 2, size, size / 2)
        cross.addColorStop(0, 'rgba(200,220,255,0)')
        cross.addColorStop(0.5, 'rgba(200,220,255,0.22)')
        cross.addColorStop(1, 'rgba(200,220,255,0)')
        ctx.fillStyle = cross
        ctx.fillRect(0, size / 2 - 1, size, 2)
        ctx.fillRect(size / 2 - 1, 0, 2, size)
        const tex = new THREE.CanvasTexture(canvas)
        tex.needsUpdate = true
        return tex
    }, [])

    useFrame(() => {
        const influence = sectionInfluence(scrollState.sections.contact)
        // Faint presence always (it is a star, after all), waking up at Contact
        const intensity = 0.10 + influence * 0.9

        if (coreRef.current) {
            const mat = coreRef.current.material as THREE.MeshBasicMaterial
            mat.opacity = Math.min(1, intensity)
            // HDR push so bloom picks it up when active
            mat.color.setScalar(1 + influence * 1.4)
        }
        if (haloRef.current) {
            const mat = haloRef.current.material as THREE.SpriteMaterial
            mat.opacity = intensity * 0.55
            const s = 7 + influence * 9
            haloRef.current.scale.set(s, s, 1)
        }
    })

    return (
        <group position={[0, 5, -75]}>
            <mesh ref={coreRef}>
                <sphereGeometry args={[0.35, 12, 12]} />
                <meshBasicMaterial color="#ffffff" transparent toneMapped={false} />
            </mesh>
            <sprite ref={haloRef}>
                <spriteMaterial
                    map={haloTexture}
                    transparent
                    opacity={0}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </sprite>
        </group>
    )
}
