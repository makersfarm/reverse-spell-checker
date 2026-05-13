import { describe, expect, it } from "vitest";
import { reverseSpellCheck } from "./reverseSpellCheck";

describe("reverseSpellCheck", () => {
  it("applies merged spelling rules from the previous app and Manus app", () => {
    const result = reverseSpellCheck("오랜만에 친구를 만나서 좋았다. 며칠 전부터 기대했다.");

    expect(result.wrongText).toContain("오랫만에");
    expect(result.wrongText).toContain("몇일");
    expect(result.errors.map((error) => error.original)).toContain("오랜만에");
    expect(result.errors.map((error) => error.original)).toContain("며칠");
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
});
