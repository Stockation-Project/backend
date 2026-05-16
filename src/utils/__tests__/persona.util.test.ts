// src/utils/__tests__/persona.util.test.ts
import { describe, it, expect } from "vitest";
import { determinePersonaFromScore } from "../persona.util.js";

describe("Persona Utility", () => {
  it("should return turtle for low scores (0-18)", () => {
    expect(determinePersonaFromScore(0)).toBe("turtle");
    expect(determinePersonaFromScore(10)).toBe("turtle");
    expect(determinePersonaFromScore(18)).toBe("turtle");
  });

  it("should return hippo for scores 19-22", () => {
    expect(determinePersonaFromScore(19)).toBe("hippo");
    expect(determinePersonaFromScore(22)).toBe("hippo");
  });

  it("should return capybara for scores 23-28", () => {
    expect(determinePersonaFromScore(23)).toBe("capybara");
    expect(determinePersonaFromScore(28)).toBe("capybara");
  });

  it("should return wolf for scores 29-32", () => {
    expect(determinePersonaFromScore(29)).toBe("wolf");
    expect(determinePersonaFromScore(32)).toBe("wolf");
  });

  it("should return lion for scores 33-47", () => {
    expect(determinePersonaFromScore(33)).toBe("lion");
    expect(determinePersonaFromScore(47)).toBe("lion");
  });

  it("should fallback to capybara for out of range scores", () => {
    expect(determinePersonaFromScore(100)).toBe("capybara");
    expect(determinePersonaFromScore(-5)).toBe("capybara");
  });
});
