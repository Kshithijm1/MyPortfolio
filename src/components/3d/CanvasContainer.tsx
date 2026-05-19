'use client'

import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, Preload } from '@react-three/drei'
import { Suspense, useEffect, useRef, useState } from 'react'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { OrbitalSystem } from './OrbitalSystem'
import SpaceBackground from './SpaceBackground'
import { useResponsiveCamera } from '@/hooks/useResponsiveCamera'

function CameraRig() {
    useResponsiveCamera()
    return null
}

export default function CanvasContainer() {
    const [frameloop, setFrameloop] = useState<'always' | 'never'>('always')
    const pauseReasons = useRef(new Set<string>())

    useEffect(() => {
        const addPause = (r: string) => {
            pauseReasons.current.add(r)
            setFrameloop('never')
        }
        const removePause = (r: string) => {
            pauseReasons.current.delete(r)
            if (pauseReasons.current.size === 0) setFrameloop('always')
        }

        let scrollTimer: ReturnType<typeof setTimeout>
        const onScroll = () => {
            addPause('scroll')
            clearTimeout(scrollTimer)
            scrollTimer = setTimeout(() => removePause('scroll'), 150)
        }
        const onFadeStart = () => addPause('loadingFade')
        const onFadeEnd = () => removePause('loadingFade')

        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('loading:fadestart', onFadeStart)
        window.addEventListener('loading:fadeend', onFadeEnd)

        return () => {
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('loading:fadestart', onFadeStart)
            window.removeEventListener('loading:fadeend', onFadeEnd)
            clearTimeout(scrollTimer)
        }
    }, [])

    return (
        <div className="canvas-container fixed inset-0 z-0 overflow-hidden bg-[#00000a]">
            {/* 2D photoreal backdrop — stars, Milky Way, zodiacal haze, motes, cosmic rays */}
            <SpaceBackground />

            {/* WebGL scene — planets, moons, atmospheres, auroras, orbital trails */}
            <div className="absolute inset-0" style={{ zIndex: 2 }}>
                <Canvas
                    camera={{ position: [0, 5, 15], fov: 42 }}
                    dpr={[1, 1.5]}
                    frameloop={frameloop}
                    performance={{ min: 0.5 }}
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

                    <AdaptiveDpr pixelated />

                    <ambientLight intensity={0.18} />

                    <Suspense fallback={null}>
                        <OrbitalSystem />
                        <Preload all />
                    </Suspense>

                    <EffectComposer enableNormalPass={false} multisampling={0} resolutionScale={0.5}>
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
