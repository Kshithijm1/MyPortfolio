'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const EXPERIENCE_DATA = [
    {
        year: 'Jan 2026 - Present',
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
        year: 'Sept 2024 - Sept 2025',
        title: 'Robotics Team Member',
        company: 'Gryphon Robotics — University of Guelph',
        description: 'Engaged in the design, development, and programming of autonomous and remote-controlled robots, building skills in robotics systems, coding, and team collaboration.',
        skills: ['ROS', 'C++', 'Python', 'Robotics', 'Autonomous Systems']
    },
    {
        year: 'Aug 2023 - May 2024',
        title: 'Co-Founder',
        company: 'Vasant Noire',
        description: 'Designed a user-focused, responsive website using HTML, CSS, and JavaScript. Designed consumer fashion attires based on luxury and streetwear trends. Produced 3D advertising content with Blender animations and SolidWorks 3D modeling to boost marketing. Developed and executed test cases for the website to identify defects.',
        skills: ['HTML', 'CSS', 'JavaScript', 'Blender', 'SolidWorks']
    },
    {
        year: 'May 2022 - Dec 2022',
        title: 'Social Media Manager',
        company: 'SalKreation',
        description: 'Developed marketing content including blogs, promotional materials, and social media advertisements, enhancing brand visibility by 20%. Created an AI-powered tool leveraging machine learning to analyze viewer interactions per post and benchmark top-performing content within the same genre.',
        skills: ['Content Creation', 'Machine Learning', 'Social Media', 'Analytics']
    },
    {
        year: 'Feb 2021 - Jun 2021',
        title: 'Vice President of Public Relations',
        company: 'Gavel Club — Uplus Education',
        description: 'Collaborated in weekly workshops to enhance public speaking and reduce social anxiety, achieving noticeable improvements over six months. Participated in executive meetings to increase social media viewership and devise engagement strategies, successfully attracting a larger customer base.',
        skills: ['Public Relations', 'Public Speaking', 'Strategy']
    }
]

export default function Experience() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    })

    const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1])

    return (
        <section ref={containerRef} className="container mx-auto px-4 py-24 relative z-10 min-h-screen flex flex-col items-center">
            <motion.h2
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold mb-20 text-center text-white"
            >
                Experience
            </motion.h2>

            <div className="relative w-full max-w-5xl">
                {/* Center Line (Glowing Beam) */}
                <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-0.5 bg-white/5 md:-translate-x-1/2 rounded-full overflow-hidden">
                    <motion.div
                        style={{ scaleY, transformOrigin: 'top' }}
                        className="w-full h-full bg-gradient-to-b from-cyan-500 via-purple-500 to-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                    />
                </div>

                <div className="space-y-12 md:space-y-24">
                    {EXPERIENCE_DATA.map((item, i) => (
                        <div
                            key={i}
                            className={`relative flex flex-col md:flex-row gap-8 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                        >
                            {/* Dot - Scales up when line passes */}
                            <motion.div
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true, margin: "-20%" }}
                                transition={{ duration: 0.4, type: "spring" }}
                                className="absolute left-[11px] md:left-1/2 top-0 w-5 h-5 bg-black border-2 border-cyan-400 rounded-full z-10 md:-translate-x-1/2 translate-y-1.5 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                            >
                                <div className="absolute inset-1 bg-cyan-400 rounded-full animate-pulse" />
                            </motion.div>

                            {/* Content Side - Slides OUT from center */}
                            <motion.div
                                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50, filter: "blur(10px)" }}
                                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                                className="ml-12 md:ml-0 md:w-1/2"
                            >
                                <div className={`glass-panel p-6 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-colors group ${i % 2 === 0 ? 'md:mr-12' : 'md:ml-12'
                                    }`}>
                                    <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-cyan-400 uppercase bg-cyan-900/20 rounded-full border border-cyan-500/30 group-hover:bg-cyan-500/20 transition-colors">
                                        {item.year}
                                    </span>
                                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{item.title}</h3>
                                    <p className="text-purple-400 font-medium mb-4">{item.company}</p>
                                    <p className="text-gray-400 leading-relaxed mb-4 text-sm md:text-base">
                                        {item.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {item.skills.map(skill => (
                                            <span key={skill} className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/5">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Empty side for layout balance */}
                            <div className="hidden md:block md:w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
