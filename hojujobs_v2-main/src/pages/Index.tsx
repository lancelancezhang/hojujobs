import { useState, useMemo, useEffect, useRef } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { MobileLocationFilter } from "@/components/MobileLocationFilter";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobCard } from "@/components/JobCard";
import { PromotedJobCard } from "@/components/PromotedJobCard";
import { Pagination } from "@/components/Pagination";
import { CategorySidebar } from "@/components/CategorySidebar";
import { useViewCounts } from "@/hooks/useViewCounts";
import { supabase } from "@/integrations/supabase/client";
import { SUBURB_EN } from "@/data/regionMap";
import { useSEO } from "@/hooks/useSEO";

const ITEMS_PER_PAGE = 25;

type SortOption = "recent" | "views";

interface Job {
  id: number;
  title: string;
  location: string[];
  industry: string;
  uploaded_at: string;
  Promoted?: boolean | null;
}

const CITY_META: Record<string, { title: string; description: string; canonical: string }> = {
  NSW: {
    title: "Hoju Jobs - 시드니 한인 구인구직",
    description: "시드니 한인 구인구직 게시판. 시드니 전 지역 한인 채용정보를 찾아보세요.",
    canonical: "https://hojujobs.com/sydney",
  },
  VIC: {
    title: "Hoju Jobs - 멜버른 한인 구인구직",
    description: "멜버른 한인 구인구직 게시판. 멜버른 전 지역 한인 채용정보를 찾아보세요.",
    canonical: "https://hojujobs.com/melbourne",
  },
  QLD: {
    title: "Hoju Jobs - 브리즈번 한인 구인구직",
    description: "브리즈번 한인 구인구직 게시판. 브리즈번 전 지역 한인 채용정보를 찾아보세요.",
    canonical: "https://hojujobs.com/brisbane",
  },
  SA: {
    title: "Hoju Jobs - 애들레이드 한인 구인구직",
    description: "애들레이드 한인 구인구직 게시판. 애들레이드 전 지역 한인 채용정보를 찾아보세요.",
    canonical: "https://hojujobs.com/adelaide",
  },
};

const DEFAULT_META = {
  title: "Hoju Jobs - 호주 한인 구인구직",
  description: "호주 한인 커뮤니티 구인구직 게시판. 시드니, 멜번, 브리즈번 등 호주 전역 한인 채용정보를 찾아보세요.",
  canonical: "https://hojujobs.com/",
};

interface IndexProps {
  cityFilter?: string;
}

const Index = ({ cityFilter }: IndexProps) => {
  const filterKey = cityFilter ? `hoju_filters_${cityFilter}` : "hoju_filters";

  const saved = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(filterKey);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }, []);

  const [keyword, setKeyword] = useState(saved?.keyword ?? "");
  const [selectedLocations, setSelectedLocations] = useState<string[]>(saved?.locations ?? []);
  const [industry, setIndustry] = useState(saved?.industry ?? "all");
  const [page, setPage] = useState(saved?.page ?? 1);
  const [sortBy, setSortBy] = useState<SortOption>(saved?.sortBy ?? "recent");
  const [jobsData, setJobsData] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const { counts, getCount } = useViewCounts();

  const meta = cityFilter ? (CITY_META[cityFilter] ?? DEFAULT_META) : DEFAULT_META;

  useSEO({
    title: meta.title,
    description: meta.description,
    canonical: meta.canonical,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Hoju Jobs",
      url: meta.canonical,
      description: meta.description,
      inLanguage: "ko",
    },
  });

  useEffect(() => {
    sessionStorage.setItem(filterKey, JSON.stringify({
      keyword, locations: selectedLocations, industry, page, sortBy,
    }));
  }, [keyword, selectedLocations, industry, page, sortBy]);

  useEffect(() => {
    async function fetchJobs() {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, location, industry, uploaded_at, Promoted")
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("jobs fetch error:", error);
      } else if (data) {
        setJobsData(data as unknown as Job[]);
      }
      setLoadingJobs(false);
    }
    fetchJobs();
  }, []);

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

  // Pre-filter by city/state using SUBURB_EN state suffix
  const cityJobs = useMemo(() => {
    if (!cityFilter) return jobsData;
    return jobsData.filter((job) =>
      job.location.some((loc) => (SUBURB_EN[loc] ?? "").endsWith(` ${cityFilter}`))
    );
  }, [jobsData, cityFilter]);

  const promotedJobs = useMemo(() => jobsData.filter((j) => j.Promoted === true), [jobsData]);

  const locations = useMemo(() => {
    const cityLocs = cityJobs.flatMap((j) =>
      cityFilter ? j.location.filter((loc) => (SUBURB_EN[loc] ?? "").endsWith(` ${cityFilter}`)) : j.location
    );
    const countMap: Record<string, number> = {};
    cityLocs.forEach((loc) => { countMap[loc] = (countMap[loc] || 0) + 1; });
    return [...new Set(cityLocs)].sort((a, b) => (countMap[b] || 0) - (countMap[a] || 0));
  }, [cityJobs, cityFilter]);

  const filtered = useMemo(() => {
    const result = cityJobs.filter((job) => {
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
  }, [keyword, selectedLocations, industry, sortBy, counts, cityJobs]);

  const locationCounts = useMemo(() => {
    const c: Record<string, number> = {};
    cityJobs.forEach((j) => {
      (cityFilter ? j.location.filter((loc) => (SUBURB_EN[loc] ?? "").endsWith(` ${cityFilter}`)) : j.location)
        .forEach((loc) => { c[loc] = (c[loc] || 0) + 1; });
    });
    return c;
  }, [cityJobs, cityFilter]);

  const industryCounts = useMemo(() => {
    const c: Record<string, number> = {};
    cityJobs.forEach((j) => { c[j.industry] = (c[j.industry] || 0) + 1; });
    return c;
  }, [cityJobs]);

  const industries = useMemo(() => {
    const seen = new Set<string>();
    return cityJobs
      .map((j) => j.industry)
      .filter((i): i is string => !!i && !seen.has(i) && !!seen.add(i))
      .sort((a, b) => (industryCounts[b] || 0) - (industryCounts[a] || 0));
  }, [cityJobs, industryCounts]);

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
              cityFilter={cityFilter}
            />
            </div>
          </div>

          <div className="min-w-0">
            <div className="space-y-3 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="키워드 검색 (예: 바리스타, 네일, 주방...)"
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
                    cityFilter={cityFilter}
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

            {/* Promoted jobs - only on page 1 with no active filters */}
            {currentPage === 1 && !keyword && selectedLocations.length === 0 && industry === "all" && promotedJobs.length > 0 && (
              <div className="space-y-2 mb-5">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">추천 공고</p>
                {promotedJobs.map((job) => (
                  <PromotedJobCard key={job.id} job={job} viewCount={getCount(job.id)} />
                ))}
                {/* Promote-your-post CTA */}
                <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-amber-700 mb-0.5">📣 내 공고를 상단에 올리세요</p>
                      <p className="text-xs text-amber-800/70 leading-relaxed">추천 공고는 일반 공고보다 <span className="font-semibold">3배 더 많이 조회</span>되고 지원 전환율이 <span className="font-semibold">60% 높습니다</span>. 문의: <a href="mailto:admin.hojujobs@gmail.com" className="font-semibold underline underline-offset-2 hover:text-amber-900">admin.hojujobs@gmail.com</a></p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border/60 pt-1" />
              </div>
            )}

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
