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
    primary: "bg-brand text-white hover:bg-brand-hover shadow-sm shadow-brand/20 hover:shadow-md hover:shadow-brand/35",
    secondary: "bg-brand-card text-brand border border-brand hover:bg-brand/10",
    outline: "bg-transparent text-brand-text border border-brand-border hover:border-brand hover:bg-brand-card",
  };

  const appliedClasses = `${baseClasses} ${sizeClasses} ${variants[variant]} ${className}`;

  const innerElement = (
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
        {innerElement}
      </Link>
    );
  }

  return <button type="button" className="inline-block">{innerElement}</button>;
}
