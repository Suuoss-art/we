import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Ripple Effect Component
interface RippleProps {
  x: number;
  y: number;
  onComplete: () => void;
}

const Ripple: React.FC<RippleProps> = ({ x, y, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.span
      className="absolute rounded-full bg-kopma_yellow-500/30"
      style={{
        left: x,
        top: y,
        width: 0,
        height: 0,
        transform: 'translate(-50%, -50%)'
      }}
      initial={{ width: 0, height: 0, opacity: 1 }}
      animate={{ width: 300, height: 300, opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    />
  );
};

// Ripple Button Component
interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const RippleButton: React.FC<RippleButtonProps> = ({ children, className = '', ...props }) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = { x, y, id: Date.now() };
    setRipples(prev => [...prev, newRipple]);
  };

  const removeRipple = (id: number) => {
    setRipples(prev => prev.filter(ripple => ripple.id !== id));
  };

  return (
    <button
      ref={buttonRef}
      className={`relative overflow-hidden ${className}`}
      onClick={(e) => {
        addRipple(e);
        props.onClick?.(e);
      }}
      {...props}
    >
      {children}
      {ripples.map(ripple => (
        <Ripple
          key={ripple.id}
          x={ripple.x}
          y={ripple.y}
          onComplete={() => removeRipple(ripple.id)}
        />
      ))}
    </button>
  );
};

// Toast Notification Component
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  duration = 3000,
  onClose 
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3`}
    >
      <span className="text-xl font-bold">{icons[type]}</span>
      <span className="font-medium">{message}</span>
    </motion.div>
  );
};

// Toast Container Component
export const ToastContainer: React.FC<{ toasts: Array<{ id: number; message: string; type?: 'success' | 'error' | 'info' | 'warning' }>, onRemove: (id: number) => void }> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => onRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Magnetic Button Component
interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  strength?: number;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({ 
  children, 
  strength = 0.3,
  className = '',
  ...props 
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={buttonRef}
      className={className}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Floating Action Button with Ripple
interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ 
  icon, 
  onClick,
  position = 'bottom-right'
}) => {
  const positions = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  return (
    <RippleButton
      onClick={onClick}
      className={`fixed ${positions[position]} w-14 h-14 bg-kopma_yellow-500 hover:bg-kopma_yellow-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-50`}
    >
      {icon}
    </RippleButton>
  );
};

// Hover Glow Effect
interface HoverGlowProps {
  children: React.ReactNode;
  color?: string;
  intensity?: number;
}

export const HoverGlow: React.FC<HoverGlowProps> = ({ 
  children, 
  color = 'kopma_yellow-500',
  intensity = 20 
}) => {
  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      {children}
      <motion.div
        className={`absolute inset-0 bg-${color} rounded-lg blur-xl opacity-0 -z-10`}
        whileHover={{ opacity: intensity / 100 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default {
  RippleButton,
  Toast,
  ToastContainer,
  MagneticButton,
  FloatingActionButton,
  HoverGlow
};
