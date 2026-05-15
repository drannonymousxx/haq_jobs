"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      quote: "I found my summer associate role through HAQJobs. The platform is incredibly intuitive and connected me with top-tier firms I didn't even know were hiring.",
    },
    {
      id: 2,
      quote: "An absolute game-changer for my legal career. It made networking and finding legal opportunities at startups so much easier and more transparent.",
    },
    {
      id: 3,
      quote: "I can't imagine my job search without this platform. The quality of opportunities and the seamless experience gave me a huge advantage in my placements.",
    },
    {
      id: 4,
      quote: "The legal job market is tough, but HAQJobs made it feel accessible. The interface is clean, and the curated roles saved me hundreds of hours of searching.",
    },
    {
      id: 5,
      quote: "As a recent law grad, the transition to practice felt daunting. This platform bridged the gap, offering direct access to boutique firms and in-house roles.",
    },
    {
      id: 6,
      quote: "From internships to full-time placements, HAQJobs has been my go-to resource. The personalized matching and modern UI are lightyears ahead of traditional job boards.",
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(3);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const updateCardsPerPage = () => {
      if (window.innerWidth < 768) {
        setCardsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerPage(2);
      } else {
        setCardsPerPage(3);
      }
    };
    
    updateCardsPerPage();
    window.addEventListener("resize", updateCardsPerPage);
    return () => window.removeEventListener("resize", updateCardsPerPage);
  }, []);

  useEffect(() => {
    const maxIndex = Math.max(0, testimonials.length - cardsPerPage);
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [cardsPerPage, currentIndex, testimonials.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev + cardsPerPage;
      return nextIndex >= testimonials.length ? prev : Math.min(nextIndex, testimonials.length - cardsPerPage);
    });
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - cardsPerPage, 0));
  };

  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex >= testimonials.length - cardsPerPage;

  // We chunk the testimonials into visible pages for Framer Motion AnimatePresence
  // Actually, sliding a flex container is smoother than replacing DOM elements.
  // We'll use a sliding flex track.

  return (
    <section className="w-full bg-[#EEF2FF] py-24 sm:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-16 xl:px-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-12"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold tracking-wide text-[#191D20] uppercase">
                Quotes
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#191D20]">
                From our users
              </h2>
            </div>
            
            {/* Arrows */}
            <div className="flex gap-4">
              <button 
                onClick={handlePrev}
                disabled={isPrevDisabled}
                className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-300 group
                  ${isPrevDisabled 
                    ? 'border-gray-200 bg-white/50 opacity-50 cursor-not-allowed' 
                    : 'border-[rgba(1,60,241,0.1)] bg-white hover:bg-[#DDE7FF] hover:border-[#013CF1] cursor-pointer hover:scale-105 shadow-sm'
                  }`}
              >
                <ArrowLeft className={`w-6 h-6 transition-colors ${isPrevDisabled ? 'text-gray-400' : 'text-[#191D20] group-hover:text-[#013CF1]'}`} />
              </button>
              <button 
                onClick={handleNext}
                disabled={isNextDisabled}
                className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-300 group
                  ${isNextDisabled 
                    ? 'border-gray-200 bg-white/50 opacity-50 cursor-not-allowed' 
                    : 'border-[rgba(1,60,241,0.1)] bg-white hover:bg-[#DDE7FF] hover:border-[#013CF1] cursor-pointer hover:scale-105 shadow-sm'
                  }`}
              >
                <ArrowRight className={`w-6 h-6 transition-colors ${isNextDisabled ? 'text-gray-400' : 'text-[#191D20] group-hover:text-[#013CF1]'}`} />
              </button>
            </div>
          </div>

          {/* Carousel Track */}
          <div className="relative w-full overflow-hidden mt-4">
            <motion.div 
              className="flex w-full"
              animate={{ 
                x: `calc(-${currentIndex * (100 / cardsPerPage)}% - ${currentIndex * (24 / cardsPerPage)}px)` 
              }}
              transition={{ type: "spring", stiffness: 200, damping: 25, mass: 1 }}
              style={{ gap: '24px' }}
            >
              {testimonials.map((testimonial) => (
                <motion.div
                  key={testimonial.id}
                  whileHover={{ y: -8, boxShadow: "0 20px 40px -15px rgba(1, 60, 241, 0.15)" }}
                  className="bg-white border border-[rgba(1,60,241,0.06)] shadow-[0_10px_30px_-15px_rgba(1,60,241,0.08)] rounded-[2rem] p-10 flex flex-col gap-8 transition-all duration-300 h-full cursor-default shrink-0"
                  style={{ width: `calc((100% - ${24 * (cardsPerPage - 1)}px) / ${cardsPerPage})` }}
                >
                  {/* Quote Icon Container */}
                  <div className="w-16 h-16 rounded-full bg-[rgba(1,60,241,0.08)] flex items-center justify-center flex-shrink-0">
                    {/* Quote SVG */}
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#013CF1]">
                      <path d="M10 11L8 15H11V18H5V15L7 11H5V6H11V11H10ZM20 11L18 15H21V18H15V15L17 11H15V6H21V11H20Z" fill="currentColor" />
                    </svg>
                  </div>

                  {/* Content */}
                  <p className="text-[1.15rem] text-[rgba(25,29,32,0.78)] leading-relaxed font-medium">
                    "{testimonial.quote}"
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
