import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import Skeleton from '../components/ui/Skeleton'
import Button from '../components/ui/Button'
import api from '../lib/api'
import { showToast } from '../lib/toast'
import styles from './Interview.module.css'

const MicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
)

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

function parseFeedback(text) {
  const scoreMatch = text.match(/SCORE:\s*(\d+)\/10/i)
  const strongMatch = text.match(/STRONG:\s*(.+?)(?=\s*IMPROVE:|$)/is)
  const improveMatch = text.match(/IMPROVE:\s*(.+)/is)
  return {
    score: scoreMatch ? parseInt(scoreMatch[1]) : null,
    strong: strongMatch ? strongMatch[1].trim() : '',
    improve: improveMatch ? improveMatch[1].trim() : '',
  }
}

function getScoreClass(score) {
  if (score === null) return ''
  if (score >= 7) return styles.scoreHigh
  if (score >= 4) return styles.scoreMid
  return styles.scoreLow
}

const Interview = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [inputText, setInputText] = useState('')
  const [questionCount, setQuestionCount] = useState(0)
  const [isStarted, setIsStarted] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const voiceSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition)

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`)
        setJob(data)
      } catch {
        showToast('Failed to load job details', 'error')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [id, navigate])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (e) => {
      const lastResult = e.results[e.results.length - 1]
      if (lastResult.isFinal) {
        const t = lastResult[0].transcript
        setInputText(prev => prev + (prev ? ' ' : '') + t)
      }
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.abort()
    }
  }, [])

  const startRecognition = () => {
    if (!recognitionRef.current) return
    setIsListening(true)
    try {
      recognitionRef.current.start()
    } catch {
      setIsListening(false)
    }
  }

  const stopRecognition = () => {
    if (!recognitionRef.current) return
    recognitionRef.current.stop()
    setIsListening(false)
  }

  const startInterview = async () => {
    if (!job) return
    setIsLoading(true)
    try {
      const { data } = await api.post('/interview/question', {
        role: job.role,
        company: job.company,
        history: [],
      })
      const msg = { id: Date.now(), role: 'ai', content: data.question }
      setMessages([msg])
      setHistory([{ role: 'assistant', content: data.question }])
      setQuestionCount(1)
      setIsStarted(true)
    } catch {
      showToast('Failed to start interview', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const sendAnswer = async () => {
    const answer = inputText.trim()
    if (!answer) return

    const userMsg = { id: Date.now(), role: 'user', content: answer }
    setMessages(prev => [...prev, userMsg])

    setIsLoading(true)
    setInputText('')

    try {
      const lastAiMsg = [...messages].reverse().find(m => m.role === 'ai')

      const evalRes = await api.post('/interview/evaluate', {
        question: lastAiMsg.content,
        answer,
        role: job.role,
      })

      const feedback = parseFeedback(evalRes.data.feedback)

      setMessages(prev => {
        const updated = [...prev]
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].role === 'ai') {
            updated[i] = { ...updated[i], feedback }
            break
          }
        }
        return updated
      })

      if (questionCount >= 10) {
        setIsComplete(true)
        return
      }

      const nextRes = await api.post('/interview/question', {
        role: job.role,
        company: job.company,
        history: [
          ...history,
          { role: 'user', content: answer },
        ],
      })

      const nextQuestion = nextRes.data.question
      const newCount = questionCount + 1
      const aiMsg = { id: Date.now() + 1, role: 'ai', content: nextQuestion }
      setMessages(prev => [...prev, aiMsg])
      setHistory(prev => [
        ...prev,
        { role: 'user', content: answer },
        { role: 'assistant', content: nextQuestion },
      ])
      setQuestionCount(newCount)

      if (newCount >= 10) {
        setIsComplete(true)
      }
    } catch {
      showToast('Failed to process answer', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isLoading && !isComplete) {
        sendAnswer()
      }
    }
  }

  if (loading) {
    return (
      <PageLayout title="Mock Interview">
        <div className={styles.container}>
          <div className={styles.leftPanel} style={{ padding: 24 }}>
            <Skeleton height={20} width="40%" style={{ marginBottom: 16 }} />
            <Skeleton height={14} width="60%" style={{ marginBottom: 24 }} />
            <Skeleton height={4} width="100%" style={{ marginBottom: 24 }} />
            <Skeleton height={120} width="100%" style={{ marginBottom: 12 }} />
            <Skeleton height={120} width="80%" />
          </div>
          <div className={styles.rightPanel}>
            <Skeleton height={100} width="100%" style={{ marginBottom: 16 }} />
            <Skeleton height={160} width="100%" />
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Mock Interview">
      <div className={styles.container}>
        <div className={styles.leftPanel}>
          <div className={styles.header}>
            <h2 className={styles.headerTitle}>Mock Interview</h2>
            <p className={styles.headerSubtitle}>
              {job.role} at {job.company}
            </p>
            <div className={styles.progressRow}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${Math.min((questionCount / 10) * 100, 100)}%` }}
                />
              </div>
              <span className={styles.progressLabel}>{questionCount} / 10</span>
            </div>
          </div>

          <div className={styles.messageList}>
            {!isStarted ? (
              <div className={styles.initialState}>
                <MicIcon />
                <h3 className={styles.initialTitle}>Ready to interview?</h3>
                <p className={styles.initialSubtitle}>
                  You are interviewing for {job.role} at {job.company}
                </p>
                <Button variant="primary" size="lg" onClick={startInterview} loading={isLoading}>
                  Start Interview
                </Button>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={msg.id} className={`${styles.messageRow} ${msg.role === 'ai' ? styles.messageRowAi : styles.messageRowUser}`}>
                    {msg.role === 'ai' && (
                      <div className={styles.avatar}>AI</div>
                    )}
                    <div className={styles.messageContent}>
                      <div className={`${styles.bubble} ${msg.role === 'ai' ? styles.bubbleAi : styles.bubbleUser}`}>
                        {msg.content}
                      </div>
                      {msg.feedback && (
                        <div className={styles.feedbackCard}>
                          <div className={styles.feedbackScore}>
                            Score:
                            <span className={`${styles.scoreBadge} ${getScoreClass(msg.feedback.score)}`}>
                              {msg.feedback.score}/10
                            </span>
                          </div>
                          {msg.feedback.strong && (
                            <div className={styles.strongSection}>
                              <div className={`${styles.sectionLabel} ${styles.labelSuccess}`}>STRONG</div>
                              {msg.feedback.strong}
                            </div>
                          )}
                          {msg.feedback.improve && (
                            <div className={styles.improveSection}>
                              <div className={`${styles.sectionLabel} ${styles.labelWarning}`}>IMPROVE</div>
                              {msg.feedback.improve}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className={`${styles.messageRow} ${styles.messageRowAi}`}>
                    <div className={styles.avatar}>AI</div>
                    <div className={`${styles.bubble} ${styles.bubbleAi} ${styles.typingBubble}`}>
                      <span className={styles.typingDot} />
                      <span className={styles.typingDot} />
                      <span className={styles.typingDot} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {isComplete ? (
            <div className={styles.completeOverlay}>
              <svg className={styles.completeIcon} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <h2 className={styles.completeTitle}>Interview Complete</h2>
              <p className={styles.completeSubtitle}>
                You have completed all {questionCount} questions. Great effort!
              </p>
              <Button variant="primary" onClick={() => navigate(`/jobs/${id}`)}>
                Back to Job Details
              </Button>
            </div>
          ) : isStarted && (
            <div className={styles.inputArea}>
              <textarea
                ref={textareaRef}
                className={styles.textarea}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer or click the mic to speak..."
                disabled={isLoading}
              />
              <div className={styles.buttonColumn}>
                {voiceSupported ? (
                  <button
                    className={`${styles.circleButton} ${styles.micButton} ${isListening ? styles.micListening : ''}`}
                    onClick={isListening ? stopRecognition : startRecognition}
                    disabled={isLoading}
                    title={isListening ? 'Stop recording' : 'Start recording'}
                  >
                    <MicIcon />
                  </button>
                ) : (
                  <span className={styles.tooltip} data-tooltip="Use Chrome or Edge for voice">
                    <button className={`${styles.circleButton} ${styles.micButton}`} disabled>
                      <MicIcon />
                    </button>
                  </span>
                )}
                <button
                  className={`${styles.circleButton} ${styles.sendButton}`}
                  onClick={sendAnswer}
                  disabled={!inputText.trim() || isLoading}
                  title="Send answer"
                >
                  <SendIcon />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.rightCard}>
            <h3 className={styles.cardTitle}>Job Details</h3>
            <div className={styles.jobField}>
              <span className={styles.fieldLabel}>Role</span>
              <span className={styles.fieldValue}>{job.role}</span>
            </div>
            <div className={styles.jobField}>
              <span className={styles.fieldLabel}>Company</span>
              <span className={styles.fieldValue}>{job.company}</span>
            </div>
            <div className={styles.jobField}>
              <span className={styles.fieldLabel}>Applied</span>
              <span className={styles.fieldValue}>
                {new Date(job.appliedAt || job.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className={styles.rightCard}>
            <h3 className={styles.cardTitle}>Interview Tips</h3>
            <ul className={styles.tipList}>
              <li className={styles.tipItem}>Use STAR method (Situation, Task, Action, Result)</li>
              <li className={styles.tipItem}>Quantify your achievements</li>
              <li className={styles.tipItem}>Think aloud for technical questions</li>
              <li className={styles.tipItem}>Ask clarifying questions if needed</li>
            </ul>
          </div>

          {isListening && (
            <div className={styles.rightCard}>
              <h3 className={styles.cardTitle}>Voice Status</h3>
              <div className={styles.voiceStatus}>
                <div className={styles.waveform}>
                  <div className={styles.waveBar} />
                  <div className={styles.waveBar} />
                  <div className={styles.waveBar} />
                  <div className={styles.waveBar} />
                  <div className={styles.waveBar} />
                </div>
                <span className={styles.listeningLabel}>Listening...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}

export default Interview
