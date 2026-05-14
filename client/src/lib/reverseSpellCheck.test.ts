import { describe, expect, it } from "vitest";
import { reverseSpellCheck } from "./reverseSpellCheck";
import { reverseRuleFixtures } from "./reverseSpellCheck.fixtures";

describe("reverseSpellCheck", () => {
  it.each(reverseRuleFixtures)("$name", (fixture) => {
    const result = reverseSpellCheck(fixture.input, {
      includeContextual: fixture.includeContextual,
    });

    if (fixture.expectedWrongText) {
      expect(result.wrongText).toBe(fixture.expectedWrongText);
    }

    for (const word of fixture.expectedWrongWords) {
      expect(result.wrongText).toContain(word);
      expect(result.errors.map((error) => error.wrong)).toContain(word);
    }

    for (const original of fixture.expectedOriginals) {
      expect(result.errors.map((error) => error.original)).toContain(original);
    }

    if (fixture.expectedTypes) {
      expect(result.errors.map((error) => error.type)).toEqual(expect.arrayContaining(fixture.expectedTypes));
    }
  });

  it("is deterministic for the same input", () => {
    const input = "역할을 잘 수행하면 금세 좋은 결과가 있을 거예요.";

    expect(reverseSpellCheck(input)).toEqual(reverseSpellCheck(input));
  });

  it("keeps contextual rules disabled by default", () => {
    const result = reverseSpellCheck("든지");

    expect(result.wrongText).toBe("든지");
    expect(result.errors).toHaveLength(0);
  });

  it("can include contextual rules when requested", () => {
    const result = reverseSpellCheck("든지", { includeContextual: true });

    expect(result.wrongText).toBe("던지");
    expect(result.errors[0]?.original).toBe("든지");
  });

  it("tracks highlighted ranges against the generated text", () => {
    const result = reverseSpellCheck("오랜만에 며칠 동안 기다렸다.");

    for (const error of result.errors) {
      expect(result.wrongText.slice(error.startIndex, error.endIndex)).toBe(error.wrong);
    }
  });
});
