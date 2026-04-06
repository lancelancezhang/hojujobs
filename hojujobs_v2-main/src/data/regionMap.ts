/**
 * Sydney suburb → region cluster mapping.
 * Used for grouped location filtering in the sidebar.
 */

export interface RegionGroup {
  region: string;
  suburbs: string[];
}

export const REGION_GROUPS: RegionGroup[] = [
  {
    region: "시드니 CBD / 이너시티",
    suburbs: ["시드니", "시드니 시티", "써리힐즈", "패딩턴", "피어몬트", "팟츠포인트", "헤이마켓", "치펜데일", "레드펀", "울티모", "글리브", "시드니 전역"],
  },
  {
    region: "이너웨스트",
    suburbs: ["뉴타운", "라이카트", "캠시", "시드넘", "콩코드", "파이브독", "로즈", "애보츠포드", "발메인", "버우드", "마릭빌"],
  },
  {
    region: "이스턴 서버브",
    suburbs: ["본다이", "힐스데일", "이스트레이크스", "쿠지비치"],
  },
  {
    region: "사우스 시드니",
    suburbs: ["마스콧", "알렉산드리아", "워터루", "그린스퀘어", "월리크릭"],
  },
  {
    region: "사우스웨스트",
    suburbs: ["허스트빌", "울루웨어", "벨모어", "뱅스타운", "캠벨타운", "리버풀", "리버우드", "미란다", "홀슬리파크", "로즈랜즈", "리전트파크"],
  },
  {
    region: "웨스트 / 파라마타",
    suburbs: ["파라마타", "스트라스필드", "실버워터", "어밍턴", "라이달미어", "웬트워스포인트", "뉴잉톤", "리드컴", "노스스트라스필드", "통가비", "노스미드"],
  },
  {
    region: "노스웨스트 / 힐스",
    suburbs: ["버큼힐", "페넌트힐즈", "라우즈힐", "마운트드루잇", "펜리스", "캐슬힐", "노웨스트"],
  },
  {
    region: "노스쇼어",
    suburbs: ["채스우드", "고든", "혼스비", "세인트아이브스", "모스만", "레인코브", "세인트레너즈", "노스시드니", "터라머라", "애스퀴스", "아타몬", "롱빌"],
  },
  {
    region: "라이드 / 맥쿼리",
    suburbs: ["라이드", "웨스트라이드", "이스트라이드", "이스트우드", "에핑", "매도뱅크", "맥쿼리", "맥쿼리파크", "톱라이드", "탑라이드"],
  },
  {
    region: "비치 / 노스",
    suburbs: ["맨리", "엘라노라하이츠"],
  },
  {
    region: "센트럴 코스트",
    suburbs: ["센트럴 코스트"],
  },
  {
    region: "뉴카슬",
    suburbs: ["뉴카슬"],
  },
  {
    region: "지방 / 리저널",
    suburbs: ["울굴가", "콥스하버"],
  },
  {
    region: "브리즈번",
    suburbs: ["브리즈번"],
  },
];

/** Flat lookup: suburb → region name */
export const SUBURB_TO_REGION: Record<string, string> = {};
REGION_GROUPS.forEach((g) => {
  g.suburbs.forEach((s) => {
    SUBURB_TO_REGION[s] = g.region;
  });
});

/** Korean suburb name → English name for Google Maps */
export const SUBURB_EN: Record<string, string> = {
  "시드니": "Sydney NSW",
  "시드니 시티": "Sydney CBD NSW",
  "써리힐즈": "Surry Hills NSW",
  "패딩턴": "Paddington NSW",
  "피어몬트": "Pyrmont NSW",
  "뉴타운": "Newtown NSW",
  "라이카트": "Leichhardt NSW",
  "캠시": "Campsie NSW",
  "시드넘": "Sydenham NSW",
  "콩코드": "Concord NSW",
  "파이브독": "Five Dock NSW",
  "로즈": "Rhodes NSW",
  "애보츠포드": "Abbotsford NSW",
  "본다이": "Bondi NSW",
  "힐스데일": "Hillsdale NSW",
  "이스트레이크스": "Eastlakes NSW",
  "마스콧": "Mascot NSW",
  "알렉산드리아": "Alexandria NSW",
  "워터루": "Waterloo NSW",
  "허스트빌": "Hurstville NSW",
  "울루웨어": "Woolooware NSW",
  "벨모어": "Belmore NSW",
  "뱅스타운": "Bankstown NSW",
  "캠벨타운": "Campbelltown NSW",
  "리버풀": "Liverpool NSW",
  "리버우드": "Riverwood NSW",
  "파라마타": "Parramatta NSW",
  "스트라스필드": "Strathfield NSW",
  "실버워터": "Silverwater NSW",
  "어밍턴": "Ermington NSW",
  "라이달미어": "Rydalmere NSW",
  "웬트워스포인트": "Wentworth Point NSW",
  "뉴잉톤": "Newington NSW",
  "리드컴": "Lidcombe NSW",
  "버큼힐": "Baulkham Hills NSW",
  "페넌트힐즈": "Pennant Hills NSW",
  "라우즈힐": "Rouse Hill NSW",
  "마운트드루잇": "Mount Druitt NSW",
  "펜리스": "Penrith NSW",
  "캐슬힐": "Castle Hill NSW",
  "채스우드": "Chatswood NSW",
  "고든": "Gordon NSW",
  "혼스비": "Hornsby NSW",
  "세인트아이브스": "St Ives NSW",
  "모스만": "Mosman NSW",
  "라이드": "Ryde NSW",
  "이스트우드": "Eastwood NSW",
  "에핑": "Epping NSW",
  "매도뱅크": "Meadowbank NSW",
  "맥쿼리": "Macquarie NSW",
  "맥쿼리파크": "Macquarie Park NSW",
  "맨리": "Manly NSW",
  "센트럴 코스트": "Central Coast NSW",
  "웨스트라이드": "West Ryde NSW",
  "이스트라이드": "East Ryde NSW",
  "뉴카슬": "Newcastle NSW",
  "시드니 전역": "Sydney NSW",
  "그린스퀘어": "Green Square NSW",
  "미란다": "Miranda NSW",
  "레인코브": "Lane Cove NSW",
  "울굴가": "Woolgoolga NSW",
  "팟츠포인트": "Potts Point NSW",
  "발메인": "Balmain NSW",
  "버우드": "Burwood NSW",
  "노스스트라스필드": "North Strathfield NSW",
  "세인트레너즈": "St Leonards NSW",
  "헤이마켓": "Haymarket NSW",
  "홀슬리파크": "Horsley Park NSW",
  "톱라이드": "Top Ryde NSW",
  "노스시드니": "North Sydney NSW",
  "터라머라": "Turramurra NSW",
  "애스퀴스": "Asquith NSW",
  "아타몬": "Artarmon NSW",
  "엘라노라하이츠": "Elanora Heights NSW",
  "치펜데일": "Chippendale NSW",
  "쿠지비치": "Coogee NSW",
  "통가비": "Toongabbie NSW",
  "마릭빌": "Marrickville NSW",
  "탑라이드": "Top Ryde NSW",
  "레드펀": "Redfern NSW",
  "로즈랜즈": "Roselands NSW",
  "노스미드": "Northmead NSW",
  "글리브": "Glebe NSW",
  "울티모": "Ultimo NSW",
  "리전트파크": "Regents Park NSW",
  "월리크릭": "Wolli Creek NSW",
  "브리즈번": "Brisbane QLD",
  "롱빌": "Longueville NSW",
  "콥스하버": "Coffs Harbour NSW",
  "노웨스트": "Norwest NSW",
};
