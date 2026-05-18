'use client'

import { motion } from 'framer-motion'

const EDUCATION_DATA = [
    {
        degree: 'Bachelor of Engineering, Engineering Systems and Computing (Co-op)',
        school: 'University of Guelph',
        year: 'Sep 2023 - Present',
        description: 'Relevant coursework: Object-Oriented Programming, Data Structures, Linear Algebra, Digital Systems Design. Member of the Gryphon Robotics Team (Sept 2024 – Sept 2025).',
        logo: 'https://content.sportslogos.net/news/2025/03/primary-academic-logo-20250324-university-of-guelph-gryphons-evolved-brand-visual-identity-logo-griffin-ontario-U-Sports.jpg',
        initials: 'UofG'
    }
]

const CERTIFICATIONS = [
    { name: 'Harvard CS50 AI with Python', date: 'Mar 2025' },
    { name: 'Harvard CS50 Computer Science', date: 'May 2023' },
    { name: 'CSWA SolidWorks Certification', date: 'Dec 2022' },
    { name: 'CPR-C First Aid Certification', date: 'Aug 2022' },
]

export default function Education() {
    return (
        <section className="container mx-auto px-4 py-24 relative z-10 flex flex-col items-center">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold mb-16 text-center text-white"
            >
                Education
            </motion.h2>

            <div className="w-full max-w-4xl space-y-8">
                {EDUCATION_DATA.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="glass-panel p-8 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-colors flex flex-col md:flex-row items-center md:items-start gap-6 group"
                    >
                        <div className="shrink-0">
                            <div className="w-24 h-16 rounded-xl bg-white text-black flex items-center justify-center text-xl font-bold group-hover:scale-105 transition-transform duration-300 shadow-[0_0_15px_rgba(6,182,212,0.1)] overflow-hidden">
                                {item.logo ? (
                                    <img src={item.logo} alt={item.school} className="w-full h-full object-contain p-1" />
                                ) : (
                                    item.initials
                                )}
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{item.degree}</h3>
                            <p className="text-purple-400 font-medium text-lg mb-2">{item.school}</p>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
                                {item.description}
                            </p>
                        </div>

                        <div className="shrink-0 mt-4 md:mt-0">
                            <span className="inline-block px-4 py-2 text-sm font-bold tracking-wider text-white bg-white/5 rounded-lg border border-white/10">
                                {item.year}
                            </span>
                        </div>
                    </motion.div>
                ))}

                {/* Certifications */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="glass-panel p-8 rounded-2xl border border-white/10"
                >
                    <h3 className="text-xl font-bold text-white mb-6">Certifications</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {CERTIFICATIONS.map((cert, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.08 }}
                                className="flex items-center justify-between gap-4 bg-white/5 rounded-xl px-4 py-3 border border-white/5 hover:border-cyan-500/30 transition-colors group"
                            >
                                <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{cert.name}</span>
                                <span className="text-xs text-cyan-400 font-mono shrink-0">{cert.date}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
