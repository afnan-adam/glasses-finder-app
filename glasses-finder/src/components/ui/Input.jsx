import React from 'react';

/**
 * Reusable Input component with validation styling
 */
const Input = ({ 
  label, 
  icon: Icon, 
  error, 
  className = '', 
  required = false,
  ...props 
}) => {
  const inputClasses = [
    'w-full p-4 border-2 rounded-xl focus:outline-none transition-colors text-lg',
    error 
      ? 'border-red-300 focus:border-red-500' 
      : 'border-gray-200 focus:border-purple-500',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {Icon && <Icon className="w-4 h-4 inline mr-2" />}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;