'use client'

import { motion } from 'framer-motion'

const SOCIALS = [
    { name: 'Twitter', href: 'https://x.com/KshithijM05' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/kshithijmalebennur/' },
    { name: 'GitHub', href: 'https://github.com/Kshithijm1' },
    { name: 'Instagram', href: 'https://instagram.com/kshithij.malebennur' },
]

export default function Contact() {
    return (
        <section className="container mx-auto px-6 md:px-8 py-28 relative z-10 min-h-screen flex items-center justify-center">
            <div className="w-full max-w-5xl">

                {/* Section header */}
                <div className="flex items-center gap-5 mb-16">
                    <span className="text-instrument text-[9px] text-white/18 tracking-[0.18em]">04</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <span className="text-instrument text-[9px] text-white/18 tracking-[0.18em]">CONTACT</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

                    {/* Left: Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                        <h2 className="text-4xl md:text-6xl text-white mb-6 leading-[1.05]">
                            Let&apos;s<br />Connect
                        </h2>
                        <p className="text-white/45 text-[14px] leading-[1.8] mb-10 max-w-sm">
                            Have a project in mind or looking to collaborate?
                            Send a message and let&apos;s build something together.
                        </p>

                        {/* Email */}
                        <a
                            href="mailto:Kshithij.m@gmail.com"
                            className="flex items-center gap-3 text-white/55 hover:text-white/85 transition-colors duration-200 group mb-10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 opacity-50">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                            <span className="text-[13px] group-hover:underline underline-offset-4">Kshithij.m@gmail.com</span>
                        </a>

                        {/* Social links — plain inline with separators */}
                        <div className="flex items-center gap-0 flex-wrap">
                            {SOCIALS.map((social, i) => (
                                <span key={social.name} className="flex items-center">
                                    <a
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-instrument text-[9px] tracking-[0.12em] text-white/28 hover:text-white/65 transition-colors duration-200 py-1 px-2 hover:underline underline-offset-4"
                                    >
                                        {social.name.toUpperCase()}
                                    </a>
                                    {i < SOCIALS.length - 1 && (
                                        <span className="text-white/12 text-[9px]">/</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right: Form — flat underline-style inputs, no glass */}
                    <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                            <div>
                                <label className="block text-instrument text-[9px] text-white/30 tracking-[0.14em] mb-3">
                                    NAME
                                </label>
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    className="w-full bg-transparent text-white/75 text-[14px] placeholder-white/18 focus:outline-none pb-3 transition-colors duration-200"
                                    style={{
                                        borderBottom: '1px solid rgba(255,255,255,0.12)',
                                    }}
                                    onFocus={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.45)')}
                                    onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.12)')}
                                />
                            </div>

                            <div>
                                <label className="block text-instrument text-[9px] text-white/30 tracking-[0.14em] mb-3">
                                    EMAIL
                                </label>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="w-full bg-transparent text-white/75 text-[14px] placeholder-white/18 focus:outline-none pb-3 transition-colors duration-200"
                                    style={{
                                        borderBottom: '1px solid rgba(255,255,255,0.12)',
                                    }}
                                    onFocus={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.45)')}
                                    onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.12)')}
                                />
                            </div>

                            <div>
                                <label className="block text-instrument text-[9px] text-white/30 tracking-[0.14em] mb-3">
                                    MESSAGE
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Tell me about your project..."
                                    className="w-full bg-transparent text-white/75 text-[14px] placeholder-white/18 focus:outline-none pb-3 resize-none transition-colors duration-200"
                                    style={{
                                        borderBottom: '1px solid rgba(255,255,255,0.12)',
                                    }}
                                    onFocus={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.45)')}
                                    onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.12)')}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full flex items-center justify-between px-6 py-4 text-[13px] font-medium text-black bg-white/90 hover:bg-white transition-colors duration-200 group"
                            >
                                <span>Send Message</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
