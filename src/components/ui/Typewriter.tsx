'use client'

import { useState, useEffect, useRef } from 'react'

interface TypewriterProps {
    phrases: string[]
    typeSpeed?: number       // ms per char while typing
    deleteSpeed?: number     // ms per char while deleting
    holdAfterType?: number   // ms to hold full phrase before deleting
    holdAfterDelete?: number // ms blank pause before next phrase
    startDelay?: number      // ms before first character
    className?: string
    cursorColor?: string
    loop?: boolean
}

type Mode = 'typing' | 'holding' | 'deleting' | 'pausing'

export default function Typewriter({
    phrases,
    typeSpeed = 42,
    deleteSpeed = 22,
    holdAfterType = 1800,
    holdAfterDelete = 320,
    startDelay = 600,
    className = '',
    cursorColor = '#A4B5CC',
    loop = true,
}: TypewriterProps) {
    const [phraseIdx, setPhraseIdx] = useState(0)
    const [shown, setShown] = useState(0)
    const [mode, setMode] = useState<Mode>('typing')
    const [started, setStarted] = useState(false)
    const [cursorOn, setCursorOn] = useState(true)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Initial delay before typing the first phrase
    useEffect(() => {
        const t = setTimeout(() => setStarted(true), startDelay)
        return () => clearTimeout(t)
    }, [startDelay])

    // State machine: schedule the next transition based on current mode
    useEffect(() => {
        if (!started) return
        const phrase = phrases[phraseIdx] ?? ''

        const clear = () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }

        if (mode === 'typing') {
            if (shown < phrase.length) {
                timerRef.current = setTimeout(() => setShown((s) => s + 1), typeSpeed)
            } else {
                timerRef.current = setTimeout(() => setMode('holding'), 0)
            }
        } else if (mode === 'holding') {
            timerRef.current = setTimeout(() => setMode('deleting'), holdAfterType)
        } else if (mode === 'deleting') {
            if (shown > 0) {
                timerRef.current = setTimeout(() => setShown((s) => s - 1), deleteSpeed)
            } else {
                timerRef.current = setTimeout(() => setMode('pausing'), 0)
            }
        } else if (mode === 'pausing') {
            timerRef.current = setTimeout(() => {
                const next = phraseIdx + 1
                if (next >= phrases.length && !loop) return
                setPhraseIdx(next % phrases.length)
                setMode('typing')
            }, holdAfterDelete)
        }

        return clear
    }, [
        started,
        mode,
        shown,
        phraseIdx,
        phrases,
        typeSpeed,
        deleteSpeed,
        holdAfterType,
        holdAfterDelete,
        loop,
    ])

    // Cursor blink — only when idle (holding); solid while typing/deleting
    useEffect(() => {
        if (mode === 'typing' || mode === 'deleting') {
            setCursorOn(true)
            return
        }
        const i = setInterval(() => setCursorOn((v) => !v), 520)
        return () => clearInterval(i)
    }, [mode])

    const current = (phrases[phraseIdx] ?? '').slice(0, shown)

    return (
        <span className={className}>
            {current}
            <span
                aria-hidden
                style={{
                    display: 'inline-block',
                    width: '0.55ch',
                    marginLeft: '2px',
                    color: cursorColor,
                    opacity: cursorOn ? 1 : 0,
                    transition: 'opacity 60ms linear',
                    transform: 'translateY(-0.02em)',
                }}
            >
                ▌
            </span>
        </span>
    )
}
