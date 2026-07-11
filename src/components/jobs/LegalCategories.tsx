"use client";

import { motion } from "framer-motion";
import { 
  Briefcase, Gavel, Lightbulb, Search, FileSignature, 
  ShieldCheck, Scale, Rocket, Calculator, 
  Fingerprint, GraduationCap, Globe
} from "lucide-react";

const categories = [
  { name: "Corporate Law", icon: Briefcase },
  { name: "Litigation", icon: Gavel },
  { name: "Intellectual Prop.", icon: Lightbulb },
  { name: "Legal Research", icon: Search },
  { name: "Contract Drafting", icon: FileSignature },
  { name: "Compliance", icon: ShieldCheck },
  { name: "Arbitration", icon: Scale },
  { name: "Startup Law", icon: Rocket },
  { name: "Tax Law", icon: Calculator },
  { name: "Criminal Law", icon: Fingerprint },
  { name: "Internship", icon: GraduationCap },
  { name: "Remote Roles", icon: Globe },
];

export default function LegalCategories() {
  return (
    <div className="w-full overflow-x-auto pb-8 pt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex gap-4 min-w-max">
        {categories.map((cat, index) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              whileHover={{ y: -4, borderColor: "rgba(182, 49, 6, 0.4)", boxShadow: "0 12px 30px rgba(0,0,0,0.6)" }}
              className="bg-brand-card border border-brand-border rounded-2xl flex flex-col items-center justify-center p-5 w-[140px] h-[130px] cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all duration-300 group select-none"
            >
              <div className="text-brand mb-4 bg-brand/5 group-hover:bg-brand/20 transition-colors duration-300 p-3 rounded-[14px]">
                <Icon size={26} strokeWidth={2} />
              </div>
              <span className="text-[13px] font-bold text-brand-text text-center leading-tight">
                {cat.name}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
