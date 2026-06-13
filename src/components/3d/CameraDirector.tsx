'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PerspectiveCamera } from 'three'
import { scrollState, sectionInfluence, SECTION_IDS, type SectionId } from './scrollState'
import { useResponsiveCamera } from '@/hooks/useResponsiveCamera'

/**
 * Single persistent camera choreography across the whole page.
 *
 * Each section defines a target framing (position / look-at / FOV) as a
 * function of its own scroll progress. Targets from all currently-visible
 * sections are blended by viewport influence, then the live camera is
 * critically damped toward the blend — so motion is continuous, slow, and
 * fully scrubbed in both scroll directions, with no jumps at boundaries.
 *
 * A small pointer-driven drift sits on top for ambient life.
 */

type CamTarget = { pos: THREE.Vector3; look: THREE.Vector3; fov: number }

const _up = new THREE.Vector3(0, 1, 0)
const _dir = new THREE.Vector3()
const _side = new THREE.Vector3()
const _anchor = new THREE.Vector3()

const sectionTargets: Record<SectionId, (out: CamTarget, p: number) => void> = {
    // Wide establishing shot of the full system; scroll begins a slow dolly in.
    hero(out, p) {
        const dolly = THREE.MathUtils.smoothstep(p, 0.5, 1) // p starts at 0.5 on load
        out.pos.set(0, 6 - dolly * 1.5, 17.5 - dolly * 3.5)
        out.look.set(0, 0, 0)
        out.fov = 42
    },

    // Drift toward the sun — "the core".
    about(out, p) {
        out.pos.set(0, 5 - p * 2.6, 13.5 - p * 4.5)
        out.look.set(0, 0.3, 0)
        out.fov = 42
    },

    // Tour the planets: first half frames Frontend, second half hands off to
    // Backend, framed three-quarter-lit with the whole moon system in view.
    projects(out, p) {
        const focus = THREE.MathUtils.smoothstep(p, 0.34, 0.62)
        _anchor.copy(scrollState.anchors.frontend).lerp(scrollState.anchors.backend, focus)
        const dist = THREE.MathUtils.lerp(8.6, 10.8, focus)

        _dir.copy(_anchor).normalize() // sun → planet direction
        _side.crossVectors(_up, _dir).normalize()

        out.pos
            .copy(_anchor)
            .addScaledVector(_dir, dist * 0.5)
            .addScaledVector(_side, dist * 0.72)
            .addScaledVector(_up, dist * 0.36)
        out.look.copy(_anchor)
        out.fov = 44
    },

    // Slow lateral dolly while tracking the comet along its waypoint path.
    experience(out, p) {
        out.pos.set(10 - p * 15, 4.8, 18)
        out.look.copy(scrollState.anchors.comet)
        out.fov = 44
    },

    // Gentler version, tracking the milestone probe.
    education(out, p) {
        out.pos.set(-5 + p * 5, 3.8, 16)
        out.look.copy(scrollState.anchors.probe)
        out.fov = 43
    },

    // Pull back wide and turn toward the distant beacon — "send a signal".
    contact(out, p) {
        out.pos.set(0, 6.5 + p * 3, 23 + p * 6)
        out.look.set(0, p * 3, -p * 24)
        out.fov = 42 + p * 5
    },
}

export default function CameraDirector() {
    const { distanceScale, fovOffset } = useResponsiveCamera()

    const scratch = useRef<CamTarget>({ pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 42 })
    const blended = useRef<CamTarget>({ pos: new THREE.Vector3(0, 6, 17.5), look: new THREE.Vector3(), fov: 42 })
    const dampedPos = useRef(new THREE.Vector3(0, 6, 17.5))
    const dampedLook = useRef(new THREE.Vector3(0, 0, 0))
    const dampedFov = useRef(42)
    const driftX = useRef(0)
    const driftY = useRef(0)

    useFrame((state, delta) => {
        const camera = state.camera
        if (!(camera instanceof PerspectiveCamera)) return

        const t = scratch.current
        const b = blended.current

        // ── Blend section targets by viewport influence ────────────────────
        b.pos.set(0, 0, 0)
        b.look.set(0, 0, 0)
        b.fov = 0
        let total = 0

        if (scrollState.reducedMotion) {
            sectionTargets.hero(b, 0.5)
            total = 1
        } else {
            for (const id of SECTION_IDS) {
                const w = sectionInfluence(scrollState.sections[id])
                if (w <= 0.001) continue
                sectionTargets[id](t, scrollState.sections[id])
                b.pos.addScaledVector(t.pos, w)
                b.look.addScaledVector(t.look, w)
                b.fov += t.fov * w
                total += w
            }
            if (total < 0.001) {
                sectionTargets.hero(b, 0.5)
                total = 1
            }
        }
        b.pos.divideScalar(total)
        b.look.divideScalar(total)
        b.fov /= total

        // Mobile framing: same look target, camera pushed further out
        if (distanceScale !== 1) {
            b.pos.sub(b.look).multiplyScalar(distanceScale).add(b.look)
        }
        b.fov += fovOffset

        // ── Critically damp the live camera toward the blend ───────────────
        const dp = dampedPos.current
        const dl = dampedLook.current
        dp.x = THREE.MathUtils.damp(dp.x, b.pos.x, 2.2, delta)
        dp.y = THREE.MathUtils.damp(dp.y, b.pos.y, 2.2, delta)
        dp.z = THREE.MathUtils.damp(dp.z, b.pos.z, 2.2, delta)
        dl.x = THREE.MathUtils.damp(dl.x, b.look.x, 2.8, delta)
        dl.y = THREE.MathUtils.damp(dl.y, b.look.y, 2.8, delta)
        dl.z = THREE.MathUtils.damp(dl.z, b.look.z, 2.8, delta)
        dampedFov.current = THREE.MathUtils.damp(dampedFov.current, b.fov, 2.0, delta)

        // ── Ambient pointer drift — slow, small amplitude ───────────────────
        const driftTargetX = scrollState.reducedMotion ? 0 : scrollState.pointer.x * 0.45
        const driftTargetY = scrollState.reducedMotion ? 0 : -scrollState.pointer.y * 0.28
        driftX.current = THREE.MathUtils.damp(driftX.current, driftTargetX, 1.2, delta)
        driftY.current = THREE.MathUtils.damp(driftY.current, driftTargetY, 1.2, delta)

        camera.position.set(dp.x + driftX.current, dp.y + driftY.current, dp.z)
        camera.lookAt(dl.x + driftX.current * 0.3, dl.y + driftY.current * 0.3, dl.z)

        if (Math.abs(camera.fov - dampedFov.current) > 0.01) {
            camera.fov = dampedFov.current
            camera.updateProjectionMatrix()
        }
    })

    return null
}
