"use client"

import { Building2, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import type { JobPosting } from "@/data/mock-jobs"
import { getRoleLabel } from "@/data/mock-jobs"

interface JobCardProps {
  job: JobPosting
  isSelected?: boolean
  onSelect?: () => void
  className?: string
}

export function JobCard({
  job,
  isSelected,
  onSelect,
  className,
}: JobCardProps) {
  const Comp = onSelect ? "button" : "div"
  return (
    <Comp
      type={onSelect ? "button" : undefined}
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border p-3 text-left transition-colors",
        onSelect && "hover:bg-muted/50",
        isSelected && "border-primary bg-primary/10",
        className
      )}
    >
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
      {job.requirements.length > 0 && (
        <ul className="mt-2 list-inside list-disc text-xs text-muted-foreground">
          {job.requirements.slice(0, 3).map((r, i) => (
            <li key={i} className="truncate">
              {r}
            </li>
          ))}
        </ul>
      )}
    </Comp>
  )
}
