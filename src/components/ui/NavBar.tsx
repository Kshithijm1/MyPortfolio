'use client'

import { useState } from 'react'
import MagneticButton from './MagneticButton'
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
    const isScrolled = useScrollThreshold(100)

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center pointer-events-none transition-opacity duration-300 ${isHidden ? 'opacity-0' : 'opacity-100'}`}>
            {/* Scroll Name Animation Destination */}
            <div className="absolute left-6 top-6 pointer-events-auto">
                <AnimatePresence>
                    {isScrolled && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                            className="glass-panel px-6 py-2 rounded-full cursor-pointer flex items-center gap-2"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            <motion.span
                                layoutId="hero-name-first"
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                className="font-bold text-white text-lg tracking-tight"
                            >
                                Kshithij
                            </motion.span>

                            <motion.span
                                layoutId="hero-name-last"
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                className="font-bold text-gray-400 text-lg tracking-tight"
                            >
                                Malebennur
                            </motion.span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Desktop Nav - Centered & Glassmorphic */}
            <ul className="hidden md:flex gap-8 mx-auto glass-panel px-8 py-4 rounded-full pointer-events-auto">
                {LINKS.map((link) => (
                    <li key={link.name}>
                        <MagneticButton className="block">
                            <a
                                href={link.href}
                                onClick={() => setActive(link.name)}
                                className={`text-sm tracking-widest transition-colors duration-300 hover:text-white px-4 py-2 block ${active === link.name ? 'text-white font-bold' : 'text-gray-400'}`}
                            >
                                {link.name}
                            </a>
                        </MagneticButton>
                    </li>
                ))}
            </ul>

            {/* Mobile Nav - Hamburger */}
            <div className="md:hidden pointer-events-auto ml-auto">
                <details className="group relative">
                    <summary className="list-none cursor-pointer glass-panel p-3 rounded-lg text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </summary>

                    <ul className="absolute right-0 top-12 w-48 glass-panel p-4 rounded-xl flex flex-col gap-4">
                        {LINKS.map((link) => (
                            <li key={link.name}>
                                <a
                                    href={link.href}
                                    onClick={() => setActive(link.name)}
                                    className={`block text-sm transition-colors duration-300 hover:text-white ${active === link.name ? 'text-white font-bold' : 'text-gray-400'}`}
                                >
                                    {link.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </details>
            </div>
        </nav>
    )
}
