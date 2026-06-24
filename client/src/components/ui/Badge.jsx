import React from 'react';

const stageColors = {
  applied: 'bg-info-tint border border-info text-info',
  screening: 'bg-warning-tint border border-warning text-warning',
  interview: 'bg-accent-tint border border-accent text-accent',
  offer: 'bg-success-tint border border-success text-success',
  rejected: 'bg-danger-tint border border-danger text-danger',
  ghosted: 'bg-bg-600 text-text-300 border border-border-subtle',
};

const sizeClasses = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-[11px] px-[10px] py-[3px]',
};

const Badge = ({ stage, size = 'md' }) => {
  const stageClass = stage ? stageColors[stage.toLowerCase()] : '';
  const sizeClass = sizeClasses[size];

  return (
    <span className={`inline-flex items-center rounded-full font-semibold uppercase tracking-wider ${stageClass} ${sizeClass}`}>
      {stage}
    </span>
  );
};

export default Badge;
