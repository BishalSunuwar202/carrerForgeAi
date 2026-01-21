// Mock LinkedIn job postings data for skill gap analysis

export interface JobPosting {
  id: string
  title: string
  company: string
  location: string
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
]

// Get a random job posting for analysis
export function getRandomJobPosting(): JobPosting {
  const randomIndex = Math.floor(Math.random() * mockJobPostings.length)
  return mockJobPostings[randomIndex]
}
