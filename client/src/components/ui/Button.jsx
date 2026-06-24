import React from 'react';
import Spinner from './Spinner';

const variantClasses = {
  primary: 'bg-accent text-bg-950 hover:bg-accent-light active:scale-[0.97] active:bg-accent-dark',
  secondary: 'bg-transparent border border-border-bright text-text-100 hover:bg-accent-tint hover:border-accent',
  danger: 'bg-danger-tint border border-danger text-danger hover:bg-danger hover:text-white',
  ghost: 'bg-transparent text-text-200 hover:bg-bg-700 hover:text-text-100',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  icon: Icon,
  ...rest
}) => {
  const className = `
    inline-flex items-center justify-center gap-2 rounded-sm font-medium transition whitespace-nowrap
    disabled:opacity-40 disabled:cursor-not-allowed
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      {...rest}
    >
      {loading && <Spinner size="sm" />}
      {Icon && !loading && <Icon className="size-4" />}
      <span className={loading ? 'opacity-50' : ''}>{children}</span>
    </button>
  );
};

export default Button;
