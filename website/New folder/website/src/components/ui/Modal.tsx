// src/components/ui/Modal.tsx
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'center' | 'top' | 'bottom';
  closable?: boolean;
  backdrop?: boolean;
  backdropClose?: boolean;
  keyboard?: boolean;
  className?: string;
  id?: string;
  'data-testid'?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  position = 'center',
  closable = true,
  backdrop = true,
  backdropClose = true,
  keyboard = true,
  className = '',
  id,
  'data-testid': dataTestId
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      
      if (keyboard) {
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            onClose();
          }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      }
    } else {
      document.body.style.overflow = 'unset';
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen, onClose, keyboard]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (backdropClose && event.target === event.currentTarget) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  };

  const positionClasses = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-16',
    bottom: 'items-end justify-center pb-16'
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`fixed inset-0 z-50 flex ${positionClasses[position]} ${backdrop ? 'bg-black bg-opacity-50' : ''}`}
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`relative bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} ${className}`}
            id={id}
            data-testid={dataTestId}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby={description ? 'modal-description' : undefined}
          >
            {/* Header */}
            {(title || closable) && (
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                {title && (
                  <h3 id="modal-title" className="text-lg font-semibold text-gray-900">
                    {title}
                  </h3>
                )}
                {closable && (
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    aria-label="Close modal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Description */}
            {description && (
              <div className="p-6 border-b border-gray-200">
                <p id="modal-description" className="text-sm text-gray-600">
                  {description}
                </p>
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;