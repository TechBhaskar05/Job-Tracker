import { getLlmPrecise } from '../lib/groq.js'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'

const PROMPT_TEMPLATE = `Generate exactly 5 multiple-choice questions about: {topic}
Return ONLY a valid JSON array, no markdown, no explanation:
[{"question":"...","options":["A","B","C","D"],"answer":0}]
answer is the 0-based index of the correct option.
Questions should progress from basic to advanced.
Be specific, accurate, and educational.`

const STRICTER_PROMPT = `Generate exactly 5 multiple-choice questions about: {topic}
Return ONLY a valid JSON array. No markdown. No explanation. No code fences.
Example format:
[{"question":"What is React?","options":["Library","Framework","Language","Database"],"answer":0}]
answer must be an integer 0, 1, 2, or 3.
Make sure the JSON is valid and parseable.`

function stripFences(raw) {
  return raw.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim()
}

function validateQuiz(parsed) {
  if (!Array.isArray(parsed) || parsed.length !== 5) return false
  return parsed.every(
    item =>
      typeof item.question === 'string' &&
      Array.isArray(item.options) &&
      item.options.length === 4 &&
      item.options.every(o => typeof o === 'string') &&
      typeof item.answer === 'number' &&
      item.answer >= 0 &&
      item.answer <= 3
  )
}

async function generateWithPrompt(topic, promptTemplate) {
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', promptTemplate],
    ['human', 'Topic: {topic}'],
  ])

  const chain = prompt.pipe(getLlmPrecise()).pipe(new StringOutputParser())
  const raw = await chain.invoke({ topic })

  const cleaned = stripFences(raw)
  return JSON.parse(cleaned)
}

export async function generateQuiz(topic) {
  try {
    const parsed = await generateWithPrompt(topic, PROMPT_TEMPLATE)
    if (validateQuiz(parsed)) return parsed

    const retry = await generateWithPrompt(topic, STRICTER_PROMPT)
    if (validateQuiz(retry)) return retry

    throw new Error('Quiz generation failed validation after retry')
  } catch (err) {
    throw new Error(`QuizAgent failed: ${err.message}`)
  }
}
