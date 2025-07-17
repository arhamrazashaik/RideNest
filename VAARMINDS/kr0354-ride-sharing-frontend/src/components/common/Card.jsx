import { forwardRef } from 'react';

const Card = forwardRef(
  (
    {
      children,
      className = '',
      variant = 'default',
      hover = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'rounded-xl overflow-hidden transition-all duration-300';
    
    const variantClasses = {
      default: 'bg-white shadow-lg',
      glass: 'glass-card',
      neumorphic: 'neumorphic',
      outline: 'border border-gray-200 bg-white',
      flat: 'bg-white'
    };
    
    const hoverClasses = hover ? 'card-hover' : '';
    
    const classes = [
      baseClasses,
      variantClasses[variant],
      hoverClasses,
      onClick ? 'cursor-pointer' : '',
      className
    ].join(' ');
    
    return (
      <div
        ref={ref}
        className={classes}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`px-6 py-4 border-b border-gray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Body Component
const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Card Footer Component
const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`px-6 py-4 border-t border-gray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Export all components
export { Card, CardHeader, CardBody, CardFooter };
export default Card;
