import { Router } from 'express'
import auth from '../middleware/auth.js'
import User from '../models/User.js'
import { embedAndStore } from '../agents/embeddings.js'

const router = Router()

router.patch('/resume', auth, async (req, res, next) => {
  try {
    const { resume } = req.body
    if (resume === undefined) return res.status(400).json({ error: 'resume is required' })

    await User.findByIdAndUpdate(req.user.id, { resume })

    await embedAndStore(req.user.id, resume || '')

    res.json({ message: 'Resume saved and embeddings generated' })
  } catch (err) {
    next(err)
  }
})

export default router
