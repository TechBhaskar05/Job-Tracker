import React, { useEffect } from 'react';

const PageLayout = ({ children, title }) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} — JobTrackr`;
    } else {
      document.title = 'JobTrackr';
    }
  }, [title]);

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: 'var(--bg-950)' }}>
      {children}
    </div>
  );
};

export default PageLayout;
