'use client'

import { useEffect, useRef } from 'react'

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

type Mote = {
    x: number
    y: number
    vx: number
    vy: number
    r: number
    aBase: number
    aPhase: number
    aFreq: number
}

type CosmicRay = {
    x: number
    y: number
    angle: number
    length: number
    bornAt: number
    duration: number
    peakAlpha: number
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

        for (let i = 0; i < 4; i++) {
            const offX = (Math.random() - 0.5) * bandW * 0.08
            const offY = (Math.random() - 0.5) * bandH * 0.4
            const grad = ctx.createRadialGradient(offX, offY, 0, offX, offY, bandW * 0.5)
            grad.addColorStop(0, `rgba(255, 253, 240, ${0.045 - i * 0.008})`)
            grad.addColorStop(0.5, `rgba(220, 215, 255, ${0.022 - i * 0.004})`)
            grad.addColorStop(1, 'rgba(255, 253, 240, 0)')
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
            // soft 2px glow halo around bright stars
            const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4)
            halo.addColorStop(0, hexToRgba(s.color, 0.35))
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

    // ── Layer 4 — zodiacal dust haze (subliminal warm horizontal cloud) ──
    {
        const cx = w * 0.5
        const cy = h * 0.5
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6)
        grad.addColorStop(0, 'rgba(255, 253, 224, 0.045)')
        grad.addColorStop(0.4, 'rgba(255, 240, 200, 0.025)')
        grad.addColorStop(1, 'rgba(255, 240, 200, 0)')
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
    const animRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        const staticCanvas = staticRef.current
        const animCanvas = animRef.current
        if (!staticCanvas || !animCanvas) return

        // Layer 10/11 state
        let motes: Mote[] = []
        let activeRay: CosmicRay | null = null
        let nextRayAt = performance.now() + 18000 + Math.random() * 30000
        let raf = 0
        let mounted = true

        const resize = () => {
            // sync sizes from layout
            staticCanvas.style.width = '100%'
            staticCanvas.style.height = '100%'
            animCanvas.style.width = '100%'
            animCanvas.style.height = '100%'

            drawStaticScene(staticCanvas)

            const dpr = Math.min(window.devicePixelRatio || 1, 2)
            const w = animCanvas.clientWidth
            const h = animCanvas.clientHeight
            animCanvas.width = Math.floor(w * dpr)
            animCanvas.height = Math.floor(h * dpr)
            const aCtx = animCanvas.getContext('2d', { alpha: true })
            if (aCtx) aCtx.setTransform(dpr, 0, 0, dpr, 0, 0)

            // re-seed motes proportionally
            const targetCount = Math.min(34, Math.max(20, Math.round((w * h) / 80000)))
            motes = []
            for (let i = 0; i < targetCount; i++) {
                const dir = Math.random() * Math.PI * 2
                const speed = 0.03 + Math.random() * 0.05
                motes.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: Math.cos(dir) * speed,
                    vy: Math.sin(dir) * speed,
                    r: 0.3 + Math.random() * 0.3,
                    aBase: 0.15 + Math.random() * 0.35,
                    aPhase: Math.random() * Math.PI * 2,
                    aFreq: 0.0004 + Math.random() * 0.0006,
                })
            }
        }

        const tick = () => {
            if (!mounted) return
            const ctx = animCanvas.getContext('2d', { alpha: true })
            if (!ctx) return

            const w = animCanvas.clientWidth
            const h = animCanvas.clientHeight
            ctx.clearRect(0, 0, w, h)

            const now = performance.now()

            // ── Layer 10 — drifting interplanetary dust motes ───────────
            for (const m of motes) {
                m.x += m.vx
                m.y += m.vy
                if (m.x < -2) m.x = w + 2
                if (m.x > w + 2) m.x = -2
                if (m.y < -2) m.y = h + 2
                if (m.y > h + 2) m.y = -2

                const flicker = 0.5 + 0.5 * Math.sin(now * m.aFreq + m.aPhase)
                const alpha = m.aBase * (0.55 + 0.45 * flicker)

                ctx.fillStyle = `rgba(225, 235, 255, ${alpha})`
                ctx.beginPath()
                ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2)
                ctx.fill()
            }

            // ── Layer 11 — cosmic ray flash (one at a time, randomized) ──
            if (!activeRay && now >= nextRayAt) {
                activeRay = {
                    x: Math.random() * w,
                    y: Math.random() * h,
                    angle: Math.random() * Math.PI * 2,
                    length: 8 + Math.random() * 27,
                    bornAt: now,
                    duration: 80 + Math.random() * 70,
                    peakAlpha: 0.55 + Math.random() * 0.15,
                }
            }

            if (activeRay) {
                const t = (now - activeRay.bornAt) / activeRay.duration
                if (t >= 1) {
                    activeRay = null
                    nextRayAt = now + 20000 + Math.random() * 30000
                } else {
                    // peak quickly, then fall to zero
                    const env = t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7
                    const a = activeRay.peakAlpha * Math.max(0, env)
                    const dx = Math.cos(activeRay.angle) * activeRay.length
                    const dy = Math.sin(activeRay.angle) * activeRay.length
                    ctx.strokeStyle = `rgba(255, 255, 255, ${a})`
                    ctx.lineWidth = 1
                    ctx.lineCap = 'round'
                    ctx.beginPath()
                    ctx.moveTo(activeRay.x - dx / 2, activeRay.y - dy / 2)
                    ctx.lineTo(activeRay.x + dx / 2, activeRay.y + dy / 2)
                    ctx.stroke()
                }
            }

            raf = requestAnimationFrame(tick)
        }

        resize()
        raf = requestAnimationFrame(tick)

        const ro = new ResizeObserver(resize)
        ro.observe(staticCanvas)

        return () => {
            mounted = false
            cancelAnimationFrame(raf)
            ro.disconnect()
        }
    }, [])

    return (
        <>
            <canvas
                ref={staticRef}
                aria-hidden
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: 'none', zIndex: 0 }}
            />
            <canvas
                ref={animRef}
                aria-hidden
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: 'none', zIndex: 1 }}
            />
        </>
    )
}
