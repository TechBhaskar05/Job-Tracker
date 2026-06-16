import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import api from '../../lib/api';
import { showToast } from '../../lib/toast';

const AddJobModal = ({ isOpen, onClose, onJobAdded }) => {
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role || !company) {
      showToast('Role and Company are required.', 'error');
      return;
    }
    setLoading(true);
    try {
      const { data: newJob } = await api.post('/jobs', { role, company, jobDesc, url, notes });
      onJobAdded(newJob);
      showToast('Job added successfully!', 'success');
      onClose();
      // Reset form
      setRole(''); setCompany(''); setJobDesc(''); setUrl(''); setNotes('');
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to add job.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Job Application" size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input label="Role*" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g., Software Engineer" required />
        <Input label="Company*" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g., Google" required />
        <label style={{fontSize: '12px', color: 'var(--text-300)', marginBottom: '-12px'}}>Job Description</label>
        <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} rows={5} placeholder="Paste the job description here..."></textarea>
        <Input label="Job URL" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://careers.google.com/..." />
        <label style={{fontSize: '12px', color: 'var(--text-300)', marginBottom: '-12px'}}>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Any notes about this application..."></textarea>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={loading}>Add Job</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddJobModal;
