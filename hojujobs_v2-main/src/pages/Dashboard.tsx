import { useState, useEffect } from "react";
import hojuJobsLogo from "@/assets/hoju-jobs-logo.png";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSEO } from "@/hooks/useSEO";
import { LayoutDashboard, Briefcase, TrendingUp, Eye, ExternalLink, RefreshCw } from "lucide-react";

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

interface ExchangeRate {
  rate: number;
  updatedAt: string;
}

const FLIGHT_ROUTES = [
  { label: "서울 → 시드니", from: "ICN", to: "SYD", toCity: "Sydney" },
  { label: "서울 → 멜버른", from: "ICN", to: "MEL", toCity: "Melbourne" },
  { label: "서울 → 브리즈번", from: "ICN", to: "BNE", toCity: "Brisbane" },
];

function flightSearchUrl(toCity: string) {
  return `https://www.google.com/travel/flights?q=flights+from+Seoul+to+${toCity}`;
}

export default function Dashboard() {
  useSEO({ title: "대시보드 | 호주잡스", description: "호주잡스 관리자 대시보드", noindex: true });
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/");
      return;
    }
    if (user && isAdmin) {
      fetchData();
      fetchExchangeRate();
    }
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

  const fetchExchangeRate = async () => {
    setLoadingRate(true);
    try {
      const res = await fetch("https://api.frankfurter.app/latest?from=KRW&to=AUD");
      const data = await res.json();
      setExchangeRate({ rate: data.rates.AUD, updatedAt: data.date });
    } catch {
      setExchangeRate(null);
    }
    setLoadingRate(false);
  };

  if (loading) return <div className="flex w-full min-h-0 flex-1 items-center justify-center bg-background text-muted-foreground">로딩 중...</div>;
  if (!isAdmin) return null;

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="mb-6">
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
            {/* Site stats */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              <StatCard icon={<Briefcase className="h-4 w-4 text-primary" />} label="전체 공고" value={stats?.totalJobs ?? 0} />
              <StatCard icon={<TrendingUp className="h-4 w-4 text-green-500" />} label="최근 7일 공고" value={stats?.jobsLast7Days ?? 0} />
              <StatCard icon={<Eye className="h-4 w-4 text-orange-500" />} label="누적 조회수" value={stats?.totalViews ?? 0} />
            </div>

            {/* Exchange rate */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground">환율 · 원화 → 호주 달러</h2>
                <button onClick={fetchExchangeRate} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <RefreshCw className="h-3 w-3" /> 새로고침
                </button>
              </div>
              <div className="rounded-lg border bg-card p-5">
                {loadingRate ? (
                  <p className="text-sm text-muted-foreground">불러오는 중...</p>
                ) : exchangeRate ? (
                  <div className="flex items-end gap-4">
                    <div>
                      <p className="text-3xl font-bold text-foreground">
                        ₩1,000 = A${(exchangeRate.rate * 1000).toFixed(4)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        1 KRW = {exchangeRate.rate.toFixed(6)} AUD · 기준일: {exchangeRate.updatedAt}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-2xl font-semibold text-foreground">
                        A$1 = ₩{Math.round(1 / exchangeRate.rate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">환율 정보를 불러올 수 없습니다.</p>
                )}
              </div>
            </div>

            {/* Flights */}
            <div className="mb-10">
              <h2 className="text-sm font-semibold text-foreground mb-3">항공편 · 서울 → 호주 (Google Flights)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {FLIGHT_ROUTES.map((route) => (
                  <a
                    key={route.to}
                    href={flightSearchUrl(route.toCity)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all flex items-center justify-between gap-2 group"
                  >
                    <div>
                      <p className="font-semibold text-foreground text-sm">{route.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{route.from} → {route.to}</p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </a>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Google Flights에서 최저가 검색</p>
            </div>

            {/* Recent jobs */}
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
