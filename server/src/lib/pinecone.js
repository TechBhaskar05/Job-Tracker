import { Pinecone } from '@pinecone-database/pinecone'

let instance = null

export async function getPineconeIndex() {
  if (!instance) {
    instance = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
  }
  return instance.index(process.env.PINECONE_INDEX)
}
