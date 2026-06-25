'use client'

import { useState } from 'react'
import { useScrollThreshold } from '@/hooks/useScrollThreshold'
import { motion, AnimatePresence } from 'framer-motion'

const LINKS = [
    { name: 'Home', href: '#' },
    { name: 'Projects', href: '#projects' },
    { name: 'Experience', href: '#experience' },
    { name: 'Education', href: '#education' },
    { name: 'Contact', href: '#contact' }
]

export default function NavBar({ isHidden = false }: { isHidden?: boolean }) {
    const [active, setActive] = useState('Home')
    const [mobileOpen, setMobileOpen] = useState(false)
    const isScrolled = useScrollThreshold(100)

    return (
        <>
            {/* Readability gradient — no blur, no repaint cost */}
            <div
                className="fixed top-0 left-0 right-0 z-40 pointer-events-none"
                style={{ height: 96, background: 'linear-gradient(to bottom, rgba(0,0,0,0.40) 0%, transparent 100%)' }}
            />

            <nav className={`fixed top-0 left-0 right-0 z-50 pointer-events-none transition-opacity duration-300 ${isHidden ? 'opacity-0' : 'opacity-100'}`}>
                <div className="flex items-center justify-between px-8 pt-6 pb-4">

                    {/* Left: Name (fades in when scrolled past hero) */}
                    <div className="flex-1 pointer-events-auto min-w-0">
                        <AnimatePresence>
                            {isScrolled && (
                                <motion.button
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className="cursor-pointer text-left"
                                >
                                    <motion.span
                                        layoutId="hero-name-first"
                                        transition={{ type: 'spring', stiffness: 120, damping: 22 }}
                                        className="text-instrument text-[10px] tracking-[0.14em] text-white/55 hover:text-white/80 transition-colors duration-200"
                                    >
                                        KSHITHIJ
                                    </motion.span>
                                    <span className="text-instrument text-[10px] tracking-[0.14em] text-white/25 ml-2">
                                        MALEBENNUR
                                    </span>
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Center: Desktop nav links */}
                    <ul className="hidden md:flex items-center gap-9 pointer-events-auto">
                        {LINKS.map((link) => (
                            <li key={link.name} className="relative">
                                <a
                                    href={link.href}
                                    onClick={() => setActive(link.name)}
                                    className={`block text-instrument text-[10px] tracking-[0.14em] pb-0.5 transition-colors duration-200 ${
                                        active === link.name
                                            ? 'text-white/80'
                                            : 'text-white/30 hover:text-white/60'
                                    }`}
                                >
                                    {link.name.toUpperCase()}
                                </a>
                                {active === link.name && (
                                    <motion.div
                                        layoutId="nav-underline"
                                        className="absolute -bottom-0.5 left-0 right-0 h-px"
                                        style={{ background: 'rgba(255,255,255,0.45)' }}
                                        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                                    />
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Right: Mobile toggle + spacer */}
                    <div className="flex-1 flex justify-end pointer-events-auto">
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden text-white/35 hover:text-white/65 transition-colors duration-200 p-1"
                            aria-label="Toggle navigation"
                        >
                            <div className="flex flex-col justify-center gap-[5px] w-5 h-5">
                                <span
                                    className="block h-px bg-current transition-all duration-300 origin-center"
                                    style={{ transform: mobileOpen ? 'rotate(45deg) translateY(6px)' : 'none' }}
                                />
                                <span
                                    className="block h-px bg-current transition-all duration-300"
                                    style={{ opacity: mobileOpen ? 0 : 1 }}
                                />
                                <span
                                    className="block h-px bg-current transition-all duration-300 origin-center"
                                    style={{ transform: mobileOpen ? 'rotate(-45deg) translateY(-6px)' : 'none' }}
                                />
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile dropdown — no backdrop-filter */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.18 }}
                            className="md:hidden pointer-events-auto mx-6 mt-1"
                            style={{
                                background: 'rgba(3,3,10,0.96)',
                                border: '1px solid rgba(255,255,255,0.07)',
                            }}
                        >
                            <ul className="py-2">
                                {LINKS.map((link) => (
                                    <li key={link.name}>
                                        <a
                                            href={link.href}
                                            onClick={() => { setActive(link.name); setMobileOpen(false) }}
                                            className={`block px-6 py-3 text-instrument text-[10px] tracking-[0.14em] transition-colors duration-200 ${
                                                active === link.name
                                                    ? 'text-white/75'
                                                    : 'text-white/30 hover:text-white/58'
                                            }`}
                                        >
                                            {link.name.toUpperCase()}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </>
    )
}
