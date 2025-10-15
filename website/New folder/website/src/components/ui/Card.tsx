// src/components/ui/Card.tsx
import React from 'react';
import { motion } from 'framer-motion';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'flat';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hover?: boolean;
  clickable?: boolean;
  loading?: boolean;
  className?: string;
  id?: string;
  'data-testid'?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  padding = 'md',
  rounded = 'md',
  shadow = 'md',
  hover = false,
  clickable = false,
  loading = false,
  className = '',
  id,
  'data-testid': dataTestId,
  onClick
}: CardProps) => {
  const baseClasses = 'bg-white transition-all duration-200';
  
  const variantClasses: Record<string, string> = {
    default: 'bg-white',
    elevated: 'bg-white shadow-lg',
    outlined: 'bg-white border border-gray-200',
    filled: 'bg-gray-50',
    flat: 'bg-transparent'
  };
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };
  
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };
  
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };
  
  const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl'
  };
  
  const hoverClasses = hover ? 'hover:shadow-lg hover:scale-105' : '';
  const clickableClasses = clickable ? 'cursor-pointer' : '';
  const loadingClasses = loading ? 'opacity-50 pointer-events-none' : '';
  
  const cardClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${paddingClasses[padding]} ${roundedClasses[rounded]} ${shadowClasses[shadow]} ${hoverClasses} ${clickableClasses} ${loadingClasses} ${className}`;
  
  const LoadingOverlay = () => (
    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );
  
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02 } : {}}
      whileTap={clickable ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
      className={`relative ${cardClasses}`}
      id={id}
      data-testid={dataTestId}
      onClick={onClick}
    >
      {loading && <LoadingOverlay />}
      {children}
    </motion.div>
  );
};

export default Card;