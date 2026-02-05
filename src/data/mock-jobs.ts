// Mock LinkedIn job postings data for skill gap analysis

export type JobRoleType = "frontend" | "backend" | "fullstack" | "devops" | "mobile" | "data"

export interface JobPosting {
  id: string
  title: string
  company: string
  location: string
  roleType: JobRoleType
  requirements: string[]
  preferred: string[]
  description: string
}

export const mockJobPostings: JobPosting[] = [
  {
    id: "1",
    title: "Senior Full-Stack Developer",
    company: "Tech Corp",
    location: "Remote",
    roleType: "fullstack",
    requirements: [
      "5+ years of experience with React and Next.js",
      "Strong TypeScript skills",
      "Proficiency in Node.js and Express",
      "Experience with PostgreSQL or MongoDB",
      "Knowledge of RESTful APIs and GraphQL",
      "Familiarity with AWS or similar cloud platforms",
      "Understanding of CI/CD pipelines",
    ],
    preferred: [
      "Experience with Docker and Kubernetes",
      "Knowledge of microservices architecture",
      "Background in DevOps practices",
      "Contributions to open-source projects",
    ],
    description: "We're looking for an experienced full-stack developer to join our team...",
  },
  {
    id: "2",
    title: "Frontend Engineer",
    company: "Design Studio",
    location: "San Francisco, CA",
    roleType: "frontend",
    requirements: [
      "3+ years of React experience",
      "Proficiency in TypeScript",
      "Experience with Tailwind CSS or similar CSS frameworks",
      "Knowledge of state management (Redux, Zustand, or Context API)",
      "Familiarity with testing frameworks (Jest, React Testing Library)",
      "Understanding of responsive design principles",
    ],
    preferred: [
      "Experience with Next.js App Router",
      "Knowledge of animation libraries (Framer Motion)",
      "Design system experience",
      "Experience with shadcn/ui or similar component libraries",
    ],
    description: "Join our frontend team to build beautiful, performant user interfaces...",
  },
  {
    id: "3",
    title: "Backend Developer",
    company: "Data Systems Inc",
    location: "New York, NY",
    roleType: "backend",
    requirements: [
      "4+ years of backend development experience",
      "Proficiency in Python or Node.js",
      "Experience with SQL databases (PostgreSQL, MySQL)",
      "Knowledge of API design and development",
      "Understanding of authentication and authorization",
      "Experience with caching strategies (Redis)",
    ],
    preferred: [
      "Experience with FastAPI or Django",
      "Knowledge of message queues (RabbitMQ, Kafka)",
      "Understanding of distributed systems",
      "Experience with machine learning APIs",
    ],
    description: "We're building scalable backend systems for data processing...",
  },
  {
    id: "4",
    title: "React Native Developer",
    company: "Mobile First",
    location: "Austin, TX",
    roleType: "mobile",
    requirements: [
      "3+ years React Native experience",
      "TypeScript proficiency",
      "iOS and Android deployment",
      "State management (Redux/MobX)",
      "REST/GraphQL APIs",
    ],
    preferred: ["Expo", "Firebase", "App Store/Play Store publishing"],
    description: "Build cross-platform mobile apps...",
  },
  {
    id: "5",
    title: "DevOps Engineer",
    company: "CloudScale",
    location: "Remote",
    roleType: "devops",
    requirements: [
      "CI/CD (GitHub Actions, Jenkins)",
      "Docker and Kubernetes",
      "AWS or GCP",
      "Terraform or CloudFormation",
      "Linux administration",
    ],
    preferred: ["ArgoCD", "Prometheus/Grafana", "Python/Bash scripting"],
    description: "Own our cloud infrastructure and pipelines...",
  },
  {
    id: "6",
    title: "Data Engineer",
    company: "Analytics Co",
    location: "Boston, MA",
    roleType: "data",
    requirements: [
      "SQL and data modeling",
      "Python (pandas, PySpark)",
      "ETL pipelines",
      "Data warehousing (Snowflake, BigQuery)",
    ],
    preferred: ["dbt", "Airflow", "ML pipelines"],
    description: "Design and maintain data pipelines...",
  },
  {
    id: "7",
    title: "Junior Full-Stack Developer",
    company: "StartupXYZ",
    location: "Remote",
    roleType: "fullstack",
    requirements: [
      "1+ years React or Vue",
      "Basic Node.js or Python",
      "Git and Agile",
      "HTML/CSS/JavaScript",
    ],
    preferred: ["Next.js", "TypeScript", "Testing"],
    description: "Great first role for growing developers...",
  },
  {
    id: "8",
    title: "Senior Frontend Architect",
    company: "Enterprise Inc",
    location: "Seattle, WA",
    roleType: "frontend",
    requirements: [
      "7+ years frontend experience",
      "React/TypeScript at scale",
      "Performance and accessibility",
      "Design systems leadership",
    ],
    preferred: ["Webpack/Vite", "SSR", "Monitoring"],
    description: "Lead frontend architecture and standards...",
  },
  {
    id: "9",
    title: "Backend Engineer (Node.js)",
    company: "API Labs",
    location: "Denver, CO",
    roleType: "backend",
    requirements: [
      "4+ years Node.js",
      "PostgreSQL or MongoDB",
      "REST and GraphQL",
      "Testing (Jest, Mocha)",
    ],
    preferred: ["NestJS or Fastify", "Redis", "Message queues"],
    description: "Build and scale our API platform...",
  },
  {
    id: "10",
    title: "Full-Stack Engineer (Startup)",
    company: "LaunchPad",
    location: "Remote",
    roleType: "fullstack",
    requirements: [
      "2+ years full-stack experience",
      "React and Node.js",
      "Database design",
      "Deployment (Vercel, AWS)",
    ],
    preferred: ["Next.js", "Prisma", "Stripe"],
    description: "Ship features end-to-end in a small team...",
  },
]

const ROLE_LABELS: Record<JobRoleType, string> = {
  frontend: "Frontend",
  backend: "Backend",
  fullstack: "Full-stack",
  devops: "DevOps",
  mobile: "Mobile",
  data: "Data",
}

export function getRoleLabel(role: JobRoleType): string {
  return ROLE_LABELS[role] ?? role
}

export function getJobPostingById(id: string): JobPosting | undefined {
  return mockJobPostings.find((j) => j.id === id)
}

export function getJobPostingsByRole(roleType: JobRoleType): JobPosting[] {
  return mockJobPostings.filter((j) => j.roleType === roleType)
}

export function getRandomJobPosting(): JobPosting {
  const randomIndex = Math.floor(Math.random() * mockJobPostings.length)
  return mockJobPostings[randomIndex]
}
