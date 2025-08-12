import React from 'react';

/**
 * Reusable Loading Spinner component
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'purple', 
  text = 'Loading...', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    purple: 'border-purple-600',
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    white: 'border-white'
  };

  const spinnerClasses = [
    'animate-spin rounded-full border-2 border-t-transparent',
    sizeClasses[size],
    colorClasses[color]
  ].join(' ');

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div className={spinnerClasses}></div>
      {text && (
        <p className="text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;