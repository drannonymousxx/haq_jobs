"use client";

import { motion } from "framer-motion";
import EditorialText from "@/components/ui/EditorialText";

export default function CustomersHero() {
  return (
    <section className="relative w-full bg-brand-card overflow-hidden pt-12 pb-10 md:pt-16 md:pb-14">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">

        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16 lg:gap-24">

          {/* Left Side Content */}
          <div className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="text-[44px] md:text-5xl lg:text-[64px] font-bold text-brand-text tracking-tight leading-[1.05] mb-6 font-poppins"
            >
              <EditorialText text="Customer *Stories*" />
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
              className="space-y-6 text-lg md:text-[19px] leading-relaxed text-[#475569]"
            >
              <p>
                Our mission at HAQJobs is to help legal professionals, startups, and modern law firms connect with the right opportunities faster and more efficiently. From internships to full-time placements, thousands of candidates and recruiters are discovering meaningful legal careers through the platform.
              </p>
              <p>
                Explore how students, recruiters, and legal teams are using HAQJobs to simplify hiring and build stronger professional connections.
              </p>
            </motion.div>
          </div>

          {/* Right Side Video */}
          <div className="w-full md:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative w-full aspect-video overflow-hidden rounded-[24px] border border-brand-border bg-black shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)]"
            >
              <video
                src="/videos/testimonialvideo1.mp4"
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover rounded-[24px]"
              />
            </motion.div>
          </div>

        </div>

      </div>
    </section>
  );
}
