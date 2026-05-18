'use client'

import { useState, useEffect } from 'react'

export function useScrollThreshold(threshold = 100) {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        let frame = 0
        let last = scrolled

        const evaluate = () => {
            frame = 0
            const next = window.scrollY > threshold
            if (next !== last) {
                last = next
                setScrolled(next)
            }
        }

        const handleScroll = () => {
            if (frame === 0) frame = requestAnimationFrame(evaluate)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        evaluate()

        return () => {
            window.removeEventListener('scroll', handleScroll)
            if (frame !== 0) cancelAnimationFrame(frame)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [threshold])

    return scrolled
}
