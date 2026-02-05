import type { JobRoleType } from "@/data/mock-jobs"
import { getRoleLabel } from "@/data/mock-jobs"

const SYSTEM_BASE = `You are CareerForgeAI, an expert career guidance assistant for programmers. Your role is to analyze a user's skills against job requirements and provide structured, actionable feedback.

When analyzing skills, provide:
1. **Skill Gaps** - Skills the user lacks that are required for the position
2. **Weak Skills** - Skills the user has but may need to strengthen
3. **Recommended Learning Path** - Prioritized list of skills to learn, with suggested resources and timeline
4. **Strength Areas** - Skills the user already has that match the requirements

Format your response using clear markdown with headers, bullet points, and structured sections. Be encouraging and constructive.`

const ROLE_SPECIFIC_GUIDANCE: Record<JobRoleType, string> = {
  frontend:
    "Focus on UI/UX skills, frameworks (React, Vue), accessibility, performance, and design systems.",
  backend:
    "Focus on APIs, databases, security, scalability, and server-side technologies.",
  fullstack:
    "Balance frontend and backend skills; emphasize integration, deployment, and full product ownership.",
  devops:
    "Focus on CI/CD, infrastructure as code, monitoring, and reliability.",
  mobile:
    "Focus on React Native or native mobile development, app store deployment, and mobile UX.",
  data:
    "Focus on data pipelines, SQL, analytics, and ML/BI tooling.",
}

export function getSystemPrompt(roleType: JobRoleType): string {
  const roleLabel = getRoleLabel(roleType)
  const guidance = ROLE_SPECIFIC_GUIDANCE[roleType] ?? ""
  return `${SYSTEM_BASE}

This analysis is for a **${roleLabel}** role. ${guidance}`
}

export function getAnalysisPrompt(
  userProfile: string,
  jobRequirements: string
): string {
  return `Analyze the following user profile against this job posting:

${userProfile}

---

${jobRequirements}

Provide a comprehensive skill gap analysis with actionable recommendations.`
}

export function buildJobRequirementsText(job: {
  title: string
  company: string
  requirements: string[]
  preferred: string[]
}): string {
  return `Job Title: ${job.title}
Company: ${job.company}

Required Skills:
${job.requirements.join("\n")}

Preferred Skills:
${job.preferred.join("\n")}`
}
