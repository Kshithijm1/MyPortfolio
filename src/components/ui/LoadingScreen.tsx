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

    useEffect(() => {
        const v = videoRef.current
        if (!v) return

        // Set both DOM properties — React's JSX attributes don't always set them
        v.muted = true
        v.autoplay = true

        const tryPlay = () => {
            v.muted = true
            v.play().catch(() => {})
        }

        if (v.readyState >= 3) {
            tryPlay()
        } else {
            // Two events: whichever fires first triggers play
            v.addEventListener('canplay', tryPlay, { once: true })
            v.addEventListener('loadeddata', tryPlay, { once: true })
        }

        return () => {
            v.removeEventListener('canplay', tryPlay)
            v.removeEventListener('loadeddata', tryPlay)
        }
    }, [])

    // Safety: never permanently block the site
    useEffect(() => {
        const id = setTimeout(dismiss, 8000)
        return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
                pointerEvents: fading ? 'none' : 'auto',
            }}
        >
            <video
                ref={videoRef}
                src="logo.mp4"
                autoPlay
                muted
                playsInline
                preload="auto"
                poster="logo.png"
                style={{ width: '240px', height: 'auto', display: 'block' }}
                onEnded={dismiss}
                onError={dismiss}
            />
        </div>
    )
}
