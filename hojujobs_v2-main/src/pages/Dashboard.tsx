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
    title: "RBA, 물가 압력·경기침체 위험 경고",
    date: "2026년 5월 19일",
    publishedAt: "2026-05-19T15:19:00+10:00",
    year: 2026,
    tag: "경제",
    summary: "ABC는 RBA가 유가와 운송비 상승이 소비자 물가로 번질 수 있다고 경고했다고 전했습니다. 워홀러와 유학생은 렌트, 장보기, 교통비가 다시 오를 수 있어 예산을 넉넉히 잡고 급여·근무시간을 꼼꼼히 확인하는 편이 좋습니다.",
    link: "https://www.abc.net.au/news/2026-05-19/reserve-bank-sarah-hunter-mentions-recession-inflation/106695446",
    source: "ABC News",
    domain: "abc.net.au",
  },
  {
    title: "주차장 의무 규정이 집값을 올린다는 보고서",
    date: "2026년 5월 19일",
    publishedAt: "2026-05-19T21:07:00+10:00",
    year: 2026,
    tag: "주거",
    summary: "Grattan Institute 보고서는 새 아파트에 일정 수의 주차장을 강제로 넣는 규정이 도시 주거비를 키운다고 지적했습니다. 차 없이 시티·역세권에 사는 유학생과 워홀러에게는 렌트와 아파트 공급 논의가 직접적인 생활비 이슈가 될 수 있습니다.",
    link: "https://www.abc.net.au/news/2026-05-19/grattan-institute-calls-for-abolition-of-parking-minimums/106698234",
    source: "ABC News",
    domain: "abc.net.au",
  },
  {
    title: "호주 디프테리아 확산, 백신 확인 필요",
    date: "2026년 5월 19일",
    publishedAt: "2026-05-19T10:55:00+10:00",
    year: 2026,
    tag: "건강",
    summary: "ABC는 NT에서 시작된 디프테리아 발생이 WA, QLD, SA로 번졌고 보건당국이 검사와 백신 접종을 권고한다고 보도했습니다. 장기 체류자, 쉐어하우스 거주자, 지역 이동이 잦은 워홀러는 본인 예방접종 기록과 GP·약국 상담 가능 여부를 확인해 두세요.",
    link: "https://www.abc.net.au/news/2026-05-19/mark-butler-nt-diphtheria-outbreak-spreads-to-sa-qld/106695586",
    source: "ABC News",
    domain: "abc.net.au",
  },
  {
    title: "야당 이민정책 표현 두고 내부 비판",
    date: "2026년 5월 19일",
    publishedAt: "2026-05-19T13:19:00+10:00",
    year: 2026,
    tag: "이민",
    summary: "SBS는 한 자유당 상원의원이 이민을 주택 공급과 묶어 제한하겠다는 야당 정책의 표현이 이민자 커뮤니티를 소외시킬 수 있다고 비판했다고 전했습니다. 한국인 영주권자·유학생·워홀러 모두 이민 논쟁이 복지, 주거, 비자 분위기에 영향을 줄 수 있어 흐름을 봐둘 만합니다.",
    link: "https://www.sbs.com.au/news/article/taylor-responds-liberal-senator-breaks-ranks-coalition-migration-policy/v6w78i9m0",
    source: "SBS News",
    domain: "sbs.com.au",
  },
  {
    title: "지역 인터넷 지원 서비스 예산 끊겨 폐쇄 위기",
    date: "2026년 5월 19일",
    publishedAt: "2026-05-19T10:30:00+10:00",
    year: 2026,
    tag: "지역",
    summary: "ABC는 농촌·지역 주민의 모바일·인터넷 문제를 돕던 Regional Tech Hub가 연방예산 지원을 잃어 폐쇄 위기에 놓였다고 보도했습니다. 농장, 리조트, 지방 숙소에서 일하는 워홀러는 통신 음영지역과 긴급전화 가능 여부를 출발 전 확인하는 것이 중요합니다.",
    link: "https://www.abc.net.au/news/2026-05-19/independent-tech-help-service-loses-funding/106682522",
    source: "ABC News",
    domain: "abc.net.au",
  },
  {
    title: "골드코스트 폭우, 학생·등산객 구조",
    date: "2026년 5월 19일",
    publishedAt: "2026-05-19T06:58:00+10:00",
    year: 2026,
    tag: "안전",
    summary: "ABC는 남동부 QLD와 북부 NSW 폭우로 구조가 이어졌고, Mount Barney 국립공원에서 학생과 교사 48명이 구조됐다고 전했습니다. 여행·로드트립 중에는 침수 도로를 건너지 말고 BOM, 주정부 교통정보, 숙소 안내를 수시로 확인하세요.",
    link: "https://www.abc.net.au/news/2026-05-19/school-students-rescued-mt-barney-gold-coast-rainfall/106695244",
    source: "ABC News",
    domain: "abc.net.au",
  },
  {
    title: "호주 이민자 신문 100년, 커뮤니티 연결의 힘",
    date: "2026년 5월 19일",
    publishedAt: "2026-05-19T05:36:00+10:00",
    year: 2026,
    tag: "커뮤니티",
    summary: "SBS는 그리스계 호주 신문이 100년 동안 언어, 일자리 정보, 문화 소식을 이어온 이야기를 소개했습니다. 한인 커뮤니티도 구인구직, 정착 정보, 세대 간 연결에서 같은 역할을 하므로 호주 생활 초반에는 신뢰할 만한 커뮤니티 채널을 잘 고르는 것이 도움이 됩니다.",
    link: "https://www.sbs.com.au/news/article/how-one-of-australias-oldest-migrant-newspapers-is-still-making-headlines/oiylf44u3",
    source: "SBS News",
    domain: "sbs.com.au",
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
  "여행": "bg-sky-50 text-sky-700",
  "일자리": "bg-emerald-50 text-emerald-700",
  "기술": "bg-slate-50 text-slate-700",
  "유학": "bg-violet-50 text-violet-700",
  "안전": "bg-rose-50 text-rose-700",
  "이민": "bg-amber-50 text-amber-700",
  "워홀": "bg-orange-50 text-orange-700",
  "경제": "bg-lime-50 text-lime-700",
  "주거": "bg-cyan-50 text-cyan-700",
  "건강": "bg-red-50 text-red-700",
  "지역": "bg-teal-50 text-teal-700",
  "커뮤니티": "bg-fuchsia-50 text-fuchsia-700",
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

function isUnder24Hours(duration: string) {
  const hours = duration.match(/\d+/g)?.map(Number);
  if (!hours?.length) return false;
  return Math.max(...hours) < 24;
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
      { airline: { iata: "TR", name: "스쿠트" }, duration: "약 18–24시간", direct: false, priceByMonth: [335, 318, 312, 325, 312, 298, 288, 297, 314, 295, 335, 380] },
      { airline: { iata: "D7", name: "에어아시아 X" }, duration: "약 17–23시간", direct: false, priceByMonth: [330, 315, 305, 320, 306, 306, 257, 315, 304, 310, 335, 395] },
      { airline: { iata: "JQ", name: "제트스타" }, duration: "약 10시간 15분", direct: true, priceByMonth: [480, 410, 380, 430, 390, 393, 342, 241, 299, 342, 365, 450] },
    ],
  },
  {
    flag: "🇦🇺",
    label: "멜버른",
    codes: "ICN → MEL",
    from: "icn",
    to: "mel",
    deals: [
      { airline: { iata: "D7", name: "에어아시아 X" }, duration: "약 17–23시간", direct: false, priceByMonth: [360, 330, 320, 315, 300, 259, 254, 285, 310, 300, 320, 410] },
      { airline: { iata: "TR", name: "스쿠트" }, duration: "약 18–24시간", direct: false, priceByMonth: [365, 325, 310, 315, 305, 320, 338, 284, 321, 307, 336, 430] },
      { airline: { iata: "ZH", name: "선전항공" }, duration: "약 18–22시간", direct: false, priceByMonth: [380, 340, 330, 335, 320, 284, 395, 315, 331, 320, 336, 450] },
      { airline: { iata: "VJ", name: "비엣젯항공" }, duration: "약 20–25시간", direct: false, priceByMonth: [390, 350, 335, 340, 320, 330, 360, 315, 281, 330, 350, 470] },
    ],
  },
  {
    flag: "🇦🇺",
    label: "브리즈번",
    codes: "ICN → BNE",
    from: "icn",
    to: "bne",
    deals: [
      { airline: { iata: "VJ", name: "비엣젯항공" }, duration: "약 20–24시간", direct: false, priceByMonth: [330, 320, 306, 315, 309, 259, 368, 315, 269, 273, 284, 306] },
      { airline: { iata: "JQ", name: "제트스타" }, duration: "약 9시간 35분", direct: true, priceByMonth: [378, 360, 340, 345, 378, 341, 411, 390, 360, 370, 380, 410] },
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
      { airline: { iata: "CZ", name: "중국남방항공" }, duration: "약 18–22시간", direct: false, priceByMonth: [318000, 306000, 302000, 308000, 304000, 298000, 312000, 296000, 304000, 292000, 318000, 365000] },
      { airline: { iata: "TR", name: "스쿠트" }, duration: "약 18–23시간", direct: false, priceByMonth: [308000, 293000, 287000, 299000, 287000, 274000, 265000, 273000, 289000, 271000, 308000, 350000] },
      { airline: { iata: "D7", name: "에어아시아 X" }, duration: "약 17–23시간", direct: false, priceByMonth: [304000, 290000, 281000, 294000, 281000, 282000, 237000, 290000, 280000, 285000, 308000, 363000] },
      { airline: { iata: "JQ", name: "제트스타" }, duration: "약 10시간 15분", direct: true, priceByMonth: [442000, 377000, 350000, 396000, 359000, 362000, 315000, 222000, 275000, 315000, 336000, 414000] },
    ],
  },
  {
    flag: "🇦🇺",
    label: "멜버른",
    codes: "ICN → MEL",
    from: "icn",
    to: "mel",
    deals: [
      { airline: { iata: "ZH", name: "선전항공" }, duration: "약 18–22시간", direct: false, priceByMonth: [315000, 302000, 296000, 300000, 292000, 261000, 338000, 285000, 298000, 294000, 309000, 398000] },
      { airline: { iata: "MU", name: "중국동방항공" }, duration: "약 17–22시간", direct: false, priceByMonth: [322000, 310000, 304000, 308000, 298000, 294000, 345000, 292000, 301000, 296000, 314000, 405000] },
      { airline: { iata: "D7", name: "에어아시아 X" }, duration: "약 17–23시간", direct: false, priceByMonth: [331000, 304000, 294000, 290000, 276000, 238000, 234000, 262000, 285000, 276000, 294000, 377000] },
      { airline: { iata: "TR", name: "스쿠트" }, duration: "약 18–23시간", direct: false, priceByMonth: [336000, 299000, 285000, 290000, 281000, 294000, 311000, 261000, 295000, 282000, 309000, 396000] },
      { airline: { iata: "VJ", name: "비엣젯항공" }, duration: "약 20–23시간", direct: false, priceByMonth: [359000, 322000, 308000, 313000, 294000, 304000, 331000, 290000, 259000, 304000, 322000, 432000] },
    ],
  },
  {
    flag: "🇦🇺",
    label: "브리즈번",
    codes: "ICN → BNE",
    from: "icn",
    to: "bne",
    deals: [
      { airline: { iata: "VJ", name: "비엣젯항공" }, duration: "약 20–23시간", direct: false, priceByMonth: [304000, 294000, 282000, 290000, 284000, 238000, 339000, 290000, 247000, 251000, 261000, 282000] },
      { airline: { iata: "JQ", name: "제트스타" }, duration: "약 9시간 35분", direct: true, priceByMonth: [348000, 331000, 313000, 317000, 348000, 314000, 378000, 359000, 331000, 340000, 350000, 377000] },
      { airline: { iata: "KE", name: "대한항공" }, duration: "약 9시간 30분", direct: true, priceByMonth: [760000, 720000, 690000, 710000, 730000, 690000, 740000, 720000, 700000, 720000, 730000, 820000] },
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
              <div className="min-h-[360px]" aria-busy="true">
                <div className="px-4 py-4 border-b">
                  <div className="h-8 w-48 rounded bg-muted animate-pulse" />
                  <div className="mt-2 h-4 w-28 rounded bg-muted animate-pulse" />
                </div>
                <div className="divide-y border-b">
                  {CONVERSION_AMOUNTS.map((krw) => (
                    <div key={krw} className="flex items-center justify-between px-4 py-2">
                      <span className="h-4 w-20 rounded bg-muted animate-pulse" />
                      <span className="h-4 w-24 rounded bg-muted animate-pulse" />
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 space-y-2">
                  <div className="h-3 w-36 rounded bg-muted animate-pulse" />
                  {EXTRA_RATES.map(({ code }) => (
                    <div key={code} className="flex items-center justify-between">
                      <span className="h-4 w-24 rounded bg-muted animate-pulse" />
                      <span className="h-4 w-20 rounded bg-muted animate-pulse" />
                    </div>
                  ))}
                </div>
                <div className="border-t px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="h-4 w-28 rounded bg-muted animate-pulse" />
                      <div className="mt-2 h-3 w-36 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="h-6 w-20 rounded bg-muted animate-pulse" />
                  </div>
                  <div className="mt-3 h-10 rounded-md border border-input bg-white" />
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    {CALCULATOR_PRESETS.map((amount) => (
                      <div key={amount} className="h-8 rounded-md border border-border bg-white" />
                    ))}
                  </div>
                  <div className="mt-2 h-3 w-full rounded bg-muted animate-pulse" />
                </div>
              </div>
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
                  <p className="text-xs text-muted-foreground mt-0.5">인천 출발 편도 · 24시간 미만 기준</p>
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
                  .filter((deal) => isUnder24Hours(deal.duration))
                  .map((deal) => ({ ...deal, price: deal.priceByMonth[selectedFlightMonthIndex] }))
                  .sort((a, b) => a.price - b.price)
                  .slice(0, 1);

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
            <p className="text-xs text-muted-foreground mt-0.5">2026년 5월 19일 기사만 · 이민, 생활비, 주거, 안전</p>
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
