import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowUpDown, ShoppingBag } from "lucide-react";
import { Header } from "@/components/Header";
import { MobileLocationFilter } from "@/components/MobileLocationFilter";
import { MobileIndustryFilter } from "@/components/MobileIndustryFilter";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { JobCard } from "@/components/JobCard";
import { PromotedJobCard } from "@/components/PromotedJobCard";
import { Pagination } from "@/components/Pagination";
import { CategorySidebar } from "@/components/CategorySidebar";
import { fetchViewCountsByJobIds, useViewCounts } from "@/hooks/useViewCounts";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { REGION_GROUPS, SUBURB_EN } from "@/data/regionMap";
import { useSEO } from "@/hooks/useSEO";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 50;
const LISTING_CACHE_TTL_MS = 5 * 60 * 1000;
const LISTING_CACHE_VERSION = 6;
const PROMO_CITY_FILTERS = new Set(["NSW", "VIC", "QLD"]);
const FEATURED_SALE_PROMO_RANKS = [2, 20];

type SortOption = "recent" | "views";

interface Job {
  id: number;
  title: string;
  location: string[];
  industry: string;
  uploaded_at: string;
  Promoted?: boolean | null;
}

interface JobFilterMeta {
  location: string[];
  industry: string;
}

interface SalePromoDeal {
  rank: number;
  title: string;
  category: string;
  imageUrl?: string;
}

const CITY_META: Record<string, { title: string; description: string; canonical: string; h1: string; tagline: string; keywords: string }> = {
  NSW: {
    title: "호주잡스 - 시드니 한인 구인구직",
    description: "시드니 한인 구인구직 게시판. 시드니 전 지역 한인 채용정보를 찾아보세요.",
    canonical: "https://hojujobs.com/sydney",
    h1: "시드니 한인 구인구직",
    tagline: "시드니 전 지역 한인 채용정보",
    keywords: "시드니 구인구직, 시드니 한인 구인, 시드니 구인, Sydney Korean jobs, 시드니 취업",
  },
  VIC: {
    title: "호주잡스 - 멜버른 한인 구인구직",
    description: "멜버른 한인 구인구직 게시판. 멜버른 전 지역 한인 채용정보를 찾아보세요.",
    canonical: "https://hojujobs.com/melbourne",
    h1: "멜버른 한인 구인구직",
    tagline: "멜버른 CBD, 글렌 웨이벌리, 박스힐 등 전 지역 한인 채용정보",
    keywords: "멜버른 구인구직, 멜번 한인 구인, 멜버른 구인, Melbourne Korean jobs, 멜번 취업",
  },
  QLD: {
    title: "호주잡스 - 브리즈번 한인 구인구직",
    description: "브리즈번 한인 구인구직 게시판. 브리즈번 전 지역 한인 채용정보를 찾아보세요.",
    canonical: "https://hojujobs.com/brisbane",
    h1: "브리즈번 한인 구인구직",
    tagline: "브리즈번 CBD, 골드코스트 등 전 지역 한인 채용정보",
    keywords: "브리즈번 구인구직, 브리즈번 한인 구인, Brisbane Korean jobs, 브리즈번 취업",
  },
  SA: {
    title: "호주잡스 - 애들레이드 한인 구인구직",
    description: "애들레이드 한인 구인구직 게시판. 애들레이드 전 지역 한인 채용정보를 찾아보세요.",
    canonical: "https://hojujobs.com/adelaide",
    h1: "애들레이드 한인 구인구직",
    tagline: "애들레이드 전 지역 한인 채용정보",
    keywords: "애들레이드 구인구직, 애들레이드 한인 구인, Adelaide Korean jobs, 애들레이드 취업",
  },
};

const DEFAULT_META = {
  title: "호주잡스 - 호주 구인구직 | 한인 채용정보",
  description: "호주 구인구직 게시판. 호주 잡스에서 시드니·멜번·브리즈번·애들레이드 최신 한인 채용정보를 찾아보세요.",
  canonical: "https://hojujobs.com/",
  h1: "호주 구인구직",
  tagline: "시드니·멜번·브리즈번·애들레이드 최신 한인 채용정보",
  keywords: "호주 구인구직, 호주 잡스, 호주잡스, 호주 한인 구인구직, 호주 구인, 시드니 구인, 멜번 구인, 브리즈번 구인, Korean jobs Australia, 호주 취업, 워홀 구인",
};

function getCityLocations(state: string) {
  const suburbSet = new Set<string>();

  REGION_GROUPS
    .filter((group) => group.state === state)
    .forEach((group) => {
      group.suburbs.forEach((suburb) => suburbSet.add(suburb));
    });

  Object.entries(SUBURB_EN).forEach(([suburb, englishName]) => {
    if (englishName.endsWith(` ${state}`)) {
      suburbSet.add(suburb);
    }
  });

  return [...suburbSet];
}

function mergeJobsById(...groups: Job[][]) {
  const seen = new Set<number>();
  const merged: Job[] = [];

  groups.flat().forEach((job) => {
    if (!seen.has(job.id)) {
      seen.add(job.id);
      merged.push(job);
    }
  });

  return merged;
}

interface ListingCache {
  version: number;
  jobsData: Job[];
  filterJobs: JobFilterMeta[];
  totalJobsCount: number | null;
  counts: Record<number, number>;
  cachedAt: number;
}

function readListingCache(key: string): ListingCache | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ListingCache;
    if (parsed.version !== LISTING_CACHE_VERSION || !parsed.cachedAt || Date.now() - parsed.cachedAt > LISTING_CACHE_TTL_MS) {
      sessionStorage.removeItem(key);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeListingCache(key: string, cache: Omit<ListingCache, "cachedAt" | "version">) {
  try {
    sessionStorage.setItem(key, JSON.stringify({
      ...cache,
      version: LISTING_CACHE_VERSION,
      cachedAt: Date.now(),
    }));
  } catch {}
}

function listingCacheKey({
  cityFilter,
  page,
  keyword,
  selectedLocations,
  industry,
  sortBy,
}: {
  cityFilter?: string;
  page: number;
  keyword: string;
  selectedLocations: string[];
  industry: string;
  sortBy: SortOption;
}) {
  const payload = {
    cityFilter: cityFilter ?? "all",
    page,
    keyword: keyword.trim().toLowerCase(),
    selectedLocations: [...selectedLocations].sort(),
    industry,
    sortBy,
  };

  return `hoju_listing_cache_${encodeURIComponent(JSON.stringify(payload))}`;
}

function removeJobFromListingCaches(jobId: number) {
  try {
    Object.keys(sessionStorage).forEach((key) => {
      if (!key.startsWith("hoju_listing_cache_")) return;

      const cached = readListingCache(key);
      if (!cached) return;

      const nextJobs = cached.jobsData.filter((job) => job.id !== jobId);
      const nextCounts = { ...cached.counts };
      delete nextCounts[jobId];

      sessionStorage.setItem(key, JSON.stringify({
        ...cached,
        jobsData: nextJobs,
        totalJobsCount: cached.totalJobsCount === null ? null : Math.max(0, cached.totalJobsCount - 1),
        counts: nextCounts,
        cachedAt: Date.now(),
      }));
    });
    sessionStorage.removeItem(`hoju_job_view_count_${jobId}`);
  } catch {}
}

function highlightPrices(value: string) {
  const pricePattern = /(?:A\$|\$)\d[\d,]*(?:\.\d{1,2})?/g;
  const parts: Array<string | JSX.Element> = [];
  let lastIndex = 0;

  for (const match of value.matchAll(pricePattern)) {
    const matchIndex = match.index ?? 0;
    if (matchIndex > lastIndex) {
      parts.push(value.slice(lastIndex, matchIndex));
    }
    parts.push(
      <span key={`${match[0]}-${matchIndex}`} className="font-bold text-emerald-700">
        {match[0]}
      </span>
    );
    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < value.length) {
    parts.push(value.slice(lastIndex));
  }

  return parts.length > 0 ? parts : value;
}

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
  const [filterJobs, setFilterJobs] = useState<JobFilterMeta[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [totalJobsCount, setTotalJobsCount] = useState<number | null>(null);
  const [salePromoDeals, setSalePromoDeals] = useState<SalePromoDeal[]>([]);
  const [loadingSalePromoDeals, setLoadingSalePromoDeals] = useState(true);

  const { counts, getCount, hydrateCounts } = useViewCounts();
  const { isAdmin } = useAuth();

  const meta = cityFilter ? (CITY_META[cityFilter] ?? DEFAULT_META) : DEFAULT_META;

  useSEO({
    title: meta.title,
    description: meta.description,
    canonical: meta.canonical,
    keywords: meta.keywords,
    htmlLang: "ko",
    ogLocale: "ko_KR",
    jsonLd: cityFilter ? {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: meta.title,
      url: meta.canonical,
      description: meta.description,
      inLanguage: "ko",
      isPartOf: {
        "@type": "WebSite",
        "@id": "https://hojujobs.com/#website",
        name: "Hoju Jobs",
        url: "https://hojujobs.com/",
      },
    } : {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": "https://hojujobs.com/#website",
          name: "Hoju Jobs",
          alternateName: ["호주잡스", "호주 잡스", "호주 구인구직", "호주 한인 구인구직"],
          url: "https://hojujobs.com/",
          description: meta.description,
          inLanguage: "ko",
        },
        {
          "@type": "Organization",
          "@id": "https://hojujobs.com/#organization",
          name: "Hoju Jobs",
          alternateName: ["호주잡스", "호주 잡스", "호주 구인구직"],
          url: "https://hojujobs.com/",
          logo: { "@type": "ImageObject", url: "https://hojujobs.com/favicon.png" },
          description: "호주 한인 커뮤니티 구인구직 게시판. 시드니, 멜번, 브리즈번 등 호주 전역 한인 채용정보.",
          contactPoint: { "@type": "ContactPoint", email: "admin.hojujobs@gmail.com", contactType: "customer support" },
        },
      ],
    },
  });

  useEffect(() => {
    sessionStorage.setItem(filterKey, JSON.stringify({
      keyword, locations: selectedLocations, industry, page, sortBy,
    }));
  }, [keyword, selectedLocations, industry, page, sortBy]);

  useEffect(() => {
    let cancelled = false;

    async function fetchSalePromoDeals() {
      setLoadingSalePromoDeals(true);

      const { data, error } = await supabase
        .from("ozbargain_deals")
        .select("rank, title, category, image_url")
        .in("rank", FEATURED_SALE_PROMO_RANKS)
        .order("rank", { ascending: true });

      if (cancelled) return;

      if (error) {
        console.error("sale promo deals fetch error:", error);
        setSalePromoDeals([]);
        setLoadingSalePromoDeals(false);
        return;
      }

      setSalePromoDeals((data ?? []).map((deal) => ({
        rank: deal.rank,
        title: deal.title,
        category: deal.category,
        imageUrl: deal.image_url ?? undefined,
      })));
      setLoadingSalePromoDeals(false);
    }

    fetchSalePromoDeals();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    const cityLocations = cityFilter ? getCityLocations(cityFilter) : [];

    function buildJobsQuery(from: number, to: number, withCount = false) {
      let query = supabase
        .from("jobs")
        .select("id, title, location, industry, uploaded_at, Promoted", withCount ? { count: "exact" } : undefined)
        .gte("uploaded_at", cutoff.toISOString())
        .lte("uploaded_at", new Date().toISOString());

      if (cityLocations.length > 0) {
        query = query.overlaps("location", cityLocations);
      }

      if (selectedLocations.length > 0) {
        query = query.overlaps("location", selectedLocations);
      }

      if (industry !== "all") {
        query = query.eq("industry", industry);
      }

      const trimmedKeyword = keyword.trim();
      if (trimmedKeyword) {
        query = query.ilike("title", `%${trimmedKeyword.replace(/[%_]/g, "\\$&")}%`);
      }

      return query.order("uploaded_at", { ascending: false }).range(from, to);
    }

    function buildPromotedJobsQuery() {
      let query = supabase
        .from("jobs")
        .select("id, title, location, industry, uploaded_at, Promoted")
        .eq("Promoted", true)
        .gte("uploaded_at", cutoff.toISOString())
        .lte("uploaded_at", new Date().toISOString());

      if (cityLocations.length > 0 && !PROMO_CITY_FILTERS.has(cityFilter ?? "")) {
        query = query.overlaps("location", cityLocations);
      }

      return query.order("uploaded_at", { ascending: false });
    }

    function buildFilterJobsQuery(from: number, to: number) {
      let query = supabase
        .from("jobs")
        .select("title, location, industry")
        .gte("uploaded_at", cutoff.toISOString())
        .lte("uploaded_at", new Date().toISOString());

      if (cityLocations.length > 0) {
        query = query.overlaps("location", cityLocations);
      }

      if (industry !== "all") {
        query = query.eq("industry", industry);
      }

      const trimmedKeyword = keyword.trim();
      if (trimmedKeyword) {
        query = query.ilike("title", `%${trimmedKeyword.replace(/[%_]/g, "\\$&")}%`);
      }

      return query.order("uploaded_at", { ascending: false }).range(from, to);
    }

    async function fetchFilterJobs() {
      const PAGE = 1000;
      let from = 0;
      let all: JobFilterMeta[] = [];
      while (true) {
        const { data, error } = await buildFilterJobsQuery(from, from + PAGE - 1);
        if (error) { console.error("filter jobs fetch error:", error); return all; }
        if (!data || data.length === 0) break;
        all = all.concat(data as unknown as JobFilterMeta[]);
        if (data.length < PAGE) break;
        from += PAGE;
      }
      return all;
    }

    async function fetchJobs() {
      const cacheKey = listingCacheKey({ cityFilter, page, keyword, selectedLocations, industry, sortBy });
      const cached = readListingCache(cacheKey);
      if (cached) {
        hydrateCounts(cached.counts);
        setJobsData(cached.jobsData);
        setFilterJobs(cached.filterJobs);
        setTotalJobsCount(cached.totalJobsCount);
        setLoadingJobs(false);
        return;
      }

      setLoadingJobs(true);
      setJobsData([]);
      setTotalJobsCount(null);

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const [currentPageJobs, promoted, nextFilterJobs] = await Promise.all([
        buildJobsQuery(from, to, true),
        buildPromotedJobsQuery(),
        fetchFilterJobs(),
      ]);

      if (cancelled) return;

      if (currentPageJobs.error) {
        console.error("jobs fetch error:", currentPageJobs.error);
        setJobsData([]);
        setTotalJobsCount(0);
        setLoadingJobs(false);
        return;
      }

      const pageJobs = (currentPageJobs.data as unknown as Job[]) || [];
      const promotedJobs = promoted.error ? [] : ((promoted.data as unknown as Job[]) || []);
      const totalCount = currentPageJobs.count ?? pageJobs.length;
      const maxPage = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

      if (page > maxPage) {
        setLoadingJobs(false);
        setPage(maxPage);
        return;
      }

      if (promoted.error) {
        console.error("promoted jobs fetch error:", promoted.error);
      }

      const fetchHasActiveFilters = !!keyword || selectedLocations.length > 0 || industry !== "all";
      const resolvedPageJobs = page === 1 && !fetchHasActiveFilters
        ? mergeJobsById(promotedJobs, pageJobs)
        : pageJobs;
      const resolvedFilterJobs = nextFilterJobs.length > 0
        ? nextFilterJobs
        : resolvedPageJobs.map(({ location, industry }) => ({ location, industry }));
      const countSnapshot = await fetchViewCountsByJobIds(resolvedPageJobs.map((job) => job.id));
      if (cancelled) return;

      hydrateCounts(countSnapshot);
      setJobsData(resolvedPageJobs);
      setFilterJobs(resolvedFilterJobs);
      setTotalJobsCount(totalCount);
      setLoadingJobs(false);
      writeListingCache(cacheKey, {
        jobsData: resolvedPageJobs,
        filterJobs: resolvedFilterJobs,
        totalJobsCount: totalCount,
        counts: countSnapshot,
      });
    }

    fetchJobs();
    return () => {
      cancelled = true;
    };
  }, [cityFilter, page, keyword, selectedLocations, industry, sortBy, hydrateCounts]);

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

  // DB already filters by city via overlaps(cityLocations); no client-side re-filter needed
  const cityJobs = useMemo(() => jobsData, [jobsData]);

  const promotedJobs = useMemo(() => jobsData.filter((j) => j.Promoted === true), [jobsData]);
  const filterSourceJobs = filterJobs.length > 0 ? filterJobs : cityJobs;

  const locations = useMemo(() => {
    const cityLocs = filterSourceJobs.flatMap((j) =>
      cityFilter ? j.location.filter((loc) => (SUBURB_EN[loc] ?? "").endsWith(` ${cityFilter}`)) : j.location
    );
    const countMap: Record<string, number> = {};
    cityLocs.forEach((loc) => { countMap[loc] = (countMap[loc] || 0) + 1; });
    return [...new Set(cityLocs)].sort((a, b) => (countMap[b] || 0) - (countMap[a] || 0));
  }, [filterSourceJobs, cityFilter]);

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
    filterSourceJobs.forEach((j) => {
      (cityFilter ? j.location.filter((loc) => (SUBURB_EN[loc] ?? "").endsWith(` ${cityFilter}`)) : j.location)
        .forEach((loc) => { c[loc] = (c[loc] || 0) + 1; });
    });
    return c;
  }, [filterSourceJobs, cityFilter]);

  const industryCounts = useMemo(() => {
    const c: Record<string, number> = {};
    filterSourceJobs.forEach((j) => { c[j.industry] = (c[j.industry] || 0) + 1; });
    return c;
  }, [filterSourceJobs]);

  const industries = useMemo(() => {
    const seen = new Set<string>();
    return filterSourceJobs
      .map((j) => j.industry)
      .filter((i): i is string => !!i && !seen.has(i) && !!seen.add(i))
      .sort((a, b) => (industryCounts[b] || 0) - (industryCounts[a] || 0));
  }, [filterSourceJobs, industryCounts]);

  const hasActiveFilters = !!keyword || selectedLocations.length > 0 || industry !== "all";
  const displayTotalCount = hasActiveFilters
    ? (totalJobsCount ?? filtered.length)
    : (totalJobsCount ?? filtered.length);
  const displayTotalPages = Math.ceil((displayTotalCount ?? filtered.length) / ITEMS_PER_PAGE);
  const currentPage = Math.min(page, displayTotalPages || 1);
  const paginatedJobs = filtered;
  const showPromoSection = currentPage === 1 && !hasActiveFilters && (!cityFilter || PROMO_CITY_FILTERS.has(cityFilter));
  const showReadyPromoSection = showPromoSection && !loadingSalePromoDeals;
  const showPromotedJobsInPromoSection = showReadyPromoSection && !loadingJobs;
  const loadingCards = loadingJobs;
  const regularPaginatedJobs = showPromoSection
    ? paginatedJobs.filter((job) => job.Promoted !== true)
    : paginatedJobs;

  const handleReset = () => {
    setSelectedLocations([]);
    setIndustry("all");
    setKeyword("");
    setPage(1);
  };

  const handleDeleteJob = async (job: Job) => {
    if (!isAdmin) return;

    const { error } = await supabase.from("jobs").delete().eq("id", job.id);
    if (error) {
      toast.error("삭제 실패: " + error.message);
      return;
    }

    setJobsData((prev) => prev.filter((item) => item.id !== job.id));
    setTotalJobsCount((prev) => (prev === null ? prev : Math.max(0, prev - 1)));
    removeJobFromListingCaches(job.id);
    toast.success("공고가 삭제되었습니다.");
  };

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col bg-background">
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
            <div className="mb-5">
              <h1 className="text-lg font-bold text-foreground">{meta.h1}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{meta.tagline}</p>
            </div>

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
                  <MobileIndustryFilter
                    industries={industries}
                    selectedIndustry={industry}
                    onIndustryChange={(v) => { setIndustry(v); setPage(1); }}
                    industryCounts={industryCounts}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                총 <span className="font-semibold text-foreground">{displayTotalCount ?? "계산 중"}</span>개의 공고
              </p>
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="flex items-center justify-between gap-2 w-[130px] h-8 px-3 rounded-md border border-input bg-background text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <span>{sortBy === "recent" ? "최신순" : "조회순"}</span>
                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setSortBy("recent"); setPage(1); }} className={sortBy === "recent" ? "font-semibold" : ""}>최신순</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy("views"); setPage(1); }} className={sortBy === "views" ? "font-semibold" : ""}>조회순</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Promoted jobs - only on page 1 with no active filters */}
            {showReadyPromoSection && (
              <div className="space-y-2 mb-2">
                <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-3 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-extrabold text-slate-900 mb-0.5">호주 생활 정보도 확인해보세요</p>
                      <p className="text-xs text-blue-900/75 leading-relaxed">환율, 최신 호주 뉴스, 구직 팁을 한곳에서 볼 수 있습니다.</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Link to="/news" className="inline-flex h-9 items-center justify-center rounded-md border border-blue-200 bg-white/80 px-3 text-xs font-semibold text-blue-800 hover:bg-blue-100">
                        워홀정보
                      </Link>
                    </div>
                  </div>
                </div>
                {salePromoDeals.length > 0 && (
                  <div className="rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-50 to-sky-50 px-4 py-3 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 text-sm font-extrabold text-slate-900 mb-0.5">
                          <ShoppingBag className="h-4 w-4 text-emerald-700" />
                          새로 열린 온세일도 확인해보세요
                        </p>
                        <p className="text-xs text-emerald-900/75 leading-relaxed">호주 생활에 필요한 할인 정보와 프로모션을 한곳에서 확인하세요.</p>
                      </div>
                      <Link to="/sales" className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-emerald-200 bg-white/85 px-3 text-xs font-semibold text-emerald-800 hover:bg-emerald-100">
                        세일 상품 더 보기
                      </Link>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {salePromoDeals.map((deal) => (
                        <Link
                          key={deal.rank}
                          to={`/sales/${deal.rank}`}
                          className="flex min-w-0 gap-2 overflow-hidden rounded-md border border-slate-200 bg-white p-2 transition-colors hover:bg-slate-50"
                        >
                          {deal.imageUrl && (
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-white p-1.5">
                              <img
                                src={deal.imageUrl}
                                alt={deal.title}
                                className="max-h-full w-full object-contain"
                                onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                              />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="mb-1 text-[11px] font-semibold text-emerald-700">{deal.category}</p>
                            <p className="line-clamp-2 text-xs font-bold leading-snug text-slate-900">{highlightPrices(deal.title)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {showPromotedJobsInPromoSection && promotedJobs.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">추천 공고</p>
                    {promotedJobs.map((job) => (
                      <PromotedJobCard key={job.id} job={job} viewCount={getCount(job.id)} showEditButton={isAdmin} onDelete={isAdmin ? handleDeleteJob : undefined} />
                    ))}
                  </>
                )}
                {/* Promote-your-post CTA */}
                <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-amber-700 mb-0.5">📣 내 공고를 상단에 올리세요</p>
                      <p className="text-xs text-amber-800/70 leading-relaxed">추천 공고는 일반 공고보다 <span className="font-semibold">3배 더 많이 조회</span>되고 지원 전환율이 <span className="font-semibold">60% 높습니다</span>. 문의: <a href="mailto:admin.hojujobs@gmail.com" className="font-semibold underline underline-offset-2 hover:text-amber-900">admin.hojujobs@gmail.com</a></p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border/60" />
              </div>
            )}

            <div className="space-y-3">
              {loadingCards ? (
                <div className="text-center py-16 text-muted-foreground">불러오는 중...</div>
              ) : regularPaginatedJobs.length > 0 ? (
                regularPaginatedJobs.map((job) => (
                  <JobCard key={job.id} job={job} viewCount={getCount(job.id)} showEditButton={isAdmin} onDelete={isAdmin ? handleDeleteJob : undefined} />
                ))
              ) : showPromotedJobsInPromoSection ? (
                null
              ) : (
                <div className="text-center py-16 text-muted-foreground">검색 결과가 없습니다.</div>
              )}
            </div>

            <Pagination currentPage={currentPage} totalPages={displayTotalPages} onPageChange={(p) => { setPage(p); sessionStorage.removeItem("hoju_scroll_y"); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
