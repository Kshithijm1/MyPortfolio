'use client'

import { Canvas, useThree } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { Suspense, useState, useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import {
    EffectComposer,
    Bloom,
    Vignette,
    Noise,
    ChromaticAberration,
    DepthOfField,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { OrbitalSystem } from './OrbitalSystem'
import SpaceBackground from './SpaceBackground'
import Starfield from './Starfield'
import Nebula from './Nebula'
import { AsteroidBelt, DustField, CloseAsteroid } from './Asteroids'
import Comet from './Comet'
import ContactBeacon from './ContactBeacon'
import SunFlare from './SunFlare'
import SpaceTelescope from './SpaceTelescope'
import SpaceStation from './SpaceStation'
import CameraDirector from './CameraDirector'
import ScrollChoreographer from './ScrollChoreographer'
import { scrollState } from './scrollState'

// Flight paths for the timeline travelers (world space). Tuned to stay in
// frame for the camera framing defined in CameraDirector for each section.
const EXPERIENCE_PATH: [number, number, number][] = [
    [9, 5, 3], [5, 6.5, -1], [1, 4, 4], [-3, 6, 0], [-7, 4.5, -2], [-11, 6, 2],
]
const EDUCATION_PATH: [number, number, number][] = [
    [-6, 4, 3], [-2, 5, -1], [2, 3.5, 2], [6, 5, 0], [9, 4, -2],
]

function detectWebGL(): boolean {
    if (typeof window === 'undefined') return true
    try {
        const canvas = document.createElement('canvas')
        return !!(
            window.WebGLRenderingContext &&
            (canvas.getContext('webgl2') || canvas.getContext('webgl'))
        )
    } catch {
        return false
    }
}

function SpaceEnvironment({ quality }: { quality: 'high' | 'low' }) {
    const { gl, scene } = useThree()

    useEffect(() => {
        if (quality === 'low') return

        const W = 512, H = 256
        const data = new Float32Array(W * H * 4)

        for (let j = 0; j < H; j++) {
            for (let i = 0; i < W; i++) {
                const idx = (j * W + i) * 4
                // Deep space base — near-black with blue-purple tint
                data[idx]     = 0.001
                data[idx + 1] = 0.001
                data[idx + 2] = 0.003
                data[idx + 3] = 1.0

                // Sun lobe — warm, placed at phi=0, theta=PI/2 (equatorial right)
                const phi    = (i / W) * Math.PI * 2 - Math.PI   // -π..π
                const theta  = (j / H) * Math.PI                  // 0..π
                const dPhi   = phi
                const dTheta = theta - Math.PI / 2
                const sun    = Math.exp(-(dPhi * dPhi + dTheta * dTheta) / 0.018) * 8.0
                data[idx]     += sun * 1.00
                data[idx + 1] += sun * 0.90
                data[idx + 2] += sun * 0.70

                // Faint cool ambient on the hemisphere opposite the sun
                const dPhiOpp = Math.abs(phi) - Math.PI
                const scatter  = Math.exp(-(dPhiOpp * dPhiOpp + dTheta * dTheta) / 2.0) * 0.006
                data[idx]     += scatter * 0.4
                data[idx + 1] += scatter * 0.5
                data[idx + 2] += scatter * 0.8
            }
        }

        const tex = new THREE.DataTexture(data, W, H, THREE.RGBAFormat, THREE.FloatType)
        tex.mapping    = THREE.EquirectangularReflectionMapping
        tex.colorSpace = THREE.LinearSRGBColorSpace
        tex.needsUpdate = true

        const pmrem = new THREE.PMREMGenerator(gl)
        pmrem.compileEquirectangularShader()
        const env = pmrem.fromEquirectangular(tex).texture
        pmrem.dispose()
        tex.dispose()

        scene.environment = env
        return () => { env.dispose(); scene.environment = null }
    }, [gl, scene, quality])

    return null
}

function Scene({ quality }: { quality: 'high' | 'low' }) {
    return (
        <>
            <CameraDirector />
            <SpaceEnvironment quality={quality} />
            <SpaceTelescope quality={quality} />
            <SpaceStation quality={quality} />
            <CloseAsteroid quality={quality} />

            {/* Cool, very low fill so dark sides aren't pure black */}
            <ambientLight intensity={0.16} color="#9fb4d4" />

            {/* Deep-field backdrop — parallax stars + faint nebulae */}
            <Nebula />
            <Starfield quality={quality} />

            <Suspense fallback={null}>
                <OrbitalSystem quality={quality} />
                {quality === 'high' && <AsteroidBelt count={70} />}
                <DustField count={quality === 'high' ? 140 : 70} />
                <Preload all />
            </Suspense>

            {/* Per-section travelers + signal beacon */}
            <Comet section="experience" waypointCount={6} pathPoints={EXPERIENCE_PATH} anchor="comet" color="#bfe3ff" />
            <Comet section="education" waypointCount={5} pathPoints={EDUCATION_PATH} anchor="probe" color="#ffd9a8" headSize={0.09} />
            <ContactBeacon />

            <SunFlare />
        </>
    )
}

function PostFX({ quality }: { quality: 'high' | 'low' }) {
    // Minimal chromatic aberration on the edges only
    const caOffset = useMemo(() => new THREE.Vector2(0.0006, 0.0006), [])

    return (
        <EffectComposer enableNormalPass={false} multisampling={quality === 'high' ? 2 : 0}>
            {/* Restrained bloom — reads as "light source in space", not glare */}
            <Bloom
                luminanceThreshold={0.85}
                luminanceSmoothing={0.30}
                mipmapBlur
                intensity={quality === 'high' ? 0.72 : 0.40}
            />

            {/* Subtle DOF — gently softens deep background, desktop only */}
            {quality === 'high' ? (
                <DepthOfField
                    focusDistance={0.012}
                    focalLength={0.05}
                    bokehScale={2.2}
                    height={480}
                />
            ) : (
                <></>
            )}

            {/* Edges-only chromatic aberration */}
            <ChromaticAberration
                blendFunction={BlendFunction.NORMAL}
                offset={caOffset}
                radialModulation
                modulationOffset={0.35}
            />

            {/* Cinematic frame: soft vignette + faint film grain */}
            <Vignette eskil={false} offset={0.28} darkness={0.62} />
            <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={quality === 'high' ? 0.035 : 0.02} />
        </EffectComposer>
    )
}

export default function CanvasContainer() {
    const [ready, setReady] = useState(false)
    const [webgl, setWebgl] = useState(true)
    const [quality, setQuality] = useState<'high' | 'low'>('high')
    const scrimRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setWebgl(detectWebGL())
        const mobile = window.matchMedia('(max-width: 767px)').matches
        const lowCores = (navigator.hardwareConcurrency ?? 8) <= 4
        setQuality(mobile || lowCores ? 'low' : 'high')

        // Ambient pointer drift source — normalized -1..1, fed to CameraDirector
        const onPointer = (e: PointerEvent) => {
            scrollState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
            scrollState.pointer.y = (e.clientY / window.innerHeight) * 2 - 1
        }
        window.addEventListener('pointermove', onPointer, { passive: true })
        return () => window.removeEventListener('pointermove', onPointer)
    }, [])

    return (
        <div className="canvas-container fixed inset-0 z-0 overflow-hidden bg-[#00000a]">
            {/* 2D photoreal backdrop — void gradient, Milky Way smear, motes */}
            <SpaceBackground />

            {/* WebGL scene */}
            {webgl && (
                <div
                    className="absolute inset-0"
                    style={{
                        zIndex: 2,
                        opacity: ready ? 1 : 0,
                        transition: 'opacity 1s ease',
                    }}
                >
                    <Canvas
                        camera={{ position: [0, 6, 17.5], fov: 42 }}
                        dpr={[1, quality === 'high' ? 1.5 : 1]}
                        gl={{
                            antialias: true,
                            powerPreference: 'high-performance',
                            alpha: true,
                            premultipliedAlpha: true,
                            stencil: false,
                            depth: true,
                        }}
                        style={{ background: 'transparent' }}
                        shadows={quality === 'high'}
                        onCreated={({ gl }) => {
                            gl.shadowMap.type = THREE.PCFSoftShadowMap
                            gl.toneMapping = THREE.ACESFilmicToneMapping
                            gl.toneMappingExposure = 0.88
                            gl.outputColorSpace = THREE.SRGBColorSpace
                            setReady(true)
                        }}
                    >
                        <Scene quality={quality} />
                        <PostFX quality={quality} />
                    </Canvas>
                </div>
            )}

            {/* Readability scrim — driven by ScrollChoreographer, darkens the
                scene behind text-heavy sections (esp. Contact) */}
            <div
                ref={scrimRef}
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 3, background: 'radial-gradient(ellipse at center, #00000a 0%, #000006 100%)', opacity: 0 }}
            />

            {/* DOM-side scroll wiring (always mounted once) */}
            <ScrollChoreographer scrimRef={scrimRef} />
        </div>
    )
}
