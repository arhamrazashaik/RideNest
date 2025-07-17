import { forwardRef } from 'react';

const Button = forwardRef(
  (
    {
      children,
      type = 'button',
      variant = 'primary',
      size = 'md',
      className = '',
      disabled = false,
      isLoading = false,
      fullWidth = false,
      icon: Icon,
      iconPosition = 'left',
      onClick,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium focus:outline-none transition-all duration-300 transform hover:scale-105';
    
    const variantClasses = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-md',
      secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white shadow-md',
      outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50',
      ghost: 'text-primary-600 hover:bg-primary-50',
      danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md',
      success: 'bg-green-600 hover:bg-green-700 text-white shadow-md',
      glass: 'bg-white/70 backdrop-blur-glass border border-white/20 text-gray-800 shadow-lg hover:bg-white/90',
      neumorphic: 'bg-gray-100 shadow-neumorphic text-gray-800 hover:shadow-neumorphic-inset'
    };
    
    const sizeClasses = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
      xl: 'px-6 py-3 text-lg'
    };
    
    const disabledClasses = 'opacity-60 cursor-not-allowed transform-none';
    const loadingClasses = 'relative text-transparent';
    const fullWidthClasses = 'w-full';
    
    const classes = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      disabled ? disabledClasses : '',
      fullWidth ? fullWidthClasses : '',
      className
    ].join(' ');
    
    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || isLoading}
        onClick={onClick}
        {...props}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
        
        {Icon && iconPosition === 'left' && !isLoading && (
          <Icon className={`h-5 w-5 ${children ? 'mr-2' : ''}`} />
        )}
        
        {children}
        
        {Icon && iconPosition === 'right' && !isLoading && (
          <Icon className={`h-5 w-5 ${children ? 'ml-2' : ''}`} />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
