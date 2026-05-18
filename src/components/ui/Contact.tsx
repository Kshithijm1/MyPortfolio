'use client'

import { motion } from 'framer-motion'
import MagneticButton from './MagneticButton'

export default function Contact() {
    return (
        <section className="container mx-auto px-4 py-24 relative z-10 min-h-screen flex items-center justify-center">
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                {/* Text Side */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">Let's <br /> Connect</h2>
                    <p className="text-gray-400 text-lg mb-8 max-w-md">
                        Have a project in mind? Looking to collaborate?
                        Send me a message and let's create something extraordinary together.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-white hover:text-cyan-400 transition-colors cursor-pointer">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                            </div>
                            <span className="text-xl">Kshithij.m@gmail.com</span>
                        </div>

                        <div className="flex gap-4 mt-8 flex-wrap">
                            {[
                                { name: 'Twitter', href: 'https://x.com/KshithijM05' },
                                { name: 'LinkedIn', href: 'https://www.linkedin.com/in/kshithijmalebennur/' },
                                { name: 'GitHub', href: 'https://github.com/Kshithijm1' },
                                { name: 'Instagram', href: 'https://instagram.com/kshithij.malebennur' }
                            ].map((social) => (
                                <MagneticButton key={social.name}>
                                    <a
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-3 rounded-full border border-white/10 bg-white/5 text-white text-sm hover:bg-white/10 transition-colors inline-block"
                                    >
                                        {social.name}
                                    </a>
                                </MagneticButton>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Form Side */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl"
                >
                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                            <input
                                type="text"
                                placeholder="Your Name"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                            <textarea
                                rows={4}
                                placeholder="Tell me about your project..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all resize-none"
                            />
                        </div>

                        <MagneticButton>
                            <button className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 group">
                                <span>Send Message</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </button>
                        </MagneticButton>
                    </form>
                </motion.div>

            </div>
        </section>
    )
}
