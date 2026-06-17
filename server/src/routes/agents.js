import { Router } from 'express'
import auth from '../middleware/auth.js'
import { tailorResume } from '../agents/tailor.js'

const router = Router()

router.post('/tailor', auth, async (req, res, next) => {
  try {
    const { jobId } = req.body
    if (!jobId) return res.status(400).json({ error: 'jobId is required' })
    const result = await tailorResume(jobId, req.user.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

export default router
