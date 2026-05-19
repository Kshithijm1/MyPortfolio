'use client'

import { useState, useEffect, useRef } from 'react'

export default function LoadingScreen() {
    const [visible, setVisible] = useState(true)
    const [fading, setFading] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    const dismiss = () => {
        setFading(true)
        setTimeout(() => setVisible(false), 600)
    }

    // Force muted property and trigger play as soon as the video can play.
    // Using an event listener (not onCanPlay JSX prop) is more reliable in React.
    useEffect(() => {
        const v = videoRef.current
        if (!v) return
        v.muted = true
        const onCanPlay = () => { v.play().catch(() => {}) }
        v.addEventListener('canplay', onCanPlay, { once: true })
        // If already ready, fire immediately
        if (v.readyState >= 3) onCanPlay()
        return () => v.removeEventListener('canplay', onCanPlay)
    }, [])

    // Safety fallback so the site is never permanently blocked
    useEffect(() => {
        const id = setTimeout(dismiss, 8000)
        return () => clearTimeout(id)
    }, [])

    // Lock background scroll while the screen is up
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    if (!visible) return null

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: fading ? 0 : 1,
                transition: 'opacity 0.6s ease-in-out',
            }}
        >
            <video
                ref={videoRef}
                src="/logo.mp4"
                playsInline
                preload="auto"
                style={{ width: '14rem', height: 'auto' }}
                onEnded={dismiss}
                onError={dismiss}
            />
        </div>
    )
}
