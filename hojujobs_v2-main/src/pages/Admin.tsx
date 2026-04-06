import { useState, useEffect } from "react";
import hojuJobsLogo from "@/assets/hoju-jobs-logo.png";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Shield, ExternalLink, Pencil } from "lucide-react";
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
  company: string;
  location: string[];
  type: string;
  created_at: string;
  user_id: string | null;
}

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/");
      return;
    }
    if (user && isAdmin) fetchJobs();
  }, [user, isAdmin, loading]);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("id, title, company, location, type, created_at, user_id")
      .order("uploaded_at", { ascending: false });
    if (!error && data) setJobs(data);
    setLoadingJobs(false);
  };

  const deleteJob = async (id: number) => {
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (error) {
      toast.error("삭제 실패: " + error.message);
    } else {
      toast.success("공고가 삭제되었습니다.");
      setJobs((prev) => prev.filter((j) => j.id !== id));
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">로딩 중...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 space-y-4">
          <Link to="/">
            <img src={hojuJobsLogo} alt="Hoju Jobs" className="h-8 hover:opacity-80 transition-opacity" />
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            홈으로
          </Link>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">관리자 대시보드</h2>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          총 <span className="font-semibold text-foreground">{jobs.length}</span>개의 공고
        </p>

        {loadingJobs ? (
          <div className="text-center py-16 text-muted-foreground">불러오는 중...</div>
        ) : (
          <div className="space-y-2">
            {jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-card">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link to={`/job/${job.id}`} className="font-semibold text-foreground hover:text-primary truncate">
                      {job.title}
                    </Link>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {job.company} · {job.location.join(", ")} · {job.type} · {new Date(job.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`/edit-job/${job.id}?from=admin`)}>
                    <Pencil className="h-3.5 w-3.5" /> 수정
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="gap-1.5">
                        <Trash2 className="h-3.5 w-3.5" /> 삭제
                      </Button>
                    </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>공고를 삭제하시겠습니까?</AlertDialogTitle>
                      <AlertDialogDescription>
                        "{job.title}" 공고가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteJob(job.id)}>삭제</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
