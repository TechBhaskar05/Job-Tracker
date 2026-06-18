import { Router } from 'express'
import auth from '../middleware/auth.js'
import { generateQuestion, evaluateAnswer } from '../agents/interview.js'

const router = Router()

router.post('/question', auth, async (req, res, next) => {
  try {
    const { role, company, history } = req.body
    if (!role || !company) {
      return res.status(400).json({ error: 'role and company are required' })
    }

    const question = await generateQuestion(role, company, history || [])
    res.json({ question })
  } catch (err) {
    next(err)
  }
})

router.post('/evaluate', auth, async (req, res, next) => {
  try {
    const { question, answer, role } = req.body
    if (!question || !answer || !role) {
      return res.status(400).json({ error: 'question, answer, and role are required' })
    }

    const feedback = await evaluateAnswer(question, answer, role)
    res.json({ feedback })
  } catch (err) {
    next(err)
  }
})

export default router
