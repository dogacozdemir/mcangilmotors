'use client';

import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface FilterChipProps {
  label: string;
  value: string;
  onRemove: (value: string) => void;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FilterChip({ 
  label, 
  value, 
  onRemove, 
  variant = 'default',
  size = 'md',
  className = ''
}: FilterChipProps) {
  const baseClasses = "inline-flex items-center gap-2 rounded-full font-medium transition-all duration-200 cursor-pointer group";
  
  const variantClasses = {
    default: "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200",
    primary: "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200",
    secondary: "bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200"
  };
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={() => onRemove(value)}
    >
      <span className="truncate max-w-32">{label}</span>
      <button
        className="flex-shrink-0 p-0.5 rounded-full hover:bg-black/10 transition-colors duration-200"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(value);
        }}
        aria-label={`Remove ${label} filter`}
      >
        <X size={12} className="text-current" />
      </button>
    </motion.div>
  );
}

interface FilterChipsProps {
  filters: Array<{
    label: string;
    value: string;
    category: string;
  }>;
  onRemove: (value: string) => void;
  onClearAll: () => void;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FilterChips({ 
  filters, 
  onRemove, 
  onClearAll, 
  variant = 'default',
  size = 'md',
  className = ''
}: FilterChipsProps) {
  if (filters.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {filters.map((filter) => (
        <FilterChip
          key={filter.value}
          label={filter.label}
          value={filter.value}
          onRemove={onRemove}
          variant={variant}
          size={size}
        />
      ))}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClearAll}
        className={`px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200 ${size === 'sm' ? 'px-2 py-1 text-xs' : size === 'lg' ? 'px-4 py-2 text-base' : ''}`}
      >
        Temizle
      </motion.button>
    </div>
  );
}


