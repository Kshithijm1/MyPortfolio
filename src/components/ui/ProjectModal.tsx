'use client'

import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

interface ProjectModalProps {
    project: any
    onClose: () => void
}

const TABS = ['Overview', 'Specs', 'Challenges']

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
    const [activeTab, setActiveTab] = useState('Overview')

    // Tilt Logic for Visual Side
    const ref = useRef<HTMLDivElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"])
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return
        const rect = ref.current.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        const xPct = mouseX / width - 0.5
        const yPct = mouseY / height - 0.5
        x.set(xPct)
        y.set(yPct)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    if (!project) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 pointer-events-auto">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Content */}
            <motion.div
                layoutId={`card-${project.title}`}
                className="relative w-full max-w-7xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row min-h-[85vh] max-h-[90vh]"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
                {/* Visual Side (Left/Top) with Interactive Tilt */}
                <div
                    className="w-full md:w-1/2 relative overflow-hidden bg-[#050505]"
                    ref={ref}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    <motion.div
                        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                        className={`absolute inset-4 rounded-2xl bg-gradient-to-br ${project.color} flex flex-col justify-end p-8 shadow-inner border border-white/5`}
                    >
                        <div style={{ transform: "translateZ(30px)" }} className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>

                        <motion.h2
                            style={{ transform: "translateZ(80px)" }}
                            className="text-4xl md:text-6xl font-bold text-white relative z-10 mb-4 tracking-tighter"
                        >
                            {project.title}
                        </motion.h2>
                        <motion.p
                            style={{ transform: "translateZ(60px)" }}
                            className="text-white/80 font-mono relative z-10 text-lg"
                        >
                            {project.description}
                        </motion.p>
                    </motion.div>
                </div>

                {/* Details Side (Right/Bottom) */}
                <div className="w-full md:w-1/2 bg-black/90 text-gray-300 flex flex-col h-full overflow-hidden">
                    {/* Header with Close & Tabs */}
                    <div className="p-8 pb-0 shrink-0">
                        <div className="flex justify-end mb-6">
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Interactive Tab Switcher */}
                        <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 mb-6 backdrop-blur-md">
                            {TABS.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors z-10 ${activeTab === tab ? 'text-black' : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white rounded-lg -z-10 shadow-lg"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="p-8 pt-2 overflow-y-auto flex-grow custom-scrollbar">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'Overview' && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold text-white">Project Vision</h3>
                                        <p className="leading-relaxed text-gray-300 text-lg">
                                            {project.overview}
                                        </p>
                                    </div>
                                )}

                                {activeTab === 'Specs' && (
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-3">Tech Stack</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {project.tags.map((tag: string) => (
                                                    <span key={tag} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-cyan-400 font-mono text-sm">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-3">Key Features</h3>
                                            <ul className="space-y-3 text-gray-400">
                                                {project.features?.map((feature: string, i: number) => (
                                                    <li key={i} className="flex gap-3 items-start p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                                                        <span className="text-sm">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'Challenges' && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold text-white">Engineering Hurdles</h3>
                                        <div className="grid gap-4">
                                            {project.challenges?.map((challenge: string, i: number) => (
                                                <div key={i} className="p-4 rounded-xl border border-red-500/20 bg-red-900/10">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-400">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                                        </svg>
                                                        <span className="text-white font-bold text-sm">Challenge #{i + 1}</span>
                                                    </div>
                                                    <p className="text-gray-400 text-sm ml-8">{challenge}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Sticky Footer for Buttons */}
                    <div className="p-8 pt-6 border-t border-white/10 bg-black z-20 shrink-0 mt-auto">
                        <div className="flex gap-4">
                            <a
                                href={project.liveLink || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 group"
                            >
                                <span>Live Demo</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </a>
                            <a
                                href={project.githubLink || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-4 border border-white/20 hover:bg-white/10 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-white group"
                            >
                                <span>GitHub</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="group-hover:rotate-12 transition-transform">
                                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
