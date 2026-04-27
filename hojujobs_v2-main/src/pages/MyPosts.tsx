import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Plus, Pencil, Trash2, Briefcase } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

interface Job {
  id: number;
  title: string | null;
  location: string[] | null;
  industry: string | null;
  uploaded_at: string | null;
}

export default function MyPosts() {
  useSEO({ title: "내 공고 | Hoju Jobs", description: "Hoju Jobs 내 공고 관리", noindex: true });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchMyJobs();
  }, [user]);

  const fetchMyJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("id, title, location, industry, uploaded_at")
      .eq("user_id", user!.id)
      .order("uploaded_at", { ascending: false });

    if (error) {
      toast.error("공고 불러오기 실패");
    } else {
      setJobs(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("이 공고를 삭제하시겠습니까?")) return;

    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", id)
      .eq("user_id", user!.id);

    if (error) {
      toast.error("삭제 실패: " + error.message);
    } else {
      toast.success("공고가 삭제되었습니다.");
      setJobs((prev) => prev.filter((j) => j.id !== id));
    }
  };

  if (!user) return null;

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col">
      <Header />
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            홈으로
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">내 공고 관리</h2>
          <Button onClick={() => navigate("/post-job")}>
            <Plus className="h-4 w-4 mr-1.5" /> 새 공고
          </Button>
        </div>

        {loading ? (
          <p className="text-center py-16 text-muted-foreground">불러오는 중...</p>
        ) : jobs.length === 0 ? (
          <div className="text-center py-24 space-y-5">
            <Briefcase className="h-14 w-14 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground">등록한 공고가 없습니다.</p>
            <Button onClick={() => navigate("/post-job")}>첫 공고 등록하기</Button>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl">
            {jobs.map((job) => (
              <div key={job.id} className="bg-card border border-border rounded-xl px-5 py-4 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow">
                <div className="min-w-0">
                  <Link to={`/job/${job.id}`} className="text-sm font-bold text-foreground hover:text-primary transition-colors truncate block mb-0.5">
                    {job.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {(job.location || []).join(", ")}
                    {job.industry ? ` · ${job.industry}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => navigate(`/edit-job/${job.id}`)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(job.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
