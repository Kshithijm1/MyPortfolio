'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoadingScreen() {
    const [done, setDone] = useState(false)

    // Safety fallback: never permanently block the site
    useEffect(() => {
        const id = setTimeout(() => setDone(true), 8000)
        return () => clearTimeout(id)
    }, [])

    // Lock background scroll while loading
    useEffect(() => {
        if (done) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = prev }
    }, [done])

    return (
        <AnimatePresence>
            {!done && (
                <motion.div
                    key="loading"
                    className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                >
                    <video
                        src="/logo.mp4"
                        autoPlay
                        muted
                        playsInline
                        preload="auto"
                        className="w-48 sm:w-64 h-auto object-contain"
                        onEnded={() => setDone(true)}
                        onError={() => setDone(true)}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    )
}
