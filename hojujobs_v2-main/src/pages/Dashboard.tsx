import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSEO } from "@/hooks/useSEO";
import { Header } from "@/components/Header";
import { RefreshCw, ExternalLink, ArrowRight } from "lucide-react";

interface RateData {
  aud: number;
  usd: number;
  jpy: number;
  eur: number;
  date: string;
}

const CONVERSION_AMOUNTS = [100_000, 500_000, 1_000_000, 5_000_000];

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
    year: 2026,
    tag: "비자",
    summary: "ABC는 로트네스트 아일랜드는 원격 지역으로 인정되지만 마가렛 리버 등 일부 관광지는 인정되지 않아, 2차 비자를 준비하는 워홀러와 지역 카페·숙박업체 모두 인력 확보에 어려움을 겪고 있다고 보도했습니다.",
    link: "https://www.abc.net.au/news/2026-04-03/backpacker-visa-rules-south-west-wa-rottnest/106478874",
    source: "ABC News",
  },
  {
    title: "2026 최저임금 인상 논의 — 워홀 일자리 임금도 영향",
    date: "2026년 3월 26일",
    year: 2026,
    tag: "임금",
    summary: "연방정부가 2026년 연례 임금 심사에서 물가상승률보다 높은 최저·어워드 임금 인상을 요청했습니다. 카페, 식당, 리테일 등 워홀러가 많이 일하는 업종의 시급 기준을 확인해두면 좋습니다.",
    link: "https://www.abc.net.au/news/2026-03-26/lift-minimum-wage-above-inflation-federal-government-says/106497922",
    source: "ABC News",
  },
  {
    title: "이주 노동자 임금 체불 보고서 — 현금잡 주의",
    date: "2026년 5월",
    year: 2026,
    tag: "법률",
    summary: "Migrant Justice Institute의 새 보고서를 인용한 보도에 따르면 임금 체불, 슈퍼 미지급, 불법 공제 등 임시비자 노동자 착취가 여전히 큰 문제입니다. 출국 전에는 페이슬립, TFN, 슈퍼 계좌, 고용계약을 꼭 확인하세요.",
    link: "https://www.news.com.au/finance/work/at-work/international-students-cheated-out-of318bn-in-annual-wages-new-report-finds/news-story/28981750cb1f6db3b0f1ea9095165ed4",
    source: "news.com.au",
  },
  {
    title: "아웃백 일자리 감소 — 연료비 상승이 지역 워홀 구직에 영향",
    date: "2026년 4월 14일",
    year: 2026,
    tag: "2차 비자",
    summary: "ABC는 연료비 부담과 관광객 감소로 일부 아웃백 로드하우스와 지역 사업장이 시즌 직원을 줄이고 있다고 보도했습니다. 88일 지역 근무를 계획한다면 숙소·교통·실제 근무 가능 여부를 먼저 확인하는 편이 안전합니다.",
    link: "https://www.abc.net.au/news/2026-04-15/outback-workers-cut-as-tourists-stay-away-fuel-crisis-sa/106537958",
    source: "ABC News",
  },
  {
    title: "호주 호스텔 트렌드 변화 — 조용한 숙소·개인공간 수요 증가",
    date: "2026년 4월 22일",
    year: 2026,
    tag: "숙소",
    summary: "가디언은 호주 백패커 숙소가 대형 도미토리와 파티 중심에서 프라이버시, 소셜 공간, 지역 경험을 함께 제공하는 방향으로 바뀌고 있다고 소개했습니다. 도착 초반 숙소를 잡을 때 위치와 장기 숙박 할인도 함께 비교해보세요.",
    link: "https://www.theguardian.com/travel/2026/apr/22/backpacking-hostel-changes-private-rooms-luxury",
    source: "The Guardian",
  },
  {
    title: "2026 호주 생활비 가이드 — 도시별 예산 먼저 잡기",
    date: "2026년",
    year: 2026,
    tag: "생활비",
    summary: "2026년 호주 생활비는 도시와 숙소 형태에 따라 차이가 큽니다. 입국 전 첫 4주 숙소비, 교통카드, 유심, 식비, 보증금까지 계산해두면 첫 구직 기간을 훨씬 안정적으로 버틸 수 있습니다.",
    link: "https://www.switchliving.com.au/en/student-guide/cost-of-living-in-australia-for-international-students-in-2026-a-complete-guide/",
    source: "Switch Living",
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
const CURRENT_NEWS_ARTICLES = NEWS_ARTICLES.filter((article) => article.year === CURRENT_NEWS_YEAR);

function skyscannerUrl(from: string, to: string) {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(1);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `https://www.skyscanner.net/transport/flights/${from}/${to}/${yy}${mm}01/?adults=1&rtn=0&cabinclass=economy`;
}

function nextMonthLabel() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return `${d.getMonth() + 1}월 1일`;
}

const FLIGHT_ROUTES = [
  {
    flag: "🇦🇺",
    label: "시드니",
    codes: "ICN → SYD",
    duration: "약 10시간 10분",
    direct: true,
    fromPrice: "A$400",
    airlines: [
      { iata: "KE", name: "대한항공" },
      { iata: "JQ", name: "제트스타" },
      { iata: "QF", name: "콴타스" },
    ],
    from: "icn",
    to: "syd",
  },
  {
    flag: "🇦🇺",
    label: "멜버른",
    codes: "ICN → MEL",
    duration: "약 13–16시간",
    direct: false,
    fromPrice: "A$270",
    airlines: [
      { iata: "SQ", name: "싱가포르항공" },
      { iata: "CX", name: "캐세이퍼시픽" },
      { iata: "MH", name: "말레이시아항공" },
    ],
    from: "icn",
    to: "mel",
  },
  {
    flag: "🇦🇺",
    label: "브리즈번",
    codes: "ICN → BNE",
    duration: "약 9시간 35분",
    direct: true,
    fromPrice: "A$350",
    airlines: [
      { iata: "KE", name: "대한항공" },
      { iata: "JQ", name: "제트스타" },
      { iata: "SQ", name: "싱가포르항공" },
    ],
    from: "icn",
    to: "bne",
  },
];

export default function Dashboard() {
  useSEO({ title: "대시보드 | 호주잡스", description: "호주잡스 관리자 대시보드", noindex: true });
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [rates, setRates] = useState<RateData | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);

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
        setRates({ aud: data.rates.AUD, usd: data.rates.USD, jpy: data.rates.JPY, eur: data.rates.EUR, date: new Date().toISOString().slice(0, 10) });
        setLoadingRate(false);
        return;
      }
      throw new Error();
    } catch {
      try {
        const res = await fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/krw.json");
        const data = await res.json();
        setRates({ aud: data.krw.aud, usd: data.krw.usd, jpy: data.krw.jpy, eur: data.krw.eur, date: new Date().toISOString().slice(0, 10) });
      } catch {
        setRates(null);
      }
    }
    setLoadingRate(false);
  };

  if (loading) return <div className="flex w-full min-h-0 flex-1 items-center justify-center text-muted-foreground">로딩 중...</div>;
  if (!isAdmin) return null;

  const rateForCode = (code: string) => rates?.[code.toLowerCase() as keyof RateData] as number | undefined;

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
                    🇦🇺 A$1 = ₩{Math.round(1 / rates.aud).toLocaleString()} · {rates.date}
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
              </div>
            ) : (
              <div className="px-4 py-8 text-sm text-muted-foreground text-center">환율 정보를 불러올 수 없습니다.</div>
            )}
          </div>

          {/* Flights */}
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h2 className="text-sm font-bold text-foreground">🇰🇷 최저가 항공편</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{nextMonthLabel()} 편도 기준 · Skyscanner</p>
            </div>
            <div className="divide-y">
              {FLIGHT_ROUTES.map((route) => (
                <a
                  key={route.codes}
                  href={skyscannerUrl(route.from, route.to)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {route.flag} {route.label}
                      </p>
                      <span className="text-[10px] text-muted-foreground">{route.codes}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${route.direct ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"}`}>
                        {route.direct ? "직항" : "경유"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{route.duration}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      {route.airlines.map((a) => (
                        <img
                          key={a.iata}
                          src={`https://www.gstatic.com/flights/airline_logos/70px/${a.iata}.png`}
                          alt={a.name}
                          title={a.name}
                          className="h-5 w-5 rounded object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-primary">{route.fromPrice}~</p>
                    <ExternalLink className="h-3 w-3 text-muted-foreground mt-1 ml-auto" />
                  </div>
                </a>
              ))}
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
