import { ExternalLink, Languages } from "lucide-react";
import { Header } from "@/components/Header";
import { useSEO } from "@/hooks/useSEO";

type NewsTopic = {
  key: string;
  labelKo: string;
  summary: string;
  tone: string;
  stories: Array<{
    title: string;
    source: string;
    sourceUrl: string;
    summaryKo: string;
    meta: string;
    publishedAt: string;
  }>;
};

function translatedUrl(url: string) {
  return `https://translate.google.com/translate?sl=auto&tl=ko&u=${encodeURIComponent(url)}`;
}

function domainFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

const NEWS_TOPICS: NewsTopic[] = [
  {
    key: "stay",
    labelKo: "체류·안전",
    summary: "입국, 체류, 보건, 커뮤니티 안전처럼 호주 생활에 바로 연결되는 뉴스를 모았습니다.",
    tone: "from-blue-50 to-white border-blue-100",
    stories: [
      {
        title: "입국 금지된 여성이 호주행 비행기 탑승 시도",
        source: "ABC News",
        sourceUrl: "https://www.abc.net.au/news/2026-05-27/isis-linked-woman-barred-from-australia-flight/106728994",
        summaryKo: "임시 입국 제외 명령을 받은 여성이 호주행 항공편에 타려 했지만, 항공사와 국경 당국 시스템으로 탑승이 차단됐습니다.",
        meta: "입국 · 국경",
        publishedAt: "2026년 5월 27일",
      },
      {
        title: "IS 연계 여성과 아이들이 호주에서 첫 밤을 보내",
        source: "ABC News",
        sourceUrl: "https://www.abc.net.au/news/2026-05-27/isis-linked-women-and-children-sydney-melbourne-airports/106724938",
        summaryKo: "시드니와 멜버른 공항으로 들어온 여성과 아이들에 대해 경찰과 ASIO 조사가 이어지고 있다는 내용입니다.",
        meta: "입국 · 보안",
        publishedAt: "2026년 5월 27일",
      },
      {
        title: "호주 홍역 사례 증가, 해외여행 후 감염 주의",
        source: "ABC News",
        sourceUrl: "https://www.abc.net.au/news/2026-05-27/measles-cases-rise-in-australia-as-authorities-monitor-outbreaks/106722836",
        summaryKo: "호주 내 홍역 사례가 늘고 있으며, 남아시아와 동남아시아 여행 후 귀국한 감염 사례가 많아 예방접종 확인이 권고됩니다.",
        meta: "보건 · 여행",
        publishedAt: "2026년 5월 27일",
      },
      {
        title: "화해 주간 맞아 '진실을 위한 걷기' 국회 도착",
        source: "ABC News",
        sourceUrl: "https://www.abc.net.au/news/2026-05-27/national-walk-for-truth-ends-at-parliament-calls-for-albanese-/106726304",
        summaryKo: "5주 넘게 이어진 전국 걷기 행사가 국회에 도착하며, 호주 원주민 역사와 진실화해 논의가 다시 주목받았습니다.",
        meta: "커뮤니티 · 역사",
        publishedAt: "2026년 5월 27일",
      },
    ],
  },
  {
    key: "jobs",
    labelKo: "일자리",
    summary: "구직, 이직, 실업 지원, 지역 고용처럼 호주에서 일하는 사람에게 필요한 뉴스를 정리했습니다.",
    tone: "from-emerald-50 to-white border-emerald-100",
    stories: [
      {
        title: "정부, 수십 년 만의 실업 지원 제도 개편 제안",
        source: "ABC News",
        sourceUrl: "https://www.abc.net.au/news/2026-05-27/jobseeker-unemployment-overhaul/106725618",
        summaryKo: "백만 명이 넘는 구직자를 대상으로 지원 단계를 나누고, 취업 서비스와 상호 의무 제도를 바꾸는 큰 개편안이 발표됐습니다.",
        meta: "구직 · 제도",
        publishedAt: "2026년 5월 27일",
      },
      {
        title: "새 실업 지원 제도 변화 한눈에 보기",
        source: "ABC News",
        sourceUrl: "https://www.abc.net.au/news/2026-05-27/unemployment-system-mutual-obligation-changes-centrelink/106726178",
        summaryKo: "센터링크, 상호 의무, 취업 서비스 제공 방식이 어떻게 달라질 수 있는지 구직자 입장에서 설명한 기사입니다.",
        meta: "센터링크 · 구직",
        publishedAt: "2026년 5월 27일",
      },
      {
        title: "실업 지원 개편 발표를 실시간으로 정리한 정치 라이브",
        source: "ABC News",
        sourceUrl: "https://www.abc.net.au/news/2026-05-27/federal-politics-live-blog-jobseekers-estimates-isis-brides-cgt/106724430",
        summaryKo: "고용부 장관 발표와 의회 반응을 따라가며, 취업 지원 제도 변화가 왜 나왔는지 배경을 볼 수 있습니다.",
        meta: "정부 · 취업",
        publishedAt: "2026년 5월 27일",
      },
      {
        title: "쿠버페디 경찰 인력 유치안 거절, 지역 인력난 계속",
        source: "ABC News",
        sourceUrl: "https://www.abc.net.au/news/2026-05-27/sa-police-commissioner-rejects-coober-pedy-staffing-plan/106722262",
        summaryKo: "외곽 지역에서 필수 인력을 구하고 유지하는 일이 얼마나 어려운지 보여주는 사례로, 지역 취업을 고려하는 사람에게 참고가 됩니다.",
        meta: "지역 · 인력난",
        publishedAt: "2026년 5월 27일",
      },
    ],
  },
  {
    key: "housing",
    labelKo: "주거·생활비",
    summary: "렌트, 주택 안전, 보험, 물가처럼 매달 지출에 직접 연결되는 기사를 골랐습니다.",
    tone: "from-violet-50 to-white border-violet-100",
    stories: [
      {
        title: "시드니 주택 곰팡이 문제와 보험 분쟁 장기화",
        source: "ABC News",
        sourceUrl: "https://www.abc.net.au/news/2026-05-27/home-insurance-nine-year-battle-mould-roof-repairs/106400538",
        summaryKo: "집 수리와 보험 처리 지연으로 주택이 살기 어려운 상태가 된 사례를 통해 보험 청구와 주거 안전 문제를 다룹니다.",
        meta: "주거 · 보험",
        publishedAt: "2026년 5월 27일",
      },
      {
        title: "렌트난이 가정폭력 피해자의 안전한 주거를 막아",
        source: "ABC News",
        sourceUrl: "https://www.abc.net.au/news/2026-05-27/qld-domestic-violence-housing-rental-affordability/106591974",
        summaryKo: "높은 렌트와 낮은 공실률 때문에 안전한 집을 찾기 어려운 사람들이 늘고 있다는 주거 위기 보도입니다.",
        meta: "렌트 · 안전",
        publishedAt: "2026년 5월 27일",
      },
      {
        title: "4월 물가상승률 4.2%, 연료비 하락이 영향",
        source: "ABC News",
        sourceUrl: "https://www.abc.net.au/news/2026-05-27/headline-inflation-at-4-2-per-cent-in-april-2026/106726182",
        summaryKo: "연료비 하락으로 헤드라인 물가가 완화됐지만, 주거와 기타 생활비 압박은 계속될 수 있다는 경제 기사입니다.",
        meta: "생활비 · 물가",
        publishedAt: "2026년 5월 27일",
      },
      {
        title: "제럴턴 시의회, 핵심 노동자 주택 개발 부지 확보",
        source: "ABC News",
        sourceUrl: "https://www.abc.net.au/news/2026-05-27/geraldton-council-buys-crown-land-for-one-dollar/106723070",
        summaryKo: "서호주 제럴턴에서 핵심 노동자 숙소를 만들기 위해 지방정부가 주택 개발에 나서는 사례를 다룹니다.",
        meta: "지역 · 주택",
        publishedAt: "2026년 5월 27일",
      },
    ],
  },
  {
    key: "travel",
    labelKo: "여행·교통",
    summary: "공항, 도로, 이동, 여행 안전처럼 호주 안팎을 오갈 때 필요한 뉴스를 모았습니다.",
    tone: "from-amber-50 to-white border-amber-100",
    stories: [
      {
        title: "국립공원 실종 모자 구조 사례가 알려준 여행 안전 수칙",
        source: "SBS Korean",
        sourceUrl: "https://www.sbs.com.au/language/korean/ko/podcast-episode/lost-for-10-days-in-mount-royal-national-park/47xr3l4gt/",
        summaryKo: "호주 국립공원에서 길을 잃었던 모자가 구조된 사례를 통해 산행 전 동선 공유와 비상 준비의 중요성을 설명합니다.",
        meta: "여행 · 안전",
        publishedAt: "2026년 5월 27일",
      },
      {
        title: "케언즈 출근 시간대 도난 차량 추격으로 교통 혼잡",
        source: "ABC News",
        sourceUrl: "https://www.abc.net.au/news/2026-05-27/allegedly-stolen-cars-cause-peak-hour-traffic-chaos-in-cairns/106728196",
        summaryKo: "여러 대의 도난 의심 차량이 케언즈 도로를 위험하게 달리며 출근 시간 교통에 큰 영향을 줬습니다.",
        meta: "도로 · 교통",
        publishedAt: "2026년 5월 27일",
      },
      {
        title: "브리즈번 남부 타이어 매장 화재로 도로 통제",
        source: "ABC News",
        sourceUrl: "https://www.abc.net.au/news/2026-05-27/authorities-fighting-tyre-fire-kingston-logan/106728244",
        summaryKo: "로건 킹스턴의 화재로 인근 도로가 통제되고 주민에게 실내 대피와 창문 닫기가 권고됐습니다.",
        meta: "도로 · 안전",
        publishedAt: "2026년 5월 27일",
      },
      {
        title: "휘트선데이 앞바다에서 어선 침몰 후 구조",
        source: "ABC News",
        sourceUrl: "https://www.abc.net.au/news/2026-05-27/fishermen-and-dog-rescued-off-whitsundays-queensland-coast/106726522",
        summaryKo: "퀸즐랜드 해상에서 어선이 침몰한 뒤 구조 작업이 이뤄졌으며, 비상 신호기 등록의 중요성이 강조됐습니다.",
        meta: "해양 · 여행안전",
        publishedAt: "2026년 5월 27일",
      },
    ],
  },
];

export default function News() {
  useSEO({
    title: "뉴스 | Hoju Jobs",
    description: "호주에 사는 한국인이 알아두면 좋은 체류, 일자리, 주거, 생활비, 여행 뉴스를 한국어로 확인하세요.",
    canonical: "https://hojujobs.com/news",
    htmlLang: "ko",
    ogLocale: "ko_KR",
  });

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col bg-[#f7f8fb]">
      <Header />

      <main className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-10">
        <section className="mb-7 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-[#111] px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-normal text-slate-400">호주 생활 뉴스 브리핑</p>
                <h1 className="mt-1 text-2xl font-black tracking-normal text-white sm:text-3xl">뉴스</h1>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300">
                <Languages className="h-3.5 w-3.5" />
                한국어 번역 링크 포함
              </div>
            </div>
          </div>
          <nav className="grid grid-cols-4 divide-x divide-slate-200 bg-white" aria-label="뉴스 주제">
            {NEWS_TOPICS.map((topic) => (
              <a
                key={topic.key}
                href={`#${topic.key.toLowerCase()}`}
                className="px-2 py-3 text-center text-xs font-black text-slate-900 transition-colors hover:bg-slate-50 sm:px-5 sm:text-lg"
              >
                {topic.labelKo}
              </a>
            ))}
          </nav>
        </section>

        <div className="grid gap-5">
          {NEWS_TOPICS.map((topic) => (
            <section
              key={topic.key}
              id={topic.key.toLowerCase()}
              className={`overflow-hidden rounded-lg border bg-gradient-to-br ${topic.tone}`}
            >
              <div className="grid gap-0 lg:grid-cols-[17rem_1fr]">
                <div className="border-b border-inherit bg-white/55 p-3 sm:p-5 lg:border-b-0 lg:border-r">
                  <p className="text-[11px] font-bold tracking-normal text-slate-500 sm:text-xs">추천 주제</p>
                  <h2 className="mt-0.5 text-xl font-black tracking-normal text-slate-950 sm:mt-1 sm:text-2xl">{topic.labelKo}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:mt-3 sm:text-sm">{topic.summary}</p>
                </div>

                <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-4">
                  {topic.stories.map((story) => (
                    <article key={story.sourceUrl} className="flex min-h-[13rem] flex-col rounded-lg border border-white/70 bg-white p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">{story.meta}</span>
                        <span className="text-right text-[11px] font-medium text-slate-400">{story.publishedAt}</span>
                      </div>
                      <h3 className="text-base font-black leading-snug text-slate-950">{story.title}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{story.summaryKo}</p>
                      <a
                        href={translatedUrl(story.sourceUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-slate-950 px-3 text-xs font-bold text-white transition-colors hover:bg-primary"
                      >
                        번역 기사 보기
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                        {story.source} · {domainFromUrl(story.sourceUrl)}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
