'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollState, sectionInfluence, SECTION_IDS } from './scrollState'

/**
 * DOM-side scroll wiring. Creates one ScrollTrigger per page section and
 * continuously scrubs its progress into the shared scrollState singleton,
 * which the 3D scene reads every frame. Also drives the readability scrim —
 * a gentle darkening of the 3D background behind text-heavy sections.
 *
 * Renders nothing; lives in CanvasContainer so it is mounted exactly once.
 */
export default function ScrollChoreographer({
    scrimRef,
}: {
    scrimRef: React.RefObject<HTMLDivElement | null>
}) {
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger)

        const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
        scrollState.reducedMotion = mql.matches
        const onMotionChange = () => { scrollState.reducedMotion = mql.matches }
        mql.addEventListener?.('change', onMotionChange)

        const triggers: ScrollTrigger[] = []

        // Sections render in page.tsx after this mounts — defer creation a tick
        // so the targets exist, then refresh once layout settles.
        const setup = () => {
            for (const id of SECTION_IDS) {
                const el = document.getElementById(id)
                if (!el) continue
                triggers.push(
                    ScrollTrigger.create({
                        trigger: el,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true,
                        onUpdate: (self) => { scrollState.sections[id] = self.progress },
                        onLeave: () => { scrollState.sections[id] = 1 },
                        onLeaveBack: () => { scrollState.sections[id] = 0 },
                    }),
                )
            }
            triggers.push(
                ScrollTrigger.create({
                    trigger: document.body,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: true,
                    onUpdate: (self) => { scrollState.global = self.progress },
                }),
            )
            ScrollTrigger.refresh()
        }
        const raf = requestAnimationFrame(setup)

        // Readability scrim — darkens the scene slightly behind dense text and
        // strongly toward Contact ("background dims, focus moves to the form").
        const scrimTick = () => {
            const el = scrimRef.current
            if (!el) return
            const s = scrollState.sections
            const opacity =
                sectionInfluence(s.about) * 0.22 +
                sectionInfluence(s.experience) * 0.20 +
                sectionInfluence(s.education) * 0.20 +
                sectionInfluence(s.contact) * 0.45
            el.style.opacity = Math.min(0.6, opacity).toFixed(3)
        }
        gsap.ticker.add(scrimTick)

        return () => {
            cancelAnimationFrame(raf)
            gsap.ticker.remove(scrimTick)
            triggers.forEach((t) => t.kill())
            mql.removeEventListener?.('change', onMotionChange)
        }
    }, [scrimRef])

    return null
}
