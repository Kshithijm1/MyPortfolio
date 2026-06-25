'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import TextScramble from './TextScramble'

export default function AboutMe() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start 90%', 'center center']
    })

    const opacity = useTransform(scrollYProgress, [0, 0.55], [0, 1])
    const y = useTransform(scrollYProgress, [0, 1], [24, 0])
    const xLeft = useTransform(scrollYProgress, [0, 1], [-32, 0])
    const xRight = useTransform(scrollYProgress, [0, 1], [32, 0])

    return (
        <section
            ref={containerRef}
            className="container mx-auto px-6 md:px-8 py-28 relative z-10 flex flex-col items-center justify-center min-h-[50vh]"
        >
            <motion.div style={{ opacity, y }} className="max-w-4xl w-full">

                {/* Section marker */}
                <div className="flex items-center gap-5 mb-14">
                    <span className="text-instrument text-[9px] text-white/18 tracking-[0.18em]">01</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <span className="text-instrument text-[9px] text-white/18 tracking-[0.18em]">ABOUT</span>
                </div>

                <div className="flex flex-col md:flex-row gap-12 md:gap-20">

                    {/* Left: Title */}
                    <motion.div style={{ x: xLeft }} className="w-full md:w-1/3 md:pt-1">
                        <h2 className="text-4xl md:text-5xl text-white mb-7 leading-[1.05]">
                            About<br />Me
                        </h2>
                        <div className="h-px w-10 mb-6" style={{ background: 'rgba(255,255,255,0.18)' }} />
                        <p className="text-instrument text-[9px] text-white/28 tracking-[0.16em]">
                            <TextScramble>THE ORIGIN STORY</TextScramble>
                        </p>
                    </motion.div>

                    {/* Right: Story — dark solid backing for readability, no backdrop-filter */}
                    <motion.div style={{ x: xRight }} className="w-full md:w-2/3 relative">
                        {/* Solid dark scrim — improves legibility without any glass blur */}
                        <div
                            className="absolute -inset-5 md:-inset-8 -z-10"
                            style={{
                                background: 'rgba(3,3,9,0.60)',
                                borderLeft: '1px solid rgba(255,255,255,0.055)',
                            }}
                        />

                        <div className="space-y-6">
                            <p className="text-white/72 leading-[1.82] text-[14.5px]"
                                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                                My journey didn&apos;t start with a career plan; it started with a movie and a
                                conversation. I was in Grade 6, completely captivated by the{' '}
                                <span className="text-white font-medium">Iron Man</span>{' '}
                                films and the idea that one person could build the future in a garage.
                            </p>

                            <p className="text-white/72 leading-[1.82] text-[14.5px]"
                                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                                Then came the pivotal moment: my dad walked into my room one afternoon and
                                introduced me to{' '}
                                <span className="text-white font-medium">Python.</span>{' '}
                                He showed me that the &ldquo;magic&rdquo; I saw on screen was actually just logic
                                and syntax. That day changed everything — I fell in love with the ability to
                                create something from nothing.
                            </p>

                            <p className="text-white/72 leading-[1.82] text-[14.5px]"
                                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                                Today, as an Engineering Systems and Computing student at the{' '}
                                <span className="text-white font-medium">University of Guelph</span>{' '}
                                and a Full Stack Intern at{' '}
                                <span className="text-white font-medium">Scotiabank,</span>{' '}
                                I&apos;m still chasing that same feeling — building for the craft, the
                                challenge, and the endless possibility.
                            </p>

                            <p className="text-white/36 leading-[1.82] text-[13px] italic pl-5"
                                style={{
                                    borderLeft: '1px solid rgba(255,255,255,0.12)',
                                    textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                                }}>
                                If you&apos;re excited about building the future, or just want to nerd out about
                                Iron Man tech, we&apos;ll get along just fine.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    )
}
