import { useState, useEffect } from 'react'
import PageLayout from '../components/layout/PageLayout'
import Button from '../components/ui/Button'
import api from '../lib/api'
import { showToast } from '../lib/toast'
import styles from './Profile.module.css'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [resume, setResume] = useState('')
  const [originalResume, setOriginalResume] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveText, setSaveText] = useState('Save & Generate Embeddings')
  const [editingName, setEditingName] = useState(false)
  const [editName, setEditName] = useState('')
  const [stats, setStats] = useState({ jobs: 0, quizzes: 0, ats: 0 })

  useEffect(() => {
    fetchUser()
    fetchStats()
  }, [])

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data)
      setResume(data.resume || '')
      setOriginalResume(data.resume || '')
      setEditName(data.name)
    } catch {
      showToast('Failed to load profile', 'error')
    }
  }

  const fetchStats = async () => {
    try {
      const [jobsRes, quizRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/quiz/history'),
      ])
      const jobs = jobsRes.data.length || 0
      const quizzes = quizRes.data.history?.length || 0
      const ats = jobsRes.data.filter(j => j.atsScore != null).length
      setStats({ jobs, quizzes, ats })
    } catch {
      // stats silently fail
    }
  }

  const handleSaveResume = async () => {
    setSaving(true)
    setSaveText('Saving...')
    try {
      await api.patch('/profile/resume', { resume })
      await new Promise(r => setTimeout(r, 2000))
      setSaveText('Generating embeddings...')
      await new Promise(r => setTimeout(r, 1000))
      setOriginalResume(resume)
      showToast('Resume saved! Tailor and ATS features are now active.', 'success')
      setSaveText('Save & Generate Embeddings')
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save resume', 'error')
      setSaveText('Save & Generate Embeddings')
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleEditName = () => {
    setEditingName(true)
  }

  const handleSaveName = () => {
    if (editName.trim().length < 2) {
      showToast('Name must be at least 2 characters', 'error')
      return
    }
    setUser(prev => ({ ...prev, name: editName.trim() }))
    setEditingName(false)
    showToast('Name updated', 'success')
  }

  const handleCancelName = () => {
    setEditName(user.name)
    setEditingName(false)
  }

  const resumeChanged = resume !== originalResume

  if (!user) {
    return (
      <PageLayout title="Profile">
        <div className={styles.container}>
          <div className={styles.loadingState}>Loading profile...</div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Profile">
      <div className={styles.container}>
        <div className={styles.headerCard}>
          <div className={styles.avatar}>{getInitials(user.name)}</div>
          <div className={styles.headerInfo}>
            {editingName ? (
              <div className={styles.nameEditRow}>
                <input
                  className={styles.nameInput}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName()
                    if (e.key === 'Escape') handleCancelName()
                  }}
                />
                <button className={styles.nameSaveBtn} onClick={handleSaveName}>Save</button>
                <button className={styles.nameCancelBtn} onClick={handleCancelName}>Cancel</button>
              </div>
            ) : (
              <div className={styles.nameRow}>
                <div className={styles.name}>{user.name}</div>
                <button className={styles.editBtn} onClick={handleEditName}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M10 1.5L12.5 4M4 10L2 12L4 10ZM1 13L3 11L1 13ZM4.5 4.5L9.5 9.5L4.5 4.5ZM11 2.5L13 4.5L11 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.5 9.5L11 8L13 10L11.5 11.5L9.5 9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}
            <div className={styles.email}>{user.email}</div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Your Resume</h2>
          <p className={styles.sectionSubtitle}>Paste your resume to enable AI tailoring and semantic matching</p>

          <div className={styles.textareaWrapper}>
            <textarea
              className={styles.textarea}
              rows={12}
              value={resume}
              onChange={(e) => setResume(e.target.value)}
            />
            <div className={styles.charCount}>{resume.length} characters</div>
          </div>

          <div className={styles.resumeFooter}>
            <div className={styles.statusIndicator}>
              {originalResume ? (
                <span className={styles.statusActive}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  AI features active
                </span>
              ) : (
                <span className={styles.statusInactive}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1V7L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  Upload resume to activate AI
                </span>
              )}
            </div>
            <Button
              variant="primary"
              onClick={handleSaveResume}
              disabled={!resumeChanged || saving}
              loading={saving}
            >
              {saveText}
            </Button>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Your Stats</h2>
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.jobs}</div>
              <div className={styles.statLabel}>Total Jobs Applied</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.quizzes}</div>
              <div className={styles.statLabel}>Quizzes Taken</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.ats}</div>
              <div className={styles.statLabel}>ATS Analyses Run</div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
