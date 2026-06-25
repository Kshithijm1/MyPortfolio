'use client'

import { motion } from 'framer-motion'

const EDUCATION_DATA = [
    {
        degree: 'Bachelor of Engineering, Engineering Systems and Computing (Co-op)',
        school: 'University of Guelph',
        year: 'Sep 2023 — Present',
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
        <section className="container mx-auto px-6 md:px-8 py-28 relative z-10 flex flex-col items-center">

            {/* Section header */}
            <div className="w-full max-w-4xl mb-16">
                <div className="flex items-center gap-5 mb-10">
                    <span className="text-instrument text-[9px] text-white/18 tracking-[0.18em]">03</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <span className="text-instrument text-[9px] text-white/18 tracking-[0.18em]">EDUCATION</span>
                </div>
                <motion.h2
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
                    className="text-4xl md:text-5xl text-white"
                >
                    Education
                </motion.h2>
            </div>

            <div className="w-full max-w-4xl space-y-6">
                {/* Degree cards */}
                {EDUCATION_DATA.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
                        className="flex flex-col md:flex-row items-start gap-6 p-6 border transition-colors duration-300"
                        style={{ background: 'rgba(4,4,12,0.68)', borderColor: 'rgba(255,255,255,0.065)' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.065)')}
                    >
                        {/* Logo */}
                        <div className="shrink-0 w-16 h-12 flex items-center justify-center overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.96)' }}>
                            {item.logo ? (
                                <img src={item.logo} alt={item.school} className="w-full h-full object-contain p-1" />
                            ) : (
                                <span className="text-instrument text-[10px] text-black tracking-widest">{item.initials}</span>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-[15px] font-medium text-white/90 mb-1 leading-snug">{item.degree}</h3>
                            <p className="text-white/40 text-sm mb-3 font-light">{item.school}</p>
                            <p className="text-white/48 text-[13px] leading-[1.75]"
                                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                {item.description}
                            </p>
                        </div>

                        {/* Year */}
                        <div className="shrink-0 md:pt-0.5">
                            <span className="text-instrument text-[9px] text-white/25 tracking-[0.14em] whitespace-nowrap">
                                {item.year}
                            </span>
                        </div>
                    </motion.div>
                ))}

                {/* Certifications */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.12, ease: [0.25, 0.1, 0.25, 1] }}
                    className="border"
                    style={{ background: 'rgba(4,4,12,0.68)', borderColor: 'rgba(255,255,255,0.065)' }}
                >
                    {/* Header row */}
                    <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="text-instrument text-[9px] text-white/30 tracking-[0.16em]">
                            CERTIFICATIONS
                        </span>
                    </div>

                    {/* List */}
                    <div>
                        {CERTIFICATIONS.map((cert, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.35, delay: i * 0.06 }}
                                className="flex items-center justify-between px-6 py-4"
                                style={{
                                    borderBottom: i < CERTIFICATIONS.length - 1
                                        ? '1px solid rgba(255,255,255,0.04)'
                                        : 'none'
                                }}
                            >
                                <span className="text-white/60 text-[13px]">{cert.name}</span>
                                <span className="text-instrument text-[9px] text-white/25 tracking-[0.12em] ml-6 shrink-0">
                                    {cert.date}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
