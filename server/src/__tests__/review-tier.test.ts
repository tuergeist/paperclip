import { describe, expect, it } from "vitest";
import {
  classifyReviewTier,
  InvalidReviewTierInputError,
} from "../lib/review-tier.js";

describe("classifyReviewTier", () => {
  it("classifies boundary: 3 files, 50 LOC as trivial", () => {
    expect(
      classifyReviewTier({ filesChanged: 3, linesAdded: 30, linesDeleted: 20 })
    ).toBe("trivial");
  });

  it("classifies boundary: 4 files, 50 LOC as lite", () => {
    expect(
      classifyReviewTier({ filesChanged: 4, linesAdded: 30, linesDeleted: 20 })
    ).toBe("lite");
  });

  it("classifies boundary: 3 files, 51 LOC as lite", () => {
    expect(
      classifyReviewTier({ filesChanged: 3, linesAdded: 30, linesDeleted: 21 })
    ).toBe("lite");
  });

  it("classifies boundary: 10 files, 300 LOC as lite", () => {
    expect(
      classifyReviewTier({ filesChanged: 10, linesAdded: 200, linesDeleted: 100 })
    ).toBe("lite");
  });

  it("classifies boundary: 11 files, 300 LOC as full", () => {
    expect(
      classifyReviewTier({ filesChanged: 11, linesAdded: 200, linesDeleted: 100 })
    ).toBe("full");
  });

  it("classifies boundary: 10 files, 301 LOC as full", () => {
    expect(
      classifyReviewTier({ filesChanged: 10, linesAdded: 200, linesDeleted: 101 })
    ).toBe("full");
  });

  it("classifies zero-change PR as trivial", () => {
    expect(
      classifyReviewTier({ filesChanged: 0, linesAdded: 0, linesDeleted: 0 })
    ).toBe("trivial");
  });

  it("classifies huge PR as full", () => {
    expect(
      classifyReviewTier({
        filesChanged: 100,
        linesAdded: 5000,
        linesDeleted: 5000,
      })
    ).toBe("full");
  });

  it("rejects negative filesChanged", () => {
    expect(() =>
      classifyReviewTier({ filesChanged: -1, linesAdded: 0, linesDeleted: 0 })
    ).toThrow(InvalidReviewTierInputError);
  });

  it("rejects negative linesAdded", () => {
    expect(() =>
      classifyReviewTier({ filesChanged: 1, linesAdded: -5, linesDeleted: 0 })
    ).toThrow(InvalidReviewTierInputError);
  });

  it("rejects non-integer linesDeleted", () => {
    expect(() =>
      classifyReviewTier({ filesChanged: 1, linesAdded: 0, linesDeleted: 2.5 })
    ).toThrow(InvalidReviewTierInputError);
  });

  it("rejects NaN input", () => {
    expect(() =>
      classifyReviewTier({
        filesChanged: Number.NaN,
        linesAdded: 0,
        linesDeleted: 0,
      })
    ).toThrow(InvalidReviewTierInputError);
  });
});
