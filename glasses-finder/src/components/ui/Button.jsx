import React from 'react';

/**
 * Reusable Button component with multiple variants
 * @param {Object} props - Component props
 * @param {'primary'|'secondary'|'outline'|'ghost'} props.variant - Button style variant
 * @param {'sm'|'md'|'lg'} props.size - Button size
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.loading - Whether button is in loading state
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler
 */
const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  children, 
  className = '', 
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 shadow-lg hover:shadow-xl transform hover:scale-105',
    secondary: 'bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50 focus:ring-purple-500',
    ghost: 'text-purple-600 hover:bg-purple-50 focus:ring-purple-500',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3',
    lg: 'px-6 py-4 text-lg',
  };
  
  const disabledClasses = 'opacity-50 cursor-not-allowed transform-none hover:transform-none';
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabled || loading ? disabledClasses : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
          <span>Loading...</span>
        </div>
      ) : children}
    </button>
  );
};

export default Button;