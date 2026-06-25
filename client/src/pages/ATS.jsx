import { useState, useRef, useCallback, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import Button from '../components/ui/Button'
import api from '../lib/api'
import { showToast } from '../lib/toast'

const CIRCUMFERENCE = 2 * Math.PI * 54

function getScoreColor(score) {
  if (score < 40) return { className: 'text-danger', hex: '#F87171' }
  if (score <= 70) return { className: 'text-warning', hex: '#FBBF24' }
  return { className: 'text-success', hex: '#4ADE80' }
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const ATS = () => {
  const [searchParams] = useSearchParams()
  const jobId = searchParams.get('jobId')

  const [file, setFile] = useState(null)
  const [jobDesc, setJobDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [gaugeValue, setGaugeValue] = useState(CIRCUMFERENCE)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!result) return
    const timeout = setTimeout(() => {
      setGaugeValue(CIRCUMFERENCE - (CIRCUMFERENCE * result.score) / 100)
    }, 50)
    return () => clearTimeout(timeout)
  }, [result])

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragOut = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const dropped = e.dataTransfer.files?.[0]
    if (dropped && dropped.type === 'application/pdf') {
      setFile(dropped)
    } else {
      showToast('Please upload a PDF file', 'error')
    }
  }, [])

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0]
    if (selected && selected.type === 'application/pdf') {
      setFile(selected)
    } else if (selected) {
      showToast('Please upload a PDF file', 'error')
    }
  }

  const handleAnalyse = async () => {
    if (!file || !jobDesc.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('jobDesc', jobDesc.trim())
      if (jobId) formData.append('jobId', jobId)

      const { data } = await api.post('/ats/analyse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setResult(data)
    } catch (err) {
      const message = err.response?.data?.error || 'Analysis failed. Please try again.'
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setFile(null)
    setJobDesc('')
    setGaugeValue(CIRCUMFERENCE)
  }

  const renderDropZone = () => (
    <div
      className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer mb-6 transition-all ${dragActive ? 'border-accent bg-accent-tint' : 'border-border-bright bg-bg-800 hover:border-accent hover:bg-accent-tint'}`}
      onClick={() => inputRef.current?.click()}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {file ? (
        <div className="flex flex-col items-center gap-1">
          <div className="text-[28px] mb-1">📄</div>
          <div className="text-text-100 text-sm">{file.name}</div>
          <div className="text-text-400 text-xs">{formatSize(file.size)}</div>
          <button
            className="text-accent text-xs mt-2 cursor-pointer bg-none"
            onClick={(e) => {
              e.stopPropagation()
              setFile(null)
              if (inputRef.current) inputRef.current.value = ''
            }}
          >
            Change file
          </button>
        </div>
      ) : (
        <>
          <div className="text-[36px] mb-3">📁</div>
          <div className="text-text-200 text-sm">Drop your resume PDF here, or click to browse</div>
          <div className="text-text-400 text-xs mt-1">Only PDF files supported</div>
        </>
      )}
    </div>
  )

  const renderLoading = () => (
    <div className="flex flex-col items-center py-12 gap-4">
      <div className="w-full h-1.5 bg-bg-700 rounded overflow-hidden">
        <div className="h-full bg-accent rounded w-[40%]" style={{ animation: 'progressAnim 1.8s ease-in-out infinite' }} />
      </div>
      <div className="text-text-300 text-sm">Matching your resume...</div>
    </div>
  )

  const renderResults = () => {
    if (!result) return null
    const color = getScoreColor(result.score)

    return (
      <div style={{ animation: 'fadeInUp 0.3s ease-out' }}>
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-[140px] h-[140px]">
            <svg className="w-[140px] h-[140px] -rotate-90" viewBox="0 0 120 120">
              <circle className="fill-none stroke-bg-700" strokeWidth="10" cx="60" cy="60" r="54" />
              <circle
                className="fill-none"
                strokeWidth="10"
                strokeLinecap="round"
                cx="60"
                cy="60"
                r="54"
                stroke={color.hex}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={gaugeValue}
                style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className={`text-[32px] font-bold ${color.className}`}>{result.score}</div>
              <div className="text-xs text-text-400">Match Score</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-2">
            <div className="text-xs font-medium text-success">
              Present in Resume ({result.presentKeywords.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.presentKeywords.map((kw, i) => (
                <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success-tint border border-success text-success">{kw}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-xs font-medium text-danger">
              Missing Keywords ({result.missingKeywords.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.missingKeywords.map((kw, i) => (
                <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-danger-tint border border-danger text-danger">{kw}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-base font-semibold text-text-100 mb-3">Recommendations</div>
          {result.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3 bg-bg-800 border-l-[3px] border-l-accent rounded-sm px-4 py-3.5 mb-2">
              <div className="w-[22px] h-[22px] rounded-full bg-accent-tint text-accent text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
              <div className="text-text-200 text-sm leading-relaxed">{rec}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button variant="secondary" onClick={handleReset}>
            Analyse Another Resume
          </Button>
          {jobId && (
            <Button variant="ghost" onClick={handleReset}>
              New Analysis
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <PageLayout title="ATS Resume Analyser">
      <style>{`
        @keyframes progressAnim {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="max-w-[740px] mx-auto p-8">
        {result ? (
          <button className="inline-flex items-center gap-1 text-text-300 text-sm mb-6 cursor-pointer bg-none hover:text-accent" onClick={handleReset}>← Back</button>
        ) : (
          <Link to="/board" className="inline-flex items-center gap-1 text-text-300 text-sm mb-6 cursor-pointer bg-none hover:text-accent">← Back</Link>
        )}

        <h1 className="text-[28px] font-bold text-text-100">ATS Resume Analyser</h1>
        <p className="text-text-300 text-sm mt-1 mb-6">
          Analyse how well your resume matches a job description using AI
        </p>

        {!result && (
          <div className="flex gap-2 items-center mb-8 flex-wrap">
            <div className="flex items-center gap-1.5 bg-bg-700 rounded-lg px-3 py-1.5 text-xs text-text-200">
              <span className="w-5 h-5 rounded-full bg-accent-tint text-accent text-[11px] font-bold flex items-center justify-center">1</span>
              Upload PDF
            </div>
            <span className="text-text-400 text-sm">→</span>
            <div className="flex items-center gap-1.5 bg-bg-700 rounded-lg px-3 py-1.5 text-xs text-text-200">
              <span className="w-5 h-5 rounded-full bg-accent-tint text-accent text-[11px] font-bold flex items-center justify-center">2</span>
              Paste JD
            </div>
            <span className="text-text-400 text-sm">→</span>
            <div className="flex items-center gap-1.5 bg-bg-700 rounded-lg px-3 py-1.5 text-xs text-text-200">
              <span className="w-5 h-5 rounded-full bg-accent-tint text-accent text-[11px] font-bold flex items-center justify-center">3</span>
              Get Score
            </div>
          </div>
        )}

        {loading ? (
          renderLoading()
        ) : result ? (
          renderResults()
        ) : (
          <>
            {renderDropZone()}

            <label className="block text-text-200 text-sm font-medium mb-2">Job Description</label>
            <textarea
              className="w-full min-h-[140px] resize-y mb-6 bg-bg-800 border border-border rounded-lg p-3 text-text-200 text-sm focus:border-accent focus:outline-none placeholder:text-text-400"
              rows={6}
              placeholder="Paste the full job description..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            />

            <Button
              variant="primary"
              fullWidth
              disabled={!file || !jobDesc.trim()}
              onClick={handleAnalyse}
            >
              Analyse Resume
            </Button>
          </>
        )}
      </div>
    </PageLayout>
  )
}

export default ATS
