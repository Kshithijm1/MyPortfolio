'use client'

import TextScramble from './TextScramble'
import Typewriter from './Typewriter'
import { useScrollThreshold } from '@/hooks/useScrollThreshold'
import { motion, AnimatePresence } from 'framer-motion'

export default function Hero() {
    const isScrolled = useScrollThreshold(100)

    return (
        <section className="h-screen w-full flex flex-col justify-center items-center relative z-10 pointer-events-none">

            {/* Soft radial scrim — darkens only the region behind the name/tagline,
                invisible as a shape, prevents the bright sun washing out the text */}
            <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse 70% 55% at 50% 46%, rgba(0,0,4,0.65) 0%, rgba(0,0,4,0.32) 45%, transparent 72%)',
                    zIndex: 0,
                }}
            />

            <div className="relative z-10 text-center flex flex-col justify-center items-center gap-8">

                <AnimatePresence mode="popLayout">
                    {!isScrolled && (
                        <div className="flex flex-col items-center gap-2">
                            {/* First name — large display serif, clean */}
                            <motion.h1
                                layoutId="hero-name-first"
                                transition={{ type: 'spring', stiffness: 120, damping: 22 }}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }}
                                className="leading-none font-light text-white/92"
                                style={{
                                    fontFamily: 'var(--font-display), serif',
                                    fontSize: 'clamp(3.2rem, 10vw, 7.5rem)',
                                    letterSpacing: '-0.02em',
                                    textShadow: '0 2px 16px rgba(0,0,0,0.65)',
                                }}
                            >
                                <TextScramble>Kshithij</TextScramble>
                            </motion.h1>

                            {/* Last name — small mono, tracked, muted */}
                            <motion.div
                                layoutId="hero-name-last"
                                transition={{ type: 'spring', stiffness: 120, damping: 22 }}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6, transition: { duration: 0.18 } }}
                                className="text-instrument text-white/45"
                                style={{
                                    fontSize: 'clamp(0.6rem, 1.6vw, 0.88rem)',
                                    letterSpacing: '0.38em',
                                    textShadow: '0 1px 8px rgba(0,0,0,0.7)',
                                }}
                            >
                                MALEBENNUR
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Typewriter — plain mono, no glass pill */}
                <div
                    className="text-instrument text-[11px] text-white/50"
                    style={{
                        letterSpacing: '0.12em',
                        textShadow: '0 1px 8px rgba(0,0,0,0.8)',
                    }}
                >
                    <Typewriter
                        phrases={[
                            'Engineering Student @ UofG',
                            'Full Stack Intern @ Scotiabank',
                        ]}
                        typeSpeed={42}
                        deleteSpeed={22}
                        holdAfterType={1800}
                        holdAfterDelete={320}
                        startDelay={600}
                        cursorColor="rgba(255,255,255,0.35)"
                    />
                </div>
            </div>
        </section>
    )
}
