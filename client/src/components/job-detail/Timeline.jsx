import React from 'react';
import styles from './Timeline.module.css';

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
    <div className={styles.timeline}>
      {history.map((item, index) => (
        <div key={index} className={styles.timelineItem}>
          <div className={styles.timelineConnector}>
            <div className={styles.timelineDot}></div>
            {index < history.length - 1 && <div className={styles.timelineLine}></div>}
          </div>
          <div className={styles.timelineContent}>
            <p className={styles.timelineText}>
              {item.fromStage} → {item.toStage}
            </p>
            <span className={styles.timelineTime}>{timeAgo(item.changedAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
