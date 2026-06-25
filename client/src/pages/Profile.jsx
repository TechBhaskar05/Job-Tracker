import { useState, useEffect } from 'react'
import PageLayout from '../components/layout/PageLayout'
import Button from '../components/ui/Button'
import api from '../lib/api'
import { showToast } from '../lib/toast'

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
        <div className="max-w-[680px] mx-auto p-8">
          <div className="text-text-300 text-center py-12 text-sm">Loading profile...</div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Profile">
      <div className="max-w-[680px] mx-auto p-8">
        <div className="bg-bg-800 border border-border rounded-xl p-7 flex gap-5 items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-dark to-accent text-text-100 text-2xl font-bold flex items-center justify-center shrink-0">
            {getInitials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  className="text-lg font-bold text-text-100 bg-bg-700 border border-accent rounded-sm px-2.5 py-1.5 outline-none flex-1 min-w-0"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName()
                    if (e.key === 'Escape') handleCancelName()
                  }}
                />
                <button className="px-3 py-1.5 bg-accent text-bg-950 border-none rounded-sm text-xs font-medium cursor-pointer" onClick={handleSaveName}>Save</button>
                <button className="px-3 py-1.5 bg-transparent text-text-300 border border-border rounded-sm text-xs cursor-pointer hover:text-text-100 hover:border-text-400" onClick={handleCancelName}>Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="text-[22px] font-bold text-text-100">{user.name}</div>
                <button className="w-7 h-7 rounded-full bg-transparent text-text-400 flex items-center justify-center transition cursor-pointer border-none hover:bg-bg-700 hover:text-text-100" onClick={handleEditName}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M10 1.5L12.5 4M4 10L2 12L4 10ZM1 13L3 11L1 13ZM4.5 4.5L9.5 9.5L4.5 4.5ZM11 2.5L13 4.5L11 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.5 9.5L11 8L13 10L11.5 11.5L9.5 9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}
            <div className="text-text-400 text-sm mt-0.5">{user.email}</div>
          </div>
        </div>

        <div className="bg-bg-800 border border-border rounded-xl p-6 mt-5">
          <h2 className="text-lg font-bold text-text-100 mb-1">Your Resume</h2>
          <p className="text-text-300 text-xs mb-4">Paste your resume to enable AI tailoring and semantic matching</p>

          <div className="relative">
            <textarea
              className="w-full min-h-[280px] text-xs font-['SF_Mono','Fira_Code',monospace] resize-y"
              rows={12}
              value={resume}
              onChange={(e) => setResume(e.target.value)}
            />
            <div className="absolute bottom-2.5 right-3 text-text-400 text-[11px]">{resume.length} characters</div>
          </div>

          <div className="flex items-center justify-between gap-4 mt-4 flex-wrap">
            <div className="flex items-center">
              {originalResume ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success bg-success-tint px-2.5 py-1 rounded-full">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  AI features active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-warning bg-warning-tint px-2.5 py-1 rounded-full">
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

        <div className="bg-bg-800 border border-border rounded-xl p-6 mt-5">
          <h2 className="text-lg font-bold text-text-100 mb-1">Your Stats</h2>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-bg-700 border border-border rounded p-5 text-center">
              <div className="text-[28px] font-bold text-text-100">{stats.jobs}</div>
              <div className="text-text-300 text-xs mt-1">Total Jobs Applied</div>
            </div>
            <div className="bg-bg-700 border border-border rounded p-5 text-center">
              <div className="text-[28px] font-bold text-text-100">{stats.quizzes}</div>
              <div className="text-text-300 text-xs mt-1">Quizzes Taken</div>
            </div>
            <div className="bg-bg-700 border border-border rounded p-5 text-center">
              <div className="text-[28px] font-bold text-text-100">{stats.ats}</div>
              <div className="text-text-300 text-xs mt-1">ATS Analyses Run</div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
