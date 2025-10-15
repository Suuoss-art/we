// src/components/ui/Loading.tsx
import React from 'react';
import { motion } from 'framer-motion';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'ripple' | 'skeleton';
  color?: 'primary' | 'secondary' | 'white' | 'gray' | 'blue' | 'green' | 'red' | 'yellow';
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  className?: string;
  id?: string;
  'data-testid'?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  text,
  fullScreen = false,
  overlay = false,
  className = '',
  id,
  'data-testid': dataTestId
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-400',
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600'
  };

  const Spinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    >
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </motion.div>
  );

  const Dots = () => (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.2
          }}
          className={`w-2 h-2 rounded-full bg-current ${colorClasses[color]}`}
        />
      ))}
    </div>
  );

  const Pulse = () => (
    <motion.div
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={`${sizeClasses[size]} rounded-full bg-current ${colorClasses[color]} ${className}`}
    />
  );

  const Bars = () => (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          animate={{
            scaleY: [1, 2, 1]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.1
          }}
          className={`w-1 bg-current ${colorClasses[color]}`}
        />
      ))}
    </div>
  );

  const Ripple = () => (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <motion.div
        animate={{
          scale: [0, 1],
          opacity: [1, 0]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeOut'
        }}
        className={`absolute inset-0 rounded-full border-2 border-current ${colorClasses[color]}`}
      />
      <motion.div
        animate={{
          scale: [0, 1],
          opacity: [1, 0]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: 0.5,
          ease: 'easeOut'
        }}
        className={`absolute inset-0 rounded-full border-2 border-current ${colorClasses[color]}`}
      />
    </div>
  );

  const Skeleton = () => (
    <div className={`animate-pulse ${className}`}>
      <div className={`bg-gray-200 rounded ${sizeClasses[size]}`} />
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return <Spinner />;
      case 'dots':
        return <Dots />;
      case 'pulse':
        return <Pulse />;
      case 'bars':
        return <Bars />;
      case 'ripple':
        return <Ripple />;
      case 'skeleton':
        return <Skeleton />;
      default:
        return <Spinner />;
    }
  };

  const content = (
    <div
      className={`flex flex-col items-center justify-center ${text ? 'space-y-3' : ''} ${className}`}
      id={id}
      data-testid={dataTestId}
    >
      {renderLoader()}
      {text && (
        <p className={`text-sm ${colorClasses[color]}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;