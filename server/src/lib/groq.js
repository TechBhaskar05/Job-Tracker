import { ChatGroq } from '@langchain/groq'

let _llm = null
let _llmPrecise = null

export function getLlm() {
  if (!_llm) {
    _llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: 'llama3-8b-8192',
      temperature: 0.7,
      maxTokens: 1200,
    })
  }
  return _llm
}

export function getLlmPrecise() {
  if (!_llmPrecise) {
    _llmPrecise = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: 'llama3-8b-8192',
      temperature: 0.1,
      maxTokens: 1500,
    })
  }
  return _llmPrecise
}
