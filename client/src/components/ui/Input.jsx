import React from 'react';

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
    <div className="w-full">
      {label && <label className="block text-text-300 text-xs mb-1 font-medium">{label}</label>}
      <div className="relative flex items-center">
        {Icon && <Icon className="absolute left-3 text-text-300 size-[18px]" />}
        <input
          type={type}
          ref={ref}
          {...rest}
          className={`w-full ${Icon ? 'pl-10' : ''} ${RightIcon ? 'pr-10' : ''} ${hasError ? 'border-danger focus:border-danger focus:ring-3 focus:ring-danger-tint' : ''}`}
        />
        {RightIcon && <RightIcon className="absolute right-3 text-text-300 size-[18px]" />}
      </div>
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
      {!error && helperText && <p className="text-text-400 text-xs mt-1">{helperText}</p>}
    </div>
  );
});

export default Input;
