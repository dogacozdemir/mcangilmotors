'use client';

import React from 'react';
import { FrontendXSSProtection } from '@/lib/sanitizer';

interface SafeHTMLProps {
  content: string;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
}

export function SafeHTML({ content, className, tag: Tag = 'div' }: SafeHTMLProps) {
  const sanitizedContent = FrontendXSSProtection.sanitizeHTML(content);
  
  return (
    <Tag 
      className={className}
      dangerouslySetInnerHTML={FrontendXSSProtection.createSafeHTML(sanitizedContent)}
    />
  );
}

// XSS-safe input component
interface SafeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: string) => void;
  sanitizeContext?: 'text' | 'email' | 'phone' | 'url' | 'filename';
}

export function SafeInput({ 
  onValueChange, 
  sanitizeContext = 'text', 
  onChange,
  ...props 
}: SafeInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const validation = FrontendXSSProtection.validateInput(value, sanitizeContext);
    
    if (!validation.isValid) {
      e.target.setCustomValidity(validation.error || 'Invalid input');
      e.target.reportValidity();
      return;
    }
    
    e.target.setCustomValidity('');
    
    if (onValueChange) {
      onValueChange(validation.sanitized);
    }
    
    if (onChange) {
      onChange(e);
    }
  };

  return <input {...props} onChange={handleChange} />;
}

// XSS-safe textarea component
interface SafeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onValueChange?: (value: string) => void;
  sanitizeContext?: 'text' | 'html';
}

export function SafeTextarea({ 
  onValueChange, 
  sanitizeContext = 'text', 
  onChange,
  ...props 
}: SafeTextareaProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const validation = FrontendXSSProtection.validateInput(value, sanitizeContext);
    
    if (!validation.isValid) {
      e.target.setCustomValidity(validation.error || 'Invalid input');
      e.target.reportValidity();
      return;
    }
    
    e.target.setCustomValidity('');
    
    if (onValueChange) {
      onValueChange(validation.sanitized);
    }
    
    if (onChange) {
      onChange(e);
    }
  };

  return <textarea {...props} onChange={handleChange} />;
}
