'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const EXPERIENCE_DATA = [
    {
        year: 'Jan 2026 — Present',
        title: 'Full Stack Engineering Intern',
        company: 'Scotiabank — InvestIQ Team',
        description: 'Engineered a SharePoint-style hierarchical document folder system from scratch using Node.js and GCP, delivering the team\'s primary March milestone. Architected an internal agentic workflow POC using LangChain, LangGraph, Node.js, BigQuery, and Plotly — enabling portfolio managers to query financial data via natural language and receive real-time chart visualizations without writing SQL. Led a 5-person team in "Curiosity," an agentic internal knowledge platform; placed 2nd of 6 teams company-wide with projected savings of $7.8M and 6–8 weeks of onboarding time per new hire.',
        skills: ['React', 'TypeScript', 'Node.js', 'GCP', 'LangChain', 'LangGraph', 'BigQuery', 'Material-UI']
    },
    {
        year: 'April 2025',
        title: 'Registration Officer',
        company: 'Elections Canada',
        description: 'Verified voter ID and proof of residence to meet federal eligibility standards with zero audit discrepancies. Processed up to 600 registration, assisted-voting, and vouching forms per day into the National Register of Electors. Worked alongside poll clerks on election night to tally and report ballots accurately under tight deadlines.',
        skills: ['Data Entry', 'Compliance', 'Federal Elections']
    },
    {
        year: 'Sept 2024 — Sept 2025',
        title: 'Robotics Team Member',
        company: 'Gryphon Robotics — University of Guelph',
        description: 'Engaged in the design, development, and programming of autonomous and remote-controlled robots, building skills in robotics systems, coding, and team collaboration.',
        skills: ['ROS', 'C++', 'Python', 'Robotics', 'Autonomous Systems']
    },
    {
        year: 'Aug 2023 — May 2024',
        title: 'Co-Founder',
        company: 'Vasant Noire',
        description: 'Designed a user-focused, responsive website using HTML, CSS, and JavaScript. Designed consumer fashion attires based on luxury and streetwear trends. Produced 3D advertising content with Blender animations and SolidWorks 3D modeling to boost marketing.',
        skills: ['HTML', 'CSS', 'JavaScript', 'Blender', 'SolidWorks']
    },
    {
        year: 'May 2022 — Dec 2022',
        title: 'Social Media Manager',
        company: 'SalKreation',
        description: 'Developed marketing content including blogs, promotional materials, and social media advertisements, enhancing brand visibility by 20%. Created an AI-powered tool leveraging machine learning to analyze viewer interactions per post and benchmark top-performing content.',
        skills: ['Content Creation', 'Machine Learning', 'Social Media', 'Analytics']
    },
    {
        year: 'Feb 2021 — Jun 2021',
        title: 'Vice President of Public Relations',
        company: 'Gavel Club — Uplus Education',
        description: 'Collaborated in weekly workshops to enhance public speaking and reduce social anxiety, achieving noticeable improvements over six months. Participated in executive meetings to increase social media viewership and devise engagement strategies.',
        skills: ['Public Relations', 'Public Speaking', 'Strategy']
    }
]

export default function Experience() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start center', 'end center']
    })

    const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1])

    return (
        <section ref={containerRef} className="container mx-auto px-6 md:px-8 py-28 relative z-10 min-h-screen flex flex-col items-center">

            {/* Section header */}
            <div className="w-full max-w-5xl mb-16">
                <div className="flex items-center gap-5 mb-10">
                    <span className="text-instrument text-[9px] text-white/18 tracking-[0.18em]">02</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <span className="text-instrument text-[9px] text-white/18 tracking-[0.18em]">EXPERIENCE</span>
                </div>
                <motion.h2
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
                    className="text-4xl md:text-5xl text-white"
                >
                    Experience
                </motion.h2>
            </div>

            <div className="relative w-full max-w-5xl">
                {/* Single centered timeline spine — desktop only */}
                <div
                    className="hidden md:block absolute top-0 bottom-0 overflow-hidden"
                    style={{
                        left: 'calc(50% - 0.5px)',
                        width: 1,
                        background: 'rgba(255,255,255,0.05)',
                    }}
                >
                    <motion.div
                        style={{ scaleY: lineScaleY, transformOrigin: 'top' }}
                        className="w-full h-full"
                    />
                </div>

                <div className="space-y-10 md:space-y-20">
                    {EXPERIENCE_DATA.map((item, i) => (
                        <div
                            key={i}
                            className={`relative flex flex-col md:flex-row gap-6 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                        >

                            {/* Card */}
                            <motion.div
                                initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                                className="md:w-1/2"
                            >
                                <div
                                    className={`p-6 border transition-colors duration-300 ${
                                        i % 2 === 0 ? 'md:mr-10' : 'md:ml-10'
                                    }`}
                                    style={{
                                        background: 'rgba(4,4,12,0.68)',
                                        borderColor: 'rgba(255,255,255,0.065)',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)')}
                                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.065)')}
                                >
                                    <span className="text-instrument text-[9px] text-white/22 tracking-[0.14em] block mb-3">
                                        {item.year}
                                    </span>
                                    <h3 className="text-[17px] font-medium text-white/90 mb-1 leading-snug">
                                        {item.title}
                                    </h3>
                                    <p className="text-white/38 text-sm mb-5 font-light">
                                        {item.company}
                                    </p>
                                    <p className="text-white/48 leading-[1.75] text-[13px]"
                                        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                        {item.description}
                                    </p>
                                    {item.skills.length > 0 && (
                                        <div
                                            className="flex flex-wrap gap-x-4 gap-y-1.5 mt-5 pt-4"
                                            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                                        >
                                            {item.skills.map(skill => (
                                                <span
                                                    key={skill}
                                                    className="text-instrument text-[8px] text-white/22 tracking-[0.10em]"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Layout balance spacer */}
                            <div className="hidden md:block md:w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
