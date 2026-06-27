import cron from 'node-cron'
import Job from '../models/Job.js'
import Notification from '../models/Notification.js'
import { getLlm } from './groq.js'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'

export function startScheduler() {
  // Cron job disabled — Render free tier doesn't support persistent background scheduling.
  // The follow-up scheduler would run only when the server is awake, which is unreliable.
  // console.log('[Scheduler] Cron job disabled')
}
