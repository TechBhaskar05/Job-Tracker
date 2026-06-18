import { getLlm } from '../lib/groq.js'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { HumanMessage, AIMessage } from '@langchain/core/messages'
import { StringOutputParser } from '@langchain/core/output_parsers'

export async function generateQuestion(role, company, history) {
  const messages = history.map(m =>
    m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)
  )

  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are a senior interviewer at {company} hiring for {role}. Ask ONE focused interview question. Rotate types: behavioural (STAR), technical (specific to the role), system design (if senior role). Never repeat a question from the conversation history. Return ONLY the question — no preamble, no numbering.`,
    ],
    new MessagesPlaceholder('history'),
    ['human', 'Ask the next interview question.'],
  ])

  const chain = prompt.pipe(getLlm()).pipe(new StringOutputParser())
  const question = await chain.invoke({
    role,
    company,
    history: messages.slice(-6),
  })

  return question.trim()
}

export async function evaluateAnswer(question, answer, role) {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are an expert interview coach evaluating an answer for a {role} position. Question asked: {question} Candidate answer: {answer} Provide structured evaluation: SCORE: X/10 STRONG: (1-2 sentences on what worked well) IMPROVE: (1 specific, actionable suggestion) Total response must be under 80 words. Be direct and encouraging.`,
    ],
    ['human', 'Evaluate my answer.'],
  ])

  const chain = prompt.pipe(getLlm()).pipe(new StringOutputParser())
  const feedback = await chain.invoke({ role, question, answer })

  return feedback.trim()
}
