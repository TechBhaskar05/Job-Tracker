import React from 'react';
import styles from './Input.module.css';

const Input = React.forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  rightIcon: RightIcon,
  type = 'text',
  ...rest
}, ref) => {
  const hasError = !!error;
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={`${styles.inputContainer} ${hasError ? styles.errorState : ''}`}>
        {Icon && <Icon className={styles.leftIcon} />}
        <input type={type} ref={ref} {...rest} className={styles.input} />
        {RightIcon && <RightIcon className={styles.rightIcon} />}
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
      {!error && helperText && <p className={styles.helperText}>{helperText}</p>}
    </div>
  );
});

export default Input;
