import * as THREE from 'three'

/**
 * Shared scroll/scene state singleton.
 *
 * Written by:
 *   • ScrollChoreographer (GSAP ScrollTrigger → per-section progress, DOM side)
 *   • Planet / Comet components (world-space anchors, every frame)
 *   • CanvasContainer (pointer position)
 *
 * Read by:
 *   • CameraDirector (camera choreography)
 *   • OrbitalSystem (sun boost, moon activation)
 *   • Comet / ContactBeacon / Starfield (section-driven fades)
 *
 * A plain mutable module object (not React state) so the r3f frame loop can
 * read it 60×/s with zero re-renders.
 */

export const SECTION_IDS = ['hero', 'about', 'projects', 'experience', 'education', 'contact'] as const
export type SectionId = (typeof SECTION_IDS)[number]

export type ScrollState = {
    /** 0→1 progress of each section through the viewport
     *  (0 = top of section at bottom of screen, 1 = bottom of section at top).
     *  ~0.5 means the section is centered. */
    sections: Record<SectionId, number>
    /** Whole-page scroll progress 0→1 */
    global: number
    /** prefers-reduced-motion */
    reducedMotion: boolean
    /** Normalized pointer position, -1..1, for ambient camera drift */
    pointer: { x: number; y: number }
    /** World-space anchors updated each frame by scene objects */
    anchors: {
        frontend: THREE.Vector3
        backend: THREE.Vector3
        comet: THREE.Vector3
        probe: THREE.Vector3
    }
}

export const scrollState: ScrollState = {
    sections: {
        hero: 0.5, // page loads with hero centered
        about: 0,
        projects: 0,
        experience: 0,
        education: 0,
        contact: 0,
    },
    global: 0,
    reducedMotion: false,
    pointer: { x: 0, y: 0 },
    anchors: {
        frontend: new THREE.Vector3(8, 0, 0),
        backend: new THREE.Vector3(-16, 0, 0),
        comet: new THREE.Vector3(0, 4, 0),
        probe: new THREE.Vector3(0, 3, 0),
    },
}

/**
 * How "active" a section is: 0 outside its span, peaking at 1 when the
 * section is centered in the viewport. Smooth in both scroll directions.
 */
export function sectionInfluence(progress: number): number {
    if (progress <= 0 || progress >= 1) return 0
    return Math.sin(Math.PI * progress)
}
