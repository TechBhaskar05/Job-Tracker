import cron from 'node-cron'
import Job from '../models/Job.js'
import Notification from '../models/Notification.js'
import { getLlm } from './groq.js'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'

const STALE_STAGES = ['APPLIED', 'SCREENING']
const STALE_DAYS = 7

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)),
  ])
}

async function generateFollowUp(job) {
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are a job search assistant. Write professional, polite follow-up emails. Keep every email to exactly two sentences.'],
    ['human', 'Write a two-sentence follow-up email to the hiring team at {company} about the position of {role}. The applicant applied over a week ago and has not heard back yet.'],
  ])

  const chain = prompt.pipe(getLlm()).pipe(new StringOutputParser())
  const message = await withTimeout(chain.invoke({ company: job.company, role: job.role }), 15000)
  return message.trim()
}

export function startScheduler() {
  // Runs daily at 9 AM. Note: on Render's free tier this only fires while the server is awake.
  cron.schedule('0 9 * * *', async () => {
    console.log('[Scheduler] Running follow-up check')
    const cutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000)

    try {
      const jobs = await Job.find({
        stage: { $in: STALE_STAGES },
        updatedAt: { $lt: cutoff },
      }).lean()

      if (jobs.length === 0) {
        console.log('[Scheduler] No stale jobs found')
        return
      }

      const notified = await Notification.find({ jobId: { $in: jobs.map(j => j._id) } }).distinct('jobId')

      let created = 0
      for (const job of jobs) {
        if (notified.some(id => id.equals(job._id))) continue
        try {
          const message = await generateFollowUp(job)
          await Notification.create({
            userId: job.userId,
            jobId: job._id,
            message,
            read: false,
          })
          created++
        } catch (err) {
          console.error(`[Scheduler] Failed for ${job.company} (${job._id}):`, err.message)
        }
      }

      console.log(`[Scheduler] Created ${created} follow-up notification(s)`)
    } catch (err) {
      console.error('[Scheduler] Run failed:', err.message)
    }
  })
}
