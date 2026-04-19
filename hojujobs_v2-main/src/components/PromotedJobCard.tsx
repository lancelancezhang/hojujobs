import { MapPin, ChevronRight, Calendar, Sparkles } from "lucide-react";
import type { PromotedJob } from "@/data/promotedJobs";

function formatDate(dateStr: string) {
  const tz = "Australia/Sydney";
  const nowSyd = new Date().toLocaleDateString("en-CA", { timeZone: tz });
  const dateSyd = new Date(dateStr).toLocaleDateString("en-CA", { timeZone: tz });
  const diffDays = Math.round((new Date(nowSyd).getTime() - new Date(dateSyd).getTime()) / 86400000);
  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return `${diffDays}일 전`;
  return `${Math.floor(diffDays / 7)}주 전`;
}

export function PromotedJobCard({ job }: { job: PromotedJob }) {
  return (
    <a href={job.url} target="_blank" rel="noopener noreferrer" className="block group">
      <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 w-full hover:shadow-md hover:border-amber-400 transition-[box-shadow,border-color] duration-200">
        <div className="flex items-start justify-between gap-3 w-full min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-100 border border-amber-300 rounded px-1.5 py-0.5 shrink-0">
                <Sparkles className="h-2.5 w-2.5" />
                추천
              </span>
              <h3 className="text-sm font-bold text-foreground truncate group-hover:text-amber-700 transition-colors">{job.title}</h3>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{job.description}</p>
            <div className="flex items-center gap-x-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 shrink-0"><Calendar className="h-3 w-3" />{formatDate(job.time_posted)}</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-amber-400 group-hover:text-amber-600 shrink-0 transition-colors mt-0.5" />
        </div>
      </div>
    </a>
  );
}
