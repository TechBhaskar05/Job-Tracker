import cron from 'node-cron'
import Job from '../models/Job.js'
import Notification from '../models/Notification.js'
import { getLlm } from './groq.js'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'

export function startScheduler() {
  cron.schedule('0 9 * * *', async () => {
    console.log('[Scheduler] Running follow-up check...')

    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const staleJobs = await Job.find({
        stage: { $in: ['APPLIED', 'SCREENING'] },
        updatedAt: { $lt: sevenDaysAgo },
      }).populate('userId', 'name email')

      for (const job of staleJobs) {
        try {
          const prompt = ChatPromptTemplate.fromMessages([
            [
              'system',
              `Write a 2-sentence polite follow-up email for {name} applying to {role} at {company}.`,
            ],
            ['human', 'Write follow-up email.'],
          ])

          const chain = prompt.pipe(getLlm()).pipe(new StringOutputParser())
          const message = await chain.invoke({
            name: job.userId.name,
            role: job.role,
            company: job.company,
          })

          await Notification.create({
            userId: job.userId._id,
            jobId: job._id,
            message,
          })
        } catch (innerErr) {
          console.error(`[Scheduler] Failed for job ${job._id}:`, innerErr.message)
        }
      }

      console.log(`[Scheduler] Processed ${staleJobs.length} stale jobs`)
    } catch (err) {
      console.error('[Scheduler] Error:', err.message)
    }
  })

  console.log('[Scheduler] Cron job scheduled for 9:00 AM daily')
}
