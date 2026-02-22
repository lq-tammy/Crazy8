import React from 'react';
import { motion } from 'framer-motion';

interface MacawAnimationProps {
  type: 'win' | 'lose';
}

const MacawAnimation: React.FC<MacawAnimationProps> = ({ type }) => {
  if (type === 'win') {
    return (
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Circular Path for the Macaw */}
        <motion.div
          className="absolute w-full h-full border-2 border-dashed border-yellow-400/20 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        
        <motion.div
          className="text-6xl relative z-10"
          animate={{
            rotate: [0, 360],
            x: [0, 100, 0, -100, 0],
            y: [0, -100, -200, -100, 0],
            scale: [1, 1.2, 1.5, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <span className="inline-block transform -scale-x-100">🦜</span>
          
          {/* Feather Particles */}
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-xs opacity-0"
              animate={{
                opacity: [0, 1, 0],
                x: [0, (i - 2) * 30],
                y: [0, 50],
                rotate: [0, 180]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            >
              🪶
            </motion.span>
          ))}
        </motion.div>
        
        <motion.div 
          className="absolute text-4xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✨
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      <motion.div
        className="text-8xl relative"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative flex items-center justify-center">
          {/* Left Wing */}
          <motion.span
            className="absolute -left-8 text-4xl"
            animate={{ 
              rotate: [0, 45, 0],
              x: [0, 20, 0]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🪶
          </motion.span>
          
          {/* The Macaw */}
          <span className="relative z-10">🦜</span>
          
          {/* Right Wing */}
          <motion.span
            className="absolute -right-8 text-4xl transform -scale-x-100"
            animate={{ 
              rotate: [0, -45, 0],
              x: [0, -20, 0]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🪶
          </motion.span>
        </div>
        
        {/* Heart for the hug */}
        <motion.span
          className="absolute -top-4 left-1/2 -translate-x-1/2 text-3xl"
          animate={{ 
            scale: [0, 1.5, 0],
            y: [0, -40]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ❤️
        </motion.span>
      </motion.div>
    </div>
  );
};

export default MacawAnimation;
