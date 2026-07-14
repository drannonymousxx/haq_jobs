"use client";

import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import EditorialText from "@/components/ui/EditorialText";

export function CtaSection() {
  return (
    <section className="py-12 md:py-16 bg-brand-bg border-t border-brand-border relative overflow-hidden">
      <div className="max-w-[800px] mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-brand-text mb-6 font-poppins">
            <EditorialText text="Your next *great hire* is already here." />
          </h2>
          <p className="text-lg md:text-xl text-brand-text-muted mb-10 max-w-2xl mx-auto">
            Join the thousands of top law firms and fast-growing startups finding their best talent on HAQJobs.
          </p>
          
          <Button href="/post-job/create" variant="primary" className="!px-10 !py-4 text-lg">
            Post a Job for Free
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
