import { useState, useEffect } from "react";
import hojuJobsLogo from "@/assets/hoju-jobs-logo.png";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSEO } from "@/hooks/useSEO";
import { LayoutDashboard, Briefcase, TrendingUp, Eye } from "lucide-react";

interface Stats {
  totalJobs: number;
  jobsLast7Days: number;
  totalViews: number;
}

interface RecentJob {
  id: number;
  title: string | null;
  industry: string | null;
  uploaded_at: string | null;
}

export default function Dashboard() {
  useSEO({ title: "대시보드 | 호주잡스", description: "호주잡스 관리자 대시보드", noindex: true });
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/");
      return;
    }
    if (user && isAdmin) fetchData();
  }, [user, isAdmin, loading]);

  const fetchData = async () => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    const [jobsRes, recentRes, viewsRes] = await Promise.all([
      supabase.from("jobs").select("id", { count: "exact", head: true }),
      supabase.from("jobs").select("id, title, industry, uploaded_at").gte("uploaded_at", cutoff.toISOString()).order("uploaded_at", { ascending: false }).limit(5),
      supabase.from("view_counts").select("count"),
    ]);

    const totalViews = (viewsRes.data ?? []).reduce((sum, row) => sum + (row.count ?? 0), 0);

    setStats({
      totalJobs: jobsRes.count ?? 0,
      jobsLast7Days: recentRes.data?.length ?? 0,
      totalViews,
    });
    setRecentJobs(recentRes.data ?? []);
    setLoadingData(false);
  };

  if (loading) return <div className="flex w-full min-h-0 flex-1 items-center justify-center bg-background text-muted-foreground">로딩 중...</div>;
  if (!isAdmin) return null;

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="mb-6 space-y-4">
          <Link to="/">
            <img src={hojuJobsLogo} alt="Hoju Jobs" className="h-8 hover:opacity-80 transition-opacity" />
          </Link>
        </div>

        <div className="flex items-center gap-2 mb-8">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">대시보드</h1>
        </div>

        {loadingData ? (
          <div className="text-center py-16 text-muted-foreground">불러오는 중...</div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <StatCard icon={<Briefcase className="h-4 w-4 text-primary" />} label="전체 공고" value={stats?.totalJobs ?? 0} />
              <StatCard icon={<TrendingUp className="h-4 w-4 text-green-500" />} label="최근 7일 공고" value={stats?.jobsLast7Days ?? 0} />
              <StatCard icon={<Eye className="h-4 w-4 text-orange-500" />} label="누적 조회수" value={stats?.totalViews ?? 0} />
            </div>

            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">최근 등록 공고</h2>
              <Link to="/admin" className="text-xs text-primary hover:underline">전체 관리 →</Link>
            </div>
            <div className="space-y-2">
              {recentJobs.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">최근 공고가 없습니다.</p>
              )}
              {recentJobs.map((job) => (
                <Link key={job.id} to={`/job/${job.id}`} className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:border-primary/30 hover:shadow-sm transition-all">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{job.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {job.industry}
                      {job.uploaded_at ? ` · ${new Date(job.uploaded_at).toLocaleDateString("ko-KR")}` : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-muted-foreground">{label}</span></div>
      <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
    </div>
  );
}
