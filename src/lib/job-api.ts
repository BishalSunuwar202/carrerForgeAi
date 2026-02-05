/**
 * Job posting API layer.
 * Uses Adzuna when ADZUNA_APP_ID and ADZUNA_APP_KEY are set; otherwise falls back to mock data.
 */

import type { JobPosting, JobRoleType } from "@/data/mock-jobs"
import { mockJobPostings, getRandomJobPosting } from "@/data/mock-jobs"

const ADZUNA_BASE = "https://api.adzuna.com/v1/api/jobs"

export interface JobSearchParams {
  query?: string
  country?: string
  resultsPerPage?: number
}

function mapAdzunaToJobPosting(item: {
  title: string
  company: { display_name: string }
  location: { display_name: string }
  description?: string
  id: string
}): JobPosting {
  const requirements = item.description
    ? item.description
        .replace(/<[^>]+>/g, " ")
        .split(/[\n•·]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 10)
        .slice(0, 8)
    : []

  return {
    id: `adzuna-${item.id}`,
    title: item.title,
    company: item.company?.display_name ?? "Company",
    location: item.location?.display_name ?? "Unknown",
    roleType: "fullstack",
    requirements: requirements.length ? requirements : ["See job description"],
    preferred: [],
    description: item.description ?? "",
  }
}

export async function fetchJobsFromAdzuna(
  params: JobSearchParams = {}
): Promise<JobPosting[]> {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  if (!appId || !appKey) return []

  const { query = "developer", country = "us", resultsPerPage = 10 } = params
  const url = `${ADZUNA_BASE}/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=${resultsPerPage}&what=${encodeURIComponent(query)}`

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = (await res.json()) as { results?: unknown[] }
    const results = data.results ?? []
    return results.map((item: unknown) =>
      mapAdzunaToJobPosting(item as Parameters<typeof mapAdzunaToJobPosting>[0])
    )
  } catch (e) {
    console.error("Adzuna API error:", e)
    return []
  }
}

export function getMockJobs(): JobPosting[] {
  return [...mockJobPostings]
}

export function getRandomJob(): JobPosting {
  return getRandomJobPosting()
}

export async function getJobs(params?: JobSearchParams): Promise<JobPosting[]> {
  const fromApi = await fetchJobsFromAdzuna(params)
  if (fromApi.length > 0) return fromApi
  return getMockJobs()
}
