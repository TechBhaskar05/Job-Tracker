import { useState } from 'react'
import PageLayout from '../components/layout/PageLayout'
import Button from '../components/ui/Button'
import api from '../lib/api'
import { showToast } from '../lib/toast'
import styles from './Roadmap.module.css'

export default function Roadmap() {
  const [state, setState] = useState('empty')
  const [roadmapData, setRoadmapData] = useState(null)
  const [activeStep, setActiveStep] = useState(0)

  const handleGenerate = async () => {
    setState('loading')
    setActiveStep(0)

    const t1 = setTimeout(() => setActiveStep(1), 100)
    const t2 = setTimeout(() => setActiveStep(2), 4000)
    const t3 = setTimeout(() => setActiveStep(3), 9000)

    try {
      const { data } = await api.post('/roadmap/generate', {}, { timeout: 90000 })
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      setRoadmapData(data)
      setState('display')
    } catch (err) {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      showToast(err.response?.data?.error || 'Failed to generate roadmap', 'error')
      setState('empty')
    }
  }

  const renderEmpty = () => (
    <div className={styles.emptyState}>
      <svg className={styles.illustration} viewBox="0 0 200 140" fill="none">
        <path d="M20 120 L100 60 L180 120" stroke="var(--accent)" strokeWidth="2" fill="none" opacity="0.3" />
        <path d="M40 100 L100 50 L160 100" stroke="var(--accent)" strokeWidth="1.5" fill="none" opacity="0.2" />
        <line x1="20" y1="110" x2="180" y2="110" stroke="var(--accent)" strokeWidth="2" strokeDasharray="6 4" />
        <circle cx="100" cy="110" r="6" fill="var(--accent)" />
        <rect x="30" y="30" width="30" height="20" rx="4" fill="var(--accent-tint)" stroke="var(--accent)" strokeWidth="1" />
        <rect x="140" y="25" width="35" height="18" rx="4" fill="var(--accent-tint)" stroke="var(--accent)" strokeWidth="1" />
        <rect x="85" y="15" width="30" height="15" rx="3" fill="var(--accent-tint)" stroke="var(--accent)" strokeWidth="1" />
      </svg>
      <h1 className={styles.title}>Your Career Roadmap</h1>
      <p className={styles.subtitle}>
        Based on your job applications, we will identify skill gaps and build a personalised step-by-step learning plan.
      </p>
      <Button variant="primary" size="lg" onClick={handleGenerate}>
        Generate My Roadmap
      </Button>
    </div>
  )

  const renderLoading = () => (
    <div className={styles.loadingContainer}>
      <div className={styles.stepper}>
        <div className={`${styles.step} ${activeStep >= 1 ? styles.stepActive : ''} ${activeStep > 1 ? styles.stepDone : ''}`}>
          <div className={styles.stepDot}>
            {activeStep > 1 ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 8L7 11L12 5" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : activeStep === 1 ? (
              <div className={styles.spinnerDot} />
            ) : (
              <div className={styles.stepEmpty} />
            )}
          </div>
          <span className={`${styles.stepLabel} ${activeStep === 1 ? styles.stepLabelActive : ''} ${activeStep > 1 ? styles.stepLabelDone : ''}`}>
            Analysing your job applications
          </span>
        </div>
        <div className={`${styles.step} ${activeStep >= 2 ? styles.stepActive : ''} ${activeStep > 2 ? styles.stepDone : ''}`}>
          <div className={styles.stepDot}>
            {activeStep > 2 ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 8L7 11L12 5" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : activeStep === 2 ? (
              <div className={styles.spinnerDot} />
            ) : (
              <div className={styles.stepEmpty} />
            )}
          </div>
          <span className={`${styles.stepLabel} ${activeStep === 2 ? styles.stepLabelActive : ''} ${activeStep > 2 ? styles.stepLabelDone : ''}`}>
            Identifying skill gaps
          </span>
        </div>
        <div className={`${styles.step} ${activeStep >= 3 ? styles.stepActive : ''}`}>
          <div className={styles.stepDot}>
            {activeStep === 3 ? (
              <div className={styles.spinnerDot} />
            ) : (
              <div className={styles.stepEmpty} />
            )}
          </div>
          <span className={`${styles.stepLabel} ${activeStep === 3 ? styles.stepLabelActive : ''} ${activeStep > 3 ? styles.stepLabelDone : ''}`}>
            Building your learning plan
          </span>
        </div>
      </div>
    </div>
  )

  const renderDisplay = () => {
    if (!roadmapData) return null
    const { skillGaps, roadmap } = roadmapData

    return (
      <div className={styles.displayContainer}>
        <h1 className={styles.title}>Your Career Roadmap</h1>

        <div className={styles.skillGapsSection}>
          <div className={styles.skillGapsLabel}>Skill Gaps Identified</div>
          <div className={styles.skillGapsRow}>
            {skillGaps?.map((gap, i) => (
              <span key={i} className={styles.skillChip}>{gap}</span>
            ))}
          </div>
        </div>

        <div className={styles.timeline}>
          <div className={styles.timelineLine} />
          {roadmap?.map((item) => (
            <div key={item.step} className={styles.timelineCard}>
              <div className={styles.stepCircle}>{item.step}</div>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardSkill}>{item.skill}</div>
                  <span className={styles.weeksBadge}>{item.weeks} weeks</span>
                </div>
                <p className={styles.cardWhy}>{item.why}</p>
                <div className={styles.cardResource}>
                  <span className={styles.resourceLabel}>Learn:</span>
                  <a href={item.resource} target="_blank" rel="noopener noreferrer" className={styles.resourceLink}>
                    {item.resource.replace(/^https?:\/\//, '').split('/')[0]}
                    <svg className={styles.externalIcon} width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 9L9 3M9 3H5M9 3V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.regenerateRow}>
          <Button variant="secondary" onClick={handleGenerate}>Regenerate Roadmap</Button>
        </div>
      </div>
    )
  }

  return (
    <PageLayout title="Career Roadmap">
      <div className={styles.container}>
        {state === 'empty' && renderEmpty()}
        {state === 'loading' && renderLoading()}
        {state === 'display' && renderDisplay()}
      </div>
    </PageLayout>
  )
}
