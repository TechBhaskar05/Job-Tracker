import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import api from '../lib/api';
import { showToast } from '../lib/toast';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';
import CompanyInfoCard from '../components/job-detail/CompanyInfoCard';
import CircularScore from '../components/job-detail/CircularScore';
import Timeline from '../components/job-detail/Timeline';

const timeAgo = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
};

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tailorLoading, setTailorLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [isNotesSaved, setIsNotesSaved] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const notesTimeoutRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setJob(data);
        setNotes(data.notes || '');
        setLoading(false);

        if (!data.companyInfo || !data.companyInfo.fetchedAt) {
          pollingIntervalRef.current = setInterval(async () => {
            try {
              const { data: updatedJob } = await api.get(`/jobs/${id}`);
              if (updatedJob.companyInfo && updatedJob.companyInfo.fetchedAt) {
                setJob(updatedJob);
                clearInterval(pollingIntervalRef.current);
              }
            } catch (pollError) {
              console.error("Polling error:", pollError);
              clearInterval(pollingIntervalRef.current);
            }
          }, 3000);
        }
      } catch (error) {
        showToast('Failed to fetch job details.', 'error');
        navigate('/');
      }
    };

    fetchJob();

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current);
    };
  }, [id, navigate]);

  const handleNotesBlur = async () => {
    if (notes === job.notes) return;
    try {
      await api.patch(`/jobs/${id}`, { notes });
      setJob(prev => ({ ...prev, notes }));
      setIsNotesSaved(true);
      notesTimeoutRef.current = setTimeout(() => setIsNotesSaved(false), 1500);
    } catch (error) {
      showToast('Failed to save notes.', 'error');
    }
  };

  const handleTailorResume = async () => {
    setTailorLoading(true);
    try {
      const { data } = await api.post(`/agents/tailor`, { jobId: id });
      setJob(prev => ({ ...prev, tailoredResume: data.tailoredResume }));
      showToast('Resume tailored successfully!', 'success');
    } catch (error) {
      showToast('Failed to tailor resume.', 'error');
    } finally {
      setTailorLoading(false);
    }
  };

  const handleCopyResume = () => {
    navigator.clipboard.writeText(job.tailoredResume);
    showToast('Copied to clipboard!', 'success');
  };

  const handleDeleteJob = async () => {
    try {
      await api.delete(`/jobs/${id}`);
      showToast('Job deleted successfully.', 'success');
      navigate('/');
    } catch (error) {
      showToast('Failed to delete job.', 'error');
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="p-6 max-w-[1200px] mx-auto">
           <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4">
             ← Back to Board
           </Button>
          <div className="grid md:grid-cols-[58%_1fr] grid-cols-1 gap-6">
            <div className="flex flex-col gap-6">
              <Skeleton height="40px" width="60%" />
              <Skeleton height="30px" width="40%" className="mt-2" />
              <div className="flex gap-4 mt-6">
                <Skeleton height="34px" width="150px" />
                <Skeleton height="34px" width="150px" />
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <Skeleton height="300px" />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`${job.role} at ${job.company}`}>
      <style>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; }
          20%, 80% { opacity: 1; }
        }
      `}</style>
      <div className="p-6 max-w-[1200px] mx-auto">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4">
          ← Back to Board
        </Button>
        <div className="grid md:grid-cols-[58%_1fr] grid-cols-1 gap-6">
          <div className="flex flex-col gap-6">
            <header className="pb-6 border-b border-border-subtle">
              <h1 className="text-[26px] font-bold text-accent">{job.company}</h1>
              <h2 className="text-xl text-text-100 mt-1">{job.role}</h2>
              <div className="flex items-center gap-3 mt-3 text-text-400 text-xs">
                <Badge stage={job.stage} />
                <span>Applied {timeAgo(job.appliedAt)}</span>
              </div>
              {job.url && (
                <a href={job.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-accent-tint text-accent px-2.5 py-1 rounded-full text-xs mt-3 border border-border hover:bg-bg-600 hover:no-underline">
                  🔗 {new URL(job.url).hostname}
                </a>
              )}
            </header>

            <div className="flex gap-3">
              <Button variant="primary" size="sm" onClick={handleTailorResume} loading={tailorLoading}>
                {tailorLoading ? 'Tailoring...' : 'Tailor Resume'}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => navigate(`/interview/${id}`)}>
                Mock Interview
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate(`/ats?jobId=${id}`)}>
                ATS Analysis
              </Button>
            </div>
            
            <section className="flex flex-col gap-2">
                <label className="text-text-300 text-xs font-bold uppercase tracking-[0.08em]">Notes</label>
                <div style={{position: 'relative'}}>
                    <textarea 
                        className="w-full bg-bg-800 border border-transparent rounded-lg p-3 min-h-[80px] focus:bg-bg-700 focus:border-border"
                        rows={4} 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        onBlur={handleNotesBlur}
                        placeholder="Add your notes here..."
                    />
                    {isNotesSaved && <span className="absolute bottom-2 right-2 text-text-400 text-xs" style={{ animation: 'fadeInOut 1.5s ease' }}>Saved</span>}
                </div>
            </section>

            {job.tailoredResume && (
              <section className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <label className="text-text-300 text-xs font-bold uppercase tracking-[0.08em]">AI-Tailored Resume</label>
                    <Button variant="ghost" size="sm" onClick={handleCopyResume}>
                        📋 Copy
                    </Button>
                </div>
                <pre className="bg-bg-950 border border-border-subtle border-l-[3px] border-l-accent p-4 text-xs text-text-200 overflow-x-auto whitespace-pre-wrap rounded-sm max-h-[300px]">{job.tailoredResume}</pre>
              </section>
            )}
            
            {job.atsScore !== null && typeof job.atsScore === 'number' && (
                <section className="flex flex-col gap-2">
                    <div className="flex items-center gap-4 bg-bg-800 p-4 rounded-lg">
                        <CircularScore score={job.atsScore} />
                        <label className="text-text-300 text-xs font-bold uppercase tracking-[0.08em]">ATS Score</label>
                    </div>
                </section>
            )}

            {job.stageHistory && job.stageHistory.length > 0 && (
                <section className="flex flex-col gap-2">
                    <label className="text-text-300 text-xs font-bold uppercase tracking-[0.08em]">Stage History</label>
                    <Timeline history={job.stageHistory} />
                </section>
            )}

            <div className="mt-auto pt-6 border-t border-border-subtle">
                <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>Delete Job</Button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <CompanyInfoCard companyInfo={job.companyInfo} companyName={job.company} />
          </div>
        </div>
      </div>
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Job Application">
        <p>Are you sure you want to delete this application? This action cannot be undone.</p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteJob}>Delete</Button>
        </div>
      </Modal>
    </PageLayout>
  );
};

export default JobDetail;
