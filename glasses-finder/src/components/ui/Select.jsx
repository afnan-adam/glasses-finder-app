import React from 'react';

/**
 * Reusable Select component with validation styling
 */
const Select = ({ 
  label, 
  icon: Icon, 
  error, 
  children, 
  className = '', 
  required = false,
  ...props 
}) => {
  const selectClasses = [
    'w-full p-4 border-2 rounded-xl focus:outline-none transition-colors text-lg bg-white',
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
      <select className={selectClasses} {...props}>
        {children}
      </select>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default Select;