/**
 * Sydney suburb → region cluster mapping.
 * Used for grouped location filtering in the sidebar.
 */

export interface RegionGroup {
  region: string;
  suburbs: string[];
  state: "NSW" | "VIC" | "QLD" | "SA" | "ACT";
}

export const REGION_GROUPS: RegionGroup[] = [
  // NSW - Sydney
  { state: "NSW", region: "시드니 시티", suburbs: [
    "시드니 CBD", "킹스크로스", "차이나타운", "헤이마켓",
    "뉴타운", "서리 힐스", "울티모", "알렉산드리아", "로젤",
    "레드펀", "록스", "드러모인", "바랑가루", "팟츠 포인트", "피어몬트", "타운홀",
  ]},
  { state: "NSW", region: "노스 시드니 / 노스쇼어", suburbs: [
    "노스 쇼어", "노스 시드니", "채스우드", "세인트 레오나즈",
    "노스 브릿지", "레인 코브", "롱귀빌", "모즈먼", "아타몬", "카머레이",
    "세인트 아이브스", "워리우드", "혼스비", "고든", "노던 비치", "린필드", "맨리", "발고울라",
  ]},
  { state: "NSW", region: "라이드 / 이스트우드", suburbs: [
    "라이드", "이스트우드", "에핑", "웨스트 라이드", "탑라이드", "메도우뱅크", "맥쿼리", "맥쿼리빌",
  ]},
  { state: "NSW", region: "파라마타 / 웨스트", suburbs: [
    "파라마타", "실버워터", "리드컴", "로즈", "스트라스필드", "버우드", "애쉬필드", "웬트워스 포인트",
    "노스 스트라스필드", "뉴잉턴", "사우스 스트라스필드", "오번", "캠시", "플레밍턴", "해리스 파크",
  ]},
  { state: "NSW", region: "힐스 지구", suburbs: [
    "노웨스트", "켈리빌", "라우스 힐", "스탠호프 가든스", "체리브룩", "카슬힐", "듀럴", "노스 록스", "스카트필드", "칼링포드",
  ]},
  { state: "NSW", region: "사우스 시드니", suburbs: [
    "허스트빌", "사우스 허스트빌", "마스콧", "본다이", "본다이 정션",
    "랜드윅", "로즈랜즈", "미란다", "울리 크릭", "쿠지", "킹스포드",
  ]},
  { state: "NSW", region: "사우스웨스트", suburbs: [
    "캠벨타운", "마운트 드루이트", "스프링우드", "리버풀", "뱅크스타운", "페어필드", "펜리스",
  ]},
  { state: "NSW", region: "센트럴 코스트", suburbs: ["센트럴 코스트", "고스포드"] },
  { state: "NSW", region: "기타 NSW", suburbs: [
    "포트 맥쿼리", "울릉공", "울굴가", "굴번", "배서스트",
    "코프스 하버", "웬트워스", "윈덤",
  ]},

  // VIC - Melbourne
  { state: "VIC", region: "멜버른 CBD / 이너", suburbs: [
    "멜버른 CBD", "사우스 야라", "프라란", "세인트 킬다", "엘스터윅", "콜링우드", "피츠로이", "칼튼",
  ]},
  { state: "VIC", region: "이너 이스트 멜버른", suburbs: [
    "큐", "캠버웰", "헤이쏜", "버우드 이스트", "블랙번", "글렌 웨이버리", "Mt 웨이버리",
  ]},
  { state: "VIC", region: "사우스 이스트 멜버른", suburbs: [
    "사우스 이스트 멜버른", "채드스톤", "오클리", "오클리 이스트", "글렌 헌틀리", "헌팅데일", "카네기", "단데농", "비스",
  ]},
  { state: "VIC", region: "노스 멜버른", suburbs: [
    "브로드메도우스", "에핑 (VIC)", "크레이기번", "선샤인",
  ]},
  { state: "VIC", region: "기타 빅토리아", suburbs: ["질롱", "밸러렛", "벤디고"] },

  // QLD - Brisbane
  { state: "QLD", region: "골드코스트", suburbs: ["골드코스트"] },
  { state: "QLD", region: "기타 퀸즐랜드", suburbs: ["타운스빌", "케언즈", "선샤인 코스트"] },

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
  "시드니 CBD": "Sydney CBD NSW",
  "킹스크로스": "Kings Cross NSW",
  "차이나타운": "Chinatown Sydney NSW",
  "헤이마켓": "Haymarket NSW",
  "뉴타운": "Newtown NSW",
  "서리 힐스": "Surry Hills NSW",
  "울티모": "Ultimo NSW",
  "알렉산드리아": "Alexandria NSW",
  "로젤": "Rozelle NSW",
  "레드펀": "Redfern NSW",
  "록스": "The Rocks NSW",
  "드러모인": "Drummoyne NSW",
  "바랑가루": "Barangaroo NSW",
  "팟츠 포인트": "Potts Point NSW",
  "피어몬트": "Pyrmont NSW",
  "타운홀": "Town Hall NSW",
  "노스 쇼어": "North Shore NSW",
  "노스 시드니": "North Sydney NSW",
  "채스우드": "Chatswood NSW",
  "세인트 레오나즈": "St Leonards NSW",
  "노스 브릿지": "Northbridge NSW",
  "레인 코브": "Lane Cove NSW",
  "롱귀빌": "Longueville NSW",
  "모즈먼": "Mosman NSW",
  "아타몬": "Artarmon NSW",
  "카머레이": "Cammeray NSW",
  "세인트 아이브스": "St Ives NSW",
  "워리우드": "Warriewood NSW",
  "혼스비": "Hornsby NSW",
  "고든": "Gordon NSW",
  "노던 비치": "Northern Beaches NSW",
  "린필드": "Lindfield NSW",
  "맨리": "Manly NSW",
  "발고울라": "Balgowlah NSW",
  "라이드": "Ryde NSW",
  "이스트우드": "Eastwood NSW",
  "에핑": "Epping NSW",
  "웨스트 라이드": "West Ryde NSW",
  "탑라이드": "Top Ryde NSW",
  "메도우뱅크": "Meadowbank NSW",
  "맥쿼리": "Macquarie Park NSW",
  "맥쿼리빌": "Macquarie Fields NSW",
  "파라마타": "Parramatta NSW",
  "실버워터": "Silverwater NSW",
  "리드컴": "Lidcombe NSW",
  "로즈": "Rhodes NSW",
  "스트라스필드": "Strathfield NSW",
  "버우드": "Burwood NSW",
  "애쉬필드": "Ashfield NSW",
  "웬트워스 포인트": "Wentworth Point NSW",
  "노스 스트라스필드": "North Strathfield NSW",
  "뉴잉턴": "Newington NSW",
  "사우스 스트라스필드": "South Strathfield NSW",
  "오번": "Auburn NSW",
  "캠시": "Campsie NSW",
  "플레밍턴": "Flemington NSW",
  "해리스 파크": "Harris Park NSW",
  "노웨스트": "Norwest NSW",
  "켈리빌": "Kellyville NSW",
  "라우스 힐": "Rouse Hill NSW",
  "스탠호프 가든스": "Stanhope Gardens NSW",
  "체리브룩": "Cherrybrook NSW",
  "카슬힐": "Castle Hill NSW",
  "듀럴": "Dural NSW",
  "노스 록스": "North Rocks NSW",
  "스카트필드": "Schofields NSW",
  "칼링포드": "Carlingford NSW",
  "허스트빌": "Hurstville NSW",
  "사우스 허스트빌": "South Hurstville NSW",
  "마스콧": "Mascot NSW",
  "본다이": "Bondi NSW",
  "본다이 정션": "Bondi Junction NSW",
  "랜드윅": "Randwick NSW",
  "로즈랜즈": "Roselands NSW",
  "미란다": "Miranda NSW",
  "울리 크릭": "Wolli Creek NSW",
  "쿠지": "Coogee NSW",
  "킹스포드": "Kingsford NSW",
  "캠벨타운": "Campbelltown NSW",
  "마운트 드루이트": "Mount Druitt NSW",
  "스프링우드": "Springwood NSW",
  "리버풀": "Liverpool NSW",
  "뱅크스타운": "Bankstown NSW",
  "페어필드": "Fairfield NSW",
  "펜리스": "Penrith NSW",
  "센트럴 코스트": "Central Coast NSW",
  "고스포드": "Gosford NSW",
  "포트 맥쿼리": "Port Macquarie NSW",
  "울릉공": "Wollongong NSW",
  "울굴가": "Woolgoolga NSW",
  "굴번": "Goulburn NSW",
  "배서스트": "Bathurst NSW",
  "코프스 하버": "Coffs Harbour NSW",
  "웬트워스": "Wentworth Falls NSW",
  "윈덤": "Wyndham NSW",
  // VIC - Melbourne
  "멜버른": "Melbourne VIC",
  "멜버른 CBD": "Melbourne CBD VIC",
  "사우스 야라": "South Yarra VIC",
  "프라란": "Prahran VIC",
  "세인트 킬다": "St Kilda VIC",
  "엘스터윅": "Elsternwick VIC",
  "콜링우드": "Collingwood VIC",
  "피츠로이": "Fitzroy VIC",
  "칼튼": "Carlton VIC",
  "큐": "Kew VIC",
  "캠버웰": "Camberwell VIC",
  "헤이쏜": "Hawthorn VIC",
  "버우드 이스트": "Burwood East VIC",
  "블랙번": "Blackburn VIC",
  "글렌 웨이버리": "Glen Waverley VIC",
  "Mt 웨이버리": "Mount Waverley VIC",
  "채드스톤": "Chadstone VIC",
  "오클리": "Oakleigh VIC",
  "오클리 이스트": "Oakleigh East VIC",
  "글렌 헌틀리": "Glen Huntly VIC",
  "헌팅데일": "Huntingdale VIC",
  "카네기": "Carnegie VIC",
  "사우스 이스트 멜버른": "South East Melbourne VIC",
  "단데농": "Dandenong VIC",
  "비스": "Wantirna South VIC",
  "브로드메도우스": "Broadmeadows VIC",
  "에핑 (VIC)": "Epping VIC",
  "크레이기번": "Craigieburn VIC",
  "선샤인": "Sunshine VIC",
  "질롱": "Geelong VIC",
  "밸러렛": "Ballarat VIC",
  "벤디고": "Bendigo VIC",
  // QLD - Brisbane
  "브리즈번": "Brisbane QLD",
  "골드코스트": "Gold Coast QLD",
  "타운스빌": "Townsville QLD",
  "케언즈": "Cairns QLD",
  "선샤인 코스트": "Sunshine Coast QLD",
  // SA - Adelaide
  "애들레이드": "Adelaide SA",
  // ACT
  "캔버라": "Canberra ACT",
};
