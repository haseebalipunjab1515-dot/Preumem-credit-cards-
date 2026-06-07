import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      case 'top':
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  const getAnimationProps = () => {
    switch (position) {
      case 'bottom':
        return { initial: { opacity: 0, y: -5 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -5 } };
      case 'left':
        return { initial: { opacity: 0, x: 5 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 5 } };
      case 'right':
        return { initial: { opacity: 0, x: -5 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -5 } };
      case 'top':
      default:
        return { initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 5 } };
    }
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            {...getAnimationProps()}
            className={`absolute z-[1000] px-2 py-1 text-[10px] md:text-xs font-bold text-white bg-slate-900 border border-white/10 rounded shadow-xl whitespace-nowrap pointer-events-none ${getPositionClasses()}`}
          >
            {content}
            {/* Arrow */}
            <div 
              className={`absolute border-4 border-transparent ${
                position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900' :
                position === 'left' ? 'left-full top-1/2 -translate-y-1/2 border-l-slate-900' :
                position === 'right' ? 'right-full top-1/2 -translate-y-1/2 border-r-slate-900' :
                'top-full left-1/2 -translate-x-1/2 border-t-slate-900'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
