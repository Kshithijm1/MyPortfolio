'use client'

import { Canvas } from '@react-three/fiber'
import { AdaptiveEvents, Preload } from '@react-three/drei'
import { Suspense } from 'react'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { OrbitalSystem } from './OrbitalSystem'
import SpaceBackground from './SpaceBackground'
import { useResponsiveCamera } from '@/hooks/useResponsiveCamera'

function CameraRig() {
    useResponsiveCamera()
    return null
}

export default function CanvasContainer() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-[#00000a]">
            {/* 2D photoreal backdrop — stars, Milky Way, zodiacal haze, motes, cosmic rays */}
            <SpaceBackground />

            {/* WebGL scene — planets, moons, atmospheres, auroras, orbital trails */}
            <div className="absolute inset-0" style={{ zIndex: 2 }}>
                <Canvas
                    camera={{ position: [0, 5, 18], fov: 45 }}
                    dpr={[1, 1.5]}
                    gl={{
                        antialias: true,
                        powerPreference: 'default',
                        alpha: true,
                        premultipliedAlpha: true,
                        stencil: false,
                        depth: true,
                    }}
                    style={{ background: 'transparent' }}
                    shadows={false}
                >
                    <CameraRig />

                    <AdaptiveEvents />

                    <ambientLight intensity={0.18} />

                    <Suspense fallback={null}>
                        <OrbitalSystem />
                        <Preload all />
                    </Suspense>

                    <EffectComposer enableNormalPass={false} multisampling={0}>
                        <Bloom
                            luminanceThreshold={1.0}
                            luminanceSmoothing={0.2}
                            mipmapBlur
                            intensity={0.18}
                        />
                    </EffectComposer>
                </Canvas>
            </div>
        </div>
    )
}
