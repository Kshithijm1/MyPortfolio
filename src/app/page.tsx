'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import BentoGrid from '@/components/ui/BentoGrid'
import Hero from '@/components/ui/Hero'
import AboutMe from '@/components/ui/AboutMe'
import NavBar from '@/components/ui/NavBar'
import CustomCursor from '@/components/ui/CustomCursor'
import Experience from '@/components/ui/Experience'
import Education from '@/components/ui/Education'
import Contact from '@/components/ui/Contact'

const CanvasContainer = dynamic(() => import('@/components/3d/CanvasContainer'), { ssr: false })

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // Force scroll to top on page load
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual'
      window.scrollTo(0, 0)
    }
  }, [])

  return (
    <main className="relative w-full min-h-screen bg-[#020202]">
      {/* 3D Background - Fixed */}
      <div className="fixed inset-0 z-0">
        <CanvasContainer />
      </div>

      {/* Scrollable Content - Z-Index 10 */}
      <div className="relative z-10 pointer-events-none">
        <NavBar isHidden={isModalOpen} />
        <div className="pointer-events-auto">
          <Hero />
          <AboutMe />
        </div>

        {/* Spacer removed for clean snapping */}

        <section id="projects" className="pointer-events-auto">
          <BentoGrid onModalChange={setIsModalOpen} />
        </section>

        {/* Timeline placeholder */}
        <section id="experience">
          <Experience />
        </section>

        <section id="education">
          <Education />
        </section>

        <section id="contact" className="pointer-events-auto">
          <Contact />
        </section>
      </div>
    </main>
  )
}
