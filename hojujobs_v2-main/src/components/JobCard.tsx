import { Link } from "react-router-dom";
import { MapPin, Building2, Briefcase, ChevronRight, Eye, Calendar } from "lucide-react";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string[];
  industry: string;
  type: string;
  summary: string;
  pay?: string;
  created_at?: string;
}

const typeEmoji: Record<string, string> = {
  "풀타임": "💼",
  "파트타임": "🕒",
  "컨트랙": "📄",
  "캐주얼": "⚡",
  "리모트": "🌍",
};

const typeColor: Record<string, string> = {
  "풀타임": "bg-primary/10 text-primary",
  "파트타임": "bg-amber-100 text-amber-700",
  "컨트랙": "bg-emerald-100 text-emerald-700",
  "캐주얼": "bg-orange-100 text-orange-700",
  "리모트": "bg-violet-100 text-violet-700",
};

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
    <Link to={`/job/${job.id}`} className="block group">
      <div className="bg-card border border-border rounded-lg px-4 py-3 min-h-[4.5rem] hover:shadow-md hover:border-primary/30 transition-all duration-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-0.5">
              <h3 className="text-sm font-bold text-foreground line-clamp-2 sm:truncate group-hover:text-primary transition-colors">{job.title}</h3>
              <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-px rounded-full shrink-0 w-fit ${typeColor[job.type] || "bg-secondary text-secondary-foreground"}`}>
                {typeEmoji[job.type] || "💼"} {job.type}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              {job.company && <span className="flex items-center gap-1"><Building2 className="h-3 w-3 text-primary/60" />{job.company}</span>}
              {job.location && job.location.length > 0 && <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-accent/60" />{job.location.join(", ")}</span>}
              {job.industry && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.industry}</span>}
              {(job as any).pay && (
                <span className="text-emerald-600 font-semibold">{(job as any).pay}</span>
              )}
              <span className="flex items-center gap-1 ml-auto"><Eye className="h-3 w-3" />{viewCount}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate((job as any).uploaded_at || job.created_at)}</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary shrink-0 transition-colors" />
        </div>
      </div>
    </Link>
  );
}
