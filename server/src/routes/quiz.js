import { Router } from 'express'
import auth from '../middleware/auth.js'
import QuizResult from '../models/QuizResult.js'
import { generateQuiz } from '../agents/quiz.js'

const router = Router()

router.post('/generate', auth, async (req, res, next) => {
  try {
    const { topic } = req.body
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'topic is required' })
    }

    const questions = await generateQuiz(topic)
    res.json({ questions })
  } catch (err) {
    next(err)
  }
})

router.post('/save', auth, async (req, res, next) => {
  try {
    const { topic, score, total } = req.body
    if (!topic || score == null || total == null) {
      return res.status(400).json({ error: 'topic, score, and total are required' })
    }

    const result = await QuizResult.create({ userId: req.user.id, topic, score, total })
    res.status(201).json({ result })
  } catch (err) {
    next(err)
  }
})

router.get('/history', auth, async (req, res, next) => {
  try {
    const history = await QuizResult.find({ userId: req.user.id })
      .sort({ takenAt: -1 })
      .limit(20)
      .lean()

    res.json({ history })
  } catch (err) {
    next(err)
  }
})

export default router
