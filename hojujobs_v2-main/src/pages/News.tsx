import { ExternalLink, Languages, Newspaper, Radio } from "lucide-react";
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
    key: "Politics",
    labelKo: "정치",
    summary: "연방 의회, 국방, 이민, 생활 정책처럼 호주 거주자가 바로 영향을 받는 정치 뉴스를 모았습니다.",
    tone: "from-blue-50 to-white border-blue-100",
    stories: [
      {
        title: "AUKUS 실패 시 잠수함 '플랜 B'는 없다고 말한 국방장관",
        source: "ABC News",
        sourceUrl: "https://www.abc.net.au/news/2026-05-27/no-plan-b-for-submarines-if-aukus-fails-says-defence-minister/106728832",
        summaryKo: "리처드 말스 국방장관은 AUKUS 잠수함 계획이 어렵지만 방향을 바꾸면 장거리 잠수함 확보 자체를 포기하는 결과가 될 수 있다고 말했습니다.",
        meta: "정책 · 국방",
        publishedAt: "2026년 5월 27일",
      },
      {
        title: "ABC 뉴스 책임자 저스틴 스티븐스 사임",
        source: "Guardian Australia",
        sourceUrl: "https://www.theguardian.com/australia-news/live/2026/may/27/australia-politics-live-quad-wong-jobseeker-capital-gains-tax-budget-anthony-albanese-angus-taylor-labor-coalition-one-nation-question-time-senate-estimates-ntwnfb?filterKeyEvents=false&page=with%3Ablock-6a165a4b8f0803c3c6f95a8e",
        summaryKo: "가디언 정치 라이브는 ABC 뉴스 책임자 사임, 의회 질의, 세제 개편 논란 등 하루 주요 정치 흐름을 정리했습니다.",
        meta: "정치 · 미디어",
        publishedAt: "2026년 5월 27일",
      },
      {
        title: "입국 금지된 ISIS 연계 여성이 호주행 비행기 탑승 시도",
        source: "ABC News",
        sourceUrl: "https://www.abc.net.au/news/2026-05-27/isis-linked-woman-barred-from-australia-flight/106728994",
        summaryKo: "임시 입국 제외 명령을 받은 호주 여성이 시리아에서 호주행 비행기에 오르려 했으나 탑승이 차단됐다고 보도했습니다.",
        meta: "안보 · 이민",
        publishedAt: "2026년 5월 27일",
      },
    ],
  },
  {
    key: "World",
    labelKo: "세계",
    summary: "호주 관점에서 보는 국제 정세, 외교, 전쟁, 글로벌 경제 리스크를 정리했습니다.",
    tone: "from-sky-50 to-white border-sky-100",
    stories: [
      {
        title: "IS 연계 여성과 아이들 2차 그룹 호주 도착",
        source: "SBS News",
        sourceUrl: "https://www.sbs.com.au/news/video/second-group-of-is-linked-women-and-children-arrive-in-australia/rtkmxrc3k",
        summaryKo: "SBS는 시리아 수용소에서 온 여성과 아이들이 시드니와 멜버른에 도착했으며, 관련 수사가 계속되고 있다고 전했습니다.",
        meta: "국제 · 호주",
        publishedAt: "2026년 5월 27일",
      },
      {
        title: "시리아 수용소의 호주 가족들은 누구인가",
        source: "ABC News",
        sourceUrl: "https://www.abc.net.au/news/2026-05-02/who-are-the-australians-from-al-roj-isis-camp-in-syria/106629466",
        summaryKo: "ABC는 시리아 알 로즈 수용소에 있던 호주 여성과 아이들의 배경, 귀국 과정, 법적 쟁점을 설명했습니다.",
        meta: "배경 · 시리아",
        publishedAt: "2026년 5월 2일",
      },
      {
        title: "시리아 수용소 호주 여성들, 아이들만이라도 귀국하길 원한다고 밝혀",
        source: "The Guardian",
        sourceUrl: "https://www.theguardian.com/australia-news/2026/feb/24/australian-women-syria-camps-children-ntwnfb",
        summaryKo: "가디언은 시리아 수용소에 있던 일부 호주 여성들이 자녀들이 안전하게 호주로 갈 수 있다면 분리도 받아들이겠다고 말했다고 보도했습니다.",
        meta: "인권 · 국제",
        publishedAt: "2026년 2월 24일",
      },
    ],
  },
  {
    key: "Business",
    labelKo: "비즈니스",
    summary: "일자리, 물가, 주거, 기업, 시장 뉴스를 호주 생활 관점에서 볼 수 있게 묶었습니다.",
    tone: "from-emerald-50 to-white border-emerald-100",
    stories: [
      {
        title: "리버티 벨 베이 노동자 지원금 500만 달러 추가 발표",
        source: "Department of Industry",
        sourceUrl: "https://www.minister.industry.gov.au/ministers/timayres/media-releases/5-million-support-liberty-bell-bay-workers-preferred-bidder-named",
        summaryKo: "연방·태즈메이니아 정부는 매각 절차가 진행되는 동안 리버티 벨 베이 제련소 직원 고용 유지를 위해 추가 지원을 발표했습니다.",
        meta: "산업 · 고용",
        publishedAt: "2026년 5월 27일",
      },
      {
        title: "주택 승인 속도를 높이기 위해 AI 도입",
        source: "ABC News",
        sourceUrl: "https://www.abc.net.au/news/2026-05-11/housing-artificial-intelligence-epbc-assessments-federal-budget/106663464",
        summaryKo: "ABC는 연방정부가 주택·에너지 프로젝트 환경평가를 빠르게 하기 위한 AI 도구에 예산을 투입한다고 보도했습니다.",
        meta: "주택 · 예산",
        publishedAt: "2026년 5월 11일",
      },
      {
        title: "와이알라 제철소와 섬 제련소 매각 움직임",
        source: "Yahoo Finance / AAP",
        sourceUrl: "https://au.finance.yahoo.com/news/no-whyalla-wipeout-final-race-020517458.html/",
        summaryKo: "AAP 보도는 와이알라 제철소와 벨 베이 제련소 매각 절차가 노동자와 지역 산업에 어떤 의미를 갖는지 설명했습니다.",
        meta: "기업 · 지역경제",
        publishedAt: "2026년 5월 27일",
      },
    ],
  },
  {
    key: "Analysis",
    labelKo: "분석",
    summary: "뉴스 뒤의 맥락을 읽을 수 있는 해설, 칼럼, 데이터 기반 분석을 모았습니다.",
    tone: "from-violet-50 to-white border-violet-100",
    stories: [
      {
        title: "AUKUS '플랜 B' 논의가 커지는 이유",
        source: "ABC Analysis",
        sourceUrl: "https://www.abc.net.au/news/2026-05-23/why-theres-more-talk-of-an-aukus-plan-b/106705426",
        summaryKo: "ABC 분석은 잠수함 건조 지연과 노후 함대 문제 때문에 AUKUS 대안 논의가 왜 다시 커졌는지 짚었습니다.",
        meta: "분석 · 국방",
        publishedAt: "2026년 5월 23일",
      },
      {
        title: "주택 위기와 이민 계산법은 정치권 주장보다 복잡하다",
        source: "ABC Analysis",
        sourceUrl: "https://www.abc.net.au/news/2026-05-25/housing-crisis-migration-cap-kohler/106716056",
        summaryKo: "앨런 콜러의 분석은 이민 숫자와 주택 공급을 단순히 연결하는 정치적 주장 뒤의 경제적 복잡성을 설명합니다.",
        meta: "분석 · 주택",
        publishedAt: "2026년 5월 25일",
      },
      {
        title: "BHP 파일이 드러낸 광산 대기업의 큰 문제",
        source: "ABC Analysis",
        sourceUrl: "https://www.abc.net.au/news/2026-05-25/bhp-leaked-documents-climate-emissions-cuts-delay-electric-truck/106706762",
        summaryKo: "ABC와 포 코너스 보도는 BHP 내부 문건을 통해 청정에너지 전환 약속과 실제 투자 결정 사이의 간극을 짚었습니다.",
        meta: "분석 · 자원",
        publishedAt: "2026년 5월 25일",
      },
    ],
  },
  {
    key: "Sport",
    labelKo: "스포츠",
    summary: "호주에서 많이 보는 AFL, NRL, 크리켓, 테니스, 국제 스포츠 뉴스를 모았습니다.",
    tone: "from-amber-50 to-white border-amber-100",
    stories: [
      {
        title: "스테이트 오브 오리진 1차전 퇴장 판정에 레전드들도 충격",
        source: "ABC Sport",
        sourceUrl: "https://www.abc.net.au/news/2026-05-27/kalyn-ponga-send-off-state-of-origin-i-reaction/106730106",
        summaryKo: "ABC는 칼린 퐁아 퇴장 판정이 경기 흐름을 바꾸며 NSW의 대역전극에 길을 열었다는 반응을 전했습니다.",
        meta: "NRL · 오리진",
        publishedAt: "2026년 5월 27일",
      },
      {
        title: "호주인 두 명의 MLB 맞대결, 호주 유니폼 팬이 홈런볼 캐치",
        source: "ABC Sport",
        sourceUrl: "https://www.abc.net.au/news/2026-05-26/curtis-mead-travis-bazzana-fan-in-aussie-shirt-catch/106722402",
        summaryKo: "커티스 미드와 트래비스 바자나가 MLB에서 맞붙은 경기에서 호주 대표팀 유니폼을 입은 팬이 홈런볼을 잡아 화제가 됐습니다.",
        meta: "야구 · 호주 선수",
        publishedAt: "2026년 5월 26일",
      },
      {
        title: "스테이트 오브 오리진 2026 1차전 일정과 관전 정보",
        source: "Fox Sports",
        sourceUrl: "https://www.foxsports.com.au/nrl/state-of-origin/state-of-origin-2026-start-time-what-time-does-game-1-between-nsw-blues-and-queensland-maroons-start-kickoff-time-full-schedule/news-story/1a9d59ddfbc3a2c096351cff7d5d503f",
        summaryKo: "폭스스포츠는 시드니 아코르 스타디움에서 열린 오리진 1차전의 킥오프 시간, 일정, 관전 정보를 정리했습니다.",
        meta: "NRL · 일정",
        publishedAt: "2026년 5월 27일",
      },
    ],
  },
];

export default function News() {
  useSEO({
    title: "뉴스 | Hoju Jobs",
    description: "호주 주요 뉴스 사이트의 정치, 세계, 비즈니스, 분석, 스포츠 뉴스를 한국어로 확인하세요.",
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
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Australia briefing</p>
                <h1 className="mt-1 text-2xl font-black tracking-normal text-white sm:text-3xl">뉴스</h1>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300">
                <Languages className="h-3.5 w-3.5" />
                한국어 번역 링크 포함
              </div>
            </div>
          </div>
          <nav className="grid grid-cols-5 divide-x divide-slate-200 bg-white" aria-label="뉴스 주제">
            {NEWS_TOPICS.map((topic) => (
              <a
                key={topic.key}
                href={`#${topic.key.toLowerCase()}`}
                className="px-2 py-3 text-center text-[11px] font-black text-slate-900 transition-colors hover:bg-slate-50 sm:px-5 sm:text-xl"
              >
                {topic.key}
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
                <div className="border-b border-inherit bg-white/55 p-5 lg:border-b-0 lg:border-r">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-white shadow-sm">
                    <Newspaper className="h-5 w-5 text-slate-800" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{topic.labelKo}</p>
                  <h2 className="mt-1 text-2xl font-black tracking-normal text-slate-950">{topic.key}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{topic.summary}</p>
                  <p className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white/80 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                    <Radio className="h-3 w-3" />
                    실제 기사 {topic.stories.length}개
                  </p>
                </div>

                <div className="grid gap-3 p-4 sm:grid-cols-3">
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
                        <Radio className="h-3 w-3" />
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
