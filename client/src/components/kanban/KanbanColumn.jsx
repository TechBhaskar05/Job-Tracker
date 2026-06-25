import React from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import JobCard from './JobCard';

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
    <div ref={setNodeRef} style={style} className="w-72 max-md:w-[85vw] shrink-0 bg-bg-800 border border-border rounded-lg overflow-hidden flex flex-col transition duration-200 ease-out scroll-snap-start">
      <div className="px-4 py-3.5 flex justify-between items-center border-t-[3px] border-b border-border-subtle" style={{ borderTopColor: columnColors[title] }}>
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-200">{title}</h3>
        <span className="bg-bg-700 text-text-300 text-xs font-semibold px-2 py-0.5 rounded-full">{jobs.length}</span>
      </div>
      <div className="p-2 min-h-[200px] flex flex-col gap-2 flex-grow bg-bg-900">
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
