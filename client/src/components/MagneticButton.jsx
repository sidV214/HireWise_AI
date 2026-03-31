import React from 'react';
import { motion } from 'framer-motion';

export default function MagneticButton({ children, className = '', onClick, ...props }) {
    return (
        <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`group relative overflow-hidden transition-all duration-300 ${className}`}
            onClick={onClick}
            {...props}
        >
            {/* Ambient Shimmer / Light Sweep Layer */}
            <motion.div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
                initial={{ x: '-150%', opacity: 0 }}
                whileHover={{ x: '150%', opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
            />
            
            {/* Button Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.button>
    );
}
