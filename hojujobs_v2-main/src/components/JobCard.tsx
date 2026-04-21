import { Link } from "react-router-dom";
import { MapPin, Briefcase, ChevronRight, Eye, Calendar } from "lucide-react";

interface Job {
  id: number;
  title: string;
  location: string[];
  industry: string;
  uploaded_at?: string;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const tz = "Australia/Sydney";
  const nowSyd = new Date().toLocaleDateString("en-CA", { timeZone: tz });
  const dateSyd = new Date(dateStr).toLocaleDateString("en-CA", { timeZone: tz });
  const nowDate = new Date(nowSyd);
  const postDate = new Date(dateSyd);
  const diffDays = Math.round((nowDate.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  return `${Math.floor(diffDays / 30)}개월 전`;
}

export function JobCard({ job, viewCount = 0 }: { job: Job; viewCount?: number }) {
  return (
    <Link to={`/job/${job.id}`} className="block group" onClick={() => sessionStorage.setItem("hoju_scroll_y", String(window.scrollY))}>
      <div className="bg-card border border-border rounded-lg px-4 h-[4.75rem] w-full flex items-center overflow-hidden hover:shadow-md hover:border-primary/30 transition-[box-shadow,border-color] duration-200">
        <div className="flex items-center justify-between gap-3 w-full min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{job.title}</h3>
            </div>
            <div className="flex items-center gap-x-3 text-xs text-muted-foreground overflow-hidden">
              {job.location && job.location.length > 0 && <span className="flex items-center gap-1 min-w-0 shrink"><MapPin className="h-3 w-3 text-accent/60 shrink-0" /><span className="truncate">{job.location.slice(0, 2).join(", ")}</span></span>}
              {job.industry && <span className="flex items-center gap-1 shrink-0"><Briefcase className="h-3 w-3 shrink-0" />{job.industry}</span>}
              <span className="flex items-center gap-1 ml-auto shrink-0"><Eye className="h-3 w-3" />{viewCount}</span>
              <span className="flex items-center gap-1 shrink-0"><Calendar className="h-3 w-3" />{formatDate(job.uploaded_at)}</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary shrink-0 transition-colors" />
        </div>
      </div>
    </Link>
  );
}
