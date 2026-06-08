import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bath, BedSingle, Check, ChevronDown, ChevronLeft, ChevronRight, MapPin, RotateCcw, Search, ShieldCheck, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { cn } from "@/lib/utils";

type FlatmateListing = {
  id: number;
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
  post_photo: string[] | null;
  private_room: boolean | null;
  gender_restriction: string | null;
  private_bathroom: boolean | null;
  suburb: string | null;
};

type BooleanFilter = "all" | "yes" | "no";
type GenderFilter = "all" | "restricted" | "unrestricted" | "female_only" | "male_only";

const LISTING_LIMIT = 500;
const RENT_OPTIONS = Array.from({ length: 21 }, (_, index) => index * 50);
const FLATMATES_SCROLL_KEY = "hoju_flatmates_scroll_y";

const booleanOptions: Array<{ value: BooleanFilter; label: string }> = [
  { value: "all", label: "전체" },
  { value: "yes", label: "있음" },
  { value: "no", label: "없음" },
];

const genderOptions: Array<{ value: GenderFilter; label: string }> = [
  { value: "all", label: "전체" },
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
    .replace(/[━=]{2,}/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
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
    description: "호주 한인 쉐어하우스와 플렛메이트 렌트를 독방, 성별 제한, 개인 화장실, 지역별로 찾아보세요.",
    canonical: "https://hojujobs.com/flatmates",
    htmlLang: "ko",
    ogLocale: "ko_KR",
  });

  const [listings, setListings] = useState<FlatmateListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [selectedSuburbs, setSelectedSuburbs] = useState<string[]>([]);
  const [privateRoom, setPrivateRoom] = useState<BooleanFilter>("all");
  const [gender, setGender] = useState<GenderFilter>("all");
  const [privateBathroom, setPrivateBathroom] = useState<BooleanFilter>("all");
  const [minRent, setMinRent] = useState("");
  const [maxRent, setMaxRent] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchListings() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("hojunara_realestate_share")
        .select("id, url, title, description, price, contact_number, enquiry_email, state_location, time_posted, uploaded_at, image_url, post_photo, private_room, gender_restriction, private_bathroom, suburb")
        .order("time_posted", { ascending: false })
        .limit(LISTING_LIMIT);

      if (cancelled) return;

      if (fetchError) {
        console.error("flatmate listings fetch error:", fetchError);
        setListings([]);
        setError("플렛메이트 렌트를 불러오지 못했습니다.");
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

  const scrollRestored = useRef(false);
  useEffect(() => {
    if (loading || scrollRestored.current) return;
    scrollRestored.current = true;

    const savedY = sessionStorage.getItem(FLATMATES_SCROLL_KEY);
    if (!savedY) return;

    sessionStorage.removeItem(FLATMATES_SCROLL_KEY);
    window.setTimeout(() => {
      window.scrollTo({ top: Number(savedY) });
    }, 50);
  }, [loading]);

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
    const minRentValue = Number(minRent);
    const maxRentValue = Number(maxRent);
    const hasMinRent = minRent.trim() !== "" && Number.isFinite(minRentValue);
    const hasMaxRent = maxRent.trim() !== "" && Number.isFinite(maxRentValue);

    return listings.filter((listing) => {
      if (selectedSuburbs.length > 0 && !selectedSuburbs.includes(listing.suburb?.trim() ?? "")) return false;

      if (!matchesBooleanFilter(listing.private_room, privateRoom)) return false;
      if (!matchesGenderFilter(listing.gender_restriction, gender)) return false;
      if (!matchesBooleanFilter(listing.private_bathroom, privateBathroom)) return false;
      if (hasMinRent && (listing.price === null || listing.price < minRentValue)) return false;
      if (hasMaxRent && (listing.price === null || listing.price > maxRentValue)) return false;

      if (!trimmedKeyword) return true;
      const haystack = `${listing.title ?? ""} ${listing.description ?? ""} ${listing.suburb ?? ""}`.toLowerCase();
      return haystack.includes(trimmedKeyword);
    });
  }, [gender, keyword, listings, maxRent, minRent, privateBathroom, privateRoom, selectedSuburbs]);

  const hasFilters = keyword !== "" || selectedSuburbs.length > 0 || privateRoom !== "all" || gender !== "all" || privateBathroom !== "all" || minRent !== "" || maxRent !== "";

  const resetFilters = () => {
    setKeyword("");
    setSelectedSuburbs([]);
    setPrivateRoom("all");
    setGender("all");
    setPrivateBathroom("all");
    setMinRent("");
    setMaxRent("");
  };

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col bg-[#f7f8fb]">
      <Header />

      <main className="mx-auto w-full max-w-6xl px-4 pt-4 pb-8">
        <div className="grid gap-5 lg:grid-cols-[200px_minmax(0,1fr)]">
          <aside className="space-y-3">
            <div className={cn("flex justify-end", hasFilters ? "h-5" : "h-0 lg:h-5")}>
              <button
                type="button"
                onClick={resetFilters}
                className={cn(
                  "flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors",
                  !hasFilters && "invisible pointer-events-none"
                )}
              >
                <RotateCcw className="h-3 w-3" />
                초기화
              </button>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-slate-700">검색</span>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
	                  <Input
	                    value={keyword}
	                    onChange={(event) => setKeyword(event.target.value)}
	                    placeholder="지역, 건물, 조건"
	                    className="h-8 pl-8 text-[12px] font-medium placeholder:!text-[12px] placeholder:font-medium placeholder:text-slate-500 sm:h-10 sm:text-sm"
	                  />
                </div>
              </label>

              <div>
                <span className="mb-1 block text-xs font-bold text-slate-700">지역</span>
                <SuburbDropdown
                  suburbs={suburbs}
                  suburbCounts={suburbCounts}
                  selectedSuburbs={selectedSuburbs}
                  onChange={setSelectedSuburbs}
                />
              </div>

              <div>
                <span className="mb-1 block text-xs font-bold text-slate-700">렌트</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <span className="mb-0.5 block text-[10px] font-bold text-slate-500">최소</span>
                    <RentDropdown
                      value={minRent}
                      placeholder="$0"
                      onChange={(nextValue) => {
                        if (nextValue && maxRent && Number(nextValue) > Number(maxRent)) setMaxRent(nextValue);
                        setMinRent(nextValue);
                      }}
                    />
                  </div>
                  <div>
                    <span className="mb-0.5 block text-[10px] font-bold text-slate-500">최대</span>
                    <RentDropdown
                      value={maxRent}
                      placeholder="전체"
                      onChange={(nextValue) => {
                        if (nextValue && minRent && Number(nextValue) < Number(minRent)) setMinRent(nextValue);
                        setMaxRent(nextValue);
                      }}
                    />
                  </div>
                </div>
              </div>

              <FilterGroup
                label="독방"
                options={booleanOptions}
                value={privateRoom}
                onChange={setPrivateRoom}
                yesLabel="독방"
                noLabel="쉐어룸"
              />

              <div>
                <span className="mb-1 block text-xs font-bold text-slate-700">성별 조건</span>
                <div className="grid grid-cols-3 gap-1">
                  {genderOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setGender(option.value)}
                      className={cn(
                        "h-8 rounded-md border px-1 text-xs font-bold transition-colors",
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

              <div>
                <span className="mb-1 block text-xs font-bold text-slate-700">개인 화장실</span>
                <div className="grid grid-cols-2 gap-1">
                  {(["all", "yes"] as BooleanFilter[]).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setPrivateBathroom(val)}
                      className={cn(
                        "h-8 rounded-md border px-2 text-xs font-bold transition-colors",
                        privateBathroom === val
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      {val === "all" ? "전체" : "개인 화장실"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-3 hidden lg:block">
              <h1 className="text-xl font-extrabold tracking-normal text-foreground sm:text-2xl">플렛메이트</h1>
              <p className="mt-1 text-sm text-muted-foreground">호주 한인 쉐어하우스 · 독방 · 룸쉐어 정보</p>
            </div>
            {loading ? (
              <div className="rounded-lg border bg-white px-4 py-16 text-center text-sm text-muted-foreground">불러오는 중...</div>
            ) : error ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-12 text-center">
                <p className="text-sm font-bold text-slate-950">{error}</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="rounded-lg border bg-white px-4 py-12 text-center">
                <p className="text-sm font-bold text-slate-950">조건에 맞는 렌트가 없습니다.</p>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={resetFilters}>
                  필터 초기화
                </Button>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredListings.map((listing) => (
                  <FlatmateCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function RentDropdown({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const label = value ? `$${value}` : placeholder;
  const rentOptions = placeholder === "$0" ? RENT_OPTIONS.filter((rent) => rent !== 0) : RENT_OPTIONS;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const selectValue = (nextValue: string) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-2.5 text-[12px] not-italic leading-none ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:h-10 sm:px-3 sm:text-sm"
      >
        <span className={cn("truncate not-italic leading-none", value ? "font-semibold text-slate-950" : "font-medium text-slate-500")}>
          {label}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-500 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border bg-white shadow-lg">
          <ul className="max-h-52 overflow-y-auto py-1">
            <li>
              <button
                type="button"
                onClick={() => selectValue("")}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-1.5 text-left text-xs font-medium hover:bg-slate-50",
                  !value ? "text-primary" : "text-slate-800"
                )}
              >
                {placeholder}
                {!value && <Check className="h-3 w-3" />}
              </button>
            </li>
            {rentOptions.map((rent) => {
              const nextValue = String(rent);
              const selected = value === nextValue;
              return (
                <li key={rent}>
                  <button
                    type="button"
                    onClick={() => selectValue(nextValue)}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-1.5 text-left text-xs font-medium hover:bg-slate-50",
                      selected ? "text-primary" : "text-slate-800"
                    )}
                  >
                    ${rent}
                    {selected && <Check className="h-3 w-3" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
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
      <span className="mb-1 block text-xs font-bold text-slate-700">{label}</span>
      <div className="grid grid-cols-3 gap-1">
        {options.map((option) => {
          const labelText = option.value === "yes" ? yesLabel : option.value === "no" ? noLabel : option.label;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "h-8 rounded-md border px-1 text-xs font-bold transition-colors",
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

function SuburbDropdown({
  suburbs,
  suburbCounts,
  selectedSuburbs,
  onChange,
}: {
  suburbs: string[];
  suburbCounts: Record<string, number>;
  selectedSuburbs: string[];
  onChange: (v: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return s ? suburbs.filter((sub) => sub.toLowerCase().includes(s)) : suburbs;
  }, [suburbs, search]);

  const toggle = (sub: string) => {
    onChange(selectedSuburbs.includes(sub)
      ? selectedSuburbs.filter((s) => s !== sub)
      : [...selectedSuburbs, sub]);
  };

  const label = selectedSuburbs.length === 0 ? "전체 지역" : `${selectedSuburbs.length}개 선택`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-2.5 text-[12px] not-italic leading-none ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:h-10 sm:px-3 sm:text-sm"
      >
        <span className={cn("truncate not-italic leading-none", selectedSuburbs.length === 0 ? "font-medium text-slate-500" : "font-semibold text-slate-950")}>
          {label}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border bg-white shadow-lg">
          <div className="border-b p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="지역 검색..."
                className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs outline-none placeholder:text-[11px] focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          {selectedSuburbs.length > 0 && (
            <div className="border-b px-3 py-1.5">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs font-semibold text-primary hover:underline"
              >
                선택 초기화 ({selectedSuburbs.length})
              </button>
            </div>
          )}
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-xs text-muted-foreground">검색 결과 없음</li>
            ) : (
              filtered.map((sub) => {
                const checked = selectedSuburbs.includes(sub);
                return (
                  <li key={sub}>
                    <button
                      type="button"
                      onClick={() => toggle(sub)}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-slate-50"
                    >
                      <span className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        checked ? "border-primary bg-primary text-white" : "border-slate-300 bg-white"
                      )}>
                        {checked && <Check className="h-3 w-3" />}
                      </span>
                      <span className="flex-1 truncate text-xs font-medium text-slate-800">{sub}</span>
                      <span className="text-xs text-slate-400">{suburbCounts[sub]}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function FlatmateCard({ listing }: { listing: FlatmateListing }) {
  const description = compactDescription(listing.description);
  const navigate = useNavigate();
  const detailPath = `/flatmates/${listing.id}`;
  const suburb = listing.suburb?.trim();

  const openDetail = () => {
    sessionStorage.setItem(FLATMATES_SCROLL_KEY, String(window.scrollY));
    navigate(detailPath);
  };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetail();
        }
      }}
      className="w-full max-w-full cursor-pointer overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      <div className="grid min-w-0 grid-cols-1 gap-0 sm:grid-cols-[14rem_minmax(0,1fr)]">
        <PhotoCarousel listing={listing} />

        <div className="flex min-h-[14rem] min-w-0 flex-col p-4">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {suburb && (
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                <MapPin className="h-3.5 w-3.5" />
                {suburb}
              </span>
            )}
            {listing.private_room === true && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                <BedSingle className="h-3.5 w-3.5" />
                독방
              </span>
            )}
            {listing.private_room === false && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                <BedSingle className="h-3.5 w-3.5" />
                쉐어룸
              </span>
            )}
            {listing.private_bathroom === true && (
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                <Bath className="h-3.5 w-3.5" />
                개인 화장실
              </span>
            )}
            {(listing.gender_restriction === "female_only" || listing.gender_restriction === "male_only") && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                {genderLabel(listing.gender_restriction)}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h2 className="line-clamp-2 text-sm font-black leading-snug text-slate-950 sm:text-base">{listing.title ?? "제목 없음"}</h2>
            {description && (
              <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{description}</p>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <span className="text-xs text-slate-500">
              {formatDate(listing.time_posted ?? listing.uploaded_at)}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <span className="text-sm font-black text-slate-950">{formatPrice(listing.price)}</span>
              <span className="text-xs font-semibold text-slate-500">/ 주</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function listingPhotos(listing: FlatmateListing) {
  const photos = [
    ...(Array.isArray(listing.post_photo) ? listing.post_photo : []),
    listing.image_url,
  ].filter((photo): photo is string => Boolean(photo?.trim()));

  return [...new Set(photos)];
}

function PhotoCarousel({ listing }: { listing: FlatmateListing }) {
  const photos = listingPhotos(listing);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const currentPhoto = photos[photoIndex];
  const hasMultiplePhotos = photos.length > 1;

  const showPrevious = () => {
    setPhotoIndex((current) => (current === 0 ? photos.length - 1 : current - 1));
  };

  const showNext = () => {
    setPhotoIndex((current) => (current + 1) % photos.length);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = event.touches[0]?.clientX ?? 0;
    event.currentTarget.dataset.touchStartX = String(startX);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!hasMultiplePhotos) return;
    const startX = Number(event.currentTarget.dataset.touchStartX ?? 0);
    const endX = event.changedTouches[0]?.clientX ?? 0;
    const deltaX = endX - startX;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX > 0) showPrevious();
    else showNext();
  };

  return (
    <div
      className="relative h-56 w-full shrink-0 overflow-hidden bg-slate-100 sm:h-[18rem]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {currentPhoto ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setLightboxIndex(photoIndex);
          }}
          className="block h-full w-full"
          aria-label="사진 크게 보기"
        >
          <img
            src={currentPhoto}
            alt={listing.title ?? "플렛메이트 렌트"}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(event) => { event.currentTarget.style.display = "none"; }}
          />
        </button>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">
          사진 없음
        </div>
      )}

      {hasMultiplePhotos && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showPrevious();
            }}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            aria-label="이전 사진"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            aria-label="다음 사진"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-black/45 px-2 py-1">
            {photos.map((photo, index) => (
              <button
                key={`${photo}-${index}`}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setPhotoIndex(index);
                }}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === photoIndex ? "w-4 bg-white" : "w-1.5 bg-white/55"
                )}
                aria-label={`${index + 1}번째 사진`}
              />
            ))}
          </div>
        </>
      )}

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          photoIndex={lightboxIndex}
          title={listing.title ?? "플렛메이트 렌트"}
          onPhotoIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}

function PhotoLightbox({
  photos,
  photoIndex,
  title,
  onPhotoIndexChange,
  onClose,
}: {
  photos: string[];
  photoIndex: number;
  title: string;
  onPhotoIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const hasMultiplePhotos = photos.length > 1;
  const currentPhoto = photos[photoIndex];

  const showPrevious = () => {
    onPhotoIndexChange(photoIndex === 0 ? photos.length - 1 : photoIndex - 1);
  };

  const showNext = () => {
    onPhotoIndexChange((photoIndex + 1) % photos.length);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-3 sm:p-6"
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="사진 크게 보기"
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
        aria-label="닫기"
      >
        <X className="h-5 w-5" />
      </button>

      {hasMultiplePhotos && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            showPrevious();
          }}
          className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
          aria-label="이전 사진"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <img
        src={currentPhoto}
        alt={title}
        className="max-h-[86vh] max-w-full rounded-lg object-contain"
        onClick={(event) => event.stopPropagation()}
      />

      {hasMultiplePhotos && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            showNext();
          }}
          className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
          aria-label="다음 사진"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
