import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  onClick?: () => void;
}

export function Button({ children, href, variant = "primary", className = "", onClick }: ButtonProps) {
  const baseClasses = "inline-flex justify-center items-center font-medium rounded-xl transition-all duration-200 ease-in-out select-none";
  const sizeClasses = "px-6 py-3 md:px-8 md:py-4 text-sm md:text-base";
  
  const variants = {
    primary: "bg-[#013CF1] text-white hover:bg-[#013CF1]/90 shadow-sm shadow-[#013CF1]/20 hover:shadow-md hover:shadow-[#013CF1]/30",
    secondary: "bg-gray-100 text-black hover:bg-gray-200 border border-transparent",
    outline: "bg-transparent text-black border border-gray-200 hover:border-gray-300 hover:bg-gray-50",
  };

  const appliedClasses = `${baseClasses} ${sizeClasses} ${variants[variant]} ${className}`;

  const Inner = () => (
    <motion.span 
      whileTap={{ scale: 0.98 }}
      className={appliedClasses}
      onClick={onClick}
    >
      {children}
    </motion.span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        <Inner />
      </Link>
    );
  }

  return <button type="button" className="inline-block"><Inner /></button>;
}
