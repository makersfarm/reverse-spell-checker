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
    input: "오랜만에 친구를 만나서 정말 좋았다. 며칠 전부터 기대하고 있었다.",
    expectedWrongWords: ["오랫만에", "몇일"],
    expectedOriginals: ["오랜만에", "며칠"],
    expectedTypes: ["맞춤법", "맞춤법"],
  },
  {
    name: "되 and 돼 confusion",
    input: "오늘은 집에 가도 돼요. 내일 다시 봐도 돼서 좋아요.",
    expectedWrongWords: ["되요", "되서"],
    expectedOriginals: ["돼요", "돼서"],
    expectedTypes: ["맞춤법", "맞춤법"],
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
    name: "fallback applies once when primary rules do not match",
    input: "오늘 기분 좋다.",
    expectedWrongText: "오늘 기분 졋다.",
    expectedWrongWords: ["졋다"],
    expectedOriginals: ["좋다"],
    expectedTypes: ["맞춤법"],
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
