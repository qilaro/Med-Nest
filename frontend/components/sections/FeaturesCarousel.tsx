"use client"

import * as React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

const features = [
  {
    title: "Drug Directory",
    description: "Browse 20,000+ prescription & OTC drugs with complete medical information.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#57B8A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path>
        <path d="m8.5 8.5 7 7"></path>
      </svg>
    ),
  },
  {
    title: "Interaction Checker",
    description: "Check for dangerous drug-drug and drug-food interactions instantly.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#57B8A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
      </svg>
    ),
  },
  {
    title: "Drug Comparison",
    description: "Compare up to 4 medications side-by-side for informed decisions.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#57B8A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
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
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#57B8A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
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
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#57B8A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
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
  return (
    <section className="py-12 bg-white">
      <div 
        className="container-medq py-16 relative mx-auto" 
        style={{ 
          backgroundColor: '#E4F1F0', 
          borderRadius: '3rem', 
          maxWidth: '90rem', 
          boxShadow: '0 40px 60px -15px rgba(0, 0, 0, 0.15), 0 20px 30px -10px rgba(0, 0, 0, 0.1)' 
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent 0%, #3b82f6 50%, transparent 100%)' }}></div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-navy">
          Everything You Need to Know About Your Medications
        </h2>

        <div className="px-4 md:px-12 relative">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-6">
              {features.map((feature, index) => (
                <CarouselItem key={index} className="pl-6 md:basis-1/2 lg:basis-1/3">
                  <div className="bg-white rounded-3xl p-8 h-full shadow-lg border border-white hover:border-primary/20 transition-all group">
                    <div className="flex justify-center mb-8">
                      <div className="w-full max-w-[12rem] h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shadow-inner relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent opacity-50"></div>
                        <div className="relative z-10 group-hover:scale-110 transition-transform duration-300">
                          {feature.icon}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-navy mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Navigation Arrows - Using shadcn's internal logic but keeping your style */}
            <CarouselPrevious className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-white transition-all shadow-sm z-10 disabled:opacity-0" />
            <CarouselNext className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-white transition-all shadow-sm z-10 disabled:opacity-0" />
          </Carousel>
        </div>
      </div>
    </section>
  )
}
