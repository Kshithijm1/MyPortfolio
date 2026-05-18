'use client'

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, Variants } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import TextScramble from './TextScramble'
import ProjectModal from './ProjectModal'

const PROJECTS = [
    {
        title: 'ALFRED',
        description: 'Local-first modular AI assistant with 8 independent subsystems — LLM routing, STT, TTS, screen vision, OCR, semantic memory, and a focus engine.',
        tags: ['Python', 'Ollama', 'ChromaDB', 'Whisper STT', 'OpenCV'],
        span: 'col-span-1 md:col-span-2',
        color: 'from-indigo-900/40 via-purple-900/20 to-black',
        overview: (
            <>
                <strong>ALFRED</strong> is a modular, local-first AI assistant built for privacy-first, zero-cloud operation.
                Eight independent subsystems — including <span className="text-cyan-400">Ollama/qwen2.5-coder</span> for LLM routing,{' '}
                <span className="text-purple-400">Whisper STT</span>, Piper TTS, moondream/llava screen vision,
                Tesseract OCR, and <span className="text-cyan-400">ChromaDB</span> semantic memory — are all lazy-loaded for zero-startup overhead.
                A Guardian focus-detection engine monitors typing cadence and auto-silences interruptions during deep work sessions.
            </>
        ),
        features: [
            'Neural Shadow persistent semantic memory via ChromaDB — siloed personal/work/code recall, entirely on-device.',
            'IDE-aware Guardian flow engine monitoring WPM cadence; ships with 45+ hermetic unit tests.',
            'Multimodal screen vision via moondream/llava for real-time context awareness.',
            'Gesture recognition (95% accuracy) via OpenCV for hands-free volume, music, and mouse control.',
            'RNN + BERT sentiment analysis achieving >90% accuracy, <200ms response time.',
        ],
        challenges: [
            'Lazy-loading 8 subsystems with zero startup overhead while keeping them hot on demand.',
            'Building hermetic unit tests (45+) across async, stateful AI subsystems.',
            'Achieving <200ms LLM response latency on consumer hardware with quantized models.',
        ],
        liveLink: '#',
        githubLink: 'https://github.com/Kshithijm1'
    },
    {
        title: 'A.R. Glasses',
        description: 'Real-time augmented reality glasses interface with AI-powered image processing at 60 FPS.',
        tags: ['Python', 'OpenCV', 'TensorFlow', 'AR'],
        span: 'col-span-1',
        color: 'from-cyan-500/20 to-blue-500/20',
        overview: (
            <>
                An <strong>Augmented Reality Glasses Interface</strong> built with Python and OpenCV,
                targeting real-time AI-powered visual enhancement at <strong>60 FPS</strong>.
                Gesture recognition achieves <span className="text-cyan-400">92% accuracy</span> using ML techniques
                for hands-free control of volume, navigation, and context-aware interactions.
            </>
        ),
        features: [
            'Real-time image processing pipeline running at 60 FPS.',
            'ML-powered gesture recognition achieving 92% accuracy.',
            'Hands-free control of volume, navigation, and context-aware actions.',
            'Computer vision for object detection and contextual enhancement.',
        ],
        challenges: [
            'Maintaining 60 FPS on embedded hardware with real-time ML inference.',
            'Minimizing gesture recognition latency without sacrificing accuracy.',
            'Handling varied lighting and occlusion in live camera feeds.',
        ],
        liveLink: '#',
        githubLink: 'https://github.com/Kshithijm1'
    },
    {
        title: 'Self-Driving Car',
        description: 'Autonomous vehicle software with 35+ modules — lane detection, object recognition, and adaptive cruise control.',
        tags: ['Python', 'YOLOv7', 'OpenCV', 'AI/ML'],
        span: 'col-span-1',
        color: 'from-emerald-500/20 to-teal-500/20',
        overview: (
            <>
                A full autonomous driving software stack implementing <strong>35+ modules</strong>, including
                lane detection at <span className="text-emerald-400">96% accuracy</span>, object recognition at 85%,
                and adaptive cruise control using <span className="text-cyan-400">YOLOv7</span> and OpenCV.
                Trained and iterated over 200+ hours of real-world driving simulations.
            </>
        ),
        features: [
            'Lane detection at 96% accuracy, object recognition at 85% accuracy.',
            'Adaptive cruise control via YOLOv7 — collision response time reduced by 30%.',
            '200+ hours of simulation testing improving model adaptability by 20%.',
            'Modular architecture spanning 35+ independently testable subsystems.',
        ],
        challenges: [
            'Achieving real-time inference on 35 concurrent detection modules.',
            'Simulating edge-case scenarios (wet roads, occlusions) from YouTube footage.',
            'Tuning YOLOv7 confidence thresholds for safety-critical collision avoidance.',
        ],
        liveLink: '#',
        githubLink: 'https://github.com/Kshithijm1'
    },
    {
        title: 'Stock Price Predictor',
        description: 'Hybrid CNN-BiLSTM-Transformer model achieving MAE below 2% across 10 years of historical stock data.',
        tags: ['Python', 'TensorFlow', 'Scikit-learn', 'Finance'],
        span: 'col-span-1 md:col-span-2',
        color: 'from-amber-900/30 via-orange-900/20 to-black',
        overview: (
            <>
                A <strong>Financial Forecasting System</strong> built on a hybrid{' '}
                <span className="text-amber-400">CNN-BiLSTM-Transformer</span> architecture.
                Automated preprocessing ingests 10 years of historical stock data across 15+ technical indicators.
                The model achieves a <span className="text-cyan-400">MAE below 2%</span> and a 25% accuracy improvement
                over Random Forest and XGBoost baselines.
            </>
        ),
        features: [
            'Hybrid CNN-BiLSTM-Transformer for multi-scale temporal feature extraction.',
            'Automated pipeline: 10 years of data, 15+ technical indicators, feature engineering.',
            'MAE below 2% — outperforms Random Forest and XGBoost baselines by 25%.',
            'Comparative benchmark suite across multiple ML architectures.',
        ],
        challenges: [
            'Preventing lookahead bias in sliding-window train/test splits.',
            'Stabilizing Transformer attention over long financial time-series.',
            'Balancing model complexity against overfitting on <5 years of volatile data.',
        ],
        liveLink: '#',
        githubLink: 'https://github.com/Kshithijm1'
    }
]

// Cinematic 3D Fly-In Variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
}

const cardVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 100,
        scale: 0.8,
        rotateX: 10,
        filter: "blur(10px)"
    },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        filter: "blur(0px)",
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 20
        }
    }
}

function ProjectCard({ project, onClick }: { project: typeof PROJECTS[0], onClick: () => void }) {
    const ref = useRef<HTMLDivElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const xSpring = useSpring(x, { stiffness: 300, damping: 30 })
    const ySpring = useSpring(y, { stiffness: 300, damping: 30 })

    const rotateX = useTransform(ySpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"])
    const rotateY = useTransform(xSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"])

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

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            variants={cardVariants}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className={`glass-panel rounded-2xl p-6 relative overflow-visible group hover:border-white/30 transition-colors cursor-pointer ${project.span}`}
            onClick={onClick}
        >
            <div
                style={{ transform: "translateZ(75px)", transformStyle: "preserve-3d" }}
                className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}
            />

            <div style={{ transform: "translateZ(50px)" }} className="relative z-10 pointer-events-none">
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
                    {project.title}
                </h3>
                <p className="text-gray-400 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Hover Reveal CTA */}
                <div className="flex items-center gap-2 text-white font-bold opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    <span>View Project</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </div>
            </div>
        </motion.div>
    )
}

export default function BentoGrid({ onModalChange }: { onModalChange?: (isOpen: boolean) => void }) {
    const [selectedId, setSelectedId] = useState<string | null>(null)

    useEffect(() => {
        if (onModalChange) {
            onModalChange(!!selectedId)
        }
    }, [selectedId, onModalChange])

    return (
        <section className="container mx-auto px-4 py-24 relative z-10">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold mb-12 text-center"
            >
                <TextScramble>Selected Works</TextScramble>
            </motion.h2>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                style={{ perspective: 1000 }} // Ensure container has perspective for children's 3D movement
            >
                {PROJECTS.map((p, i) => (
                    <ProjectCard key={i} project={p} onClick={() => setSelectedId(p.title)} />
                ))}
            </motion.div>

            <AnimatePresence>
                {selectedId && (
                    <ProjectModal
                        key="modal"
                        project={PROJECTS.find(p => p.title === selectedId)}
                        onClose={() => setSelectedId(null)}
                    />
                )}
            </AnimatePresence>
        </section>
    )
}
