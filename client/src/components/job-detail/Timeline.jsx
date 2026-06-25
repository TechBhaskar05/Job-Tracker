import React from 'react';

const timeAgo = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
};


const Timeline = ({ history }) => {
  return (
    <div className="flex flex-col gap-4">
      {history.map((item, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-accent shrink-0"></div>
            {index < history.length - 1 && <div className="w-[2px] flex-1 bg-border"></div>}
          </div>
          <div className="pb-4">
            <p className="text-text-200 text-sm font-medium">
              {item.fromStage} → {item.toStage}
            </p>
            <span className="text-text-400 text-xs">{timeAgo(item.changedAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
