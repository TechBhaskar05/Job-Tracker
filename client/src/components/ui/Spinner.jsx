import React from 'react';
import styles from './Spinner.module.css';

const Spinner = ({ size = 'md', color }) => {
  const sizeMap = { sm: 16, md: 24, lg: 32 };
  const style = {
    width: sizeMap[size],
    height: sizeMap[size],
    borderColor: color || 'var(--accent)',
    borderTopColor: 'transparent',
  };

  return <div className={styles.spinner} style={style}></div>;
};

export default Spinner;
