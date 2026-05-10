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

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  thumbnail: string | null;
  description: string;
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

function todayLabel() {
  const d = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}(${days[d.getDay()]})`;
}

export default function Dashboard() {
  useSEO({ title: "대시보드 | 호주잡스", description: "호주잡스 관리자 대시보드", noindex: true });
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [rates, setRates] = useState<RateData | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/");
  }, [user, isAdmin, loading]);

  useEffect(() => {
    if (isAdmin) {
      fetchRate();
      fetchNews();
    }
  }, [isAdmin]);

  const fetchRate = async () => {
    setLoadingRate(true);
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/KRW");
      const data = await res.json();
      if (data.result === "success") {
        setRates({
          aud: data.rates.AUD,
          usd: data.rates.USD,
          jpy: data.rates.JPY,
          eur: data.rates.EUR,
          date: new Date().toISOString().slice(0, 10),
        });
        setLoadingRate(false);
        return;
      }
      throw new Error();
    } catch {
      try {
        const res = await fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/krw.json");
        const data = await res.json();
        setRates({
          aud: data.krw.aud,
          usd: data.krw.usd,
          jpy: data.krw.jpy,
          eur: data.krw.eur,
          date: new Date().toISOString().slice(0, 10),
        });
      } catch {
        setRates(null);
      }
    }
    setLoadingRate(false);
  };

  const fetchNews = async () => {
    setLoadingNews(true);
    try {
      const feed = encodeURIComponent("https://www.abc.net.au/news/feed/51120/rss.xml");
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${feed}&count=6`);
      const data = await res.json();
      if (data.status === "ok") {
        setNews(data.items.map((item: { title: string; link: string; pubDate: string; thumbnail: string | null; description: string }) => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          thumbnail: item.thumbnail || null,
          description: item.description?.replace(/<[^>]+>/g, "").slice(0, 100) ?? "",
        })));
      }
    } catch {
      setNews([]);
    }
    setLoadingNews(false);
  };

  if (loading) return <div className="flex w-full min-h-0 flex-1 items-center justify-center text-muted-foreground">로딩 중...</div>;
  if (!isAdmin) return null;

  const rateForCode = (code: string) => {
    if (!rates) return null;
    return rates[code.toLowerCase() as keyof RateData] as number;
  };

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col bg-background">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8 w-full space-y-6">

        {/* Date */}
        <div className="flex items-center justify-end">
          <span className="text-sm text-muted-foreground">{todayLabel()}</span>
        </div>

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
                {/* Main KRW → AUD rate */}
                <div className="px-4 py-4 border-b">
                  <p className="text-2xl font-bold text-foreground">
                    ₩1,000 = <span className="text-primary">A${(rates.aud * 1000).toFixed(3)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    🇦🇺 A$1 = ₩{Math.round(1 / rates.aud).toLocaleString()} · {rates.date}
                  </p>
                </div>
                {/* KRW → AUD conversion table */}
                <div className="divide-y border-b">
                  {CONVERSION_AMOUNTS.map((krw) => (
                    <div key={krw} className="flex items-center justify-between px-4 py-2">
                      <span className="text-sm text-muted-foreground">₩{krw.toLocaleString()}</span>
                      <span className="text-sm font-semibold text-foreground">A${(rates.aud * krw).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                {/* Extra rates */}
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
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <h2 className="text-sm font-bold text-foreground">🇦🇺 호주 최신 뉴스</h2>
              <p className="text-xs text-muted-foreground mt-0.5">ABC News Australia</p>
            </div>
            <button onClick={fetchNews} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              <RefreshCw className="h-3 w-3" /> 새로고침
            </button>
          </div>
          {loadingNews ? (
            <div className="px-4 py-8 text-sm text-muted-foreground text-center">불러오는 중...</div>
          ) : news.length === 0 ? (
            <div className="px-4 py-8 text-sm text-muted-foreground text-center">뉴스를 불러올 수 없습니다.</div>
          ) : (
            <div className="divide-y">
              {news.map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors group"
                >
                  {item.thumbnail && (
                    <img src={item.thumbnail} alt="" className="h-14 w-20 rounded object-cover shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(item.pubDate).toLocaleDateString("ko-KR")}</p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                </a>
              ))}
            </div>
          )}
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
