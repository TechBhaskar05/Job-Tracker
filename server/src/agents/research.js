import axios from 'axios'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { getLlm } from '../lib/groq.js'
import Job from '../models/Job.js'

const SECTION_DEFS = [
  { name: 'COMPANY SUMMARY', field: 'summary' },
  { name: 'CULTURE', field: 'culture' },
  { name: 'RECENT NEWS', field: 'news' },
]

function cleanSectionText(text) {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractSections(response) {
  const result = { summary: '', culture: '', news: '' }
  if (!response) return result

  const headerRegex =
    /\*{1,2}\s*(COMPANY SUMMARY|CULTURE|RECENT NEWS)\s*:?\s*\*{1,2}|\s(COMPANY SUMMARY|CULTURE|RECENT NEWS)\s*:?|^[ \t]*(COMPANY SUMMARY|CULTURE|RECENT NEWS)\s*:?/gm

  const matches = []
  let match
  while ((match = headerRegex.exec(response)) !== null) {
    const name = match[1] || match[2] || match[3]
    if (name) matches.push({ name: name.toUpperCase(), index: match.index, start: match.index + match[0].length })
  }

  if (matches.length === 0) return result

  for (let i = 0; i < matches.length; i++) {
    const end = i + 1 < matches.length ? matches[i + 1].index : response.length
    const def = SECTION_DEFS.find(s => s.name === matches[i].name)
    if (def) result[def.field] = cleanSectionText(response.slice(matches[i].start, end))
  }

  const first = matches[0]
  if (first && first.name !== 'COMPANY SUMMARY' && !result.summary) {
    const leading = cleanSectionText(response.slice(0, first.index))
    if (leading) result.summary = leading
  }

  return result
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)),
  ])
}

async function researchCompany(job) {
  try {
    const company = job.company
    const tavilyKey = process.env.TAVILY_API_KEY
    const tavilyUrl = 'https://api.tavily.com/search'

    let snippets1 = ''
    try {
      const res1 = await withTimeout(axios.post(tavilyUrl, {
        api_key: tavilyKey,
        query: `${company} company culture engineering team glassdoor 2024`,
        max_results: 4,
        search_depth: 'basic',
        include_answer: false,
      }), 10000)
      snippets1 = (res1.data.results || [])
        .map(r => r.content || r.snippet || '')
        .filter(Boolean)
        .join('\n')
    } catch (err) {
      console.error('[Research] Tavily culture search failed:', err.message)
    }

    let snippets2 = ''
    try {
      const res2 = await withTimeout(axios.post(tavilyUrl, {
        api_key: tavilyKey,
        query: `${company} news funding product launch 2024 2025`,
        max_results: 3,
        search_depth: 'basic',
        include_answer: false,
      }), 10000)
      snippets2 = (res2.data.results || [])
        .map(r => r.content || r.snippet || '')
        .filter(Boolean)
        .join('\n')
    } catch (err) {
      console.error('[Research] Tavily news search failed:', err.message)
    }

    let webData = [snippets1, snippets2].filter(Boolean).join('\n')
    if (webData.length > 2500) {
      webData = webData.slice(0, 2500)
    }

    if (!webData) {
      console.log('[Research] No web data found for', company)
      await Job.findByIdAndUpdate(job._id, {
        companyInfo: { summary: '', culture: '', news: '', fetchedAt: new Date() },
      })
      return
    }

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', 'You are a company research assistant. Be concise and factual. 2-3 sentences per section.'],
      ['human', 'Based on this data about {company}, write:\nCOMPANY SUMMARY:\n(what they do, scale, domain)\n\nCULTURE:\n(work culture, values, team environment)\n\nRECENT NEWS:\n(1-2 notable recent things)\n\nWeb data:\n{webData}'],
    ])

    const chain = prompt.pipe(getLlm()).pipe(new StringOutputParser())
    const response = await withTimeout(chain.invoke({ company, webData }), 15000)

    const sections = extractSections(response)
    const summary = sections.summary
    const culture = sections.culture
    const news = sections.news

    await Job.findByIdAndUpdate(job._id, {
      companyInfo: {
        summary: summary || '',
        culture: culture || '',
        news: news || '',
        fetchedAt: new Date(),
      },
    })

    console.log('[Research] Completed for', company)
  } catch (err) {
    console.error('[Research] Failed for', job.company, ':', err.message)
    await Job.findByIdAndUpdate(job._id, {
      companyInfo: { summary: '', culture: '', news: '', fetchedAt: new Date() },
    }).catch(e => console.error('[Research] Failed to save fallback state:', e.message))
  }
}

export { researchCompany }
