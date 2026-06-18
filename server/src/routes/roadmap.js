import { Router } from 'express'
import auth from '../middleware/auth.js'
import { generateRoadmap } from '../agents/roadmap.js'

const router = Router()

router.post('/generate', auth, async (req, res, next) => {
  req.setTimeout(90000)

  try {
    const result = await generateRoadmap(req.user.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

export default router
