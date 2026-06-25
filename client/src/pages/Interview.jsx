import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import Skeleton from '../components/ui/Skeleton'
import Button from '../components/ui/Button'
import api from '../lib/api'
import { showToast } from '../lib/toast'

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
  if (score >= 7) return 'bg-success-tint text-success'
  if (score >= 4) return 'bg-warning-tint text-warning'
  return 'bg-danger-tint text-danger'
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
        <div className="flex flex-col md:flex-row gap-5 p-5 md:h-[calc(100vh-64px)] min-h-[calc(100vh-64px)] bg-bg-950">
          <div className="flex-[7] flex flex-col min-w-0 bg-bg-900 border border-border rounded-xl overflow-hidden p-6">
            <Skeleton height={20} width="40%" className="mb-4" />
            <Skeleton height={14} width="60%" className="mb-6" />
            <Skeleton height={4} width="100%" className="mb-6" />
            <Skeleton height={120} width="100%" className="mb-3" />
            <Skeleton height={120} width="80%" />
          </div>
          <div className="hidden md:flex md:flex-col gap-4 overflow-y-auto min-w-[240px] flex-[3]">
            <Skeleton height={100} width="100%" className="mb-4" />
            <Skeleton height={160} width="100%" />
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Mock Interview">
      <style>{`
        @keyframes typingBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes micPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.5); }
          50% { box-shadow: 0 0 0 8px rgba(248, 113, 113, 0); }
        }
        @keyframes wave {
          0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
      <div className="flex flex-col md:flex-row gap-5 p-5 md:h-[calc(100vh-64px)] min-h-[calc(100vh-64px)] bg-bg-950">
        <div className="flex-[7] flex flex-col min-w-0 h-full bg-bg-900 border border-border rounded-xl overflow-hidden">
          <div className="shrink-0 px-5 py-4 pb-3 border-b border-border">
            <h2 className="text-base font-bold text-text-100 m-0 mb-0.5">Mock Interview</h2>
            <p className="text-sm text-text-300 m-0 mb-3">
              {job.role} at {job.company}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1 bg-bg-700 rounded overflow-hidden">
                <div
                  className="h-full bg-accent rounded transition-all duration-300"
                  style={{ width: `${Math.min((questionCount / 10) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs text-text-400 shrink-0">{questionCount} / 10</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-4">
            {!isStarted ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 gap-3">
                <MicIcon />
                <h3 className="text-xl font-bold text-text-100 m-0">Ready to interview?</h3>
                <p className="text-sm text-text-300 m-0 mb-2">
                  You are interviewing for {job.role} at {job.company}
                </p>
                <Button variant="primary" size="lg" onClick={startInterview} loading={isLoading}>
                  Start Interview
                </Button>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={msg.id} className={`flex gap-2.5 max-w-[85%] md:max-w-[95%] ${msg.role === 'ai' ? 'self-start' : 'self-end'}`}>
                    {msg.role === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-accent-dark flex items-center justify-center text-[11px] font-bold text-text-100 shrink-0 mt-1">AI</div>
                    )}
                    <div className="flex flex-col gap-1">
                      <div className={`text-sm leading-relaxed px-4 py-3 ${msg.role === 'ai' ? 'bg-bg-700 border border-border rounded-lg rounded-bl text-text-200' : 'bg-accent-tint border border-border-bright rounded-lg rounded-br text-text-100'}`}>
                        {msg.content}
                      </div>
                      {msg.feedback && (
                        <div className="bg-bg-800 border border-border rounded-lg px-4 py-3 mt-2 text-xs leading-relaxed">
                          <div className="flex items-center gap-2 mb-2 font-semibold text-text-200">
                            Score:
                            <span className={`inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-sm text-xs font-bold ${getScoreClass(msg.feedback.score)}`}>
                              {msg.feedback.score}/10
                            </span>
                          </div>
                          {msg.feedback.strong && (
                            <div className="border-l-[3px] border-l-success pl-2.5 mb-1.5 text-text-200">
                              <div className="text-[11px] font-bold uppercase tracking-[0.5px] mb-0.5 text-success">STRONG</div>
                              {msg.feedback.strong}
                            </div>
                          )}
                          {msg.feedback.improve && (
                            <div className="border-l-[3px] border-l-warning pl-2.5 text-text-200">
                              <div className="text-[11px] font-bold uppercase tracking-[0.5px] mb-0.5 text-warning">IMPROVE</div>
                              {msg.feedback.improve}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2.5 max-w-[85%] md:max-w-[95%] self-start">
                    <div className="w-8 h-8 rounded-full bg-accent-dark flex items-center justify-center text-[11px] font-bold text-text-100 shrink-0 mt-1">AI</div>
                    <div className="flex items-center gap-1 px-5 py-4 bg-bg-700 border border-border rounded-lg rounded-bl text-text-200 text-sm leading-relaxed">
                      <span className="w-2 h-2 bg-text-400 rounded-full" style={{ animation: 'typingBounce 1.4s ease-in-out infinite' }} />
                      <span className="w-2 h-2 bg-text-400 rounded-full" style={{ animation: 'typingBounce 1.4s ease-in-out infinite', animationDelay: '0.2s' }} />
                      <span className="w-2 h-2 bg-text-400 rounded-full" style={{ animation: 'typingBounce 1.4s ease-in-out infinite', animationDelay: '0.4s' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {isComplete ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 gap-4">
              <svg className="w-16 h-16 text-success" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <h2 className="text-2xl font-bold text-text-100 m-0">Interview Complete</h2>
              <p className="text-sm text-text-300 m-0">
                You have completed all {questionCount} questions. Great effort!
              </p>
              <Button variant="primary" onClick={() => navigate(`/jobs/${id}`)}>
                Back to Job Details
              </Button>
            </div>
          ) : isStarted && (
            <div className="shrink-0 border-t border-border p-4 bg-bg-900 flex gap-2.5 items-end">
              <textarea
                ref={textareaRef}
                className="flex-1 min-h-[80px] bg-bg-700 border border-border rounded-lg px-3.5 py-2.5 text-sm leading-relaxed text-text-100 resize-none outline-none font-inherit focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-glow)] placeholder:text-text-400"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer or click the mic to speak..."
                disabled={isLoading}
              />
              <div className="flex flex-col gap-2 shrink-0">
                {voiceSupported ? (
                  <button
                    className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${isListening ? 'bg-danger text-white border-danger' : 'border border-border bg-transparent text-text-300 hover:border-border-bright hover:text-text-200'}`}
                    style={isListening ? { animation: 'micPulse 1.5s ease-in-out infinite' } : {}}
                    onClick={isListening ? stopRecognition : startRecognition}
                    disabled={isLoading}
                    title={isListening ? 'Stop recording' : 'Start recording'}
                  >
                    <MicIcon />
                  </button>
                ) : (
                  <span className="relative group">
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-bg-700 text-text-200 text-[11px] px-2 py-1 rounded-sm whitespace-nowrap border border-border pointer-events-none z-10">
                      Use Chrome or Edge for voice
                    </div>
                    <button className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-border bg-transparent text-text-300 opacity-40 cursor-not-allowed" disabled>
                      <MicIcon />
                    </button>
                  </span>
                )}
                <button
                  className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shrink-0 border-none bg-accent text-white hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed"
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

        <div className="hidden md:flex md:flex-col gap-4 overflow-y-auto min-w-[240px] flex-[3]">
          <div className="bg-bg-900 border border-border rounded-lg p-4">
            <h3 className="text-sm font-bold text-text-100 m-0 mb-3">Job Details</h3>
            <div className="flex flex-col gap-0.5 mb-2.5">
              <span className="text-xs text-text-400 uppercase tracking-[0.5px]">Role</span>
              <span className="text-sm text-text-200 font-medium">{job.role}</span>
            </div>
            <div className="flex flex-col gap-0.5 mb-2.5">
              <span className="text-xs text-text-400 uppercase tracking-[0.5px]">Company</span>
              <span className="text-sm text-text-200 font-medium">{job.company}</span>
            </div>
            <div className="flex flex-col gap-0.5 mb-2.5">
              <span className="text-xs text-text-400 uppercase tracking-[0.5px]">Applied</span>
              <span className="text-sm text-text-200 font-medium">
                {new Date(job.appliedAt || job.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="bg-bg-900 border border-border rounded-lg p-4">
            <h3 className="text-sm font-bold text-text-100 m-0 mb-3">Interview Tips</h3>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
              <li className="text-xs text-text-300 leading-relaxed pl-4 relative before:content-['\u2022'] before:absolute before:left-0 before:text-accent before:font-bold">
                Use STAR method (Situation, Task, Action, Result)
              </li>
              <li className="text-xs text-text-300 leading-relaxed pl-4 relative before:content-['\u2022'] before:absolute before:left-0 before:text-accent before:font-bold">
                Quantify your achievements
              </li>
              <li className="text-xs text-text-300 leading-relaxed pl-4 relative before:content-['\u2022'] before:absolute before:left-0 before:text-accent before:font-bold">
                Think aloud for technical questions
              </li>
              <li className="text-xs text-text-300 leading-relaxed pl-4 relative before:content-['\u2022'] before:absolute before:left-0 before:text-accent before:font-bold">
                Ask clarifying questions if needed
              </li>
            </ul>
          </div>

          {isListening && (
            <div className="bg-bg-900 border border-border rounded-lg p-4">
              <h3 className="text-sm font-bold text-text-100 m-0 mb-3">Voice Status</h3>
              <div className="flex items-center gap-2.5 pt-3">
                <div className="flex items-center gap-0.5 h-5">
                  <div className="w-0.5 bg-danger rounded" style={{ height: '8px', animation: 'wave 0.8s ease-in-out infinite' }} />
                  <div className="w-0.5 bg-danger rounded" style={{ height: '14px', animation: 'wave 0.8s ease-in-out infinite', animationDelay: '0.1s' }} />
                  <div className="w-0.5 bg-danger rounded" style={{ height: '10px', animation: 'wave 0.8s ease-in-out infinite', animationDelay: '0.2s' }} />
                  <div className="w-0.5 bg-danger rounded" style={{ height: '18px', animation: 'wave 0.8s ease-in-out infinite', animationDelay: '0.3s' }} />
                  <div className="w-0.5 bg-danger rounded" style={{ height: '12px', animation: 'wave 0.8s ease-in-out infinite', animationDelay: '0.4s' }} />
                </div>
                <span className="text-xs text-danger font-medium">Listening...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}

export default Interview
