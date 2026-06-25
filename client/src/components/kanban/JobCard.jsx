import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Badge from '../ui/Badge';

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
    if (e.target.closest('[data-drag-handle]')) return;
    navigate(`/board/jobs/${job._id}`);
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="bg-bg-700 border border-border rounded p-3.5 cursor-pointer transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-accent)] hover:border-border-bright" onClick={handleClick}>
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-sm text-accent">{job.company}</h4>
        <button data-drag-handle {...listeners} className="bg-transparent text-text-400 cursor-grab p-0 text-lg hover:text-text-200">⠿</button>
      </div>
      <p className="text-text-100 text-xs font-medium mt-2">{job.role}</p>
      <div className="flex justify-between items-center mt-3">
        <span className="text-text-400 text-[11px]">{timeAgo(job.appliedAt)}</span>
        <Badge stage={job.stage} size="sm" />
      </div>
    </div>
  );
};

export default JobCard;
