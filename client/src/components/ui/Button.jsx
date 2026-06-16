import React from 'react';
import Spinner from './Spinner';
import styles from './Button.module.css';

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
    ${styles.button}
    ${styles[variant]}
    ${styles[size]}
    ${fullWidth ? styles.fullWidth : ''}
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
      {Icon && !loading && <Icon className={styles.icon} />}
      <span className={loading ? styles.loadingContent : ''}>{children}</span>
    </button>
  );
};

export default Button;
