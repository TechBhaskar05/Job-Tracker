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
import styles from './JobDetail.module.css';

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
        <div className={styles.page}>
           <Button variant="ghost" size="sm" onClick={() => navigate('/')} className={styles.backButton}>
             ← Back to Board
           </Button>
          <div className={styles.grid}>
            <div className={styles.leftColumn}>
              <Skeleton height="40px" width="60%" />
              <Skeleton height="30px" width="40%" style={{ marginTop: '8px' }} />
              <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                <Skeleton height="34px" width="150px" />
                <Skeleton height="34px" width="150px" />
              </div>
            </div>
            <div className={styles.rightColumn}>
              <Skeleton height="300px" />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`${job.role} at ${job.company}`}>
      <div className={styles.page}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className={styles.backButton}>
          ← Back to Board
        </Button>
        <div className={styles.grid}>
          <div className={styles.leftColumn}>
            <header className={styles.header}>
              <h1 className={styles.company}>{job.company}</h1>
              <h2 className={styles.role}>{job.role}</h2>
              <div className={styles.meta}>
                <Badge stage={job.stage} />
                <span>Applied {timeAgo(job.appliedAt)}</span>
              </div>
              {job.url && (
                <a href={job.url} target="_blank" rel="noopener noreferrer" className={styles.urlChip}>
                  🔗 {new URL(job.url).hostname}
                </a>
              )}
            </header>

            <div className={styles.actionButtons}>
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
            
            <section className={styles.section}>
                <label className={styles.label}>Notes</label>
                <div style={{position: 'relative'}}>
                    <textarea 
                        className={styles.notesTextarea}
                        rows={4} 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        onBlur={handleNotesBlur}
                        placeholder="Add your notes here..."
                    />
                    {isNotesSaved && <span className={styles.savedFlash}>Saved</span>}
                </div>
            </section>

            {job.tailoredResume && (
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <label className={styles.label}>AI-Tailored Resume</label>
                    <Button variant="ghost" size="sm" onClick={handleCopyResume}>
                        📋 Copy
                    </Button>
                </div>
                <pre className={styles.resumeContent}>{job.tailoredResume}</pre>
              </section>
            )}
            
            {job.atsScore !== null && typeof job.atsScore === 'number' && (
                <section className={styles.section}>
                    <div className={styles.atsContainer}>
                        <CircularScore score={job.atsScore} />
                        <label className={styles.label}>ATS Score</label>
                    </div>
                </section>
            )}

            {job.stageHistory && job.stageHistory.length > 0 && (
                <section className={styles.section}>
                    <label className={styles.label}>Stage History</label>
                    <Timeline history={job.stageHistory} />
                </section>
            )}

            <div className={styles.deleteSection}>
                <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>Delete Job</Button>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <CompanyInfoCard companyInfo={job.companyInfo} companyName={job.company} />
          </div>
        </div>
      </div>
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Job Application">
        <p>Are you sure you want to delete this application? This action cannot be undone.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteJob}>Delete</Button>
        </div>
      </Modal>
    </PageLayout>
  );
};

export default JobDetail;
