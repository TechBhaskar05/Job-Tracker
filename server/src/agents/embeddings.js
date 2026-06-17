import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf'
import { getPineconeIndex } from '../lib/pinecone.js'

let hfEmbeddings = null

function getEmbeddings() {
  if (!hfEmbeddings) {
    hfEmbeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HUGGINGFACE_TOKEN || 'hf_placeholder',
      model: 'sentence-transformers/all-MiniLM-L6-v2',
    })
  }
  return hfEmbeddings
}

function mockEmbedQuery(text) {
  const dim = 384
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i)
    hash |= 0
  }
  const vector = new Array(dim)
  for (let i = 0; i < dim; i++) {
    vector[i] = Math.sin(hash * (i + 1)) * 0.1
  }
  return vector
}

function cleanText(text) {
  return text.trim().replace(/\s+/g, ' ').slice(0, 512)
}

export async function embedText(text) {
  const cleaned = cleanText(text)
  try {
    return await getEmbeddings().embedQuery(cleaned)
  } catch {
    console.warn('[Embeddings] HuggingFace failed, using mock embeddings')
    return mockEmbedQuery(cleaned)
  }
}

export async function embedAndStore(userId, resumeText) {
  let chunks = resumeText.split(/\n\s*\n/).filter(c => c.trim())
  const finalChunks = []
  for (const chunk of chunks) {
    if (chunk.length > 500) {
      const lines = chunk.split('\n').filter(l => l.trim())
      for (const line of lines) {
        if (line.trim()) finalChunks.push(line.trim())
      }
    } else {
      finalChunks.push(chunk.trim())
    }
  }

  const index = await getPineconeIndex()
  try {
    await index.deleteMany({ filter: { userId } })
  } catch {
    // no existing vectors — ignore
  }
  const batch = []
  for (let i = 0; i < finalChunks.length; i++) {
    const embedding = await embedText(finalChunks[i])
    batch.push({
      id: `${userId}_chunk_${i}`,
      values: embedding,
      metadata: { userId, chunk: finalChunks[i] },
    })
    if (batch.length === 10) {
      await index.upsert({ records: batch })
      batch.length = 0
    }
  }
  if (batch.length > 0) {
    await index.upsert({ records: batch })
  }

  return { chunksStored: finalChunks.length }
}
