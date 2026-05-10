import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSEO } from "@/hooks/useSEO";
import { Header } from "@/components/Header";
import { RefreshCw, ExternalLink, ArrowRight, CalendarDays } from "lucide-react";

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

const EXTRA_RATES = [
  { code: "USD", flag: "🇺🇸", label: "미국 달러" },
  { code: "JPY", flag: "🇯🇵", label: "일본 엔" },
  { code: "EUR", flag: "🇪🇺", label: "유로" },
];

const CITY_LINKS = [
  { label: "시드니 구인구직", path: "/sydney", sub: "NSW 전 지역" },
  { label: "멜버른 구인구직", path: "/melbourne", sub: "VIC 전 지역" },
  { label: "브리즈번 구인구직", path: "/brisbane", sub: "QLD 전 지역" },
  { label: "애들레이드 구인구직", path: "/adelaide", sub: "SA 전 지역" },
];

const NEWS_ARTICLES = [
  {
    title: "워홀러 88일 지역 근무, WA 관광지 기준 논란",
    date: "2026년 4월 3일",
    publishedAt: "2026-04-03",
    year: 2026,
    tag: "비자",
    summary: "ABC는 로트네스트 아일랜드는 원격 지역으로 인정되지만 마가렛 리버 등 일부 관광지는 인정되지 않아, 2차 비자를 준비하는 워홀러와 지역 카페·숙박업체 모두 인력 확보에 어려움을 겪고 있다고 보도했습니다.",
    link: "https://www.abc.net.au/news/2026-04-03/backpacker-visa-rules-south-west-wa-rottnest/106478874",
    source: "ABC News",
    domain: "abc.net.au",
  },
  {
    title: "2026 최저임금 인상 논의 — 워홀 일자리 임금도 영향",
    date: "2026년 3월 26일",
    publishedAt: "2026-03-26",
    year: 2026,
    tag: "임금",
    summary: "연방정부가 2026년 연례 임금 심사에서 물가상승률보다 높은 최저·어워드 임금 인상을 요청했습니다. 카페, 식당, 리테일 등 워홀러가 많이 일하는 업종의 시급 기준을 확인해두면 좋습니다.",
    link: "https://www.abc.net.au/news/2026-03-26/lift-minimum-wage-above-inflation-federal-government-says/106497922",
    source: "ABC News",
    domain: "abc.net.au",
  },
  {
    title: "이주 노동자 임금 체불 보고서 — 현금잡 주의",
    date: "2026년 5월",
    publishedAt: "2026-05-01",
    year: 2026,
    tag: "법률",
    summary: "Migrant Justice Institute의 새 보고서를 인용한 보도에 따르면 임금 체불, 슈퍼 미지급, 불법 공제 등 임시비자 노동자 착취가 여전히 큰 문제입니다. 출국 전에는 페이슬립, TFN, 슈퍼 계좌, 고용계약을 꼭 확인하세요.",
    link: "https://www.news.com.au/finance/work/at-work/international-students-cheated-out-of318bn-in-annual-wages-new-report-finds/news-story/28981750cb1f6db3b0f1ea9095165ed4",
    source: "news.com.au",
    domain: "news.com.au",
  },
  {
    title: "아웃백 일자리 감소 — 연료비 상승이 지역 워홀 구직에 영향",
    date: "2026년 4월 14일",
    publishedAt: "2026-04-14",
    year: 2026,
    tag: "2차 비자",
    summary: "ABC는 연료비 부담과 관광객 감소로 일부 아웃백 로드하우스와 지역 사업장이 시즌 직원을 줄이고 있다고 보도했습니다. 88일 지역 근무를 계획한다면 숙소·교통·실제 근무 가능 여부를 먼저 확인하는 편이 안전합니다.",
    link: "https://www.abc.net.au/news/2026-04-15/outback-workers-cut-as-tourists-stay-away-fuel-crisis-sa/106537958",
    source: "ABC News",
    domain: "abc.net.au",
  },
  {
    title: "호주 호스텔 트렌드 변화 — 조용한 숙소·개인공간 수요 증가",
    date: "2026년 4월 22일",
    publishedAt: "2026-04-22",
    year: 2026,
    tag: "숙소",
    summary: "가디언은 호주 백패커 숙소가 대형 도미토리와 파티 중심에서 프라이버시, 소셜 공간, 지역 경험을 함께 제공하는 방향으로 바뀌고 있다고 소개했습니다. 도착 초반 숙소를 잡을 때 위치와 장기 숙박 할인도 함께 비교해보세요.",
    link: "https://www.theguardian.com/travel/2026/apr/22/backpacking-hostel-changes-private-rooms-luxury",
    source: "The Guardian",
    domain: "theguardian.com",
  },
  {
    title: "2026 호주 생활비 가이드 — 도시별 예산 먼저 잡기",
    date: "2026년",
    publishedAt: "2026-01-01",
    year: 2026,
    tag: "생활비",
    summary: "2026년 호주 생활비는 도시와 숙소 형태에 따라 차이가 큽니다. 입국 전 첫 4주 숙소비, 교통카드, 유심, 식비, 보증금까지 계산해두면 첫 구직 기간을 훨씬 안정적으로 버틸 수 있습니다.",
    link: "https://www.switchliving.com.au/en/student-guide/cost-of-living-in-australia-for-international-students-in-2026-a-complete-guide/",
    source: "Switch Living",
    domain: "switchliving.com.au",
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
};

const CURRENT_NEWS_YEAR = 2026;
const CURRENT_NEWS_ARTICLES = NEWS_ARTICLES
  .filter((article) => article.year === CURRENT_NEWS_YEAR)
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

function faviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
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

function flightPrice(price: number) {
  return `A$${price.toLocaleString()}`;
}

function formatAud(amount: number) {
  return `A$${amount.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatKrw(amount: number) {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

const FLIGHT_ROUTES = [
  {
    flag: "🇦🇺",
    label: "시드니",
    codes: "ICN → SYD",
    from: "icn",
    to: "syd",
    deals: [
      { airline: { iata: "JQ", name: "제트스타" }, duration: "약 10시간 10분", direct: true, priceByMonth: [420, 430, 450, 470, 520, 610, 560, 500, 470, 440, 430, 580] },
      { airline: { iata: "KE", name: "대한항공" }, duration: "약 10시간 10분", direct: true, priceByMonth: [680, 710, 740, 760, 820, 960, 900, 820, 760, 720, 700, 980] },
      { airline: { iata: "QF", name: "콴타스" }, duration: "약 10시간 10분", direct: true, priceByMonth: [650, 690, 720, 750, 790, 940, 890, 810, 750, 700, 680, 940] },
      { airline: { iata: "CZ", name: "중국남방항공" }, duration: "약 15–18시간", direct: false, priceByMonth: [390, 405, 430, 455, 500, 590, 540, 480, 440, 410, 400, 560] },
    ],
  },
  {
    flag: "🇦🇺",
    label: "멜버른",
    codes: "ICN → MEL",
    from: "icn",
    to: "mel",
    deals: [
      { airline: { iata: "MU", name: "중국동방항공" }, duration: "약 14–17시간", direct: false, priceByMonth: [310, 320, 350, 380, 430, 520, 480, 420, 380, 340, 325, 500] },
      { airline: { iata: "CZ", name: "중국남방항공" }, duration: "약 13–16시간", direct: false, priceByMonth: [330, 340, 365, 390, 450, 540, 500, 440, 395, 360, 345, 520] },
      { airline: { iata: "SQ", name: "싱가포르항공" }, duration: "약 14–18시간", direct: false, priceByMonth: [590, 620, 650, 700, 760, 920, 860, 780, 710, 660, 630, 900] },
      { airline: { iata: "CX", name: "캐세이퍼시픽" }, duration: "약 14–17시간", direct: false, priceByMonth: [560, 590, 630, 680, 730, 880, 830, 750, 690, 630, 600, 850] },
    ],
  },
  {
    flag: "🇦🇺",
    label: "브리즈번",
    codes: "ICN → BNE",
    from: "icn",
    to: "bne",
    deals: [
      { airline: { iata: "JQ", name: "제트스타" }, duration: "약 9시간 35분", direct: true, priceByMonth: [360, 375, 395, 420, 470, 560, 520, 470, 430, 390, 380, 540] },
      { airline: { iata: "KE", name: "대한항공" }, duration: "약 9시간 35분", direct: true, priceByMonth: [650, 680, 710, 760, 820, 960, 900, 820, 770, 710, 690, 940] },
      { airline: { iata: "SQ", name: "싱가포르항공" }, duration: "약 14–17시간", direct: false, priceByMonth: [560, 590, 630, 680, 740, 890, 840, 760, 700, 640, 610, 860] },
      { airline: { iata: "CZ", name: "중국남방항공" }, duration: "약 14–18시간", direct: false, priceByMonth: [340, 355, 380, 410, 460, 550, 510, 450, 410, 370, 360, 520] },
    ],
  },
];

export default function Dashboard() {
  useSEO({ title: "대시보드 | 호주잡스", description: "호주잡스 관리자 대시보드", noindex: true });
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [rates, setRates] = useState<RateData | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);
  const [selectedFlightMonth, setSelectedFlightMonth] = useState(() => getUpcomingFlightMonths()[0].value);
  const [krwAmount, setKrwAmount] = useState("1000000");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/");
  }, [user, isAdmin, loading]);

  useEffect(() => {
    if (isAdmin) fetchRate();
  }, [isAdmin]);

  const fetchRate = async () => {
    setLoadingRate(true);
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/KRW");
      const data = await res.json();
      if (data.result === "success") {
        const updatedDate = data.time_last_update_unix ? new Date(data.time_last_update_unix * 1000) : new Date();
        setRates({
          aud: data.rates.AUD,
          usd: data.rates.USD,
          jpy: data.rates.JPY,
          eur: data.rates.EUR,
          date: updatedDate.toISOString().slice(0, 10),
          updatedAt: formatRateUpdatedAt(updatedDate),
        });
        setLoadingRate(false);
        return;
      }
      throw new Error();
    } catch {
      try {
        const res = await fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/krw.json");
        const data = await res.json();
        const updatedDate = new Date();
        setRates({
          aud: data.krw.aud,
          usd: data.krw.usd,
          jpy: data.krw.jpy,
          eur: data.krw.eur,
          date: updatedDate.toISOString().slice(0, 10),
          updatedAt: formatRateUpdatedAt(updatedDate),
        });
      } catch {
        setRates(null);
      }
    }
    setLoadingRate(false);
  };

  if (loading) return <div className="flex w-full min-h-0 flex-1 items-center justify-center text-muted-foreground">로딩 중...</div>;
  if (!isAdmin) return null;

  const rateForCode = (code: string) => rates?.[code.toLowerCase() as keyof RateData] as number | undefined;
  const flightMonths = getUpcomingFlightMonths();
  const selectedFlightMonthIndex = Number(selectedFlightMonth.split("-")[1]) - 1;
  const calculatorKrw = Number(krwAmount.replace(/[^\d]/g, ""));
  const calculatorAud = rates ? calculatorKrw * rates.aud : 0;

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
              <button onClick={fetchRate} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                <RefreshCw className="h-3 w-3" /> 새로고침
              </button>
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
                  <p className="text-xs text-muted-foreground mt-1">
                    업데이트: {rates.updatedAt}
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
                  <p className="text-xs text-muted-foreground mt-0.5">인천 출발 편도 기준 · Skyscanner 확인</p>
                </div>
                <div className="flex h-8 w-[116px] shrink-0 items-center justify-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 text-xs font-semibold text-primary">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  {monthLabel(selectedFlightMonth)}
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
              {FLIGHT_ROUTES.map((route) => {
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
                          href={skyscannerUrl(route.from, route.to, selectedFlightMonth)}
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
                            <p className="text-sm font-bold text-primary">{flightPrice(deal.price)}~</p>
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
            <h2 className="text-sm font-bold text-foreground">📰 2026 워킹홀리데이 뉴스</h2>
            <p className="text-xs text-muted-foreground mt-0.5">호주 입국 전 알아두면 좋은 비자·일자리·생활 정보</p>
          </div>
          <div className="divide-y">
            {CURRENT_NEWS_ARTICLES.map((article, i) => (
              <a
                key={i}
                href={article.link}
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
