'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * Spacecraft-instrument targeting reticle. A small precision crosshair with
 * four floating tick marks, a hairline ring, and a soft cyan halo when hovering
 * an interactive surface. Inverts via mix-blend-difference so it remains legible
 * against bright glass panels and dark space alike.
 */
export default function CustomCursor() {
    const cursorX = useMotionValue(-200)
    const cursorY = useMotionValue(-200)
    const [interactive, setInteractive] = useState(false)
    const [visible, setVisible] = useState(false)

    const x = useSpring(cursorX, { damping: 35, stiffness: 800, mass: 0.4 })
    const y = useSpring(cursorY, { damping: 35, stiffness: 800, mass: 0.4 })

    useEffect(() => {
        const move = (e: MouseEvent) => {
            cursorX.set(e.clientX)
            cursorY.set(e.clientY)
            if (!visible) setVisible(true)

            // Detect hover over actionable surfaces
            const t = e.target as HTMLElement | null
            if (t && t.closest('a, button, [role="button"], input, textarea, [data-cursor="hover"]')) {
                setInteractive(true)
            } else {
                setInteractive(false)
            }
        }
        const leave = () => setVisible(false)

        window.addEventListener('mousemove', move)
        window.addEventListener('mouseleave', leave)
        return () => {
            window.removeEventListener('mousemove', move)
            window.removeEventListener('mouseleave', leave)
        }
    }, [cursorX, cursorY, visible])

    return (
        <motion.div
            aria-hidden
            className="pointer-events-none fixed top-0 left-0 z-[9999]"
            style={{
                x,
                y,
                opacity: visible ? 1 : 0,
                mixBlendMode: 'difference',
                width: 36,
                height: 36,
                marginLeft: -18,
                marginTop: -18,
                transition: 'opacity 220ms ease-out',
            }}
        >
            <motion.svg
                viewBox="0 0 36 36"
                width="36"
                height="36"
                animate={{
                    scale: interactive ? 1.45 : 1,
                    rotate: interactive ? 45 : 0,
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                style={{ display: 'block' }}
            >
                {/* outer hairline ring */}
                <circle
                    cx="18"
                    cy="18"
                    r="11"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="0.6"
                    opacity={interactive ? 0.85 : 0.55}
                />

                {/* four directional tick marks */}
                <line x1="18" y1="2"  x2="18" y2="6"  stroke="#ffffff" strokeWidth="0.8" opacity="0.85" />
                <line x1="18" y1="30" x2="18" y2="34" stroke="#ffffff" strokeWidth="0.8" opacity="0.85" />
                <line x1="2"  y1="18" x2="6"  y2="18" stroke="#ffffff" strokeWidth="0.8" opacity="0.85" />
                <line x1="30" y1="18" x2="34" y2="18" stroke="#ffffff" strokeWidth="0.8" opacity="0.85" />

                {/* central crosshair */}
                <line x1="18" y1="13" x2="18" y2="16" stroke="#ffffff" strokeWidth="0.7" />
                <line x1="18" y1="20" x2="18" y2="23" stroke="#ffffff" strokeWidth="0.7" />
                <line x1="13" y1="18" x2="16" y2="18" stroke="#ffffff" strokeWidth="0.7" />
                <line x1="20" y1="18" x2="23" y2="18" stroke="#ffffff" strokeWidth="0.7" />

                {/* center dot — only when hovering interactive */}
                {interactive && (
                    <circle cx="18" cy="18" r="1.4" fill="#ffffff" />
                )}
            </motion.svg>
        </motion.div>
    )
}
