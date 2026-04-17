import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { MobileLocationFilter } from "@/components/MobileLocationFilter";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobCard } from "@/components/JobCard";
import { Pagination } from "@/components/Pagination";
import { CategorySidebar } from "@/components/CategorySidebar";
import { useViewCounts } from "@/hooks/useViewCounts";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

import { useSEO } from "@/hooks/useSEO";

const ITEMS_PER_PAGE = 25;

type SortOption = "recent" | "views";

interface Job {
  id: number;
  title: string;
  location: string[];
  industry: string;
  uploaded_at: string;
}

const FILTER_STORAGE_KEY = "hoju_filters";

function loadSavedFilters() {
  try {
    const raw = sessionStorage.getItem(FILTER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

const Index = () => {
  const saved = useMemo(() => loadSavedFilters(), []);
  const [keyword, setKeyword] = useState(saved?.keyword ?? "");
  const [selectedLocations, setSelectedLocations] = useState<string[]>(saved?.locations ?? []);
  const [industry, setIndustry] = useState(saved?.industry ?? "all");
  const [page, setPage] = useState(saved?.page ?? 1);
  const [sortBy, setSortBy] = useState<SortOption>(saved?.sortBy ?? "recent");
  const [jobsData, setJobsData] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const { counts, increment, getCount } = useViewCounts();
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  useSEO({
    title: "Hoju Jobs - 호주 한인 구인구직",
    description: "호주 한인 커뮤니티 구인구직 게시판. 시드니, 멜번, 브리즈번 등 호주 전역 한인 채용정보를 찾아보세요.",
    canonical: "https://hojujobs.com/",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Hoju Jobs",
      url: "https://hojujobs.com/",
      description: "호주 한인 커뮤니티 구인구직 게시판",
      inLanguage: "ko",
    },
  });

  // Persist filters to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify({
      keyword, locations: selectedLocations, industry, page, sortBy,
    }));
  }, [keyword, selectedLocations, industry, page, sortBy]);

  useEffect(() => {
    async function fetchJobs() {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, location, industry, uploaded_at")
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("jobs fetch error:", error);
      } else if (data) {
        setJobsData(data as Job[]);
      }
      setLoadingJobs(false);
    }
    fetchJobs();
  }, []);

  // Restore scroll position after returning from a job detail page
  const scrollRestored = useRef(false);
  useEffect(() => {
    if (!loadingJobs && !scrollRestored.current) {
      scrollRestored.current = true;
      const savedY = sessionStorage.getItem("hoju_scroll_y");
      if (savedY) {
        sessionStorage.removeItem("hoju_scroll_y");
        setTimeout(() => window.scrollTo({ top: Number(savedY) }), 50);
      }
    }
  }, [loadingJobs]);

  const locations = useMemo(() => {
    const countMap: Record<string, number> = {};
    jobsData.forEach((j) => { j.location.forEach((loc) => { countMap[loc] = (countMap[loc] || 0) + 1; }); });
    const allLocs = jobsData.flatMap((j) => j.location);
    return [...new Set(allLocs)].sort((a, b) => (countMap[b] || 0) - (countMap[a] || 0));
  }, [jobsData]);
  const industries = useMemo(() => [...new Set(jobsData.map((j) => j.industry))].sort(), [jobsData]);

  const filtered = useMemo(() => {
    const result = jobsData.filter((job) => {
      const kw = keyword.toLowerCase();
      const matchKeyword = !kw || job.title.toLowerCase().includes(kw);
      const matchLocation = selectedLocations.length === 0 || job.location.some((loc) => selectedLocations.includes(loc));
      const matchIndustry = industry === "all" || job.industry === industry;
      return matchKeyword && matchLocation && matchIndustry;
    });

    if (sortBy === "views") {
      result.sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0));
    } else {
      result.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
    }

    return result;
  }, [keyword, selectedLocations, industry, sortBy, counts, jobsData]);

  const locationCounts = useMemo(() => {
    const c: Record<string, number> = {};
    jobsData.forEach((j) => { j.location.forEach((loc) => { c[loc] = (c[loc] || 0) + 1; }); });
    return c;
  }, [jobsData]);

  const industryCounts = useMemo(() => {
    const c: Record<string, number> = {};
    jobsData.forEach((j) => { c[j.industry] = (c[j.industry] || 0) + 1; });
    return c;
  }, [jobsData]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentPage = Math.min(page, totalPages || 1);
  const paginatedJobs = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleReset = () => {
    setSelectedLocations([]);
    setIndustry("all");
    setKeyword("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-[14rem_1fr] lg:gap-8">
          <div className="hidden lg:block">
            <div className="sticky top-4">
            <CategorySidebar
              locations={locations}
              industries={industries}
              selectedLocations={selectedLocations}
              selectedIndustry={industry}
              onLocationsChange={(v) => { setSelectedLocations(v); setPage(1); }}
              onIndustryChange={(v) => { setIndustry(v); setPage(1); }}
              onReset={handleReset}
              locationCounts={locationCounts}
              industryCounts={industryCounts}
            />
            </div>
          </div>

          <div className="min-w-0">
            <div className="space-y-3 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="키워드 검색 (예: 바리스타, 네일, 마사지...)"
                  value={keyword}
                  onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { (e.target as HTMLInputElement).blur(); } }}
                  className="pl-10"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                <div className="lg:hidden contents sm:contents">
                  <MobileLocationFilter
                    locations={locations}
                    selectedLocations={selectedLocations}
                    onLocationsChange={(v) => { setSelectedLocations(v); setPage(1); }}
                    locationCounts={locationCounts}
                  />
                </div>
                <div className="lg:hidden contents sm:contents">
                  <Select value={industry} onValueChange={(v) => { setIndustry(v); setPage(1); }}>
                    <SelectTrigger className={cn("w-full", industry !== "all" && "border-primary/50 bg-primary/5 text-primary")}><SelectValue placeholder="업종" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 업종</SelectItem>
                      {industries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                총 <span className="font-semibold text-foreground">{filtered.length}</span>개의 공고
              </p>
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(v) => { setSortBy(v as SortOption); setPage(1); }}>
                  <SelectTrigger className="w-[130px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">최신순</SelectItem>
                    <SelectItem value="views">조회순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              {loadingJobs ? (
                <div className="text-center py-16 text-muted-foreground">불러오는 중...</div>
              ) : paginatedJobs.length > 0 ? (
                paginatedJobs.map((job) => (
                  <JobCard key={job.id} job={job} viewCount={getCount(job.id)} />
                ))
              ) : (
                <div className="text-center py-16 text-muted-foreground">검색 결과가 없습니다.</div>
              )}
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => { setPage(p); sessionStorage.removeItem("hoju_scroll_y"); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
          </div>
        </div>
      </div>

      <footer className="border-t border-border bg-muted/30 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>문의: <a href="mailto:admin.hojujobs@gmail.com" className="text-primary hover:underline">admin.hojujobs@gmail.com</a></p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
