import { NextResponse } from "next/server"
import { getJobs } from "@/lib/job-api"

export const dynamic = "force-dynamic"
export const revalidate = 3600

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") ?? undefined
    const country = searchParams.get("country") ?? "us"
    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? "20", 10) || 20,
      50
    )

    const jobs = await getJobs({
      query: query || "software developer",
      country,
      resultsPerPage: limit,
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error("GET /api/jobs error:", error)
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    )
  }
}
