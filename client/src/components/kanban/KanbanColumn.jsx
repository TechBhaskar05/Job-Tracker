import React from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import JobCard from './JobCard';
import styles from './Kanban.module.css';

const columnColors = {
  APPLIED: 'var(--info)',
  SCREENING: 'var(--warning)',
  INTERVIEW: 'var(--accent)',
  OFFER: 'var(--success)',
  REJECTED: 'var(--danger)',
  GHOSTED: 'var(--text-400)',
};

const KanbanColumn = ({ id, title, jobs }) => {
  const { setNodeRef, isOver } = useSortable({ id });

  const style = {
    borderColor: isOver ? 'var(--accent)' : 'var(--border)',
    boxShadow: isOver ? 'var(--shadow-accent)' : 'none',
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.column}>
      <div className={styles.columnHeader} style={{ borderTopColor: columnColors[title] }}>
        <h3>{title}</h3>
        <span className={styles.jobCount}>{jobs.length}</span>
      </div>
      <div className={styles.cardList}>
        <SortableContext items={jobs.map(j => j._id)} strategy={verticalListSortingStrategy}>
          {jobs.map(job => (
            <JobCard key={job._id} job={job} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn;
