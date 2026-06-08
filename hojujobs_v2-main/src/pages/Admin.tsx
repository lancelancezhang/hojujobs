import { useCallback, useEffect, useState } from "react";
import hojuJobsLogo from "@/assets/hoju-jobs-logo.png";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Shield, ExternalLink, Pencil, MapPin, Check, X, Sparkles, ShoppingBag, Users } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { LocationPicker } from "@/components/LocationPicker";
import { Pagination } from "@/components/Pagination";
import { cn } from "@/lib/utils";
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
  title: string | null;
  location: string[] | null;
  industry: string | null;
  uploaded_at: string | null;
  user_id: string | null;
  Promoted: boolean | null;
}

interface Deal {
  rank: number;
  title: string;
  category: string;
  image_url: string | null;
  uploaded_at: string;
  promoted: boolean;
}

interface UserActivityRow {
  user_id: string;
  email: string | null;
  display_name: string | null;
  total_events: number;
  job_views: number;
  rental_views: number;
  sale_views: number;
  flatmates_page_views: number;
  sales_page_views: number;
  news_page_views: number;
  dashboard_page_views: number;
  phone_clicks: number;
  email_clicks: number;
  kakao_clicks: number;
  total_contact_clicks: number;
  contact_text_selections: number;
  job_posts_started: number;
  job_posts_submitted: number;
  rental_posts_started: number;
  rental_posts_submitted: number;
  searches_performed: number;
  filters_changed: number;
  first_activity: string | null;
  last_activity: string | null;
}

const ADMIN_PAGE_SIZE = 25;
const VISIBLE_JOB_DAYS = 6;

function clearPromotionCaches() {
  try {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("hoju_listing_cache_")) sessionStorage.removeItem(key);
    });
    sessionStorage.removeItem("hoju_sales_cache");
  } catch {
    // Session storage may be unavailable in private or restricted browser contexts.
  }
}

export default function Admin() {
  useSEO({ title: "관리자 | Hoju Jobs", description: "Hoju Jobs 관리자 페이지", noindex: true });
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const [jobPage, setJobPage] = useState(1);
  const [dealPage, setDealPage] = useState(1);
  const [totalJobsCount, setTotalJobsCount] = useState(0);
  const [totalDealsCount, setTotalDealsCount] = useState(0);
  const [promotedJobsCount, setPromotedJobsCount] = useState(0);
  const [promotedDealsCount, setPromotedDealsCount] = useState(0);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [editingLocationId, setEditingLocationId] = useState<number | null>(null);
  const [editingLocations, setEditingLocations] = useState<string[]>([]);
  const [savingLocation, setSavingLocation] = useState(false);
  const [savingPromotionKey, setSavingPromotionKey] = useState<string | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivityRow[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [activitySearch, setActivitySearch] = useState("");

  const fetchJobs = useCallback(async (page = jobPage) => {
    setLoadingJobs(true);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - VISIBLE_JOB_DAYS);
    const from = (page - 1) * ADMIN_PAGE_SIZE;
    const to = from + ADMIN_PAGE_SIZE - 1;

    const { data, error, count } = await supabase
      .from("jobs")
      .select("id, title, location, industry, uploaded_at, user_id, Promoted", { count: "exact" })
      .gte("uploaded_at", cutoff.toISOString())
      .lte("uploaded_at", new Date().toISOString())
      .order("uploaded_at", { ascending: false })
      .range(from, to);

    const { count: promotedCount } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("Promoted", true)
      .gte("uploaded_at", cutoff.toISOString())
      .lte("uploaded_at", new Date().toISOString());

    if (!error && data) {
      setJobs(data);
      setTotalJobsCount(count ?? data.length);
      setPromotedJobsCount(promotedCount ?? 0);
      setAvailableLocations([...new Set(data.flatMap((j) => j.location ?? []))].sort());
    }
    setLoadingJobs(false);
  }, [jobPage]);

  const fetchDeals = useCallback(async (page = dealPage) => {
    setLoadingDeals(true);
    const from = (page - 1) * ADMIN_PAGE_SIZE;
    const to = from + ADMIN_PAGE_SIZE - 1;

    const { data, error, count } = await supabase
      .from("ozbargain_deals")
      .select("rank, title, category, image_url, uploaded_at, promoted", { count: "exact" })
      .order("promoted", { ascending: false })
      .order("rank", { ascending: true })
      .range(from, to);

    const { count: promotedCount } = await supabase
      .from("ozbargain_deals")
      .select("rank", { count: "exact", head: true })
      .eq("promoted", true);

    if (!error && data) {
      setDeals(data);
      setTotalDealsCount(count ?? data.length);
      setPromotedDealsCount(promotedCount ?? 0);
    }
    setLoadingDeals(false);
  }, [dealPage]);

  const fetchUserActivity = useCallback(async () => {
    setLoadingActivity(true);
    const { data, error } = await supabase
      .from("user_activity_summary" as "jobs")
      .select("*")
      .order("last_activity", { ascending: false }) as unknown as { data: UserActivityRow[] | null; error: unknown };
    if (!error && data) setUserActivity(data);
    setLoadingActivity(false);
  }, []);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/");
      return;
    }
    if (user && isAdmin) fetchJobs(jobPage);
  }, [user, isAdmin, loading, jobPage, navigate, fetchJobs]);

  useEffect(() => {
    if (user && isAdmin) fetchDeals(dealPage);
  }, [user, isAdmin, dealPage, fetchDeals]);

  const startEditingLocation = (job: Job) => {
    setEditingLocationId(job.id);
    setEditingLocations(job.location ?? []);
  };

  const cancelEditingLocation = () => {
    setEditingLocationId(null);
    setEditingLocations([]);
  };

  const saveLocation = async (id: number) => {
    setSavingLocation(true);
    const { error } = await supabase.from("jobs").update({ location: editingLocations }).eq("id", id);
    if (error) {
      toast.error("저장 실패: " + error.message);
    } else {
      toast.success("지역이 수정되었습니다.");
      setJobs((prev) => prev.map((j) => j.id === id ? { ...j, location: editingLocations } : j));
      setEditingLocationId(null);
    }
    setSavingLocation(false);
  };

  const deleteJob = async (id: number) => {
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (error) {
      toast.error("삭제 실패: " + error.message);
    } else {
      toast.success("공고가 삭제되었습니다.");
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setTotalJobsCount((prev) => Math.max(0, prev - 1));
      clearPromotionCaches();
    }
  };

  const toggleJobPromotion = async (job: Job, promoted: boolean) => {
    const key = `job-${job.id}`;
    setSavingPromotionKey(key);
    const { error } = await supabase.from("jobs").update({ Promoted: promoted }).eq("id", job.id);

    if (error) {
      toast.error("추천 공고 저장 실패: " + error.message);
    } else {
      setJobs((prev) => prev.map((item) => item.id === job.id ? { ...item, Promoted: promoted } : item));
      setPromotedJobsCount((prev) => promoted ? prev + 1 : Math.max(0, prev - 1));
      clearPromotionCaches();
      toast.success(promoted ? "추천 공고로 설정되었습니다." : "추천 공고에서 해제되었습니다.");
    }

    setSavingPromotionKey(null);
  };

  const toggleDealPromotion = async (deal: Deal, promoted: boolean) => {
    const key = `deal-${deal.rank}`;
    setSavingPromotionKey(key);
    const { error } = await supabase.from("ozbargain_deals").update({ promoted }).eq("rank", deal.rank);

    if (error) {
      toast.error("메인 카드 딜 저장 실패: " + error.message);
    } else {
      setDeals((prev) => prev.map((item) => item.rank === deal.rank ? { ...item, promoted } : item));
      setPromotedDealsCount((prev) => promoted ? prev + 1 : Math.max(0, prev - 1));
      clearPromotionCaches();
      toast.success(promoted ? "메인 카드 딜로 설정되었습니다." : "메인 카드 딜에서 해제되었습니다.");
    }

    setSavingPromotionKey(null);
  };

  if (loading) return <div className="flex w-full min-h-0 flex-1 items-center justify-center bg-background text-muted-foreground">로딩 중...</div>;
  if (!isAdmin) return null;

  return (
    <div className="flex w-full min-w-0 min-h-0 flex-1 flex-col overflow-x-hidden bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
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

        <Tabs defaultValue="jobs" className="w-full min-w-0">
          <TabsList className="mb-5 grid w-full grid-cols-3 sm:w-[32rem]">
            <TabsTrigger value="jobs" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              공고
            </TabsTrigger>
            <TabsTrigger value="deals" className="gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5" />
              딜
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-1.5" onClick={() => { if (userActivity.length === 0) fetchUserActivity(); }}>
              <Users className="h-3.5 w-3.5" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="mt-0">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  추천 공고 선택
                </h3>
                <p className="text-sm text-muted-foreground">
                  현재 사이트에 보이는 공고 <span className="font-semibold text-foreground">{totalJobsCount}</span>개를 페이지별로 관리합니다.
                </p>
              </div>
              <p className="text-xs font-semibold text-amber-700">선택됨 {promotedJobsCount}</p>
            </div>

            {loadingJobs ? (
              <div className="text-center py-16 text-muted-foreground">불러오는 중...</div>
            ) : jobs.length === 0 ? (
              <div className="rounded-lg border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
                현재 보이는 공고가 없습니다.
              </div>
            ) : (
              <div className="space-y-1.5">
                {jobs.map((job) => (
                  <div key={job.id} className="w-full min-w-0 space-y-1.5 rounded-lg border bg-card p-2.5">
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <Link to={`/job/${job.id}`} className="truncate text-sm font-semibold text-foreground hover:text-primary">
                            {job.title}
                          </Link>
                          <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {(job.location || []).join(", ")}
                          {job.industry ? `  ${job.industry}` : ""}
                          {job.uploaded_at ? `  ${new Date(job.uploaded_at).toLocaleDateString("ko-KR")}` : ""}
                        </p>
                      </div>
                      <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:justify-end">
                        <div className="flex h-7 items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2">
                          <Sparkles className="h-3 w-3 text-amber-600" />
                          <span className="text-xs font-semibold text-amber-800">추천</span>
                          <Switch
                            checked={job.Promoted === true}
                            disabled={savingPromotionKey === `job-${job.id}`}
                            onCheckedChange={(checked) => void toggleJobPromotion(job, checked)}
                            aria-label={`${job.title ?? "공고"} 추천 공고 설정`}
                          />
                        </div>
                        <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => startEditingLocation(job)}>
                          <MapPin className="h-3 w-3" /> 지역
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => navigate(`/edit-job/${job.id}?from=admin`)}>
                          <Pencil className="h-3 w-3" /> 수정
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="h-7 gap-1 px-2 text-xs">
                              <Trash2 className="h-3 w-3" /> 삭제
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
                    {editingLocationId === job.id && (
                      <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
                        <div className="min-w-0 flex-1">
                          <LocationPicker
                            availableLocations={availableLocations}
                            selectedLocations={editingLocations}
                            onLocationsChange={setEditingLocations}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" className="gap-1.5 shrink-0" onClick={() => saveLocation(job.id)} disabled={savingLocation}>
                            <Check className="h-3.5 w-3.5" /> 저장
                          </Button>
                          <Button size="sm" variant="ghost" className="shrink-0" onClick={cancelEditingLocation}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <Pagination
                  currentPage={jobPage}
                  totalPages={Math.ceil(totalJobsCount / ADMIN_PAGE_SIZE)}
                  onPageChange={(nextPage) => { setJobPage(nextPage); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="deals" className="mt-0">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                  <ShoppingBag className="h-4 w-4 text-emerald-600" />
                  메인 카드 딜 선택
                </h3>
                <p className="text-sm text-muted-foreground">
                  온세일 딜 <span className="font-semibold text-foreground">{totalDealsCount}</span>개 중 메인 페이지에 보여줄 예시 딜을 선택하세요.
                </p>
              </div>
              <p className="text-xs font-semibold text-emerald-700">선택됨 {promotedDealsCount}</p>
            </div>

            {loadingDeals ? (
              <div className="text-center py-16 text-muted-foreground">딜 불러오는 중...</div>
            ) : deals.length === 0 ? (
              <div className="rounded-lg border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
                등록된 딜이 없습니다.
              </div>
            ) : (
              <div className="space-y-2">
                {deals.map((deal) => (
                  <div key={deal.rank} className="relative flex w-full min-w-0 items-center gap-3 rounded-lg border bg-card p-2.5 pr-16">
                    {deal.image_url && (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white p-1">
                        <img
                          src={deal.image_url}
                          alt={deal.title}
                          className="max-h-full w-full object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <Link to={`/sales/${deal.rank}`} className="truncate text-sm font-semibold text-foreground hover:text-primary">
                          {deal.title}
                        </Link>
                        <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        #{deal.rank}  {deal.category}  {new Date(deal.uploaded_at).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 p-1.5">
                      <ShoppingBag className="h-3 w-3 text-emerald-700" />
                      <Switch
                        checked={deal.promoted}
                        disabled={savingPromotionKey === `deal-${deal.rank}`}
                        onCheckedChange={(checked) => void toggleDealPromotion(deal, checked)}
                        aria-label={`${deal.title} 메인 카드 딜 설정`}
                      />
                    </div>
                  </div>
                ))}
                <Pagination
                  currentPage={dealPage}
                  totalPages={Math.ceil(totalDealsCount / ADMIN_PAGE_SIZE)}
                  onPageChange={(nextPage) => { setDealPage(nextPage); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                />
              </div>
            )}
          </TabsContent>
          <TabsContent value="activity" className="mt-0">
            <UserActivityTab
              rows={userActivity}
              loading={loadingActivity}
              search={activitySearch}
              onSearchChange={setActivitySearch}
              onRefresh={fetchUserActivity}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  if (!value) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-semibold", color)}>
      {value}
    </span>
  );
}

function formatRelative(iso: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-AU", { month: "short", day: "numeric" }).format(new Date(iso));
}

function UserActivityTab({
  rows,
  loading,
  search,
  onSearchChange,
  onRefresh,
}: {
  rows: UserActivityRow[];
  loading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  onRefresh: () => void;
}) {
  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (r.email ?? "").toLowerCase().includes(q) || (r.display_name ?? "").toLowerCase().includes(q);
  });

  const totalEvents = rows.reduce((s, r) => s + (r.total_events ?? 0), 0);
  const totalUsers = rows.length;

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
            <Users className="h-4 w-4 text-blue-500" />
            User Activity Summary
          </h3>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{totalUsers}</span> users ·{" "}
            <span className="font-semibold text-foreground">{totalEvents.toLocaleString()}</span> events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search email or name"
            className="h-8 w-48 rounded-md border border-input bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
          />
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onRefresh} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
          {search ? "No results found." : "No activity data yet."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-semibold">User</th>
                <th className="px-3 py-2.5 text-center font-semibold">Total</th>
                <th className="px-3 py-2.5 text-center font-semibold border-l">Jobs</th>
                <th className="px-3 py-2.5 text-center font-semibold">Rentals</th>
                <th className="px-3 py-2.5 text-center font-semibold">Deals</th>
                <th className="px-3 py-2.5 text-center font-semibold border-l">Flatmates</th>
                <th className="px-3 py-2.5 text-center font-semibold">On Sale</th>
                <th className="px-3 py-2.5 text-center font-semibold">News</th>
                <th className="px-3 py-2.5 text-center font-semibold">Dashboard</th>
                <th className="px-3 py-2.5 text-center font-semibold border-l">Contacts</th>
                <th className="px-3 py-2.5 text-center font-semibold border-l">Job Post</th>
                <th className="px-3 py-2.5 text-center font-semibold">Rental Post</th>
                <th className="px-3 py-2.5 text-right font-semibold border-l">Last Active</th>
              </tr>
              <tr className="border-t text-[10px]">
                <th className="px-4 pb-1.5 text-left" />
                <th className="px-3 pb-1.5 text-center text-muted-foreground/70">events</th>
                <th className="px-3 pb-1.5 text-center border-l text-muted-foreground/70">views</th>
                <th className="px-3 pb-1.5 text-center text-muted-foreground/70">views</th>
                <th className="px-3 pb-1.5 text-center text-muted-foreground/70">views</th>
                <th className="px-3 pb-1.5 text-center border-l text-muted-foreground/70">visits</th>
                <th className="px-3 pb-1.5 text-center text-muted-foreground/70">visits</th>
                <th className="px-3 pb-1.5 text-center text-muted-foreground/70">visits</th>
                <th className="px-3 pb-1.5 text-center text-muted-foreground/70">visits</th>
                <th className="px-3 pb-1.5 text-center border-l text-muted-foreground/70">clicks</th>
                <th className="px-3 pb-1.5 text-center border-l text-muted-foreground/70">submitted</th>
                <th className="px-3 pb-1.5 text-center text-muted-foreground/70">submitted</th>
                <th className="px-3 pb-1.5 text-right border-l" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((row) => (
                <tr key={row.user_id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 min-w-[160px]">
                    <p className="font-semibold text-foreground truncate max-w-[200px]">
                      {row.display_name ?? <span className="text-muted-foreground font-normal italic">No name</span>}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{row.email ?? "—"}</p>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <Stat label="total" value={row.total_events} color="bg-slate-100 text-slate-700" />
                  </td>
                  <td className="px-3 py-2.5 text-center border-l">
                    <Stat label="job_views" value={row.job_views} color="bg-blue-50 text-blue-700" />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <Stat label="rental_views" value={row.rental_views} color="bg-rose-50 text-rose-700" />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <Stat label="sale_views" value={row.sale_views} color="bg-emerald-50 text-emerald-700" />
                  </td>
                  <td className="px-3 py-2.5 text-center border-l">
                    <Stat label="flatmates" value={row.flatmates_page_views} color="bg-pink-50 text-pink-700" />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <Stat label="sales" value={row.sales_page_views} color="bg-teal-50 text-teal-700" />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <Stat label="news" value={row.news_page_views} color="bg-indigo-50 text-indigo-700" />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <Stat label="dashboard" value={row.dashboard_page_views} color="bg-amber-50 text-amber-700" />
                  </td>
                  <td className="px-3 py-2.5 text-center border-l">
                    <Stat label="contact" value={row.total_contact_clicks} color="bg-orange-50 text-orange-700" />
                  </td>
                  <td className="px-3 py-2.5 text-center border-l">
                    <Stat label="job_post" value={row.job_posts_submitted} color="bg-violet-50 text-violet-700" />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <Stat label="rental_post" value={row.rental_posts_submitted} color="bg-fuchsia-50 text-fuchsia-700" />
                  </td>
                  <td className="px-3 py-2.5 text-right border-l">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{formatRelative(row.last_activity)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
