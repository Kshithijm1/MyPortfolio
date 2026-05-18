'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface TextScrambleProps {
    children: string
    className?: string
    enableHover?: boolean
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'

export default function TextScramble({ children, className = '', enableHover = true }: TextScrambleProps) {
    const [displayText, setDisplayText] = useState(children)
    const isHovering = useRef(false)

    const scramble = () => {
        let iteration = 0
        const interval = setInterval(() => {
            setDisplayText(prev =>
                children
                    .split('')
                    .map((letter, index) => {
                        if (index < iteration) {
                            return children[index]
                        }
                        return CHARS[Math.floor(Math.random() * CHARS.length)]
                    })
                    .join('')
            )

            if (iteration >= children.length) {
                clearInterval(interval)
            }

            iteration += 1 / 3
        }, 30)
    }

    // Initial Play
    useEffect(() => {
        scramble()
    }, [])

    return (
        <motion.span
            className={className}
            onHoverStart={() => {
                if (enableHover && !isHovering.current) {
                    isHovering.current = true
                    scramble()
                    // simple cooldown
                    setTimeout(() => isHovering.current = false, 1000)
                }
            }}
        >
            {displayText}
        </motion.span>
    )
}
