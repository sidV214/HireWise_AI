import React from 'react';
import { motion } from 'framer-motion';

export default function SpotlightCard({ children, className = '', glowColor = 'rgba(16, 185, 129, 0.1)', tilt = false, ...props }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.005 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`group relative overflow-hidden bg-gray-100/40 backdrop-blur-md rounded-2xl border border-gray-200/40 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(16,185,129,0.2)] hover:border-emerald-500/30 transition-all duration-500 ${className}`}
      {...props}
    >
      {/* Light Sweep (Shimmer) Effect on Hover */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)` }}
        initial={{ x: '-150%', opacity: 0 }}
        whileHover={{ x: '150%', opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
      />
      
      {/* Main Content */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}
