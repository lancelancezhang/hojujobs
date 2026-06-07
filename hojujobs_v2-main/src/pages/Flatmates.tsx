import { useEffect, useMemo, useState } from "react";
import { Bath, BedSingle, ExternalLink, Filter, MapPin, RotateCcw, Search, ShieldCheck, Users } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { cn } from "@/lib/utils";

type FlatmateListing = {
  notice_id: string;
  url: string | null;
  title: string | null;
  description: string | null;
  price: number | null;
  contact_number: string | null;
  enquiry_email: string | null;
  state_location: string | null;
  time_posted: string | null;
  uploaded_at: string | null;
  image_url: string | null;
  private_room: boolean | null;
  gender_restriction: string | null;
  private_bathroom: boolean | null;
  suburb: string | null;
};

type BooleanFilter = "all" | "yes" | "no";
type GenderFilter = "all" | "restricted" | "unrestricted" | "female_only" | "male_only";

const LISTING_LIMIT = 500;

const booleanOptions: Array<{ value: BooleanFilter; label: string }> = [
  { value: "all", label: "전체" },
  { value: "yes", label: "있음" },
  { value: "no", label: "없음" },
];

const genderOptions: Array<{ value: GenderFilter; label: string }> = [
  { value: "all", label: "전체" },
  { value: "unrestricted", label: "성별무관" },
  { value: "restricted", label: "성별제한" },
  { value: "female_only", label: "여성전용" },
  { value: "male_only", label: "남성전용" },
];

function formatPrice(price: number | null) {
  if (typeof price !== "number") return "문의";
  return `$${new Intl.NumberFormat("en-AU").format(price)}`;
}

function formatDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Australia/Sydney",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function genderLabel(value: string | null) {
  if (value === "female_only") return "여성전용";
  if (value === "male_only") return "남성전용";
  if (value && value !== "none") return "성별제한";
  return "성별무관";
}

function compactDescription(value: string | null) {
  if (!value) return "";
  return value
    .replace(/\s+/g, " ")
    .replace(/[━=]{2,}/g, " ")
    .trim();
}

function matchesBooleanFilter(value: boolean | null, filter: BooleanFilter) {
  if (filter === "all") return true;
  return filter === "yes" ? value === true : value !== true;
}

function matchesGenderFilter(value: string | null, filter: GenderFilter) {
  if (filter === "all") return true;
  const hasRestriction = Boolean(value && value !== "none");
  if (filter === "restricted") return hasRestriction;
  if (filter === "unrestricted") return !hasRestriction;
  return value === filter;
}

export default function Flatmates() {
  useSEO({
    title: "플렛메이트 | Hoju Jobs",
    description: "호주 한인 쉐어하우스와 플렛메이트 매물을 독방, 성별 제한, 개인 욕실, 지역별로 찾아보세요.",
    canonical: "https://hojujobs.com/flatmates",
    htmlLang: "ko",
    ogLocale: "ko_KR",
  });

  const [listings, setListings] = useState<FlatmateListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [suburb, setSuburb] = useState("all");
  const [privateRoom, setPrivateRoom] = useState<BooleanFilter>("all");
  const [gender, setGender] = useState<GenderFilter>("all");
  const [privateBathroom, setPrivateBathroom] = useState<BooleanFilter>("all");

  useEffect(() => {
    let cancelled = false;

    async function fetchListings() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("hojunara_realestate_share")
        .select("notice_id, url, title, description, price, contact_number, enquiry_email, state_location, time_posted, uploaded_at, image_url, private_room, gender_restriction, private_bathroom, suburb")
        .order("time_posted", { ascending: false })
        .limit(LISTING_LIMIT);

      if (cancelled) return;

      if (fetchError) {
        console.error("flatmate listings fetch error:", fetchError);
        setListings([]);
        setError("플렛메이트 매물을 불러오지 못했습니다.");
        setLoading(false);
        return;
      }

      setListings((data ?? []) as FlatmateListing[]);
      setLoading(false);
    }

    fetchListings();
    return () => {
      cancelled = true;
    };
  }, []);

  const suburbCounts = useMemo(() => {
    return listings.reduce<Record<string, number>>((counts, listing) => {
      const nextSuburb = listing.suburb?.trim();
      if (nextSuburb) counts[nextSuburb] = (counts[nextSuburb] || 0) + 1;
      return counts;
    }, {});
  }, [listings]);

  const suburbs = useMemo(() => {
    return Object.keys(suburbCounts).sort((a, b) => suburbCounts[b] - suburbCounts[a] || a.localeCompare(b, "ko"));
  }, [suburbCounts]);

  const filteredListings = useMemo(() => {
    const trimmedKeyword = keyword.trim().toLowerCase();

    return listings.filter((listing) => {
      if (suburb !== "all" && listing.suburb !== suburb) return false;
      if (!matchesBooleanFilter(listing.private_room, privateRoom)) return false;
      if (!matchesGenderFilter(listing.gender_restriction, gender)) return false;
      if (!matchesBooleanFilter(listing.private_bathroom, privateBathroom)) return false;

      if (!trimmedKeyword) return true;
      const haystack = `${listing.title ?? ""} ${listing.description ?? ""} ${listing.suburb ?? ""}`.toLowerCase();
      return haystack.includes(trimmedKeyword);
    });
  }, [gender, keyword, listings, privateBathroom, privateRoom, suburb]);

  const resetFilters = () => {
    setKeyword("");
    setSuburb("all");
    setPrivateRoom("all");
    setGender("all");
    setPrivateBathroom("all");
  };

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col bg-[#f7f8fb]">
      <Header />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
        <section className="mb-5 border-b border-slate-200 pb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold text-primary">호주 한인 쉐어하우스</p>
              <h1 className="mt-1 text-2xl font-black tracking-normal text-slate-950 sm:text-3xl">플렛메이트</h1>
              <p className="mt-1 text-sm text-slate-600">독방, 개인욕실, 성별 조건, 지역별로 빠르게 확인하세요.</p>
            </div>
            <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-bold text-slate-950">{filteredListings.length}</span>
              <span className="text-slate-500">/ {listings.length}개</span>
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-black text-slate-950">
                  <Filter className="h-4 w-4 text-primary" />
                  필터
                </h2>
                <button type="button" onClick={resetFilters} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-950">
                  <RotateCcw className="h-3.5 w-3.5" />
                  초기화
                </button>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-slate-700">검색</span>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={keyword}
                      onChange={(event) => setKeyword(event.target.value)}
                      placeholder="지역, 건물, 조건"
                      className="pl-9"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-slate-700">지역</span>
                  <select
                    value={suburb}
                    onChange={(event) => setSuburb(event.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="all">전체 지역</option>
                    {suburbs.map((nextSuburb) => (
                      <option key={nextSuburb} value={nextSuburb}>
                        {nextSuburb} ({suburbCounts[nextSuburb]})
                      </option>
                    ))}
                  </select>
                </label>

                <FilterGroup
                  label="독방"
                  options={booleanOptions}
                  value={privateRoom}
                  onChange={setPrivateRoom}
                  yesLabel="독방"
                  noLabel="쉐어룸"
                />

                <div>
                  <span className="mb-1.5 block text-xs font-bold text-slate-700">성별 조건</span>
                  <div className="grid grid-cols-2 gap-1">
                    {genderOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setGender(option.value)}
                        className={cn(
                          "h-9 rounded-md border px-2 text-xs font-bold transition-colors",
                          gender === option.value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <FilterGroup
                  label="개인 욕실"
                  options={booleanOptions}
                  value={privateBathroom}
                  onChange={setPrivateBathroom}
                  yesLabel="개인욕실"
                  noLabel="공용/미기재"
                />
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            {loading ? (
              <div className="rounded-lg border bg-white px-4 py-16 text-center text-sm text-muted-foreground">불러오는 중...</div>
            ) : error ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-12 text-center">
                <p className="text-sm font-bold text-slate-950">{error}</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="rounded-lg border bg-white px-4 py-12 text-center">
                <p className="text-sm font-bold text-slate-950">조건에 맞는 매물이 없습니다.</p>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={resetFilters}>
                  필터 초기화
                </Button>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredListings.map((listing) => (
                  <FlatmateCard key={listing.notice_id} listing={listing} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
  yesLabel,
  noLabel,
}: {
  label: string;
  options: Array<{ value: BooleanFilter; label: string }>;
  value: BooleanFilter;
  onChange: (value: BooleanFilter) => void;
  yesLabel: string;
  noLabel: string;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-bold text-slate-700">{label}</span>
      <div className="grid grid-cols-3 gap-1">
        {options.map((option) => {
          const labelText = option.value === "yes" ? yesLabel : option.value === "no" ? noLabel : option.label;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "h-9 rounded-md border px-1 text-xs font-bold transition-colors",
                value === option.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              )}
            >
              {labelText}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FlatmateCard({ listing }: { listing: FlatmateListing }) {
  const description = compactDescription(listing.description);

  return (
    <article className="overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className={cn("grid gap-0", listing.image_url ? "sm:grid-cols-[11rem_minmax(0,1fr)]" : "grid-cols-1")}>
        {listing.image_url && (
          <a href={listing.url ?? "#"} target="_blank" rel="noopener noreferrer" className="block h-44 bg-slate-100 sm:h-full">
            <img
              src={listing.image_url}
              alt={listing.title ?? "플렛메이트 매물"}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(event) => { (event.currentTarget.parentElement as HTMLElement).style.display = "none"; }}
            />
          </a>
        )}

        <div className="min-w-0 p-4">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
              <MapPin className="h-3.5 w-3.5" />
              {listing.suburb ?? "지역 미기재"}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{listing.state_location ?? "호주"}</span>
            {listing.private_room === true && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                <BedSingle className="h-3.5 w-3.5" />
                독방
              </span>
            )}
            {listing.private_bathroom === true && (
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                <Bath className="h-3.5 w-3.5" />
                개인욕실
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              {genderLabel(listing.gender_restriction)}
            </span>
          </div>

          <div className="flex gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="line-clamp-2 text-base font-black leading-snug text-slate-950 sm:text-lg">{listing.title ?? "제목 없음"}</h2>
              {description && (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{description}</p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-lg font-black text-slate-950">{formatPrice(listing.price)}</p>
              <p className="text-xs font-semibold text-slate-500">/ 주</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <div className="text-xs text-slate-500">
              {formatDate(listing.time_posted ?? listing.uploaded_at)}
              {listing.contact_number ? <span className="ml-2 font-semibold text-slate-700">{listing.contact_number}</span> : null}
            </div>
            {listing.url && (
              <a
                href={listing.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-slate-950 px-3 text-xs font-bold text-white transition-colors hover:bg-slate-800"
              >
                원문 보기
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
