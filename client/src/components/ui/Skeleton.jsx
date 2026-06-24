import React from 'react';

const Skeleton = ({ width, height, borderRadius, className = '' }) => {
  const style = {
    width: width || '100%',
    height: height || '20px',
    borderRadius: borderRadius || '6px',
  };

  return <div className={`animate-pulse bg-bg-800 ${className}`} style={style}></div>;
};

export default Skeleton;
