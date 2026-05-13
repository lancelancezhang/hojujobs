import { useNavigate } from "react-router-dom";
import { MapPin, Briefcase, ChevronRight, Eye, Calendar, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const now = new Date();
  const posted = new Date(dateStr);
  const diffMs = now.getTime() - posted.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${Math.max(1, diffMins)}분 전`;
  const nowDay = now.toLocaleDateString("en-CA", { timeZone: tz });
  const postedDay = posted.toLocaleDateString("en-CA", { timeZone: tz });
  if (postedDay === nowDay) return `${Math.floor(diffMins / 60)}시간 전`;
  const diffDays = Math.round((new Date(nowDay).getTime() - new Date(postedDay).getTime()) / 86400000);
  if (diffDays === 1) return "어제";
  return `${diffDays}일 전`;
}

export function JobCard({ job, viewCount = 0, showEditButton = false }: { job: Job; viewCount?: number; showEditButton?: boolean }) {
  const navigate = useNavigate();

  const openJob = () => {
    sessionStorage.setItem("hoju_scroll_y", String(window.scrollY));
    navigate(`/job/${job.id}`);
  };

  return (
    <div className="block group cursor-pointer" role="link" tabIndex={0} onClick={openJob} onKeyDown={(e) => { if (e.key === "Enter") openJob(); }}>
      <div className="bg-card border border-border rounded-lg px-4 h-[4.75rem] w-full flex items-center overflow-hidden hover:shadow-md hover:border-primary/30 transition-[box-shadow,border-color] duration-200">
        <div className="flex items-center justify-between gap-3 w-full min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{job.title}</h3>
            </div>
            <div className="flex items-center gap-x-3 text-xs text-muted-foreground overflow-hidden">
              {job.location && job.location.length > 0 && <span className="flex items-center gap-1 min-w-0 shrink"><MapPin className="h-3 w-3 text-accent/60 shrink-0" /><span className="truncate">{job.location.slice(0, 2).join(", ")}</span></span>}
              {job.industry && <span className="flex items-center gap-1 shrink-0"><Briefcase className="h-3 w-3 shrink-0" />{job.industry}</span>}
              <span className="flex items-center gap-1 ml-auto shrink-0"><Eye className="h-3 w-3" />{viewCount}</span>
              <span className="flex items-center gap-1 shrink-0"><Calendar className="h-3 w-3" />{formatDate(job.uploaded_at)}</span>
            </div>
          </div>
          {showEditButton && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 shrink-0 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/edit-job/${job.id}?from=admin`);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
              수정
            </Button>
          )}
          <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary shrink-0 transition-colors" />
        </div>
      </div>
    </div>
  );
}
