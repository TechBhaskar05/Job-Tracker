import { useState, useEffect } from 'react'
import PageLayout from '../components/layout/PageLayout'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
import api from '../lib/api'
import { showToast } from '../lib/toast'
import styles from './Quiz.module.css'

const OPTION_LABELS = ['A', 'B', 'C', 'D']
const TOTAL_QUESTIONS = 5

function getScoreBadgeClass(score, total) {
  const pct = (score / total) * 100
  if (pct < 40) return styles.scoreLow
  if (pct <= 70) return styles.scoreMid
  return styles.scoreHigh
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

  useEffect(() => {
    if (activeTab !== 'history') return

    api.get('/quiz/history')
      .then(({ data }) => setHistory(data.history || []))
      .catch(() => showToast('Failed to load history', 'error'))
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
    if (selectedAnswer === null) return styles.optionDefault

    const isCorrect = optIndex === qIndex.answer
    const isSelected = optIndex === selectedAnswer

    if (isSelected && isCorrect) return styles.optionCorrect
    if (isSelected && !isCorrect) return styles.optionWrong
    if (isCorrect) return styles.optionCorrect
    return styles.optionDimmed
  }

  const renderHome = () => (
    <>
      <h1 className={styles.title}>AI Quiz Generator</h1>
      <p className={styles.subtitle}>Test your knowledge on any topic</p>

      <input
        className={styles.topicInput}
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
    <div className={styles.skeletonList}>
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
        <div className={styles.quizHeader}>
          <div className={styles.progressLabel}>
            Question {currentIndex + 1} of {TOTAL_QUESTIONS}
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${((currentIndex + 1) / TOTAL_QUESTIONS) * 100}%` }}
            />
          </div>
        </div>

        <div className={styles.questionText}>{question.question}</div>

        <div className={styles.optionsList}>
          {question.options.map((option, optIndex) => (
            <button
              key={optIndex}
              className={`${styles.optionBtn} ${getOptionClass(question, optIndex)}`}
              onClick={() => handleSelectAnswer(optIndex)}
              disabled={cannotChange}
            >
              <span className={styles.optionLabel}>{OPTION_LABELS[optIndex]}</span>
              <span>{option}</span>
              {selectedAnswer !== null && optIndex === question.answer && (
                <span className={styles.optionIcon}>✓</span>
              )}
              {selectedAnswer !== null && optIndex === selectedAnswer && optIndex !== question.answer && (
                <span className={styles.optionIcon}>✕</span>
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
    <div className={styles.resultsSection}>
      <div className={styles.scoreDisplay}>{score} / {TOTAL_QUESTIONS}</div>
      <div className={styles.scoreLabel}>Your Score</div>
      <div className={styles.motivation}>{getMotivation(score)}</div>

      <div className={styles.reviewList}>
        {questions.map((q, qIndex) => (
          <div key={qIndex} className={styles.reviewItem}>
            <button
              className={styles.reviewHeader}
              onClick={(e) => {
                const body = e.currentTarget.nextElementSibling
                if (body) {
                  const isHidden = body.style.display === 'none'
                  body.style.display = isHidden ? 'block' : 'none'
                }
                const arrow = e.currentTarget.querySelector(`.${styles.reviewArrow}`)
                if (arrow) arrow.classList.toggle(styles.reviewArrowOpen)
              }}
            >
              <span>Q{qIndex + 1}: {q.question}</span>
              <span className={styles.reviewArrow}>▶</span>
            </button>
            <div className={styles.reviewBody} style={{ display: 'none' }}>
              <div>Correct answer: <span className={styles.correctAnswer}>{q.options[q.answer]}</span></div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.resultsActions}>
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
        <div className={styles.skeletonList}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} height="44px" borderRadius="6px" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📝</div>
          <div className={styles.emptyText}>No quizzes taken yet</div>
          <Button variant="primary" onClick={() => setActiveTab('generate')}>
            Generate your first quiz
          </Button>
        </div>
      ) : (
        <table className={styles.historyTable}>
          <thead>
            <tr>
              <th>Topic</th>
              <th>Score</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item._id}>
                <td>{item.topic}</td>
                <td>
                  <span className={`${styles.scoreBadge} ${getScoreBadgeClass(item.score, item.total)}`}>
                    {item.score}/{item.total}
                  </span>
                </td>
                <td>{new Date(item.takenAt).toLocaleDateString('en-US', {
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
      <div className={styles.container}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'generate' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            Generate Quiz
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'history' ? styles.tabActive : ''}`}
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
