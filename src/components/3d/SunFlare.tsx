'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Restrained lens flare for the central star: a warm halo plus a faint
 * anamorphic streak that only appear when the sun is near the center of
 * frame and in front of the camera — the way a real lens catches a star.
 * Opacity is squared against center distance so the effect is usually off.
 */

const _ndc = new THREE.Vector3()

export default function SunFlare() {
    const haloRef = useRef<THREE.Sprite>(null)
    const streakRef = useRef<THREE.Sprite>(null)

    const { haloTex, streakTex } = useMemo(() => {
        // Warm halo
        const hs = 256
        const hCanvas = document.createElement('canvas')
        hCanvas.width = hs
        hCanvas.height = hs
        const hCtx = hCanvas.getContext('2d')!
        const hGrad = hCtx.createRadialGradient(hs / 2, hs / 2, 0, hs / 2, hs / 2, hs / 2)
        hGrad.addColorStop(0, 'rgba(255,238,210,0.55)')
        hGrad.addColorStop(0.3, 'rgba(255,214,160,0.16)')
        hGrad.addColorStop(0.7, 'rgba(255,190,130,0.04)')
        hGrad.addColorStop(1, 'rgba(255,190,130,0)')
        hCtx.fillStyle = hGrad
        hCtx.fillRect(0, 0, hs, hs)

        // Horizontal anamorphic streak
        const sw = 512
        const sh = 64
        const sCanvas = document.createElement('canvas')
        sCanvas.width = sw
        sCanvas.height = sh
        const sCtx = sCanvas.getContext('2d')!
        const sGradX = sCtx.createLinearGradient(0, 0, sw, 0)
        sGradX.addColorStop(0, 'rgba(255,228,190,0)')
        sGradX.addColorStop(0.5, 'rgba(255,236,210,0.5)')
        sGradX.addColorStop(1, 'rgba(255,228,190,0)')
        sCtx.fillStyle = sGradX
        sCtx.fillRect(0, 0, sw, sh)
        const sGradY = sCtx.createLinearGradient(0, 0, 0, sh)
        sGradY.addColorStop(0, 'rgba(0,0,0,1)')
        sGradY.addColorStop(0.5, 'rgba(0,0,0,0)')
        sGradY.addColorStop(1, 'rgba(0,0,0,1)')
        sCtx.globalCompositeOperation = 'destination-out'
        sCtx.fillStyle = sGradY
        sCtx.fillRect(0, 0, sw, sh)

        const haloTex = new THREE.CanvasTexture(hCanvas)
        const streakTex = new THREE.CanvasTexture(sCanvas)
        return { haloTex, streakTex }
    }, [])

    useFrame((state) => {
        // Project the sun (world origin) into NDC
        _ndc.set(0, 0, 0).project(state.camera)
        const inFront = _ndc.z < 1
        const centerDist = Math.hypot(_ndc.x, _ndc.y)
        const centered = inFront ? Math.max(0, 1 - centerDist / 0.55) : 0
        const strength = centered * centered

        if (haloRef.current) {
            ;(haloRef.current.material as THREE.SpriteMaterial).opacity = strength * 0.30
        }
        if (streakRef.current) {
            ;(streakRef.current.material as THREE.SpriteMaterial).opacity = strength * 0.16
        }
    })

    return (
        <group>
            <sprite ref={haloRef} scale={[10, 10, 1]}>
                <spriteMaterial
                    map={haloTex}
                    transparent
                    opacity={0}
                    depthWrite={false}
                    depthTest={false}
                    blending={THREE.AdditiveBlending}
                />
            </sprite>
            <sprite ref={streakRef} scale={[16, 2, 1]}>
                <spriteMaterial
                    map={streakTex}
                    transparent
                    opacity={0}
                    depthWrite={false}
                    depthTest={false}
                    blending={THREE.AdditiveBlending}
                />
            </sprite>
        </group>
    )
}
