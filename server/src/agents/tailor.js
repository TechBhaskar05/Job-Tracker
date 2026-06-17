import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { getLlm } from '../lib/groq.js'
import { getPineconeIndex } from '../lib/pinecone.js'
import { embedText } from './embeddings.js'
import Job from '../models/Job.js'

export async function tailorResume(jobId, userId) {
  try {
    const job = await Job.findOne({ _id: jobId, userId }).lean()
    if (!job) throw new Error('Job not found')
    if (!job.jobDesc) throw new Error('Job has no description')

    const jdVector = await embedText(job.jobDesc)

    const index = await getPineconeIndex()
    const results = await index.query({
      vector: jdVector,
      topK: 6,
      filter: { userId },
      includeMetadata: true,
    })

    const chunks = results.matches.map(m => m.metadata?.chunk).filter(Boolean)
    if (chunks.length === 0) {
      console.log('[Tailor] No resume chunks found for user', userId)
    }

    let prompt
    if (chunks.length > 0) {
      prompt = ChatPromptTemplate.fromMessages([
        ['system', 'You are an expert resume writer. Rewrite the provided resume content as polished bullet points that strongly align with this job description. Rules: use strong action verbs, quantify achievements where possible, mirror keywords from the JD, keep each bullet under 20 words. Return ONLY the bullet points, one per line starting with •'],
        ['human', 'Job Description: {jobDesc}\n\nResume content to rewrite:\n{chunks}'],
      ])
    } else {
      prompt = ChatPromptTemplate.fromMessages([
        ['system', 'You are an expert resume writer. A user is applying for the job below but has not yet uploaded their resume. Generate polished generic bullet points that would strengthen any application for this role — base them purely on the job description. Use common industry-relevant achievements and skills. Rules: use strong action verbs, quantify achievements where possible, mirror keywords from the JD, keep each bullet under 20 words. Return ONLY the bullet points, one per line starting with •'],
        ['human', 'Job Description: {jobDesc}'],
      ])
    }

    const chain = prompt.pipe(getLlm()).pipe(new StringOutputParser())
    const result = await chain.invoke({
      jobDesc: job.jobDesc.slice(0, 2000),
      ...(chunks.length > 0 ? { chunks: chunks.join('\n\n') } : {}),
    })

    await Job.findByIdAndUpdate(jobId, { tailoredResume: result })

    return { tailoredResume: result }
  } catch (err) {
    console.error('[TailorAgent] Error:', err.message)
    throw new Error(`TailorAgent failed: ${err.message}`)
  }
}
