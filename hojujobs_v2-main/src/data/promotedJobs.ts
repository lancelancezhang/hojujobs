export interface PromotedJob {
  id: string;
  title: string;
  location: string[];
  industry: string;
  description: string;
  contact: string;
  email: string;
  time_posted: string;
}

const VIEW_KEY = (id: string) => `promoted_views_${id}`;
const LAST_VIEWED_KEY = (id: string) => `promoted_viewed_${id}`;
const THIRTY_MIN = 30 * 60 * 1000;

export function getPromotedViewCount(id: string): number {
  return Number(localStorage.getItem(VIEW_KEY(id)) ?? 0);
}

export function incrementPromotedViewCount(id: string): number {
  const lastRaw = localStorage.getItem(LAST_VIEWED_KEY(id));
  const now = Date.now();
  if (lastRaw && now - Number(lastRaw) < THIRTY_MIN) {
    return getPromotedViewCount(id);
  }
  const next = getPromotedViewCount(id) + 1;
  localStorage.setItem(VIEW_KEY(id), String(next));
  localStorage.setItem(LAST_VIEWED_KEY(id), String(now));
  return next;
}

export const PROMOTED_JOBS: PromotedJob[] = [
  {
    id: "F0NX0SGH69VwSl5XEIar",
    title: "Yuzu Norwest 홀 직원 구인",
    location: ["노웨스트"],
    industry: "요식업",
    description: `🍣 5월 새로 오픈하게 될 Yuzu Sushi Norwest 지점 홀 직원 모집합니다!

Norwest 역에서 도보 10분정도 거리의 일식당 Yuzu Sushi에서 즐겁게 함께 일하실 팀원을 찾고 있습니다 😊
(에핑이나 맥쿼리에서 오시면 가까워요!!)

📍 위치: Norwest metro station 근처
💼 모집분야: 홀 (파트타임 & 풀타임 모두 가능)
🕒 근무시간: 풀타임 & 파트타임 (요일 및 시간은 면접 시 협의 가능)
영업시간 10am-10pm

✨ 우대조건:
 • 주말 근무 가능자
 • 일식 또는 유사 업종 경력자
 • 밝고 책임감 있는 분
 • 경력자 스폰 가능

💰 시급: $26 ~ $28 (경력에 따라 협의)

⭐️⭐️ 아직 오픈하지 않은 매장이기 때문에 면접 & 트라이얼 & 트레이닝은 Merrylands 지점에서 진행됩니다!! ⭐️⭐️`,
    contact: "0433 455 329",
    email: "inoinohwang@naver.com",
    time_posted: "2026-04-18T01:00:44.656Z",
  },
  {
    id: "rCSJgCIQufrRzjZ36x6a",
    title: "타일 중간 기술자 모집합니다",
    location: ["시드니"],
    industry: "건설업",
    description: `안녕하세요!

J MILESTONE TILE에서 함께할 인재를 찾습니다!

- Residential housing projects 위주입니다.

- 작업 속도보다 퀄리티를 우선하는 팀이기 때문에 체력적인 부담은 덜 합니다.

- 타일 붙일 수 있는 기회제공 및 베딩 배우고 싶으신 분 환영합니다!

근무: 7:00 ~ 16:00
Wage: 경험 및 능력에 따라 협의
근무지역: 시드니 전역

지원 문의하실 때 이름 / 나이 / 경험유무 문자로 보내주세요.`,
    contact: "0476 767 636",
    email: "",
    time_posted: "2026-04-17T21:48:25.656Z",
  },
];
