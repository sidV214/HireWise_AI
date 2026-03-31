import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function MagneticButton({ children, className = '', onClick, ...props }) {
    const ref = useRef(null);
    const xMotion = useMotionValue(0);
    const yMotion = useMotionValue(0);
    
    const springConfig = { damping: 20, stiffness: 180, mass: 0.1 };
    const x = useSpring(xMotion, springConfig);
    const y = useSpring(yMotion, springConfig);

    const handleMouse = (e) => {
        if (!ref.current) return;
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        xMotion.set(middleX * 0.08);
        yMotion.set(middleY * 0.08);
    };

    const reset = () => {
        xMotion.set(0);
        yMotion.set(0);
    };


    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            style={{ x, y }}
            className={`relative ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </motion.button>
    );
}
