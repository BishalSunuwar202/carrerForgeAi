"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  mockJobPostings,
  getRoleLabel,
  type JobPosting,
  type JobRoleType,
} from "@/data/mock-jobs"
import { Briefcase, MapPin, Building2, ChevronDown } from "lucide-react"

const ALL_ROLES: JobRoleType[] = [
  "fullstack",
  "frontend",
  "backend",
  "devops",
  "mobile",
  "data",
]

interface JobSelectorProps {
  selectedJobId: string | null
  onSelectJob: (job: JobPosting | null) => void
  className?: string
}

export function JobSelector({
  selectedJobId,
  onSelectJob,
  className,
}: JobSelectorProps) {
  const [roleFilter, setRoleFilter] = useState<JobRoleType | "all">("all")
  const [isOpen, setIsOpen] = useState(false)

  const filteredJobs =
    roleFilter === "all"
      ? mockJobPostings
      : mockJobPostings.filter((j) => j.roleType === roleFilter)

  const selectedJob = selectedJobId
    ? mockJobPostings.find((j) => j.id === selectedJobId)
    : null

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Compare against:
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-2"
        >
          {selectedJob ? (
            <>
              <Briefcase className="h-4 w-4" />
              {selectedJob.title} at {selectedJob.company}
            </>
          ) : (
            "Select a job posting"
          )}
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
          />
        </Button>
        {selectedJobId && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSelectJob(null)}
          >
            Clear
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap gap-1">
            <Button
              type="button"
              variant={roleFilter === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setRoleFilter("all")}
            >
              All
            </Button>
            {ALL_ROLES.map((role) => (
              <Button
                key={role}
                type="button"
                variant={roleFilter === role ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setRoleFilter(role)}
              >
                {getRoleLabel(role)}
              </Button>
            ))}
          </div>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={selectedJobId === job.id}
                onSelect={() => {
                  onSelectJob(job)
                  setIsOpen(false)
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function JobCard({
  job,
  isSelected,
  onSelect,
}: {
  job: JobPosting
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border p-3 text-left transition-colors",
        isSelected
          ? "border-primary bg-primary/10"
          : "border-border hover:bg-muted/50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-medium">{job.title}</div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            {job.company}
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {job.location}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {getRoleLabel(job.roleType)}
          </div>
        </div>
      </div>
    </button>
  )
}
