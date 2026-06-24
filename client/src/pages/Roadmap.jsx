import { useState } from 'react'
import PageLayout from '../components/layout/PageLayout'
import Button from '../components/ui/Button'
import api from '../lib/api'
import { showToast } from '../lib/toast'

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
    <div className="flex flex-col items-center text-center py-12">
      <svg className="w-40 h-28 mb-6" viewBox="0 0 200 140" fill="none">
        <path d="M20 120 L100 60 L180 120" stroke="var(--accent)" strokeWidth="2" fill="none" opacity="0.3" />
        <path d="M40 100 L100 50 L160 100" stroke="var(--accent)" strokeWidth="1.5" fill="none" opacity="0.2" />
        <line x1="20" y1="110" x2="180" y2="110" stroke="var(--accent)" strokeWidth="2" strokeDasharray="6 4" />
        <circle cx="100" cy="110" r="6" fill="var(--accent)" />
        <rect x="30" y="30" width="30" height="20" rx="4" fill="var(--accent-tint)" stroke="var(--accent)" strokeWidth="1" />
        <rect x="140" y="25" width="35" height="18" rx="4" fill="var(--accent-tint)" stroke="var(--accent)" strokeWidth="1" />
        <rect x="85" y="15" width="30" height="15" rx="3" fill="var(--accent-tint)" stroke="var(--accent)" strokeWidth="1" />
      </svg>
      <h1 className="text-3xl font-bold text-text-100 mb-3">Your Career Roadmap</h1>
      <p className="text-text-300 text-base max-w-[440px] leading-relaxed mb-7">
        Based on your job applications, we will identify skill gaps and build a personalised step-by-step learning plan.
      </p>
      <Button variant="primary" size="lg" onClick={handleGenerate}>
        Generate My Roadmap
      </Button>
    </div>
  )

  const renderLoading = () => (
    <div className="flex justify-center py-12">
      <div className="flex flex-col gap-4 min-w-[320px]">
        <div className="flex items-center gap-3.5">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition ${activeStep > 1 ? 'border-2 border-success bg-success-tint' : activeStep >= 1 ? 'border-2 border-accent bg-accent-tint' : 'bg-bg-700'}`}>
            {activeStep > 1 ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 8L7 11L12 5" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : activeStep === 1 ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-bg-600" />
            )}
          </div>
          <span className={`text-[15px] transition ${activeStep === 1 ? 'text-text-100 font-bold' : activeStep > 1 ? 'text-text-300' : 'text-text-400'}`}>
            Analysing your job applications
          </span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition ${activeStep > 2 ? 'border-2 border-success bg-success-tint' : activeStep >= 2 ? 'border-2 border-accent bg-accent-tint' : 'bg-bg-700'}`}>
            {activeStep > 2 ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 8L7 11L12 5" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : activeStep === 2 ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-bg-600" />
            )}
          </div>
          <span className={`text-[15px] transition ${activeStep === 2 ? 'text-text-100 font-bold' : activeStep > 2 ? 'text-text-300' : 'text-text-400'}`}>
            Identifying skill gaps
          </span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition ${activeStep > 3 ? 'border-2 border-success bg-success-tint' : activeStep >= 3 ? 'border-2 border-accent bg-accent-tint' : 'bg-bg-700'}`}>
            {activeStep === 3 ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-bg-600" />
            )}
          </div>
          <span className={`text-[15px] transition ${activeStep === 3 ? 'text-text-100 font-bold' : activeStep > 3 ? 'text-text-300' : 'text-text-400'}`}>
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
      <div style={{ animation: 'roadmapFadeInUp 0.3s ease-out' }}>
        <style>{`@keyframes roadmapFadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        <h1 className="text-3xl font-bold text-text-100 mb-3">Your Career Roadmap</h1>

        <div className="mb-8">
          <div className="text-text-300 text-xs uppercase tracking-wider mb-2.5">Skill Gaps Identified</div>
          <div className="flex flex-wrap gap-2">
            {skillGaps?.map((gap, i) => (
              <span key={i} className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium bg-accent-tint border border-accent text-accent">{gap}</span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
          {roadmap?.map((item) => (
            <div key={item.step} className="relative pl-[52px] mb-5">
              <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-accent text-text-100 text-base font-bold flex items-center justify-center border-3 border-bg-800 z-1">{item.step}</div>
              <div className="bg-bg-800 border border-border rounded-lg p-5 transition hover:border-border-bright">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-lg font-bold text-text-100">{item.skill}</div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-tint text-warning whitespace-nowrap">{item.weeks} weeks</span>
                </div>
                <p className="text-text-300 text-sm mt-2 leading-relaxed">{item.why}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-text-400 text-xs">Learn:</span>
                  <a href={item.resource} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent text-xs font-medium no-underline hover:underline">
                    {item.resource.replace(/^https?:\/\//, '').split('/')[0]}
                    <svg className="shrink-0" width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 9L9 3M9 3H5M9 3V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button variant="secondary" onClick={handleGenerate}>Regenerate Roadmap</Button>
        </div>
      </div>
    )
  }

  return (
    <PageLayout title="Career Roadmap">
      <div className="max-w-[720px] mx-auto p-8">
        {state === 'empty' && renderEmpty()}
        {state === 'loading' && renderLoading()}
        {state === 'display' && renderDisplay()}
      </div>
    </PageLayout>
  )
}
