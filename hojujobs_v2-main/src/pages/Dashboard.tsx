import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, ArrowRight } from "lucide-react";

interface RateData {
  aud: number;
  usd: number;
  jpy: number;
  eur: number;
  date: string;
  updatedAt: string;
}

const CONVERSION_AMOUNTS = [100_000, 500_000, 1_000_000, 5_000_000];
const CALCULATOR_PRESETS = [500_000, 1_000_000, 3_000_000];
const RATE_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

const EXTRA_RATES = [
  { code: "USD", flag: "🇺🇸", label: "미국 달러" },
  { code: "JPY", flag: "🇯🇵", label: "일본 엔" },
  { code: "EUR", flag: "🇪🇺", label: "유로" },
];

const CITY_LINKS = [
  { label: "호주 전체 구인구직", path: "/", sub: "전국 공고 모아보기" },
  { label: "시드니 구인구직", path: "/sydney", sub: "NSW 전 지역" },
  { label: "멜버른 구인구직", path: "/melbourne", sub: "VIC 전 지역" },
  { label: "브리즈번 구인구직", path: "/brisbane", sub: "QLD 전 지역" },
];

const NEWS_ARTICLES = [
  {
    title: "2026-27 예산: 호주 이민·워홀 제도 변화",
    date: "2026년 5월 12일",
    publishedAt: "2026-05-12T19:44:00+10:00",
    year: 2026,
    tag: "비자",
    summary: "SBS는 새 예산에서 영주 이민 규모가 18만 5천 명으로 유지되고, 기술 이민·기술 심사·학생비자 심사·워홀 비자 배정 방식에 변화가 예고됐다고 정리했습니다. 호주 장기 체류나 워홀을 생각한다면 꼭 확인할 만한 기사입니다.",
    link: "https://www.sbs.com.au/news/article/federal-budget-migration-program-changes/mg2awxk1k",
    source: "SBS News",
    domain: "sbs.com.au",
  },
  {
    title: "예산 생활비 지원 한눈에 보기",
    date: "2026년 5월 12일",
    publishedAt: "2026-05-12T09:32:00+10:00",
    year: 2026,
    tag: "생활비",
    summary: "ABC는 새 예산의 세금 감면, 의약품 가격, 연료비, 메디케어, 부모휴가 등 생활비 관련 내용을 쉽게 정리했습니다. 호주 도착 후 실제 지출과 급여를 가늠하는 데 도움이 됩니다.",
    link: "https://www.abc.net.au/news/2026-05-12/what-is-in-federal-budget-to-help-cost-of-living-explainer/106671806",
    source: "ABC News",
    domain: "abc.net.au",
  },
  {
    title: "주택 세제 개편: 렌트·주거비 흐름 체크",
    date: "2026년 5월 12일",
    publishedAt: "2026-05-12T09:32:00+10:00",
    year: 2026,
    tag: "숙소",
    summary: "ABC는 부동산 투자 세제 변화와 주택 공급 대책을 설명했습니다. 당장 렌트비가 내려간다는 뜻은 아니지만, 호주 이주 전 도시별 주거비와 렌트 경쟁을 볼 때 참고할 만합니다.",
    link: "https://www.abc.net.au/news/2026-05-12/budget-2026-government-breaks-promise-negative-gearing-cgt/106669860",
    source: "ABC News",
    domain: "abc.net.au",
  },
  {
    title: "예산 승자와 패자: 일자리·주거·교통비 영향",
    date: "2026년 5월 12일",
    publishedAt: "2026-05-12T09:31:00+10:00",
    year: 2026,
    tag: "생활비",
    summary: "ABC의 예산 승자·패자 정리는 근로자 세금, 주택 구매자, 투자자, 연료비와 정부 재정까지 한 번에 훑어볼 수 있습니다. 호주에서 일하며 생활할 계획이라면 전체 분위기를 잡기 좋습니다.",
    link: "https://www.abc.net.au/news/2026-05-12/federal-budget-2026-winners-and-losers/106639966",
    source: "ABC News",
    domain: "abc.net.au",
  },
  {
    title: "이민 사기 주의: 보호비자 관련 경고",
    date: "2026년 5월 12일",
    publishedAt: "2026-05-12T13:17:00+10:00",
    year: 2026,
    tag: "법률",
    summary: "SBS는 정부가 보호비자와 관련한 이민 사기를 경고했다고 보도했습니다. 비자 대행, 현지 체류 전략, 과장된 영주권 약속을 접할 때는 등록된 전문가와 공식 정보를 확인하는 것이 안전합니다.",
    link: "https://www.sbs.com.au/news/podcast-episode/government-warns-of-migration-scames-over-protection-visas/yolor5dj2",
    source: "SBS News",
    domain: "sbs.com.au",
  },
  {
    title: "새 예산 공식 자료: 교통·지역 인프라 투자",
    date: "2026년 5월 12일",
    publishedAt: "2026-05-12T08:00:00+10:00",
    year: 2026,
    tag: "교통",
    summary: "인프라부는 2026-27 예산의 교통·지역 개발 투자 내용을 발표했습니다. 새로 이주할 도시를 고를 때 대중교통, 도로, 지역 성장 투자는 생활 편의와 일자리 접근성에 영향을 줄 수 있습니다.",
    link: "https://www.infrastructure.gov.au/department/media/news/2026-27-federal-budget-released",
    source: "Department of Infrastructure",
    domain: "infrastructure.gov.au",
  },
];

const TAG_COLORS: Record<string, string> = {
  "비자": "bg-blue-50 text-blue-700",
  "임금": "bg-green-50 text-green-700",
  "연금": "bg-purple-50 text-purple-700",
  "2차 비자": "bg-orange-50 text-orange-700",
  "법률": "bg-red-50 text-red-700",
  "숙소": "bg-cyan-50 text-cyan-700",
  "생활비": "bg-yellow-50 text-yellow-700",
  "교통": "bg-indigo-50 text-indigo-700",
};

const CURRENT_NEWS_YEAR = 2026;
const CURRENT_NEWS_ARTICLES = NEWS_ARTICLES
  .filter((article) => article.year === CURRENT_NEWS_YEAR)
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

function faviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

function translatedNewsUrl(url: string) {
  return `https://translate.google.com/translate?sl=auto&tl=ko&u=${encodeURIComponent(url)}`;
}

function formatRateUpdatedAt(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Australia/Sydney",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-");
  return `${year}년 ${Number(month)}월`;
}

function monthShortLabel(key: string) {
  const [, month] = key.split("-");
  return `${Number(month)}월`;
}

function getUpcomingFlightMonths() {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + i + 1);
    const value = monthKey(d);
    return { value, label: monthLabel(value) };
  });
}

function skyscannerUrl(from: string, to: string, selectedMonth: string) {
  const [year, month] = selectedMonth.split("-");
  const yy = year.slice(2);
  const mm = month.padStart(2, "0");
  return `https://www.skyscanner.net/transport/flights/${from}/${to}/${yy}${mm}01/?adults=1&rtn=0&cabinclass=economy&market=AU&locale=en-AU&currency=AUD`;
}

function naverFlightsUrl(from: string, to: string, selectedMonth: string, isDirect: boolean) {
  const [year, month] = selectedMonth.split("-");
  const date = `${year}${month.padStart(2, "0")}01`;
  const route = `${from.toUpperCase()}:airport-${to.toUpperCase()}:airport-${date}`;
  return `https://flight.naver.com/flights/international/${route}?adult=1&fareType=Y&isDirect=${isDirect}`;
}

function flightPrice(price: number, source: FlightSource) {
  return source === "naver" ? `${formatKrw(price)}~` : `A$${price.toLocaleString()}~`;
}

function formatAud(amount: number) {
  return `A$${amount.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatKrw(amount: number) {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

type FlightSource = "skyscanner" | "naver";

const FLIGHT_SOURCE_OPTIONS: { id: FlightSource; label: string; logo: string }[] = [
  { id: "skyscanner", label: "Skyscanner", logo: "https://www.google.com/s2/favicons?domain=skyscanner.net&sz=64" },
  { id: "naver", label: "Naver", logo: "https://www.google.com/s2/favicons?domain=naver.com&sz=64" },
];

const FLIGHT_ROUTES = [
  {
    flag: "🇦🇺",
    label: "시드니",
    codes: "ICN → SYD",
    from: "icn",
    to: "syd",
    deals: [
      { airline: { iata: "D7", name: "에어아시아 X" }, duration: "약 17–22시간", direct: false, priceByMonth: [274, 286, 264, 274, 258, 264, 264, 278, 266, 265, 269, 274] },
      { airline: { iata: "JQ", name: "제트스타" }, duration: "약 10시간 15분", direct: true, priceByMonth: [486, 334, 299, 566, 327, 335, 426, 253, 250, 365, 294, 365] },
    ],
  },
  {
    flag: "🇦🇺",
    label: "멜버른",
    codes: "ICN → MEL",
    from: "icn",
    to: "mel",
    deals: [
      { airline: { iata: "D7", name: "에어아시아 X" }, duration: "약 17–22시간", direct: false, priceByMonth: [791, 349, 349, 690, 335, 255, 253, 255, 255, 255, 264, 266] },
      { airline: { iata: "TR", name: "스쿠트" }, duration: "약 18–23시간", direct: false, priceByMonth: [791, 349, 349, 690, 335, 347, 543, 304, 305, 304, 304, 349] },
    ],
  },
  {
    flag: "🇦🇺",
    label: "브리즈번",
    codes: "ICN → BNE",
    from: "icn",
    to: "bne",
    deals: [
      { airline: { iata: "JQ", name: "제트스타" }, duration: "약 9시간 35분", direct: true, priceByMonth: [451, 370, 306, 315, 309, 303, 500, 303, 298, 358, 330, 344] },
      { airline: { iata: "VJ", name: "비엣젯항공" }, duration: "약 20–24시간", direct: false, priceByMonth: [451, 370, 306, 315, 309, 356, 509, 362, 396, 374, 352, 362] },
    ],
  },
];

const NAVER_FLIGHT_ROUTES = [
  {
    flag: "🇦🇺",
    label: "시드니",
    codes: "ICN → SYD",
    from: "icn",
    to: "syd",
    deals: [
      { airline: { iata: "D7", name: "에어아시아 X" }, duration: "약 17–22시간", direct: false, priceByMonth: [291000, 304000, 280000, 291000, 274000, 280000, 280000, 296000, 283000, 282000, 286000, 291000] },
      { airline: { iata: "JQ", name: "제트스타 항공" }, duration: "약 10시간 15분", direct: true, priceByMonth: [516000, 355000, 318000, 601000, 347000, 356000, 453000, 269000, 266000, 388000, 312000, 388000] },
    ],
  },
  {
    flag: "🇦🇺",
    label: "멜버른",
    codes: "ICN → MEL",
    from: "icn",
    to: "mel",
    deals: [
      { airline: { iata: "D7", name: "에어아시아 X" }, duration: "약 17–22시간", direct: false, priceByMonth: [740000, 326000, 326000, 645000, 313000, 271000, 269000, 271000, 271000, 271000, 281000, 283000] },
      { airline: { iata: "TR", name: "스쿠트" }, duration: "약 18–23시간", direct: false, priceByMonth: [740000, 326000, 326000, 645000, 313000, 369000, 577000, 323000, 324000, 323000, 323000, 371000] },
    ],
  },
  {
    flag: "🇦🇺",
    label: "브리즈번",
    codes: "ICN → BNE",
    from: "icn",
    to: "bne",
    deals: [
      { airline: { iata: "JQ", name: "제트스타" }, duration: "약 9시간 35분", direct: true, priceByMonth: [477000, 392000, 324000, 334000, 328000, 322000, 531000, 322000, 317000, 381000, 351000, 366000] },
      { airline: { iata: "VJ", name: "비엣젯항공" }, duration: "약 20–24시간", direct: false, priceByMonth: [477000, 392000, 324000, 334000, 328000, 378000, 541000, 385000, 421000, 397000, 374000, 385000] },
    ],
  },
];

export default function Dashboard() {
  useSEO({ title: "워홀정보", description: "호주 워킹홀리데이 환율, 항공, 최신 뉴스 정보" });
  const [rates, setRates] = useState<RateData | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);
  const [selectedFlightMonth, setSelectedFlightMonth] = useState(() => getUpcomingFlightMonths()[0].value);
  const [selectedFlightSource, setSelectedFlightSource] = useState<FlightSource>("skyscanner");
  const [krwAmount, setKrwAmount] = useState("1000000");

  useEffect(() => {
    fetchRate();
    const intervalId = window.setInterval(() => {
      fetchRate(true);
    }, RATE_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  const fetchRate = async (silent = false) => {
    if (!silent) setLoadingRate(true);
    try {
      const { data, error } = await supabase
        .from("exchange_rates")
        .select("aud, usd, jpy, eur, fetched_at")
        .eq("base_currency", "KRW")
        .single();
      if (error || !data) throw error;
      const fetchedAt = new Date(data.fetched_at);
      setRates({
        aud: Number(data.aud),
        usd: Number(data.usd),
        jpy: Number(data.jpy),
        eur: Number(data.eur),
        date: fetchedAt.toISOString().slice(0, 10),
        updatedAt: formatRateUpdatedAt(fetchedAt),
      });
    } catch {
      setRates(null);
    }
    if (!silent) setLoadingRate(false);
  };


  const rateForCode = (code: string) => rates?.[code.toLowerCase() as keyof RateData] as number | undefined;
  const flightMonths = getUpcomingFlightMonths();
  const selectedFlightMonthIndex = Number(selectedFlightMonth.split("-")[1]) - 1;
  const calculatorKrw = Number(krwAmount.replace(/[^\d]/g, ""));
  const calculatorAud = rates ? calculatorKrw * rates.aud : 0;
  const activeFlightRoutes = selectedFlightSource === "naver" ? NAVER_FLIGHT_ROUTES : FLIGHT_ROUTES;

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col bg-background">
      <Header />
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-8 w-full space-y-5">

        {/* Exchange rate + Flights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Exchange Rate */}
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-sm font-bold text-foreground">🇰🇷 → 🇦🇺 환율</h2>
              {rates && <span className="text-xs text-muted-foreground">업데이트: {rates.updatedAt}</span>}
            </div>
            {loadingRate ? (
              <div className="px-4 py-8 text-sm text-muted-foreground text-center">불러오는 중...</div>
            ) : rates ? (
              <div>
                <div className="px-4 py-4 border-b">
                  <p className="text-2xl font-bold text-foreground">
                    ₩1,000 = <span className="text-primary">A${(rates.aud * 1000).toFixed(3)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    🇦🇺 A$1 = ₩{Math.round(1 / rates.aud).toLocaleString()}
                  </p>
                </div>
                <div className="divide-y border-b">
                  {CONVERSION_AMOUNTS.map((krw) => (
                    <div key={krw} className="flex items-center justify-between px-4 py-2">
                      <span className="text-sm text-muted-foreground">₩{krw.toLocaleString()}</span>
                      <span className="text-sm font-semibold text-foreground">A${(rates.aud * krw).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">기타 환율 (₩10,000 기준)</p>
                  {EXTRA_RATES.map(({ code, flag, label }) => {
                    const r = rateForCode(code);
                    if (!r) return null;
                    return (
                      <div key={code} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{flag} {label}</span>
                        <span className="text-sm font-semibold text-foreground">
                          {code === "JPY" ? `¥${(r * 10000).toFixed(1)}` : code === "USD" ? `$${(r * 10000).toFixed(2)}` : `€${(r * 10000).toFixed(2)}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-foreground">KRW → AUD 계산기</p>
                      <p className="text-xs text-muted-foreground mt-0.5">보유한 원화를 호주 달러로 바로 계산</p>
                    </div>
                    <p className="shrink-0 text-lg font-bold text-primary">{formatAud(calculatorAud)}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-md border border-input bg-white px-3 py-2">
                    <span className="text-sm font-semibold text-muted-foreground">₩</span>
                    <input
                      value={calculatorKrw ? calculatorKrw.toLocaleString("ko-KR") : ""}
                      onChange={(event) => setKrwAmount(event.target.value.replace(/[^\d]/g, ""))}
                      inputMode="numeric"
                      placeholder="금액 입력"
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                      aria-label="원화 금액"
                    />
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    {CALCULATOR_PRESETS.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setKrwAmount(String(amount))}
                        className="h-8 rounded-md border border-border bg-white px-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/40 hover:text-foreground"
                      >
                        {formatKrw(amount)}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    실제 환전 금액은 은행·환전 수수료와 카드사 적용 환율에 따라 달라질 수 있습니다.
                  </p>
                </div>
              </div>
            ) : (
              <div className="px-4 py-8 text-sm text-muted-foreground text-center">환율 정보를 불러올 수 없습니다.</div>
            )}
          </div>

          {/* Flights */}
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-foreground">🇰🇷 최저가 항공편</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">인천 출발 편도 기준</p>
                </div>
                <div className="flex shrink-0 gap-1 rounded-md border border-border bg-muted/40 p-1" aria-label="항공권 검색 소스 선택">
                  {FLIGHT_SOURCE_OPTIONS.map((source) => (
                    <button
                      key={source.id}
                      type="button"
                      onClick={() => setSelectedFlightSource(source.id)}
                      className={`flex h-8 w-[100px] items-center justify-center gap-1.5 rounded px-3 text-[11px] font-semibold transition-colors ${
                        selectedFlightSource === source.id
                          ? source.id === "skyscanner"
                            ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                            : "bg-green-50 text-green-700 shadow-sm ring-1 ring-green-200"
                          : "text-muted-foreground hover:bg-white/70 hover:text-foreground"
                      }`}
                      aria-pressed={selectedFlightSource === source.id}
                    >
                      <img src={source.logo} alt="" className="h-3.5 w-3.5 rounded-sm object-contain" />
                      <span>{source.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-1.5" aria-label="항공편 월 선택">
                {flightMonths.map((month) => (
                  <button
                    key={month.value}
                    type="button"
                    onClick={() => setSelectedFlightMonth(month.value)}
                    className={`h-8 rounded-md border px-2 text-xs font-semibold transition-colors ${
                      selectedFlightMonth === month.value
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-white text-muted-foreground hover:border-primary/40 hover:bg-muted/40 hover:text-foreground"
                    }`}
                    aria-pressed={selectedFlightMonth === month.value}
                  >
                    <span className="block leading-none">{monthShortLabel(month.value)}</span>
                    <span className="mt-0.5 block text-[10px] leading-none opacity-70">{month.value.slice(0, 4)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y">
              {activeFlightRoutes.map((route) => {
                const bestDeals = route.deals
                  .map((deal) => ({ ...deal, price: deal.priceByMonth[selectedFlightMonthIndex] }))
                  .sort((a, b) => a.price - b.price)
                  .slice(0, 2);

                return (
                  <div key={route.codes} className="px-4 py-3.5">
                    <div className="mb-2 flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {route.flag} {route.label}
                      </p>
                      <span className="text-[10px] text-muted-foreground">{route.codes}</span>
                    </div>
                    <div className="space-y-2">
                      {bestDeals.map((deal) => (
                        <a
                          key={`${route.codes}-${deal.airline.iata}`}
                          href={
                            selectedFlightSource === "naver"
                              ? naverFlightsUrl(route.from, route.to, selectedFlightMonth, deal.direct)
                              : skyscannerUrl(route.from, route.to, selectedFlightMonth)
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-md border border-border/70 bg-white px-3 py-2 hover:border-primary/30 hover:bg-muted/30 transition-colors group"
                        >
                          <img
                            src={`https://www.gstatic.com/flights/airline_logos/70px/${deal.airline.iata}.png`}
                            alt=""
                            title={deal.airline.name}
                            className="h-6 w-6 rounded object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{deal.airline.name}</p>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${deal.direct ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"}`}>
                                {deal.direct ? "직항" : "경유"}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{deal.duration}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-bold text-primary">{flightPrice(deal.price, selectedFlightSource)}</p>
                            <ExternalLink className="h-3 w-3 text-muted-foreground mt-1 ml-auto" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* News */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="text-sm font-bold text-foreground">최근 호주 뉴스</h2>
            <p className="text-xs text-muted-foreground mt-0.5">비자, 일자리, 생활 정보</p>
          </div>
          <div className="divide-y divide-border/40">
            {CURRENT_NEWS_ARTICLES.map((article, i) => (
              <a
                key={i}
                href={translatedNewsUrl(article.link)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors group"
              >
                <img
                  src={faviconUrl(article.domain)}
                  alt=""
                  className="h-5 w-5 rounded-sm object-contain mt-0.5"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${TAG_COLORS[article.tag] ?? "bg-muted text-muted-foreground"}`}>
                      {article.tag}
                    </span>
                    <span className="text-xs text-muted-foreground">{article.date}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{article.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{article.summary}</p>
                  <p className="text-xs text-muted-foreground mt-1 opacity-60">{article.source}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
              </a>
            ))}
          </div>
        </div>

        {/* City redirects */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
          <h2 className="text-base font-semibold text-foreground">지역별 최신 공고 바로가기</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">도시별 한인 구인구직 공고를 확인해보세요.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CITY_LINKS.map((city) => (
              <Link
                key={city.path}
                to={city.path}
                className="flex items-center justify-between rounded-lg border border-primary/20 bg-white px-3 py-3 hover:border-primary/50 hover:shadow-sm transition-all group"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{city.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{city.sub}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
