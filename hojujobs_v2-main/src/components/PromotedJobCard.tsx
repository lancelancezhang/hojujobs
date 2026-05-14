import { useNavigate } from "react-router-dom";
import { MapPin, Briefcase, ChevronRight, Eye, Sparkles, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const diffDays = Math.round((new Date(nowSyd).getTime() - new Date(dateSyd).getTime()) / 86400000);
  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  return `${Math.floor(diffDays / 30)}개월 전`;
}

export function PromotedJobCard({
  job,
  viewCount = 0,
  showEditButton = false,
  onDelete,
}: {
  job: Job;
  viewCount?: number;
  showEditButton?: boolean;
  onDelete?: (job: Job) => void | Promise<void>;
}) {
  const navigate = useNavigate();

  const openJob = () => {
    sessionStorage.setItem("hoju_scroll_y", String(window.scrollY));
    sessionStorage.setItem(`hoju_job_view_count_${job.id}`, String(viewCount));
    navigate(`/job/${job.id}`);
  };

  return (
    <div className="block group cursor-pointer" role="link" tabIndex={0} onClick={openJob} onKeyDown={(e) => { if (e.key === "Enter") openJob(); }}>
      <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 h-[4.75rem] w-full flex items-center overflow-hidden hover:shadow-md hover:border-amber-400 transition-[box-shadow,border-color] duration-200">
        <div className="flex items-center justify-between gap-3 w-full min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-100 border border-amber-200 rounded px-1.5 py-0.5 shrink-0">
                <Sparkles className="h-2.5 w-2.5" />
                추천
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-amber-700 transition-colors">{job.title}</h3>
            </div>
            <div className="flex items-center gap-x-3 text-xs text-muted-foreground overflow-hidden">
              {job.location?.length > 0 && <span className="flex items-center gap-1 min-w-0 shrink"><MapPin className="h-3 w-3 text-accent/60 shrink-0" /><span className="truncate">{job.location.slice(0, 2).join(", ")}</span></span>}
              {job.industry && <span className="flex items-center gap-1 shrink-0"><Briefcase className="h-3 w-3 shrink-0" />{job.industry}</span>}
              <span className="flex items-center gap-1 ml-auto shrink-0"><Eye className="h-3 w-3" />{viewCount}</span>
            </div>
          </div>
          {showEditButton && (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 border-amber-300 bg-amber-50 text-xs hover:bg-amber-100"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/edit-job/${job.id}?from=admin`);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                수정
              </Button>
              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 border-destructive/30 bg-amber-50 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      삭제
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>공고를 삭제하시겠습니까?</AlertDialogTitle>
                      <AlertDialogDescription>
                        "{job.title}" 공고가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction onClick={() => void onDelete(job)}>삭제</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
          <ChevronRight className="h-4 w-4 text-amber-400 group-hover:text-amber-600 shrink-0 transition-colors" />
        </div>
      </div>
    </div>
  );
}
