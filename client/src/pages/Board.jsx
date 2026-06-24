import React, { useState, useEffect, useMemo } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import PageLayout from '../components/layout/PageLayout';
import PageTransition from '../components/layout/PageTransition';
import KanbanColumn from '../components/kanban/KanbanColumn';
import JobCard from '../components/kanban/JobCard';
import AddJobModal from '../components/kanban/AddJobModal';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import api from '../lib/api';
import { showToast } from '../lib/toast';

const STAGES = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'GHOSTED'];

const StatCard = ({ icon, value, label, color }) => (
  <div className="p-3 md:px-5 md:py-4 text-center bg-bg-800 border border-border rounded-lg">
    <div className="text-2xl mb-2" style={{ color }}>{icon}</div>
    <div className="md:text-3xl text-2xl font-bold text-accent leading-tight">{value}</div>
    <div className="text-xs text-text-300">{label}</div>
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

  const weeklyData = useMemo(() => {
    const weeks = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - start.getDay() - i * 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      weeks.push({
        label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: jobs.filter(j => {
          const d = new Date(j.appliedAt || j.createdAt);
          return d >= start && d < end;
        }).length,
      });
    }
    return weeks;
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
  
    setJobs(prev => prev.map(j => j._id === active.id ? { ...j, stage: overStage } : j));
  
    try {
      await api.patch(`/jobs/${active.id}`, { stage: overStage });
      showToast('Job stage updated!', 'success');
    } catch (error) {
      showToast('Failed to update job stage.', 'error');
      setJobs(originalJobs);
    }
  };
  
  const handleJobAdded = (newJob) => {
    setJobs(prev => [newJob, ...prev]);
  };

  const renderBoardContent = () => {
    if (loading) {
      return (
        <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 [scroll-snap-type:x_mandatory] [-webkit-overflow-scrolling:touch]">
          {STAGES.map(stage => (
            <div key={stage} className="min-w-[320px] shrink-0 bg-bg-800 border border-border rounded-lg p-4 animate-pulse">
              <h3 className="text-sm font-semibold text-text-400 uppercase tracking-[0.5px] mb-3 py-2 bg-bg-700 rounded h-5 w-[60%]">{stage}</h3>
              <div className="flex flex-col gap-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} height="100px" />)}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (jobs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center border-2 border-dashed border-border rounded-xl mt-6">
          <div className="text-[120px] text-text-400 opacity-50 leading-none">💼</div>
          <h2 className="text-2xl text-text-100 mt-4">No jobs yet</h2>
          <p className="text-text-300 mb-6">Start tracking your applications to see them here.</p>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>Add Your First Application</Button>
        </div>
      );
    }

    return (
      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 [scroll-snap-type:x_mandatory] [-webkit-overflow-scrolling:touch]">
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
      <PageTransition>
        <div className="p-4 md:p-6 max-w-full">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 flex-1">
              <StatCard icon="💼" value={stats.total} label="Total Applied" color="var(--text-200)" />
              <StatCard icon="🕒" value={stats.inProgress} label="In Progress" color="var(--warning)" />
              <StatCard icon="⭐" value={stats.interviews} label="Interviews" color="var(--accent)" />
              <StatCard icon="🏆" value={stats.offers} label="Offers" color="var(--success)" />
            </div>
            <div className="bg-bg-800 border border-border rounded-lg p-4 md:min-w-[220px] flex flex-col justify-center">
              <div className="text-xs font-semibold text-text-300 uppercase tracking-[0.5px] mb-2">Weekly Applications</div>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={weeklyData}>
                  <XAxis dataKey="label" tick={{ fill: 'var(--text-400)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 12 }}
                    labelStyle={{ color: 'var(--text-100)' }}
                    itemStyle={{ color: 'var(--accent)' }}
                  />
                  <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {renderBoardContent()}
        </div>
      </PageTransition>
      <button className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent text-white text-3xl shadow-accent z-100 border-none flex items-center justify-center hover:scale-110 transition-transform" onClick={() => setIsModalOpen(true)} title="Add new job (N)">+</button>
      <AddJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onJobAdded={handleJobAdded} />
    </PageLayout>
  );
};

export default Board;
