import React, { useState, useEffect } from 'react';

const PageTransition = ({ children }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(id);
  }, []);

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(10px)',
      transition: 'opacity 200ms ease, transform 200ms ease',
    }}>
      {children}
    </div>
  );
};

export default PageTransition;
