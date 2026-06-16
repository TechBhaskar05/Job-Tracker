import React from 'react';
import styles from './Badge.module.css';

const Badge = ({ stage, size = 'md' }) => {
  const stageClass = stage ? styles[stage.toLowerCase()] : '';
  const sizeClass = styles[size];

  return (
    <span className={`${styles.badge} ${stageClass} ${sizeClass}`}>
      {stage}
    </span>
  );
};

export default Badge;
