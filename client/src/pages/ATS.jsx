import { useState, useRef, useCallback, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import Button from '../components/ui/Button'
import api from '../lib/api'
import { showToast } from '../lib/toast'
import styles from './ATS.module.css'

const CIRCUMFERENCE = 2 * Math.PI * 54

function getScoreColor(score) {
  if (score < 40) return { className: styles.scoreDanger, hex: '#F87171' }
  if (score <= 70) return { className: styles.scoreWarning, hex: '#FBBF24' }
  return { className: styles.scoreSuccess, hex: '#4ADE80' }
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

  const handleSaveScore = async () => {
    try {
      await api.post(`/jobs/${jobId}/ats-score`, { score: result.score })
      showToast('Score saved to job!', 'success')
    } catch {
      showToast('Failed to save score', 'error')
    }
  }

  const renderDropZone = () => (
    <div
      className={`${styles.dropZone} ${dragActive ? styles.dropZoneActive : ''}`}
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
        <div className={styles.fileInfo}>
          <div className={styles.fileIcon}>📄</div>
          <div className={styles.fileName}>{file.name}</div>
          <div className={styles.fileSize}>{formatSize(file.size)}</div>
          <button
            className={styles.changeFile}
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
          <div className={styles.dropIcon}>📁</div>
          <div className={styles.dropText}>Drop your resume PDF here, or click to browse</div>
          <div className={styles.dropHint}>Only PDF files supported</div>
        </>
      )}
    </div>
  )

  const renderLoading = () => (
    <div className={styles.loadingContainer}>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} />
      </div>
      <div className={styles.loadingText}>Matching your resume...</div>
    </div>
  )

  const renderResults = () => {
    if (!result) return null
    const color = getScoreColor(result.score)

    return (
      <div className={styles.resultsContainer}>
        <div className={styles.scoreSection}>
          <div className={styles.gaugeWrapper}>
            <svg className={styles.gaugeSvg} viewBox="0 0 120 120">
              <circle className={styles.gaugeTrack} cx="60" cy="60" r="54" />
              <circle
                className={styles.gaugeProgress}
                cx="60"
                cy="60"
                r="54"
                stroke={color.hex}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={gaugeValue}
              />
            </svg>
            <div className={styles.gaugeCenter}>
              <div className={`${styles.gaugeScore} ${color.className}`}>{result.score}</div>
              <div className={styles.gaugeLabel}>Match Score</div>
            </div>
          </div>
        </div>

        <div className={styles.keywordsGrid}>
          <div className={styles.keywordsColumn}>
            <div className={`${styles.keywordsLabel} ${styles.labelPresent}`}>
              Present in Resume ({result.presentKeywords.length})
            </div>
            <div className={styles.chipList}>
              {result.presentKeywords.map((kw, i) => (
                <span key={i} className={`${styles.chip} ${styles.chipPresent}`}>{kw}</span>
              ))}
            </div>
          </div>
          <div className={styles.keywordsColumn}>
            <div className={`${styles.keywordsLabel} ${styles.labelMissing}`}>
              Missing Keywords ({result.missingKeywords.length})
            </div>
            <div className={styles.chipList}>
              {result.missingKeywords.map((kw, i) => (
                <span key={i} className={`${styles.chip} ${styles.chipMissing}`}>{kw}</span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.recommendationsSection}>
          <div className={styles.recommendationsTitle}>Recommendations</div>
          {result.recommendations.map((rec, i) => (
            <div key={i} className={styles.recommendationCard}>
              <div className={styles.recommendationNum}>{i + 1}</div>
              <div className={styles.recommendationText}>{rec}</div>
            </div>
          ))}
        </div>

        <div className={styles.actionsRow}>
          <Button variant="secondary" onClick={handleReset}>
            Analyse Another Resume
          </Button>
          {jobId && (
            <Button variant="ghost" onClick={handleSaveScore}>
              Save Score to Job
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <PageLayout title="ATS Resume Analyser">
      <div className={styles.container}>
        {result ? (
          <button className={styles.backLink} onClick={handleReset}>← Back</button>
        ) : (
          <Link to="/" className={styles.backLink}>← Back</Link>
        )}

        <h1 className={styles.title}>ATS Resume Analyser</h1>
        <p className={styles.subtitle}>
          Analyse how well your resume matches a job description using AI
        </p>

        {!result && (
          <div className={styles.stepsRow}>
            <div className={styles.step}>
              <span className={styles.stepNum}>1</span>
              Upload PDF
            </div>
            <span className={styles.stepArrow}>→</span>
            <div className={styles.step}>
              <span className={styles.stepNum}>2</span>
              Paste JD
            </div>
            <span className={styles.stepArrow}>→</span>
            <div className={styles.step}>
              <span className={styles.stepNum}>3</span>
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

            <label className={styles.fieldLabel}>Job Description</label>
            <textarea
              className={styles.textarea}
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
