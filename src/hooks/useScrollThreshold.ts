'use client'

import { useState, useEffect } from 'react'

export function useScrollThreshold(threshold = 100) {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > threshold)
        }
        window.addEventListener('scroll', handleScroll)
        handleScroll() // Check initial
        return () => window.removeEventListener('scroll', handleScroll)
    }, [threshold])

    return scrolled
}
