import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function MagneticButton({ children, className = '', onClick, ...props }) {
    const ref = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e) => {
        if (!ref.current) return;
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        setPosition({ x: middleX * 0.08, y: middleY * 0.08 });
    };

    const reset = () => {
        setPosition({ x: 0, y: 0 });
    };

    const { x, y } = position;
    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x, y }}
            transition={{ type: "spring", stiffness: 180, damping: 20, mass: 0.1 }}
            className={`relative ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </motion.button>
    );
}
