import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Badge from '../ui/Badge';
import styles from './Kanban.module.css';

const timeAgo = (date) => {
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

const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job._id });

  const dndTransform = CSS.Transform.toString(transform)
  const style = {
    transform: isDragging ? `${dndTransform} scale(1.02)` : dndTransform,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = (e) => {
    // Prevent navigation when clicking the drag handle
    if (e.target.closest(`.${styles.dragHandle}`)) return;
    navigate(`/jobs/${job._id}`);
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className={styles.card} onClick={handleClick}>
      <div className={styles.cardHeader}>
        <h4 className={styles.company}>{job.company}</h4>
        <button {...listeners} className={styles.dragHandle}>⠿</button>
      </div>
      <p className={styles.role}>{job.role}</p>
      <div className={styles.cardFooter}>
        <span className={styles.timeAgo}>{timeAgo(job.appliedAt)}</span>
        <Badge stage={job.stage} size="sm" />
      </div>
    </div>
  );
};

export default JobCard;
