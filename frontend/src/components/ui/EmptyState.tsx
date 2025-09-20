'use client';

import { motion } from 'framer-motion';
import { Car, Search, Heart, Filter, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: 'car' | 'search' | 'heart' | 'filter' | 'alert';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'minimal' | 'error';
  className?: string;
}

export function EmptyState({ 
  icon = 'car',
  title,
  description,
  action,
  variant = 'default',
  className = ''
}: EmptyStateProps) {
  const iconMap = {
    car: Car,
    search: Search,
    heart: Heart,
    filter: Filter,
    alert: AlertCircle
  };

  const IconComponent = iconMap[icon];

  const variantClasses = {
    default: 'text-gray-500',
    minimal: 'text-gray-400',
    error: 'text-red-500'
  };

  const iconSize = variant === 'minimal' ? 48 : 64;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`mb-6 ${variantClasses[variant]}`}
      >
        <IconComponent size={iconSize} />
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-xl font-semibold text-gray-900 mb-2"
      >
        {title}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-gray-600 mb-6 max-w-md"
      >
        {description}
      </motion.p>
      
      {action && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Button
            onClick={action.onClick}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

interface EmptyStateWithIllustrationProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  illustration?: React.ReactNode;
  className?: string;
}

export function EmptyStateWithIllustration({ 
  title,
  description,
  action,
  illustration,
  className = ''
}: EmptyStateWithIllustrationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center justify-center text-center py-16 px-4 ${className}`}
    >
      {illustration && (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          {illustration}
        </motion.div>
      )}
      
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-2xl font-bold text-gray-900 mb-4"
      >
        {title}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-gray-600 mb-8 max-w-lg text-lg"
      >
        {description}
      </motion.p>
      
      {action && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Button
            onClick={action.onClick}
            className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200"
          >
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}


