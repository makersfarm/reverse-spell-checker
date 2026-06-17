/**
 * 맏춤법 검사기 — 리버스 맞춤법 변환 로직
 * 올바른 문장을 입력받아 일부러 틀린 문장으로 변환한다.
 */

import { getAttachableReverseRuleCandidates, type ReverseRuleCandidate } from "./reverseRuleCandidates";

type ErrorType = "맞춤법" | "띄어쓰기" | "표준어" | "외래어";

export interface ErrorItem {
  id: string;
  ruleId: string;
  original: string;
  wrong: string;
  type: ErrorType;
  reason: string;
  startIndex: number; // wrongText 내 위치
  endIndex: number;
}

export interface ReverseResult {
  originalText: string;
  wrongText: string;
  errors: ErrorItem[];
}

interface ReverseOptions {
  includeContextual?: boolean;
}

interface ReverseRule {
  ruleId: string;
  pattern: RegExp;
  wrong: string;
  type: ErrorType;
  reason: string;
  requiresContext?: boolean;
  order: number;
}

interface Candidate extends ReverseRule {
  original: string;
  startIndex: number;
  endIndex: number;
}

let ruleOrder = 0;

function rule(
  correct: string | RegExp,
  wrong: string,
  type: ErrorType,
  reason: string,
  options: { requiresContext?: boolean; ruleId?: string } = {},
): ReverseRule {
  const pattern =
    typeof correct === "string"
      ? new RegExp(escapeRegExp(correct), "g")
      : new RegExp(correct.source, correct.flags.includes("g") ? correct.flags : `${correct.flags}g`);

  return {
    ruleId: options.ruleId || createRuleId(correct, wrong),
    pattern,
    wrong,
    type,
    reason,
    requiresContext: options.requiresContext,
    order: ruleOrder++,
  };
}

function ruleFromCandidate(candidate: ReverseRuleCandidate): ReverseRule {
  return rule(candidate.correct, candidate.wrong, candidate.type, candidate.reason, {
    requiresContext: candidate.contextRequired,
    ruleId: candidate.id,
  });
}

function makeRulesFromPairs(
  pairs: Array<[correct: string, wrong: string]>,
  type: ErrorType,
  reason: string,
  options: { requiresContext?: boolean; ruleGroup?: string } = {},
) {
  return pairs.map(([correct, wrong]) => rule(correct, wrong, type, reason, {
    requiresContext: options.requiresContext,
    ruleId: options.ruleGroup ? `${options.ruleGroup}_${slugifyRulePart(correct)}_to_${slugifyRulePart(wrong)}` : undefined,
  }));
}

function makeStandaloneRulesFromPairs(
  pairs: Array<[correct: string, wrong: string]>,
  type: ErrorType,
  reason: string,
  options: { requiresContext?: boolean; ruleGroup?: string } = {},
) {
  return pairs.map(([correct, wrong]) => standaloneRule(correct, wrong, type, reason, {
    requiresContext: options.requiresContext,
    ruleId: options.ruleGroup ? `${options.ruleGroup}_${slugifyRulePart(correct)}_to_${slugifyRulePart(wrong)}` : undefined,
  }));
}

function standaloneRule(
  correct: string,
  wrong: string,
  type: ErrorType,
  reason: string,
  options: { requiresContext?: boolean; ruleId?: string } = {},
): ReverseRule {
  return rule(
    new RegExp(`(?<![\\p{Letter}\\p{Number}])${escapeRegExp(correct)}(?![\\p{Letter}\\p{Number}])`, "gu"),
    wrong,
    type,
    reason,
    {
      requiresContext: options.requiresContext,
      ruleId: options.ruleId || createRuleId(correct, wrong),
    },
  );
}

function makeEndingPairs(
  words: readonly string[],
  correctEnding: "이" | "히",
  wrongEnding: "이" | "히",
): Array<[correct: string, wrong: string]> {
  return words.map((word) => {
    if (!word.endsWith(correctEnding)) {
      throw new Error(`Article 51 adverb "${word}" must end with "${correctEnding}".`);
    }

    return [word, `${word.slice(0, -correctEnding.length)}${wrongEnding}`];
  });
}

function mergeRules(primaryRules: ReverseRule[], candidateRules: ReverseRule[]) {
  const seen = new Set(primaryRules.map((currentRule) => `${currentRule.pattern.source}->${currentRule.wrong}`));

  return [
    ...primaryRules,
    ...candidateRules.filter((candidateRule) => {
      const key = `${candidateRule.pattern.source}->${candidateRule.wrong}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }),
  ];
}

const DWAE_CONTRACTION_RULES = makeRulesFromPairs(
  [
    ["돼요", "되요"],
    ["돼서", "되서"],
    ["돼야", "되야"],
    ["돼도", "되도"],
    ["돼라", "되라"],
    ["돼야지", "되야지"],
    ["돼", "되"],
  ],
  "맞춤법",
  "'돼'는 '되어'가 줄어든 말이에요.",
  { ruleGroup: "dwae_contraction" },
);

const DOEDA_STEM_RULES = makeRulesFromPairs(
  [
    ["되어", "돼어"],
    ["되었", "돼었"],
    ["되나요", "돼나요"],
    ["되나", "돼나"],
    ["되는", "돼는"],
    ["된다고", "됀다고"],
    ["된다면", "됀다면"],
    ["된다", "됀다"],
    ["된", "됀"],
    ["될", "됄"],
    ["됩니다", "됍니다"],
    ["되고", "돼고"],
    ["되지", "돼지"],
    ["되면", "돼면"],
    ["되니", "돼니"],
    ["되는데", "돼는데"],
    ["되므로", "돼므로"],
    ["되면서", "돼면서"],
    ["되니까", "돼니까"],
    ["되던", "돼던"],
    ["되더라", "돼더라"],
    ["되길", "돼길"],
    ["되기", "돼기"],
    ["되려고", "돼려고"],
    ["되려면", "돼려면"],
    ["됨", "됌"],
  ],
  "맞춤법",
  "'되-' 뒤에 '-어'가 붙어 줄어들 때만 '돼'로 써요.",
  { ruleGroup: "doeda_stem" },
);

const BAKKWIDA_CONTRACTION_RULES = makeRulesFromPairs(
  [
    ["바뀌어요", "바껴요"],
    ["바뀌어서", "바껴서"],
    ["바뀌어도", "바껴도"],
    ["바뀌었", "바꼈"],
    ["바뀌어", "바껴"],
  ],
  "맞춤법",
  "'바뀌어'는 '바껴'로 줄여 쓰지 않아요.",
  { ruleGroup: "bakkwida_contraction" },
);

const ARTICLE_51_I_ONLY_ADVERBS = [
  "가붓이",
  "깨끗이",
  "나붓이",
  "느긋이",
  "둥긋이",
  "따뜻이",
  "반듯이",
  "버젓이",
  "산뜻이",
  "의젓이",
  "가까이",
  "고이",
  "날카로이",
  "대수로이",
  "번거로이",
  "많이",
  "헛되이",
  "겹겹이",
  "번번이",
  "일일이",
  "집집이",
  "틈틈이",
] as const;

const ARTICLE_51_CONTEXTUAL_I_ONLY_ADVERBS = [
  "적이",
] as const;

const ARTICLE_51_HI_ONLY_ADVERBS = [
  "극히",
  "급히",
  "딱히",
  "속히",
  "작히",
  "족히",
  "특히",
  "엄격히",
  "정확히",
] as const;

const ARTICLE_51_I_OR_HI_ADVERBS = [
  "솔직히",
  "가만히",
  "간편히",
  "나른히",
  "무단히",
  "각별히",
  "소홀히",
  "쓸쓸히",
  "정결히",
  "과감히",
  "꼼꼼히",
  "심히",
  "열심히",
  "급급히",
  "답답히",
  "섭섭히",
  "공평히",
  "능히",
  "당당히",
  "분명히",
  "상당히",
  "조용히",
  "간소히",
  "고요히",
  "도저히",
] as const;

const ARTICLE_51_I_ONLY_ADVERB_RULES = makeStandaloneRulesFromPairs(
  makeEndingPairs(ARTICLE_51_I_ONLY_ADVERBS, "이", "히"),
  "맞춤법",
  "끝음절이 '이'로만 나는 부사는 '-이'로 적어요.",
  { ruleGroup: "article_51_i_only" },
);

const ARTICLE_51_CONTEXTUAL_I_ONLY_ADVERB_RULES = makeStandaloneRulesFromPairs(
  makeEndingPairs(ARTICLE_51_CONTEXTUAL_I_ONLY_ADVERBS, "이", "히"),
  "맞춤법",
  "'적이'는 부사일 때 '-이'로 적지만, 명사 '적'에 조사가 붙은 말과 헷갈릴 수 있어요.",
  { requiresContext: true, ruleGroup: "article_51_i_only_contextual" },
);

const ARTICLE_51_HI_ONLY_ADVERB_RULES = makeStandaloneRulesFromPairs(
  makeEndingPairs(ARTICLE_51_HI_ONLY_ADVERBS, "히", "이"),
  "맞춤법",
  "끝음절이 '히'로 나는 부사는 '-히'로 적어요.",
  { ruleGroup: "article_51_hi_only" },
);

const ARTICLE_51_I_OR_HI_ADVERB_RULES = makeStandaloneRulesFromPairs(
  makeEndingPairs(ARTICLE_51_I_OR_HI_ADVERBS, "히", "이"),
  "맞춤법",
  "'이'나 '히'로 소리 나는 부사는 '-히'로 적어요.",
  { ruleGroup: "article_51_i_or_hi" },
);

const BASE_REVERSE_RULES: ReverseRule[] = [
  rule("오랜만에", "오랫만에", "맞춤법", "'오랜만에'가 맞아요. '오랫만에'로 자주 헷갈려요."),
  rule("어이없다", "어의없다", "맞춤법", "'어이없다'가 맞아요. '어의없다'는 없는 말이에요."),
  rule("어이없", "어의없", "표준어", "'어이없다'가 맞아요. '어의없다'는 없는 말이에요."),
  rule("며칠", "몇일", "맞춤법", "'며칠'이 맞아요. '몇일'은 없는 말이에요.", { ruleId: "spelling-myeochil" }),
  rule("웬만하면", "왠만하면", "맞춤법", "'웬만하면'이 맞아요. '왠'은 '왜인지'의 줄임이에요."),
  rule("웬일", "왠일", "맞춤법", "'웬일'이 맞아요. '왠일'로 자주 헷갈려요."),
  rule("웬", "왠", "맞춤법", "'웬'은 '어떤'의 뜻. '왠'은 '왜인지'의 줄임이에요."),
  rule("왠지", "웬지", "맞춤법", "'왠지'는 '왜인지'의 줄임. '웬지'로 쓰면 틀려요."),
  rule("왜냐하면", "외냐하면", "맞춤법", "'왜냐하면'이 맞아요. 이유를 물을 때는 '왜'를 써요.", { ruleId: "spelling-wae-wae-why" }),
  rule("왜", "외", "맞춤법", "'왜'는 이유를 묻는 말이에요. '외'와 구분해요.", { ruleId: "spelling-wae-why" }),
  rule("금세", "금새", "맞춤법", "'금세'는 '금시에'의 줄임. '금새'는 물건 값을 뜻해요."),
  rule("됐다", "됬다", "맞춤법", "'됐다'는 '되었다'의 줄임. '됬다'로 쓰면 틀려요."),
  rule("됐", "됬", "맞춤법", "'됐'은 '되었'의 줄임말. '됬'은 없는 말이에요."),
  ...DWAE_CONTRACTION_RULES,
  ...DOEDA_STEM_RULES,
  ...BAKKWIDA_CONTRACTION_RULES,
  ...ARTICLE_51_I_ONLY_ADVERB_RULES,
  ...ARTICLE_51_CONTEXTUAL_I_ONLY_ADVERB_RULES,
  ...ARTICLE_51_HI_ONLY_ADVERB_RULES,
  ...ARTICLE_51_I_OR_HI_ADVERB_RULES,
  rule("역할", "역활", "맞춤법", "'역할'이 맞아요. '역활'은 없는 말이에요."),
  rule("희한하다", "희안하다", "맞춤법", "'희한하다'가 맞아요. '희안하다'는 없는 말이에요."),
  rule("희한하", "희안하", "표준어", "'희한하다'가 맞아요. '희안하다'는 없는 말이에요."),
  rule("굳이", "구지", "맞춤법", "'굳이'가 맞아요. '구지'로 자주 헷갈려요."),
  rule("도대체", "도데체", "맞춤법", "'도대체'가 맞아요. '도데체'로 자주 헷갈려요."),
  rule("요새", "요세", "맞춤법", "'요새'가 맞아요. '요세'로 자주 헷갈려요."),
  rule("일부러", "일부로", "맞춤법", "'일부러'가 맞아요. '일부로'는 다른 표현이에요."),
  rule("설렘", "설레임", "맞춤법", "'설렘'이 표준어예요. '설레임'은 비표준어예요."),
  rule("찌개", "찌게", "맞춤법", "'찌개'가 맞아요. '찌게'로 자주 헷갈려요."),
  rule("떡볶이", "떡볶기", "맞춤법", "'떡볶이'가 맞아요. '떡볶기'로 자주 헷갈려요."),
  rule("설거지", "설겆이", "표준어", "'설거지'가 맞아요. '설겆이'로 자주 헷갈려요."),
  rule("바라요", "바래요", "표준어", "소원을 나타낼 땐 '바라다'가 맞아요. '바래다'는 색이 바래는 것!"),
  rule("바랐다", "바랬다", "표준어", "소원을 나타낼 땐 '바라다'가 맞아요. '바래다'는 색이 바래는 것!"),
  rule("바람", "바램", "표준어", "소원을 나타낼 땐 '바람'이 맞아요. '바램'으로 자주 헷갈려요."),
  rule("건드리다", "건들이다", "표준어", "'건드리다'가 맞아요. '건들이다'로 자주 헷갈려요."),
  rule("움츠리다", "움추리다", "표준어", "'움츠리다'가 맞아요. '움추리다'로 자주 헷갈려요."),
  rule("낫다", "낳다", "맞춤법", "'낫다'는 회복하다, '낳다'는 출산하다. 전혀 다른 말이에요!", { requiresContext: true }),
  rule("낳다", "낫다", "맞춤법", "'낳다'는 출산하다, '낫다'는 회복하다. 전혀 다른 말이에요!", { requiresContext: true }),
  rule("가르치", "가리키", "맞춤법", "'가르치다'는 교육, '가리키다'는 방향 지시예요.", { requiresContext: true }),
  rule("가리키", "가르치", "맞춤법", "'가리키다'는 방향 지시, '가르치다'는 교육이에요.", { requiresContext: true }),
  rule("잊어버리", "잃어버리", "맞춤법", "'잊다'는 기억을 못 하는 것, '잃다'는 물건을 잃는 것이에요.", { requiresContext: true }),
  rule("잃어버리", "잊어버리", "맞춤법", "'잃다'는 물건을 잃는 것, '잊다'는 기억을 못 하는 것이에요.", { requiresContext: true }),
  rule("나뭇잎", "나무잎", "맞춤법", "합성어에서 뒷말이 된소리가 나면 사이시옷을 써요."),
  rule("햇살", "해살", "맞춤법", "'햇살'은 '해'+'살'의 합성어로 사이시옷이 들어가요."),
  rule("할게요", "할께요", "맞춤법", "'-ㄹ게요'가 맞아요. '-ㄹ께요'는 틀린 표기예요."),
  rule("할게", "할께", "맞춤법", "'-ㄹ게'가 맞아요. '-ㄹ께'는 틀린 표기예요."),
  rule("할 거", "할꺼", "맞춤법", "'할 거'가 맞아요. '할꺼'는 없는 표기예요."),
  rule("띄어쓰기", "띠어쓰기", "맞춤법", "'띄어쓰기'가 맞아요. '띠어쓰기'로 적지 않아요."),
  rule("것 같다", "것같다", "띄어쓰기", "'것 같다'는 띄어 써요."),
  rule("것 같아", "것같아", "띄어쓰기", "'것 같아'는 띄어 써요."),
  rule("것 같", "거 같", "맞춤법", "'것 같다'가 맞아요. '거 같다'는 구어체 표현이에요."),
  rule("것이", "거이", "맞춤법", "'것이'가 맞아요. '거이'는 비표준 구어체예요."),
  rule("할 수", "할수", "띄어쓰기", "의존명사 '수'는 앞말과 띄어 써야 해요."),
  rule("될 수", "될수", "띄어쓰기", "의존명사 '수'는 앞말과 띄어 써야 해요."),
  rule("볼 수", "볼수", "띄어쓰기", "의존명사 '수'는 앞말과 띄어 써야 해요."),
  rule("알 수", "알수", "띄어쓰기", "의존명사 '수'는 앞말과 띄어 써야 해요."),
  rule("수밖에", "수 밖에", "띄어쓰기", "'수밖에'는 붙여 써요."),
  rule("뿐만 아니라", "뿐만아니라", "띄어쓰기", "'뿐만 아니라'는 띄어 써요."),
  rule("그뿐이다", "그 뿐이다", "띄어쓰기", "'그뿐이다'는 붙여 써요."),
  rule("온 지", "온지", "띄어쓰기", "시간의 경과를 나타내는 '지'는 띄어 써요."),
  rule("보고 싶다", "보고싶다", "띄어쓰기", "'보고 싶다'는 띄어 써요."),
  rule("하고 싶다", "하고싶다", "띄어쓰기", "'하고 싶다'는 띄어 써요."),
  rule("수 있", "수있", "띄어쓰기", "의존명사 '수'는 앞말과 띄어 써야 해요."),
  rule("때문에", "때 문에", "띄어쓰기", "'때문에'는 붙여 쓰는 게 맞아요."),
  rule("만큼", "만 큼", "띄어쓰기", "의존명사 '만큼'은 앞말과 띄어 써야 해요."),
  rule("뿐만", "뿐 만", "띄어쓰기", "'뿐만'은 붙여 쓰는 게 맞아요."),
  rule("안 하", "않하", "맞춤법", "'안 하다'와 '않다'는 쓰임이 달라요."),
  rule("어떻게", "어떻해", "맞춤법", "'어떻게'는 '어떠하게'의 줄임. '어떻해'는 없는 말이에요."),
  rule("어떡해", "어떻해", "맞춤법", "'어떡해'는 '어떻게 해'의 줄임. '어떻해'로 쓰면 틀려요."),
  rule("든지", "던지", "맞춤법", "선택을 나타낼 때는 '든지'를 써요.", { requiresContext: true }),
  rule("던지", "든지", "맞춤법", "과거 회상을 나타낼 때는 '던지'를 써요.", { requiresContext: true }),
  rule("데", "대", "맞춤법", "'데'와 '대'는 문맥에 따라 달라져요.", { requiresContext: true }),
  rule("대", "데", "맞춤법", "'대'와 '데'는 문맥에 따라 달라져요.", { requiresContext: true }),
];

const RESEARCHED_REVERSE_RULES = getAttachableReverseRuleCandidates({ includeContextual: true }).map(ruleFromCandidate);

const REVERSE_RULES = mergeRules(BASE_REVERSE_RULES, RESEARCHED_REVERSE_RULES);

const FALLBACK_RULES: ReverseRule[] = [
  rule(/했/g, "햇", "맞춤법", "일반적인 맞춤법 오류가 적용됐어요."),
  rule(/있다/g, "잇다", "맞춤법", "일반적인 맞춤법 오류가 적용됐어요."),
  rule(/없다/g, "업다", "맞춤법", "일반적인 맞춤법 오류가 적용됐어요."),
  rule(/같다/g, "갔다", "맞춤법", "일반적인 맞춤법 오류가 적용됐어요."),
  rule(/많다/g, "만타", "맞춤법", "일반적인 맞춤법 오류가 적용됐어요."),
  rule(/좋다/g, "졋다", "맞춤법", "일반적인 맞춤법 오류가 적용됐어요."),
];

export function reverseSpellCheck(text: string, options: ReverseOptions = {}): ReverseResult {
  if (!text.trim()) {
    return { originalText: text, wrongText: text, errors: [] };
  }

  const primaryResult = applyRuleSet(text, REVERSE_RULES, {
    includeContextual: options.includeContextual ?? false,
    firstOnly: false,
  });

  if (primaryResult.errors.length > 0) {
    return primaryResult;
  }

  return applyRuleSet(text, FALLBACK_RULES, {
    includeContextual: true,
    firstOnly: true,
  });
}

function applyRuleSet(
  text: string,
  rules: ReverseRule[],
  options: { includeContextual: boolean; firstOnly: boolean },
): ReverseResult {
  const candidates = collectCandidates(text, rules, options.includeContextual);
  const selected = selectNonOverlappingCandidates(candidates, options.firstOnly);

  if (selected.length === 0) {
    return { originalText: text, wrongText: text, errors: [] };
  }

  let wrongText = "";
  let cursor = 0;
  const errors: ErrorItem[] = [];

  selected.forEach((candidate, index) => {
    wrongText += text.slice(cursor, candidate.startIndex);

    const replacementStart = wrongText.length;
    wrongText += candidate.wrong;
    const replacementEnd = wrongText.length;

    errors.push({
      id: `err-${index + 1}`,
      ruleId: candidate.ruleId,
      original: candidate.original,
      wrong: candidate.wrong,
      type: candidate.type,
      reason: candidate.reason,
      startIndex: replacementStart,
      endIndex: replacementEnd,
    });

    cursor = candidate.endIndex;
  });

  wrongText += text.slice(cursor);

  return { originalText: text, wrongText, errors };
}

function collectCandidates(text: string, rules: ReverseRule[], includeContextual: boolean): Candidate[] {
  const candidates: Candidate[] = [];

  for (const currentRule of rules) {
    if (currentRule.requiresContext && !includeContextual) continue;

    currentRule.pattern.lastIndex = 0;

    let match: RegExpExecArray | null;

    while ((match = currentRule.pattern.exec(text)) !== null) {
      const original = match[0];
      const startIndex = match.index ?? -1;
      if (original.length === 0) {
        currentRule.pattern.lastIndex += 1;
        continue;
      }
      if (startIndex < 0) continue;

      candidates.push({
        ...currentRule,
        original,
        startIndex,
        endIndex: startIndex + original.length,
      });
    }
  }

  return candidates.sort((a, b) => {
    if (a.startIndex !== b.startIndex) return a.startIndex - b.startIndex;
    const lengthDiff = b.original.length - a.original.length;
    if (lengthDiff !== 0) return lengthDiff;
    return a.order - b.order;
  });
}

function selectNonOverlappingCandidates(candidates: Candidate[], firstOnly: boolean): Candidate[] {
  const selected: Candidate[] = [];
  let cursor = 0;

  for (const candidate of candidates) {
    if (candidate.startIndex < cursor) continue;

    selected.push(candidate);
    cursor = candidate.endIndex;

    if (firstOnly) break;
  }

  return selected;
}

/**
 * 오류 단어를 data-id 속성이 있는 span으로 감싸 하이라이트 HTML 생성
 */
export function buildHighlightedHtml(result: ReverseResult): string {
  if (!result.errors.length) return escapeAndBreak(result.wrongText);

  const sortedErrors = [...result.errors]
    .filter((err) => err.startIndex >= 0 && err.endIndex > err.startIndex)
    .sort((a, b) => a.startIndex - b.startIndex || b.endIndex - a.endIndex);

  let html = "";
  let cursor = 0;

  for (const err of sortedErrors) {
    if (err.startIndex < cursor) continue;

    html += escapeAndBreak(result.wrongText.slice(cursor, err.startIndex));

    const word = result.wrongText.slice(err.startIndex, err.endIndex);
    const escapedWrong = escapeHtml(err.wrong);
    const escapedReason = escapeHtml(err.reason);
    const escapedOriginal = escapeHtml(err.original);

    html += `<span class="error-word" data-id="${err.id}" data-wrong="${escapedWrong}" data-original="${escapedOriginal}" data-reason="${escapedReason}" data-type="${err.type}">${escapeAndBreak(word)}</span>`;

    cursor = err.endIndex;
  }

  html += escapeAndBreak(result.wrongText.slice(cursor));

  return html;
}

function escapeAndBreak(str: string): string {
  return escapeHtml(str).replace(/\n/g, "<br/>");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createRuleId(correct: string | RegExp, wrong: string) {
  const source = typeof correct === "string" ? correct : correct.source;
  return `rule_${slugifyRulePart(source)}_to_${slugifyRulePart(wrong)}`;
}

function slugifyRulePart(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase()
    .slice(0, 48) || "pattern";
}
