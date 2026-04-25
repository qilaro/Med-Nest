"use client"

import * as React from "react"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import { cn } from "@/lib/utils"

const features = [
  {
    title: "Drug Directory",
    description: "Browse 20,000+ prescription & OTC drugs with complete medical information.",
    href: "#",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path>
        <path d="m8.5 8.5 7 7"></path>
      </svg>
    ),
  },
  {
    title: "Interaction Checker",
    description: "Check for dangerous drug-drug and drug-food interactions instantly.",
    href: "#",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
      </svg>
    ),
  },
  {
    title: "Drug Comparison",
    description: "Compare up to 4 medications side-by-side for informed decisions.",
    href: "#",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <circle cx="18" cy="18" r="3"></circle>
        <circle cx="6" cy="6" r="3"></circle>
        <path d="M13 6h3a2 2 0 0 1 2 2v7"></path>
        <path d="M11 18H8a2 2 0 0 1-2-2V9"></path>
      </svg>
    ),
  },
  {
    title: "AI Chat",
    description: "Get quick medication guidance from Med-Nest AI any time you need support.",
    href: "#",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M12 8V4H8"></path>
        <rect width="16" height="12" x="4" y="8" rx="2"></rect>
        <path d="M2 14h2"></path>
        <path d="M20 14h2"></path>
        <path d="M15 13v2"></path>
        <path d="M9 13v2"></path>
      </svg>
    ),
  },
  {
    title: "Health News",
    description: "Stay updated with reliable medicine and wellness stories from experts.",
    href: "#",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
        <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
        <path d="M10 9H8"></path>
        <path d="M16 13H8"></path>
        <path d="M16 17H8"></path>
      </svg>
    ),
  },
]

export function FeaturesCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
  })

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  return (
    <section className="py-12">
      {/* Container - Matching reference 1:1 */}
      <div 
        className="container-medq py-16 relative overflow-hidden mx-auto" 
        onKeyDownCapture={handleKeyDown}
        tabIndex={0}
        style={{ 
          backgroundColor: '#E4F1F0', 
          borderRadius: '3rem', 
          maxWidth: '90rem', 
          boxShadow: '0 40px 60px -15px rgba(0, 0, 0, 0.15), 0 20px 30px -10px rgba(0, 0, 0, 0.1)',
          outline: 'none'
        }}
      >
        {/* Gradient Top Line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent 0%, #3b82f6 50%, transparent 100%)' }}></div>
        
        <h2 className="text-center font-bold text-navy leading-tight font-serif" style={{ fontSize: '1.875rem', lineHeight: '2.25rem', marginBottom: '2rem', color: '#0D261E' }}>
          Everything You Need to Know About Your Medications
        </h2>

        {/* 1:1 Flex Structure from Reference for exact "Teal Arrow Gap" */}
        <div className="flex items-center gap-4 px-4 md:px-8">
          {/* Custom Arrow - Matching Reference CSS */}
          <button 
            onClick={scrollPrev}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#cfe1dc] bg-[#eef4f2] text-[#527a6d] hover:bg-[#e4f1f0] hover:text-[#0a5c55] transition-all cursor-pointer shadow-sm z-20"
            aria-label="Previous feature"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m15 18-6-6 6-6"></path></svg>
          </button>

          {/* Viewport - flex: 1 */}
          <div className="flex-1 min-w-0 overflow-hidden" ref={emblaRef}>
            {/* Track - flex gap: 2rem */}
            <div className="flex gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="min-w-0 shrink-0 grow-0 basis-full md:basis-[calc((100%-2rem)/2)] lg:basis-[calc((100%-4rem)/3)]"
                >
                  <Link 
                    href={feature.href}
                    className="block bg-white border border-gray-200 transition-all duration-150 hover:border-primary group h-full"
                    style={{ 
                      borderRadius: '1rem', 
                      padding: '2.5rem', 
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      minHeight: '16rem',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Truth Design: Wide Pill Bar with Expansive Shadow */}
                    <div className="flex justify-center mb-6 shrink-0">
                      <div className="w-[260px] h-[40px] rounded-full bg-white flex items-center justify-center shadow-[0_12px_25px_rgba(0,0,0,0.12)] border border-gray-100/50 relative overflow-hidden">
                        <div className="relative z-10 group-hover:scale-110 transition-transform duration-300 text-primary">
                          {feature.icon}
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-navy mb-3 leading-tight font-serif text-[24px]">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-[18px]">
                      {feature.description}
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Next Arrow */}
          <button 
            onClick={scrollNext}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#cfe1dc] bg-[#eef4f2] text-[#527a6d] hover:bg-[#e4f1f0] hover:text-[#0a5c55] transition-all cursor-pointer shadow-sm z-20"
            aria-label="Next feature"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m9 18 6-6-6-6"></path></svg>
          </button>
        </div>
      </div>
    </section>
  )
}
