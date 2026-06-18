import { getLlmPrecise } from '../lib/groq.js'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'

export async function analyseResume(resumeText, jobDesc) {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `Analyse this resume against the job description. Return a JSON object with exactly these keys:
- "score": number between 0 and 100
- "presentKeywords": array of matching keywords
- "missingKeywords": keywords in JD not in resume
- "recommendations": exactly 3 actionable strings
Score is percentage of important JD keywords present in resume. Return ONLY valid JSON. No markdown. No explanation.`,
    ],
    ['human', 'Resume: {resumeText}\n\nJob Description: {jobDesc}'],
  ])

  const chain = prompt.pipe(getLlmPrecise()).pipe(new StringOutputParser())
  const raw = await chain.invoke({
    resumeText: resumeText.slice(0, 4000),
    jobDesc: jobDesc.slice(0, 2000),
  })

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    const stripped = raw.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim()
    parsed = JSON.parse(stripped)
  }

  if (typeof parsed.score !== 'number' || !Array.isArray(parsed.presentKeywords) || !Array.isArray(parsed.missingKeywords) || !Array.isArray(parsed.recommendations)) {
    throw new Error('ATS analysis returned invalid structure')
  }

  return parsed
}
