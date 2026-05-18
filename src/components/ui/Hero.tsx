'use client'

import TextScramble from './TextScramble'
import Typewriter from './Typewriter'
import { useScrollThreshold } from '@/hooks/useScrollThreshold'
import { motion, AnimatePresence } from 'framer-motion'

export default function Hero() {
    const isScrolled = useScrollThreshold(100)

    return (
        <section className="h-screen w-full flex flex-col justify-center items-center relative z-10 pointer-events-none">

            {/* Main Content Area - Auto Height for centering */}
            <div className="text-center flex flex-col justify-center items-center z-20">
                <AnimatePresence mode='popLayout'>
                    {!isScrolled && (
                        <div className="relative z-20 mb-6 flex flex-col items-center">
                            {/* First Name */}
                            <motion.h1
                                layoutId="hero-name-first"
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                className="text-6xl md:text-8xl font-light tracking-[-0.04em] leading-none"
                                style={{
                                    fontFamily: 'var(--font-hero), system-ui, sans-serif',
                                    color: '#9a9a9a',
                                    textShadow:
                                        '0 0 14px rgba(0, 0, 0, 0.95), 0 0 38px rgba(0, 0, 0, 0.75), 0 2px 6px rgba(0, 0, 0, 0.85)',
                                }}
                            >
                                <TextScramble>Kshithij</TextScramble>
                            </motion.h1>

                            {/* Last Name */}
                            <motion.h1
                                layoutId="hero-name-last"
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                className="text-4xl md:text-6xl font-light tracking-[-0.03em] mt-1"
                                style={{
                                    fontFamily: 'var(--font-hero), system-ui, sans-serif',
                                    color: '#9a9a9a',
                                    textShadow:
                                        '0 0 12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 0, 0, 0.7), 0 2px 5px rgba(0, 0, 0, 0.8)',
                                }}
                            >
                                <TextScramble>Malebennur</TextScramble>
                            </motion.h1>
                        </div>
                    )}
                </AnimatePresence>

                <p className="text-xl md:text-2xl text-gray-400 glass-panel inline-block px-6 py-2 rounded-full backdrop-blur-md">
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
                        cursorColor="#a0a0a0"
                    />
                </p>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 animate-bounce text-white/50">
                ↓ Scroll to Explore
            </div>
        </section>
    )
}
