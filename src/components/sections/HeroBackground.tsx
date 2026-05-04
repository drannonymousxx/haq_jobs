'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from '@/styles/HeroBackground.module.css';

const floatingElements = [
  // Top left
  { text: 'Corporate Law', top: '10%', left: '8%', speed: 1.2 },
  { text: 'Intellectual Property', top: '22%', left: '15%', speed: 0.9 },
  // Middle left
  { text: 'Litigation', top: '45%', left: '5%', speed: 1.5 },
  { text: 'Cyber Law', top: '60%', left: '12%', speed: 1.1 },
  // Bottom left
  { text: 'Contract Drafting', top: '80%', left: '8%', speed: 1.3 },
  { text: 'Internships', top: '92%', left: '20%', speed: 0.8 },
  // Top right
  { text: 'Criminal Law', top: '15%', left: '82%', speed: 1.0 },
  { text: 'Tax Law', top: '25%', left: '72%', speed: 1.4 },
  // Middle right
  { text: 'Compliance', top: '40%', left: '85%', speed: 1.1 },
  { text: 'Arbitration', top: '55%', left: '78%', speed: 1.3 },
  // Bottom right
  { text: 'Legal Research', top: '75%', left: '88%', speed: 0.9 },
  { text: 'Remote Roles', top: '88%', left: '75%', speed: 1.2 },
  // Top center-ish
  { text: 'Environmental Law', top: '5%', left: '30%', speed: 0.7 },
  { text: 'Due Diligence', top: '8%', left: '60%', speed: 1.1 },
  // Bottom center-ish
  { text: 'Judiciary Prep', top: '90%', left: '40%', speed: 1.4 },
  { text: 'In-House Counsel', top: '85%', left: '55%', speed: 1.0 },
  // Edges
  { text: 'Startups', top: '35%', left: '2%', speed: 0.8 },
  { text: 'Law Firms', top: '65%', left: '90%', speed: 1.2 },
  { text: 'Case Analysis', top: '50%', left: '92%', speed: 0.9 },
];

export default function HeroBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse position from -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className={styles.backgroundContainer}>
      {floatingElements.map((el, i) => {
        // Parallax offset
        const offsetX = mousePosition.x * 20 * el.speed;
        const offsetY = mousePosition.y * 20 * el.speed;

        return (
          <motion.div
            key={i}
            className={styles.floatingPill}
            style={{
              top: el.top,
              left: el.left,
            }}
            animate={{
              x: offsetX,
              y: [offsetY - 10, offsetY + 10, offsetY - 10], // Combine parallax with gentle drift
            }}
            transition={{
              y: {
                duration: 4 + el.speed * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
              x: {
                type: 'spring',
                stiffness: 150,
                damping: 25,
                mass: 0.8,
              },
            }}
            whileHover={{
              scale: 1.12,
              boxShadow: '0 12px 30px rgba(14, 165, 233, 0.25)',
              backgroundColor: 'rgba(14, 165, 233, 0.08)',
              color: '#0284c7', // Soft primary dark for contrast
              borderColor: 'rgba(14, 165, 233, 0.3)',
              zIndex: 10,
              transition: { duration: 0.25, ease: 'easeOut' }
            }}
          >
            {el.text}
          </motion.div>
        );
      })}
    </div>
  );
}
