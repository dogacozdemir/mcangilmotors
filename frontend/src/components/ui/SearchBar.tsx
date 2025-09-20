'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, SortAsc } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  showFilters?: boolean;
  showSort?: boolean;
  onFilterClick?: () => void;
  onSortClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SearchBar({ 
  value,
  onChange,
  onClear,
  placeholder = 'Araç ara...',
  showFilters = false,
  showSort = false,
  onFilterClick,
  onSortClick,
  className = '',
  size = 'md'
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'h-10 px-3 text-sm',
    md: 'h-12 px-4 text-base',
    lg: 'h-14 px-5 text-lg'
  };

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24
  };

  const handleClear = () => {
    onClear();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className={`relative flex items-center bg-white border rounded-lg transition-all duration-200 ${
          isFocused 
            ? 'border-amber-500 shadow-lg shadow-amber-500/20' 
            : 'border-gray-300 hover:border-gray-400'
        } ${sizeClasses[size]}`}
        animate={{ scale: isFocused ? 1.02 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Search Icon */}
        <Search 
          size={iconSize[size]} 
          className="text-gray-400 flex-shrink-0" 
        />
        
        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 ml-3 outline-none text-gray-900 placeholder-gray-500"
        />
        
        {/* Clear Button */}
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X size={iconSize[size]} />
            </motion.button>
          )}
        </AnimatePresence>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-1 ml-2">
          {showFilters && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onFilterClick}
              className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors duration-200"
              title="Filtreler"
            >
              <Filter size={iconSize[size]} />
            </motion.button>
          )}
          
          {showSort && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSortClick}
              className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors duration-200"
              title="Sırala"
            >
              <SortAsc size={iconSize[size]} />
            </motion.button>
          )}
        </div>
      </motion.div>
      
      {/* Search Suggestions */}
      <AnimatePresence>
        {isFocused && value && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          >
            <div className="p-4">
              <p className="text-sm text-gray-500">
                <span className="font-medium">{value}</span> için arama yapılıyor...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SearchBarWithSuggestionsProps extends SearchBarProps {
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  isLoading?: boolean;
}

export function SearchBarWithSuggestions({ 
  suggestions = [],
  onSuggestionClick,
  isLoading = false,
  ...props
}: SearchBarWithSuggestionsProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className="relative">
      <SearchBar
        {...props}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      
      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-500 border-t-transparent mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Aranıyor...</p>
              </div>
            ) : (
              <div className="py-2">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      onSuggestionClick?.(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
