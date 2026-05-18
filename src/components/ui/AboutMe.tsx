'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import TextScramble from './TextScramble'

export default function AboutMe() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 90%", "center center"]
    })

    // Card 3D Entrance: Rotates up from "laying flat"
    const rotateX = useTransform(scrollYProgress, [0, 1], [50, 0])
    const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1])
    const opacity = useTransform(scrollYProgress, [0, 0.8], [0, 1])

    // Split Assembly: Left (Title) shoots from left, Right (Content) shoots from right
    // They "lock" into place at the center
    const xLeft = useTransform(scrollYProgress, [0, 1], [-100, 0])
    const xRight = useTransform(scrollYProgress, [0, 1], [100, 0])
    const blur = useTransform(scrollYProgress, [0, 1], [10, 0])

    return (
        <section ref={containerRef} className="container mx-auto px-4 py-24 relative z-10 flex flex-col items-center justify-center min-h-[50vh]">
            <motion.div
                style={{
                    rotateX,
                    scale,
                    opacity,
                    transformPerspective: 1000,
                    transformStyle: 'preserve-3d'
                }}
                className="glass-panel p-8 md:p-12 rounded-3xl max-w-4xl w-full border border-white/10 hover:border-cyan-500/20 transition-colors relative"
            >
                <div className="flex flex-col md:flex-row gap-12 items-center">
                    {/* Visual / Title Side (Left Slide) */}
                    <motion.div
                        style={{ x: xLeft, filter: `blur(${blur}px)` }}
                        className="w-full md:w-1/3 text-center md:text-left"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            About <span className="text-cyan-400">Me</span>
                        </h2>
                        <div className="h-1 w-20 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mx-auto md:mx-0 mb-6 shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                        <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">
                            <TextScramble>THE ORIGIN STORY</TextScramble>
                        </p>
                    </motion.div>

                    {/* Content Side (Right Slide) */}
                    <motion.div
                        style={{ x: xRight, filter: `blur(${blur}px)` }}
                        className="w-full md:w-2/3 text-gray-300 leading-relaxed space-y-6 text-base md:text-lg bg-black/20 p-6 rounded-2xl border border-white/5 relative"
                    >
                        <p className="flex flex-wrap gap-x-1.5 gap-y-1">
                            {processText("My journey didn't start with a career plan; it started with a movie and a conversation. I was in Grade 6, completely captivated by the")}
                            <Word className="text-cyan-400 font-bold">Iron Man</Word>
                            {processText("films and the idea that one person could build the future in a garage.")}
                        </p>

                        <p className="flex flex-wrap gap-x-1.5 gap-y-1">
                            {processText("Then came the pivotal moment: my dad walked into my room one afternoon and introduced me to")}
                            <Word className="text-white font-bold">Python.</Word>
                            {processText("He showed me that the \"magic\" I saw on screen was actually just logic and syntax. That day changed everything. I fell in love with the ability to create something from nothing, spending hours writing code that brought my ideas to life.")}
                        </p>

                        <p className="flex flex-wrap gap-x-1.5 gap-y-1">
                            {processText("That childhood obsession evolved into a discipline. Today, as an Engineering Systems and Computing student at the")}
                            <Word className="text-white font-bold">University of Guelph</Word>
                            {processText("and a Full Stack Intern at")}
                            <Word className="text-cyan-400 font-bold">Scotiabank,</Word>
                            {processText("I’m still chasing that same feeling. I code because I love the craft, the challenge, and the endless possibility that comes with typing that first line.")}
                        </p>

                        <p className="italic text-gray-400 border-l-2 border-cyan-500/50 pl-4 flex flex-wrap gap-x-1.5 gap-y-1">
                            {processText("If you're excited about building the future, or just want to nerd out about Iron Man tech, we'll get along just fine.")}
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    )
}

// --- Helpers ---

const Word = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    return (
        <span className={`relative inline-block group cursor-default ${className}`}>
            <span className="absolute left-0 -translate-x-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-cyan-400 font-mono select-none font-bold">
                [
            </span>
            <span className="group-hover:text-cyan-200 transition-colors duration-200">
                {children}
            </span>
            <span className="absolute right-0 translate-x-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-cyan-400 font-mono select-none font-bold">
                ]
            </span>
        </span>
    )
}

const processText = (text: string) => {
    return text.split(" ").map((word, i) => (
        <Word key={i}>{word}</Word>
    ))
}
