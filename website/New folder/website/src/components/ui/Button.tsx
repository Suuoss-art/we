// src/components/ui/Button.tsx
import React from 'react';
import { motion } from 'framer-motion';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: boolean;
  shadow?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  id?: string;
  'data-testid'?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = false,
  shadow = false,
  onClick,
  type = 'button',
  className = '',
  id,
  'data-testid': dataTestId
}: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses: Record<string, string> = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    ghost: 'text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    info: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };
  
  const widthClasses = fullWidth ? 'w-full' : '';
  const roundedClasses = rounded ? 'rounded-full' : 'rounded-md';
  const shadowClasses = shadow ? 'shadow-lg hover:shadow-xl' : '';
  
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${roundedClasses} ${shadowClasses} ${className}`;
  
  const iconClasses = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const iconSpacing = size === 'sm' ? 'mr-1.5' : size === 'lg' ? 'mr-3' : 'mr-2';
  
  const LoadingSpinner = () => (
    <svg className={`animate-spin ${iconClasses}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
  
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.1 }}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      id={id}
      data-testid={dataTestId}
    >
      {loading && (
        <LoadingSpinner />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className={`${iconClasses} ${iconSpacing}`}>
          {icon}
        </span>
      )}
      
      {!loading && children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className={`${iconClasses} ml-2`}>
          {icon}
        </span>
      )}
    </motion.button>
  );
};

export default Button;