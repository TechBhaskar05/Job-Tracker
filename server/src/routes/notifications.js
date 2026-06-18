import { Router } from 'express'
import auth from '../middleware/auth.js'
import Notification from '../models/Notification.js'

const router = Router()

router.get('/', auth, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id, read: false })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()

    res.json({ notifications })
  } catch (err) {
    next(err)
  }
})

router.get('/count', auth, async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user.id, read: false })
    res.json({ count })
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/read', auth, async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' })
    }

    res.json({ notification })
  } catch (err) {
    next(err)
  }
})

router.patch('/read-all', auth, async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true }
    )

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

export default router
