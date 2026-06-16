import React from 'react';

const CircularScore = ({ score }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let color = 'var(--danger)';
  if (score >= 70) color = 'var(--success)';
  else if (score >= 40) color = 'var(--warning)';

  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle
        cx="40"
        cy="40"
        r={radius}
        stroke="var(--bg-900)"
        strokeWidth="8"
        fill="transparent"
      />
      <circle
        cx="40"
        cy="40"
        r={radius}
        stroke={color}
        strokeWidth="8"
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
        style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fill="var(--text-100)"
        fontSize="20"
        fontWeight="bold"
      >
        {score}
      </text>
    </svg>
  );
};

export default CircularScore;
