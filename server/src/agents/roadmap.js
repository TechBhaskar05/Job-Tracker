import { getLlmPrecise } from '../lib/groq.js'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import Job from '../models/Job.js'

function stripFences(raw) {
  return raw.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim()
}

export async function generateRoadmap(userId) {
  const jobs = await Job.find({ userId })
    .select('role jobDesc')
    .sort({ appliedAt: -1 })
    .limit(10)
    .lean()

  const summaryText = jobs
    .map(j => `Role: ${j.role}\nJD: ${(j.jobDesc || '').slice(0, 400)}`)
    .join('\n---\n')
    .slice(0, 4000)

  let skillGaps = []
  let roadmap = []

  try {
    const gapPrompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `Based on these job descriptions a candidate is applying for: {summary}
Return a JSON array of exactly 5 strings — the most critical skill gaps.
Return ONLY the JSON array, no other text.`,
      ],
      ['human', 'Identify skill gaps.'],
    ])

    const gapChain = gapPrompt.pipe(getLlmPrecise()).pipe(new StringOutputParser())
    const gapRaw = await gapChain.invoke({ summary: summaryText })

    skillGaps = JSON.parse(stripFences(gapRaw))
    if (!Array.isArray(skillGaps) || skillGaps.length !== 5) {
      skillGaps = skillGaps.slice(0, 5)
    }
  } catch (err) {
    console.error('[RoadmapAgent] Skill gaps LLM failed:', err.message)
    skillGaps = []
  }

  try {
    if (skillGaps.length === 0) {
      skillGaps = ['Core technical skills', 'System design', 'Communication', 'Problem solving', 'Domain knowledge']
    }

    const gapsText = skillGaps.join(', ')
    const roadmapPrompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `Create a 5-step learning roadmap for someone who needs to improve: {gaps}
Return ONLY a valid JSON array:
[{"step":1,"skill":"skill name","why":"1 sentence why this matters","resource":"real URL (MDN, freeCodeCamp, roadmap.sh, etc)","weeks":2}]
Use real, working resource URLs. Return ONLY the JSON array.`,
      ],
      ['human', 'Generate roadmap.'],
    ])

    const roadmapChain = roadmapPrompt.pipe(getLlmPrecise()).pipe(new StringOutputParser())
    const roadmapRaw = await roadmapChain.invoke({ gaps: gapsText })

    roadmap = JSON.parse(stripFences(roadmapRaw))
    if (!Array.isArray(roadmap) || roadmap.length !== 5) {
      roadmap = roadmap.slice(0, 5)
    }

    roadmap.forEach((s, i) => {
      s.step = i + 1
    })
  } catch (err) {
    console.error('[RoadmapAgent] Roadmap LLM failed:', err.message)
    roadmap = skillGaps.map((skill, i) => ({
      step: i + 1,
      skill,
      why: `Mastering ${skill.toLowerCase()} will make you a stronger candidate`,
      resource: 'https://roadmap.sh',
      weeks: 2,
    }))
  }

  return { skillGaps, roadmap }
}
