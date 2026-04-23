# Tier classifier (AI code review POC)

Deterministic PR-size bucketer used by the code-review coordinator agent to
decide how many sub-reviewers to fan out. Spec: `ING-134#document-w2-tier-classifier`.

## Coordinator invocation

```sh
node scripts/tier-classify.mjs --files N --added N --deleted N
# stdout: trivial | lite | full
# exit:   0 ok, 2 bad input
```

## Library use (TS)

```ts
import { classifyReviewTier } from "@paperclipai/server/lib/review-tier.js";

const tier = classifyReviewTier({ filesChanged, linesAdded, linesDeleted });
```

Thresholds live in `server/src/lib/review-tier.ts`; tests in
`server/src/__tests__/review-tier.test.ts`. Tune via W5, not ad-hoc edits.
