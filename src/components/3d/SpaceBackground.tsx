'use client'

import { useEffect, useRef } from 'react'
// Animated mote + cosmic ray layers removed — they caused overstimulation
// and the static backdrop alone reads as calmer, more realistic deep space.

/**
 * Photoreal space backdrop, rendered on plain 2D canvases that sit BEHIND the
 * WebGL planet/moon scene. Two canvases:
 *   • static  — void gradient, Milky Way smear, star field, zodiacal haze.
 *               Drawn once on mount/resize, then never touched again.
 *   • animated — floating debris motes + sporadic cosmic-ray flashes,
 *                running at requestAnimationFrame cadence.
 *
 * Stars never twinkle. There is no atmosphere in vacuum to scintillate them.
 */

type Star = {
    x: number
    y: number
    r: number
    a: number
    color: string
    glow: boolean
}


const STAR_COLORS: Array<[string, number]> = [
    ['#ffffff', 0.6],
    ['#c8d8ff', 0.2],
    ['#fff4c2', 0.12],
    ['#ffddaa', 0.05],
    ['#ffcccc', 0.03],
]

function pickStarColor(): string {
    const r = Math.random()
    let acc = 0
    for (const [c, w] of STAR_COLORS) {
        acc += w
        if (r <= acc) return c
    }
    return '#ffffff'
}

function drawStaticScene(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    // ── Layer 1 — deep space void with subtle warm-center gradient ────
    ctx.fillStyle = '#00000a'
    ctx.fillRect(0, 0, w, h)

    const voidGrad = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        0,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.7,
    )
    voidGrad.addColorStop(0, 'rgba(20, 16, 32, 0.55)')
    voidGrad.addColorStop(0.55, 'rgba(8, 8, 18, 0.25)')
    voidGrad.addColorStop(1, 'rgba(0, 0, 4, 0)')
    ctx.fillStyle = voidGrad
    ctx.fillRect(0, 0, w, h)

    // ── Layer 2 — Milky Way smear (~30deg diagonal river of star density) ──
    {
        const cx = w * 0.5
        const cy = h * 0.5
        const angle = (28 * Math.PI) / 180
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(angle)
        const bandW = Math.max(w, h) * 1.4
        const bandH = Math.max(w, h) * 0.32

        for (let i = 0; i < 3; i++) {
            const offX = (Math.random() - 0.5) * bandW * 0.06
            const offY = (Math.random() - 0.5) * bandH * 0.35
            const grad = ctx.createRadialGradient(offX, offY, 0, offX, offY, bandW * 0.5)
            // Desaturated neutral-white — no warm/lavender tint that reads as fake
            grad.addColorStop(0, `rgba(240, 242, 248, ${0.016 - i * 0.004})`)
            grad.addColorStop(0.5, `rgba(230, 232, 240, ${0.008 - i * 0.002})`)
            grad.addColorStop(1, 'rgba(230, 232, 240, 0)')
            ctx.fillStyle = grad
            ctx.fillRect(-bandW / 2, -bandH / 2, bandW, bandH)
        }
        ctx.restore()
    }

    // ── Layer 3 — static star field ──────────────────────────────────
    const baseCount = 520
    const areaScale = (w * h) / (1920 * 1080)
    const count = Math.round(baseCount * Math.min(1.4, Math.max(0.55, areaScale)))
    const stars: Star[] = []

    for (let i = 0; i < count; i++) {
        const tier = Math.random()
        let r: number
        let a: number
        let glow = false
        if (tier < 0.65) {
            r = 0.5
            a = 0.4 + Math.random() * 0.3
        } else if (tier < 0.93) {
            r = 1
            a = 0.6 + Math.random() * 0.3
        } else {
            r = 1.5 + Math.random() * 0.5
            a = 0.8 + Math.random() * 0.2
            glow = true
        }

        // Milky Way density bias — bias 35% of stars toward the band
        let x: number
        let y: number
        if (i < count * 0.35) {
            const cx = w * 0.5
            const cy = h * 0.5
            const angle = (28 * Math.PI) / 180
            const t = (Math.random() - 0.5) * Math.max(w, h) * 1.2
            const n = (Math.random() - 0.5) * Math.max(w, h) * 0.18
            x = cx + Math.cos(angle) * t - Math.sin(angle) * n
            y = cy + Math.sin(angle) * t + Math.cos(angle) * n
            if (x < 0 || x > w || y < 0 || y > h) {
                x = Math.random() * w
                y = Math.random() * h
            }
        } else {
            x = Math.random() * w
            y = Math.random() * h
        }

        stars.push({ x, y, r, a, color: pickStarColor(), glow })
    }

    for (const s of stars) {
        if (s.glow) {
            // tight halo — crisp point with minimal bleed
            const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 2.2)
            halo.addColorStop(0, hexToRgba(s.color, 0.18))
            halo.addColorStop(1, hexToRgba(s.color, 0))
            ctx.fillStyle = halo
            ctx.beginPath()
            ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2)
            ctx.fill()
        }
        ctx.fillStyle = hexToRgba(s.color, s.a)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
    }

    // ── Layer 4 — zodiacal dust haze (very subtle, nearly neutral) ──
    {
        const cx = w * 0.5
        const cy = h * 0.5
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6)
        grad.addColorStop(0, 'rgba(240, 240, 248, 0.010)')
        grad.addColorStop(0.4, 'rgba(235, 235, 245, 0.005)')
        grad.addColorStop(1, 'rgba(235, 235, 245, 0)')
        ctx.save()
        ctx.translate(cx, cy)
        ctx.scale(1.6, 0.45)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(0, 0, Math.max(w, h) * 0.55, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
    }
}

function hexToRgba(hex: string, alpha: number): string {
    const h = hex.replace('#', '')
    const r = parseInt(h.substring(0, 2), 16)
    const g = parseInt(h.substring(2, 4), 16)
    const b = parseInt(h.substring(4, 6), 16)
    return `rgba(${r},${g},${b},${alpha})`
}

export default function SpaceBackground() {
    const staticRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        const staticCanvas = staticRef.current
        if (!staticCanvas) return

        const resize = () => {
            staticCanvas.style.width = '100%'
            staticCanvas.style.height = '100%'
            drawStaticScene(staticCanvas)
        }

        resize()

        const ro = new ResizeObserver(resize)
        ro.observe(staticCanvas)

        return () => { ro.disconnect() }
    }, [])

    return (
        <canvas
            ref={staticRef}
            aria-hidden
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: 'none', zIndex: 0 }}
        />
    )
}
