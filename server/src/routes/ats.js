import { Router } from 'express'
import multer from 'multer'
import auth from '../middleware/auth.js'
import { analyseResume } from '../agents/ats.js'
import Job from '../models/Job.js'

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    cb(new Error('Only PDF files are allowed'), false)
  }
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })

const router = Router()

router.post('/analyse', auth, (req, res, next) => {
  upload.single('resume')(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size must be under 5MB' })
      }
      return res.status(400).json({ error: err.message || 'Upload failed' })
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Please upload a PDF resume' })
      }
      if (!req.body.jobDesc) {
        return res.status(400).json({ error: 'Job description is required' })
      }

      const { PDFParse } = await import('pdf-parse')
      const parser = new PDFParse(new Uint8Array(req.file.buffer))
      await parser.load()
      const { text: resumeText } = await parser.getText()

      if (resumeText.trim().length < 50) {
        return res.status(400).json({ error: 'Could not extract text from PDF' })
      }

      const result = await analyseResume(resumeText, req.body.jobDesc)

      if (req.body.jobId) {
        await Job.findOneAndUpdate(
          { _id: req.body.jobId, userId: req.user.id },
          { atsScore: result.score }
        )
      }

      res.json(result)
    } catch (err) {
      next(err)
    }
  })
})

export default router
