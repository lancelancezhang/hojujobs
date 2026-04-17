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
    region: "시드니 시티",
    suburbs: [
      "시드니", "시드니 CBD", "킹스크로스", "차이나타운", "헤이마켓",
      "뉴타운", "서리 힐스", "울티모", "알렉산드리아", "로젤", "레드콤브",
    ],
  },
  {
    region: "노스 시드니 / 채스우드",
    suburbs: ["노스 쇼어", "노스 시드니", "채스우드", "세인트 레오나즈"],
  },
  {
    region: "어퍼 노스쇼어",
    suburbs: ["세인트 아이브스", "워리우드", "혼스비"],
  },
  {
    region: "라이드 / 이스트우드",
    suburbs: ["라이드", "이스트우드", "에핑", "웨스트 라이드", "탑라이드", "메도우뱅크"],
  },
  {
    region: "파라마타 / 웨스트",
    suburbs: ["파라마타", "실버워터", "리드컴", "로즈", "스트라스필드", "버우드", "애쉬필드", "웬트워스 포인트"],
  },
  {
    region: "힐스 지구",
    suburbs: ["노웨스트", "켈리빌", "라우스 힐", "스탠호프 가든스", "체리브룩", "카슬힐", "듀럴"],
  },
  {
    region: "사우스 시드니",
    suburbs: ["허스트빌", "사우스 허스트빌", "마스콧", "본다이", "본다이 정션"],
  },
  {
    region: "사우스웨스트",
    suburbs: ["캠벨타운", "마운트 드루이트", "스프링우드"],
  },
  {
    region: "센트럴 코스트",
    suburbs: ["센트럴 코스트"],
  },
  {
    region: "기타 지역",
    suburbs: ["캔버라", "포트 맥쿼리"],
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
  "시드니 CBD": "Sydney CBD NSW",
  "킹스크로스": "Kings Cross NSW",
  "차이나타운": "Chinatown Sydney NSW",
  "헤이마켓": "Haymarket NSW",
  "뉴타운": "Newtown NSW",
  "서리 힐스": "Surry Hills NSW",
  "울티모": "Ultimo NSW",
  "알렉산드리아": "Alexandria NSW",
  "로젤": "Rozelle NSW",
  "노스 쇼어": "North Shore NSW",
  "노스 시드니": "North Sydney NSW",
  "채스우드": "Chatswood NSW",
  "세인트 레오나즈": "St Leonards NSW",
  "세인트 아이브스": "St Ives NSW",
  "워리우드": "Warriewood NSW",
  "혼스비": "Hornsby NSW",
  "라이드": "Ryde NSW",
  "이스트우드": "Eastwood NSW",
  "에핑": "Epping NSW",
  "웨스트 라이드": "West Ryde NSW",
  "탑라이드": "Top Ryde NSW",
  "메도우뱅크": "Meadowbank NSW",
  "파라마타": "Parramatta NSW",
  "실버워터": "Silverwater NSW",
  "리드컴": "Lidcombe NSW",
  "로즈": "Rhodes NSW",
  "스트라스필드": "Strathfield NSW",
  "버우드": "Burwood NSW",
  "애쉬필드": "Ashfield NSW",
  "웬트워스 포인트": "Wentworth Point NSW",
  "노웨스트": "Norwest NSW",
  "켈리빌": "Kellyville NSW",
  "라우스 힐": "Rouse Hill NSW",
  "스탠호프 가든스": "Stanhope Gardens NSW",
  "체리브룩": "Cherrybrook NSW",
  "카슬힐": "Castle Hill NSW",
  "듀럴": "Dural NSW",
  "허스트빌": "Hurstville NSW",
  "사우스 허스트빌": "South Hurstville NSW",
  "마스콧": "Mascot NSW",
  "본다이": "Bondi NSW",
  "본다이 정션": "Bondi Junction NSW",
  "캠벨타운": "Campbelltown NSW",
  "마운트 드루이트": "Mount Druitt NSW",
  "스프링우드": "Springwood NSW",
  "센트럴 코스트": "Central Coast NSW",
  "캔버라": "Canberra ACT",
  "포트 맥쿼리": "Port Macquarie NSW",
};
