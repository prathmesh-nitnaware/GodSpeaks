import React from 'react';
import { motion } from 'framer-motion';

const FadeIn = ({ children, delay = 0, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} // Start slightly down and invisible
      whileInView={{ opacity: 1, y: 0 }} // Animate to visible and original position
      viewport={{ once: true, margin: "-50px" }} // Trigger when 50px into viewport
      transition={{ duration: 0.6, delay: delay, ease: "easeOut" }} // Smooth timing
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;