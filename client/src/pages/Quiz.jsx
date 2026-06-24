import { useState, useEffect } from 'react'
import PageLayout from '../components/layout/PageLayout'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
import api from '../lib/api'
import { showToast } from '../lib/toast'

const OPTION_LABELS = ['A', 'B', 'C', 'D']
const TOTAL_QUESTIONS = 5

function getScoreBadgeClass(score, total) {
  const pct = (score / total) * 100
  if (pct < 40) return 'bg-danger-tint text-danger'
  if (pct <= 70) return 'bg-warning-tint text-warning'
  return 'bg-success-tint text-success'
}

function getMotivation(score) {
  if (score < 3) return 'Keep practising!'
  if (score <= 4) return 'Good effort!'
  return 'Perfect score!'
}

const Quiz = () => {
  const [activeTab, setActiveTab] = useState('generate')
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [cannotChange, setCannotChange] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [history, setHistory] = useState(null)
  const [resultSaved, setResultSaved] = useState(false)

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/quiz/history')
      setHistory(data.history || [])
    } catch {
      showToast('Failed to load history', 'error')
    }
  }

  useEffect(() => {
    if (activeTab !== 'history') return
    fetchHistory()
  }, [activeTab])

  const handleGenerate = async () => {
    if (!topic.trim()) return

    setLoading(true)
    setQuestions(null)
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setCannotChange(false)
    setShowResults(false)
    setScore(0)
    setResultSaved(false)

    try {
      const { data } = await api.post('/quiz/generate', { topic: topic.trim() })
      setQuestions(data.questions)
    } catch {
      showToast('Failed to generate quiz', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAnswer = (optionIndex) => {
    if (cannotChange) return
    setSelectedAnswer(optionIndex)
    setCannotChange(true)

    if (optionIndex === questions[currentIndex].answer) {
      setScore((prev) => prev + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < TOTAL_QUESTIONS - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setCannotChange(false)
    } else {
      setShowResults(true)
    }
  }

  const handleSaveResult = async () => {
    try {
      await api.post('/quiz/save', {
        topic: topic.trim(),
        score,
        total: TOTAL_QUESTIONS,
      })
      setResultSaved(true)
      showToast('Result saved!', 'success')
    } catch {
      showToast('Failed to save result', 'error')
    }
  }

  const handleTryAnother = () => {
    setQuestions(null)
    setTopic('')
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setCannotChange(false)
    setShowResults(false)
    setScore(0)
    setResultSaved(false)
    setActiveTab('generate')
  }

  const getOptionClass = (qIndex, optIndex) => {
    if (selectedAnswer === null) return 'cursor-pointer'

    const isCorrect = optIndex === qIndex.answer
    const isSelected = optIndex === selectedAnswer

    if (isSelected && isCorrect) return 'bg-success-tint! border-success! text-success!'
    if (isSelected && !isCorrect) return 'bg-danger-tint! border-danger! text-danger!'
    if (isCorrect) return 'bg-success-tint! border-success! text-success!'
    return 'opacity-40! cursor-not-allowed!'
  }

  const renderHome = () => (
    <>
      <h1 className="text-2xl font-bold text-text-100">AI Quiz Generator</h1>
      <p className="text-text-300 text-sm mt-1 mb-6">Test your knowledge on any topic</p>

      <input
        className="w-full mb-4"
        placeholder="Enter topic (e.g. React Hooks, SQL Joins, System Design)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleGenerate()
        }}
      />

      <Button
        variant="primary"
        fullWidth
        disabled={!topic.trim() || loading}
        onClick={handleGenerate}
        loading={loading}
      >
        {loading ? 'Generating...' : 'Generate Quiz'}
      </Button>
    </>
  )

  const renderSkeleton = () => (
    <div className="flex flex-col gap-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} height="60px" borderRadius="8px" />
      ))}
    </div>
  )

  const renderQuiz = () => {
    if (!questions || questions.length === 0) return null
    const question = questions[currentIndex]

    return (
      <>
        <div className="mb-6">
          <div className="text-xs text-text-300 mb-2">
            Question {currentIndex + 1} of {TOTAL_QUESTIONS}
          </div>
          <div className="w-full h-1 bg-bg-700 rounded-sm overflow-hidden">
            <div
              className="h-full bg-accent rounded-sm transition-[width] duration-300"
              style={{ width: `${((currentIndex + 1) / TOTAL_QUESTIONS) * 100}%` }}
            />
          </div>
        </div>

        <div className="text-xl font-bold text-text-100 py-6 leading-relaxed">{question.question}</div>

        <div className="flex flex-col gap-2.5 mb-6">
          {question.options.map((option, optIndex) => (
            <button
              key={optIndex}
              className={`w-full text-left px-4 py-3.5 rounded text-sm text-text-200 bg-transparent border border-border flex items-center gap-2 transition hover:enabled:bg-bg-700 hover:enabled:border-border-bright ${getOptionClass(question, optIndex)}`}
              onClick={() => handleSelectAnswer(optIndex)}
              disabled={cannotChange}
            >
              <span className="w-6 h-6 rounded-full border border-border-bright flex items-center justify-center text-xs font-semibold shrink-0">{OPTION_LABELS[optIndex]}</span>
              <span>{option}</span>
              {selectedAnswer !== null && optIndex === question.answer && (
                <span className="ml-auto text-base">✓</span>
              )}
              {selectedAnswer !== null && optIndex === selectedAnswer && optIndex !== question.answer && (
                <span className="ml-auto text-base">✕</span>
              )}
            </button>
          ))}
        </div>

        {selectedAnswer !== null && (
          <Button variant="primary" fullWidth onClick={handleNext}>
            {currentIndex < TOTAL_QUESTIONS - 1 ? 'Next Question' : 'See Results'}
          </Button>
        )}
      </>
    )
  }

  const renderResults = () => (
    <div className="text-center py-8">
      <div className="text-5xl font-bold text-accent">{score} / {TOTAL_QUESTIONS}</div>
      <div className="text-text-400 text-sm mt-1 mb-2">Your Score</div>
      <div className="text-text-300 text-base mb-8">{getMotivation(score)}</div>

      <div className="flex flex-col gap-2 mb-6 text-left">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-bg-800 border border-border rounded-lg overflow-hidden">
            <button
              className="w-full px-4 py-3.5 bg-transparent text-text-200 text-sm text-left flex justify-between items-center cursor-pointer hover:bg-bg-700"
              onClick={(e) => {
                const body = e.currentTarget.nextElementSibling
                if (body) {
                  const isHidden = body.style.display === 'none'
                  body.style.display = isHidden ? 'block' : 'none'
                }
                const arrow = e.currentTarget.lastElementChild
                if (arrow) arrow.classList.toggle('rotate-90')
              }}
            >
              <span>Q{qIndex + 1}: {q.question}</span>
              <span className="text-xs text-text-400 transition-transform duration-200">▶</span>
            </button>
            <div className="px-4 pb-3.5 text-sm text-text-200" style={{ display: 'none' }}>
              <div>Correct answer: <span className="text-success font-medium mt-1">{q.options[q.answer]}</span></div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-center flex-wrap">
        <Button variant="primary" onClick={handleSaveResult} disabled={resultSaved}>
          {resultSaved ? 'Saved' : 'Save Result'}
        </Button>
        <Button variant="secondary" onClick={handleTryAnother}>
          Try Another Topic
        </Button>
      </div>
    </div>
  )

  const renderHistory = () => (
    <>
      {history === null ? (
        <div className="flex flex-col gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} height="44px" borderRadius="6px" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📝</div>
          <div className="text-text-300 text-sm mb-4">No quizzes taken yet</div>
          <Button variant="primary" onClick={() => setActiveTab('generate')}>
            Generate your first quiz
          </Button>
        </div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-xs font-semibold text-text-400 uppercase px-3 py-2 border-b border-border">Topic</th>
              <th className="text-left text-xs font-semibold text-text-400 uppercase px-3 py-2 border-b border-border">Score</th>
              <th className="text-left text-xs font-semibold text-text-400 uppercase px-3 py-2 border-b border-border">Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item._id}>
                <td className="px-3 py-2.5 text-sm text-text-200 border-b border-border-subtle">{item.topic}</td>
                <td className="px-3 py-2.5 text-sm text-text-200 border-b border-border-subtle">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getScoreBadgeClass(item.score, item.total)}`}>
                    {item.score}/{item.total}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-sm text-text-200 border-b border-border-subtle">{new Date(item.takenAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )

  const renderContent = () => {
    if (activeTab === 'history') return renderHistory()

    if (loading) return renderSkeleton()
    if (showResults && questions) return renderResults()
    if (questions) return renderQuiz()

    return renderHome()
  }

  return (
    <PageLayout title="AI Quiz Generator">
      <div className="max-w-[640px] mx-auto p-8">
        <div className="flex border-b border-border mb-8">
          <button
            className={`px-5 py-2.5 text-sm font-medium text-text-300 bg-transparent border-b-2 border-transparent cursor-pointer transition hover:text-text-100 ${activeTab === 'generate' ? 'text-accent border-b-accent' : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            Generate Quiz
          </button>
          <button
            className={`px-5 py-2.5 text-sm font-medium text-text-300 bg-transparent border-b-2 border-transparent cursor-pointer transition hover:text-text-100 ${activeTab === 'history' ? 'text-accent border-b-accent' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        {renderContent()}
      </div>
    </PageLayout>
  )
}

export default Quiz
