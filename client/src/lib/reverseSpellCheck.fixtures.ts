import type { ReverseResult } from "./reverseSpellCheck";

export interface ReverseRuleFixture {
  name: string;
  input: string;
  expectedWrongText?: string;
  expectedWrongWords: string[];
  expectedOriginals: string[];
  expectedTypes?: ReverseResult["errors"][number]["type"][];
  includeContextual?: boolean;
}

export const reverseRuleFixtures: ReverseRuleFixture[] = [
  {
    name: "common spelling pair",
    input: "오랜만에 친구를 만나서 정말 좋았다. 며칠 전부터 왜 기다리고 있었다.",
    expectedWrongWords: ["오랫만에", "몇일", "외"],
    expectedOriginals: ["오랜만에", "며칠", "왜"],
    expectedTypes: ["맞춤법", "맞춤법", "맞춤법"],
  },
  {
    name: "why and loanword message sample",
    input: "왜 이렇게 안 되는지 메시지로 보내도 돼요.",
    expectedWrongWords: ["외", "않되는", "메세지", "되요"],
    expectedOriginals: ["왜", "안 되는", "메시지", "돼요"],
    expectedTypes: ["맞춤법", "맞춤법", "외래어", "맞춤법"],
  },
  {
    name: "되 and 돼 confusion",
    input: "오늘은 집에 가도 돼요. 내일 다시 봐도 돼서 좋아요.",
    expectedWrongWords: ["되요", "되서"],
    expectedOriginals: ["돼요", "돼서"],
    expectedTypes: ["맞춤법", "맞춤법"],
  },
  {
    name: "되다 stem and 돼 contraction family",
    input: "되어 가는 일이 됩니다. 잘 되는지 보면 안 돼요. 결국 됨.",
    expectedWrongWords: ["돼어", "됍니다", "돼는", "되요", "됌"],
    expectedOriginals: ["되어", "됩니다", "되는", "돼요", "됨"],
    expectedTypes: ["맞춤법", "맞춤법", "맞춤법", "맞춤법", "맞춤법"],
  },
  {
    name: "common conjugation confusions",
    input: "이렇게 해요. 안 되는 일도 결국 기록됨. 감기가 많이 나아졌고 아이를 낳았다.",
    expectedWrongWords: ["하요", "않되는", "됌", "낳아졌", "아이를 낫았다"],
    expectedOriginals: ["해요", "안 되는", "됨", "나아졌", "아이를 낳았다"],
    expectedTypes: ["맞춤법", "맞춤법", "맞춤법", "맞춤법", "맞춤법"],
  },
  {
    name: "spacing rules",
    input: "할 수 있는 만큼 보고 싶다.",
    expectedWrongWords: ["할수", "만 큼", "보고싶다"],
    expectedOriginals: ["할 수", "만큼", "보고 싶다"],
    expectedTypes: ["띄어쓰기", "띄어쓰기", "띄어쓰기"],
  },
  {
    name: "standard language rules",
    input: "설렘을 안고 설거지를 했고 바라요.",
    expectedWrongWords: ["설레임", "설겆이", "바래요"],
    expectedOriginals: ["설렘", "설거지", "바라요"],
    expectedTypes: ["맞춤법", "표준어", "표준어"],
  },
  {
    name: "loanword rules",
    input: "콘텐츠 메시지 액세서리 케이크를 준비했다.",
    expectedWrongWords: ["컨텐츠", "메세지", "악세사리", "케익"],
    expectedOriginals: ["콘텐츠", "메시지", "액세서리", "케이크"],
    expectedTypes: ["외래어", "외래어", "외래어", "외래어"],
  },
  {
    name: "popular blog and social spelling cases",
    input: "이 일은 맡겨 주세요. 으레 무난했고 김치를 담갔다. 내로라하는 사람이 필요한 조치를 했다.",
    expectedWrongWords: ["맞겨", "의레", "문안", "담궜다", "내노라하는", "조취"],
    expectedOriginals: ["맡겨", "으레", "무난", "담갔다", "내로라하는", "조치"],
    expectedTypes: ["맞춤법", "맞춤법", "맞춤법", "맞춤법", "맞춤법", "맞춤법"],
  },
  {
    name: "bakkwieo contraction confusion",
    input: "도대체 언제 바뀌어 이거. 화면이 바뀌어요.",
    expectedWrongWords: ["도데체", "바껴", "바껴요"],
    expectedOriginals: ["도대체", "바뀌어", "바뀌어요"],
    expectedTypes: ["맞춤법", "맞춤법", "맞춤법"],
  },
  {
    name: "fallback applies once when primary rules do not match",
    input: "오늘 기분 좋다.",
    expectedWrongText: "오늘 기분 졋다.",
    expectedWrongWords: ["졋다"],
    expectedOriginals: ["좋다"],
    expectedTypes: ["맞춤법"],
  },
  {
    name: "does not invent 다요 from normal sentence ending",
    input: "친구랑 맛집에 갔다.",
    expectedWrongText: "친구랑 맛집에 갔다.",
    expectedWrongWords: [],
    expectedOriginals: [],
  },
  {
    name: "contextual rule can be enabled",
    input: "무엇을 고르든지 괜찮다.",
    includeContextual: true,
    expectedWrongWords: ["던지"],
    expectedOriginals: ["든지"],
    expectedTypes: ["맞춤법"],
  },
];
