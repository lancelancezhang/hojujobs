import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Briefcase, Home, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

interface Job {
  id: number;
  title: string | null;
  location: string[] | null;
  industry: string | null;
  uploaded_at: string | null;
}

interface RentListing {
  id: number;
  title: string | null;
  suburb: string | null;
  state_location: string | null;
  price: number | null;
  uploaded_at: string | null;
}

export default function MyPosts() {
  useSEO({ title: "내 프로필 | Hoju Jobs", description: "Hoju Jobs 내 공고 관리", noindex: true });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [rentListings, setRentListings] = useState<RentListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    const [jobsRes, rentRes] = await Promise.all([
      supabase
        .from("jobs")
        .select("id, title, location, industry, uploaded_at")
        .eq("user_id", user!.id)
        .order("uploaded_at", { ascending: false }),
      supabase
        .from("hojunara_realestate_share")
        .select("id, title, suburb, state_location, price, uploaded_at")
        .eq("user_id", user!.id)
        .order("uploaded_at", { ascending: false }),
    ]);

    if (jobsRes.error) toast.error("공고 불러오기 실패");
    else setJobs(jobsRes.data || []);

    if (rentRes.error) toast.error("렌트 게시글 불러오기 실패");
    else setRentListings(rentRes.data || []);

    setLoading(false);
  };

  const handleDeleteJob = async (id: number) => {
    if (!confirm("이 공고를 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("jobs").delete().eq("id", id).eq("user_id", user!.id);
    if (error) toast.error("삭제 실패: " + error.message);
    else {
      toast.success("공고가 삭제되었습니다.");
      setJobs((prev) => prev.filter((j) => j.id !== id));
    }
  };

  const handleDeleteRent = async (id: number) => {
    if (!confirm("이 렌트 게시글을 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("hojunara_realestate_share").delete().eq("id", id).eq("user_id", user!.id);
    if (error) toast.error("삭제 실패: " + error.message);
    else {
      toast.success("게시글이 삭제되었습니다.");
      setRentListings((prev) => prev.filter((r) => r.id !== id));
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
          <h2 className="text-2xl font-bold text-foreground">내 프로필</h2>
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5 text-muted-foreground hover:text-primary">
            <LogOut className="h-4 w-4" /> 로그아웃
          </Button>
        </div>

        {loading ? (
          <p className="text-center py-16 text-muted-foreground">불러오는 중...</p>
        ) : (
          <div className="space-y-10 max-w-3xl">

            {/* Job listings */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                  <Briefcase className="h-4 w-4 text-primary" />
                  내 구인공고
                </h3>
                <Button size="sm" onClick={() => navigate("/post-job")}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> 새 일자리
                </Button>
              </div>
              {jobs.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-muted/30 py-10 text-center">
                  <p className="text-sm text-muted-foreground">등록한 공고가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {jobs.map((job) => (
                    <div key={job.id} className="bg-card border border-border rounded-xl px-5 py-4 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow">
                      <div className="min-w-0">
                        <Link to={`/job/${job.id}`} className="text-sm font-bold text-foreground hover:text-primary transition-colors truncate block mb-0.5">
                          {job.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {(job.location || []).join(", ")}
                          {job.industry ? `  ${job.industry}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/edit-job/${job.id}`)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteJob(job.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Rent listings */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                  <Home className="h-4 w-4 text-primary" />
                  내 렌트 게시글
                </h3>
                <Button size="sm" onClick={() => navigate("/flatmates/post")}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> 새 렌트
                </Button>
              </div>
              {rentListings.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-muted/30 py-10 text-center">
                  <p className="text-sm text-muted-foreground">등록한 렌트 게시글이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {rentListings.map((listing) => (
                    <div key={listing.id} className="bg-card border border-border rounded-xl px-5 py-4 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow">
                      <div className="min-w-0">
                        <Link to={`/flatmates/${listing.id}`} className="text-sm font-bold text-foreground hover:text-primary transition-colors truncate block mb-0.5">
                          {listing.title ?? "제목 없음"}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {[listing.suburb, listing.state_location].filter(Boolean).join(", ")}
                          {listing.price ? `  $${listing.price}/주` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteRent(listing.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        )}
      </div>
    </div>
  );
}
