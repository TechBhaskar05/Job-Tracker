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
    <div className="pt-16 min-h-screen bg-bg-950">
      {children}
    </div>
  );
};

export default PageLayout;
