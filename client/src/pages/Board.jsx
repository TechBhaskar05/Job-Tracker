import React, { useState, useEffect, useMemo } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import PageLayout from '../components/layout/PageLayout';
import KanbanColumn from '../components/kanban/KanbanColumn';
import JobCard from '../components/kanban/JobCard';
import AddJobModal from '../components/kanban/AddJobModal';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import api from '../lib/api';
import { showToast } from '../lib/toast';
import styles from './Board.module.css';

const STAGES = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'GHOSTED'];

const StatCard = ({ icon, value, label, color }) => (
  <div className={styles.statCard}>
    <div className={styles.statIcon} style={{ color }}>{icon}</div>
    <div className={styles.statValue}>{value}</div>
    <div className={styles.statLabel}>{label}</div>
  </div>
);

const Board = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await api.get('/jobs');
        setJobs(data);
      } catch (error) {
        showToast('Failed to fetch jobs.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'n' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        setIsModalOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const jobsByStage = useMemo(() => {
    const grouped = {};
    STAGES.forEach(stage => grouped[stage] = []);
    jobs.forEach(job => {
      if (grouped[job.stage]) {
        grouped[job.stage].push(job);
      }
    });
    return grouped;
  }, [jobs]);

  const stats = useMemo(() => {
    return {
      total: jobs.length,
      inProgress: jobs.filter(j => ['SCREENING', 'INTERVIEW'].includes(j.stage)).length,
      interviews: jobs.filter(j => j.stage === 'INTERVIEW').length,
      offers: jobs.filter(j => j.stage === 'OFFER').length,
    }
  }, [jobs]);

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveJob(jobs.find(job => job._id === active.id) || null);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveJob(null);
  
    if (!over) return;
  
    const activeJob = jobs.find(j => j._id === active.id);
    const overContainer = over.data.current?.sortable?.containerId;
    const overStage = overContainer || over.id;
  
    if (!activeJob || activeJob.stage === overStage) {
      return;
    }
  
    const originalJobs = [...jobs];
  
    // Optimistic update
    setJobs(prev => prev.map(j => j._id === active.id ? { ...j, stage: overStage } : j));
  
    try {
      await api.patch(`/jobs/${active.id}`, { stage: overStage });
      showToast('Job stage updated!', 'success');
    } catch (error) {
      showToast('Failed to update job stage.', 'error');
      setJobs(originalJobs); // Revert on error
    }
  };
  
  const handleJobAdded = (newJob) => {
    setJobs(prev => [newJob, ...prev]);
  };

  const renderBoardContent = () => {
    if (loading) {
      return (
        <div className={styles.columnsContainer}>
          {STAGES.map(stage => (
            <div key={stage} className={styles.columnSkeleton}>
              <h3 className={styles.columnHeaderSkeleton}>{stage}</h3>
              <div className={styles.cardListSkeleton}>
                {[...Array(3)].map((_, i) => <Skeleton key={i} height="100px" />)}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (jobs.length === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>💼</div>
          <h2>No jobs yet</h2>
          <p>Start tracking your applications to see them here.</p>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>Add Your First Application</Button>
        </div>
      );
    }

    return (
      <div className={styles.columnsContainer}>
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
          <SortableContext items={STAGES}>
            {STAGES.map(stage => (
              <KanbanColumn key={stage} id={stage} title={stage} jobs={jobsByStage[stage]} />
            ))}
          </SortableContext>
          <DragOverlay>
            {activeJob ? <JobCard job={activeJob} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    );
  };

  return (
    <PageLayout title="Job Board">
      <div className={styles.board}>
        <div className={styles.statsBar}>
          <StatCard icon="💼" value={stats.total} label="Total Applied" color="var(--text-200)" />
          <StatCard icon="🕒" value={stats.inProgress} label="In Progress" color="var(--warning)" />
          <StatCard icon="⭐" value={stats.interviews} label="Interviews" color="var(--accent)" />
          <StatCard icon="🏆" value={stats.offers} label="Offers" color="var(--success)" />
        </div>
        {renderBoardContent()}
      </div>
      <button className={styles.fab} onClick={() => setIsModalOpen(true)} title="Add new job (N)">+</button>
      <AddJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onJobAdded={handleJobAdded} />
    </PageLayout>
  );
};

export default Board;
