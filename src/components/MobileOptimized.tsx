import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

// Hook for detecting mobile viewport
export const useIsMobile = (breakpoint: number = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check on mount
    checkMobile();

    // Listen for resize events
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
};

// Mobile-optimized container component
interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  className = '',
  padding = 'md',
  maxWidth = 'lg'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'px-4 py-2',
    md: 'px-4 sm:px-6 py-4 sm:py-6',
    lg: 'px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12'
  };

  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-7xl',
    xl: 'max-w-screen-xl',
    full: 'max-w-full'
  };

  return (
    <div className={cn(
      'w-full mx-auto',
      paddingClasses[padding],
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  );
};

// Mobile-optimized form component
interface MobileFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export const MobileForm: React.FC<MobileFormProps> = ({
  children,
  onSubmit,
  className = ''
}) => {
  const isMobile = useIsMobile();

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'space-y-4',
        isMobile ? 'space-y-6' : 'space-y-4',
        className
      )}
    >
      {children}
    </form>
  );
};

// Mobile-optimized grid component
interface MobileGridProps {
  children: React.ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MobileGrid: React.FC<MobileGridProps> = ({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className = ''
}) => {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8'
  };

  const gridClasses = cn(
    'grid',
    cols.mobile && `grid-cols-${cols.mobile}`,
    cols.tablet && `sm:grid-cols-${cols.tablet}`,
    cols.desktop && `lg:grid-cols-${cols.desktop}`,
    gapClasses[gap],
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

// Mobile-optimized button component
interface MobileButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = ''
}) => {
  const isMobile = useIsMobile();

  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-austin-blue text-white hover:bg-austin-teal focus:ring-austin-blue',
    secondary: 'bg-austin-green text-white hover:bg-austin-green/90 focus:ring-austin-green',
    outline: 'border-2 border-austin-blue text-austin-blue hover:bg-austin-blue hover:text-white focus:ring-austin-blue',
    ghost: 'text-austin-blue hover:bg-austin-blue/10 focus:ring-austin-blue'
  };

  const sizeClasses = {
    sm: isMobile ? 'px-4 py-3 text-sm min-h-[44px]' : 'px-3 py-2 text-sm',
    md: isMobile ? 'px-6 py-4 text-base min-h-[48px]' : 'px-4 py-2 text-base',
    lg: isMobile ? 'px-8 py-5 text-lg min-h-[52px]' : 'px-6 py-3 text-lg',
    xl: isMobile ? 'px-10 py-6 text-xl min-h-[56px]' : 'px-8 py-4 text-xl'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
      )}
      {children}
    </button>
  );
};

// Mobile-optimized input component
interface MobileInputProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

export const MobileInput: React.FC<MobileInputProps & React.InputHTMLAttributes<HTMLInputElement>> = ({
  label,
  error,
  hint,
  required = false,
  className = '',
  ...props
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        {...props}
        className={cn(
          'w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent transition-colors',
          isMobile ? 'px-4 py-4 text-base min-h-[48px]' : 'px-3 py-2 text-sm',
          error && 'border-red-300 focus:ring-red-500',
          className
        )}
      />

      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

// Mobile-optimized card component
interface MobileCardProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hover?: boolean;
  className?: string;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  padding = 'md',
  shadow = 'md',
  border = true,
  hover = false,
  className = ''
}) => {
  const isMobile = useIsMobile();

  const paddingClasses = {
    sm: isMobile ? 'p-4' : 'p-3',
    md: isMobile ? 'p-6' : 'p-4',
    lg: isMobile ? 'p-8' : 'p-6'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  return (
    <div className={cn(
      'bg-white rounded-lg',
      paddingClasses[padding],
      shadowClasses[shadow],
      border && 'border border-gray-200',
      hover && 'hover:shadow-lg transition-shadow duration-200',
      className
    )}>
      {children}
    </div>
  );
};

// Touch-friendly interactive component
interface TouchTargetProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const TouchTarget: React.FC<TouchTargetProps> = ({
  children,
  onClick,
  className = '',
  disabled = false
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation',
        'focus:outline-none focus:ring-2 focus:ring-austin-blue focus:ring-offset-2',
        'transition-colors duration-200',
        !disabled && 'active:scale-95',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {children}
    </button>
  );
};

// Responsive text component
interface ResponsiveTextProps {
  children: React.ReactNode;
  size?: {
    mobile?: string;
    desktop?: string;
  };
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: string;
  className?: string;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  size = { mobile: 'text-base', desktop: 'text-lg' },
  weight = 'normal',
  color = 'text-gray-900',
  className = ''
}) => {
  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  return (
    <div className={cn(
      size.mobile,
      size.desktop && `sm:${size.desktop}`,
      weightClasses[weight],
      color,
      className
    )}>
      {children}
    </div>
  );
};

// Austin-themed mobile loading component
export const AustinMobileLoader: React.FC<{ message?: string }> = ({
  message = 'Loading your Austin moving experience...'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative mb-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-austin-blue border-t-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl">🏠</span>
        </div>
      </div>
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );
};