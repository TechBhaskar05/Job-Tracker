import React from 'react';

const Spinner = ({ size = 'md', color }) => {
  const sizeMap = { sm: 16, md: 24, lg: 32 };
  const style = {
    width: sizeMap[size],
    height: sizeMap[size],
    borderColor: color || 'var(--accent)',
    borderTopColor: 'transparent',
  };

  return <div className="rounded-full border-2 border-solid animate-spin" style={style}></div>;
};

export default Spinner;
