export interface PromotedJob {
  id: string;
  url: string;
  title: string;
  location: string[];
  industry: string;
  time_posted: string;
}

export const PROMOTED_JOBS: PromotedJob[] = [
  {
    id: "F0NX0SGH69VwSl5XEIar",
    url: "https://hojunara.com/recruitContent?notice=F0NX0SGH69VwSl5XEIar&comments=F0NX0SGH69VwSl5XEIar",
    title: "Yuzu Norwest 홀 직원 구인",
    location: ["노웨스트"],
    industry: "요식업",
    time_posted: "2026-04-18T01:00:44.656Z",
  },
  {
    id: "rCSJgCIQufrRzjZ36x6a",
    url: "https://hojunara.com/recruitContent?notice=rCSJgCIQufrRzjZ36x6a&comments=rCSJgCIQufrRzjZ36x6a",
    title: "타일 중간 기술자 모집합니다",
    location: ["시드니"],
    industry: "건설업",
    time_posted: "2026-04-17T21:48:25.656Z",
  },
];
