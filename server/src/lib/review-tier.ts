export type ReviewTier = "trivial" | "lite" | "full";

export interface ReviewTierInput {
  filesChanged: number;
  linesAdded: number;
  linesDeleted: number;
}

export class InvalidReviewTierInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidReviewTierInputError";
  }
}

function assertNonNegativeInteger(value: number, field: string): void {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
    throw new InvalidReviewTierInputError(
      `${field} must be a non-negative integer (got ${value})`
    );
  }
}

export function classifyReviewTier(input: ReviewTierInput): ReviewTier {
  assertNonNegativeInteger(input.filesChanged, "filesChanged");
  assertNonNegativeInteger(input.linesAdded, "linesAdded");
  assertNonNegativeInteger(input.linesDeleted, "linesDeleted");

  const loc = input.linesAdded + input.linesDeleted;

  if (input.filesChanged <= 3 && loc <= 50) return "trivial";
  if (input.filesChanged <= 10 && loc <= 300) return "lite";
  return "full";
}
