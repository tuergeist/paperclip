#!/usr/bin/env node
/**
 * tier-classify
 *
 * Deterministic PR-size classifier used by the AI code review POC
 * (see ING-136 / ING-134). Mirrors server/src/lib/review-tier.ts so
 * the coordinator agent can invoke it cheaply from its Bash tool.
 *
 * Usage:
 *   tier-classify --files N --added N --deleted N
 *
 * Stdout: one of `trivial`, `lite`, `full`.
 * Exit:   0 on success, non-zero on bad input.
 */

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--files" || arg === "--added" || arg === "--deleted") {
      const value = argv[i + 1];
      if (value === undefined) {
        throw new Error(`Missing value for ${arg}`);
      }
      out[arg.slice(2)] = value;
      i++;
      continue;
    }
    if (arg === "-h" || arg === "--help") {
      out.help = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return out;
}

function parseNonNegativeInteger(raw, field) {
  if (raw === undefined) {
    throw new Error(`--${field} is required`);
  }
  if (!/^-?\d+$/.test(raw)) {
    throw new Error(`--${field} must be an integer (got "${raw}")`);
  }
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`--${field} must be a non-negative integer (got "${raw}")`);
  }
  return value;
}

export function classifyReviewTier({ filesChanged, linesAdded, linesDeleted }) {
  const loc = linesAdded + linesDeleted;
  if (filesChanged <= 3 && loc <= 50) return "trivial";
  if (filesChanged <= 10 && loc <= 300) return "lite";
  return "full";
}

function printUsage(stream) {
  stream.write(
    "Usage: tier-classify --files N --added N --deleted N\n" +
      "Prints one of: trivial | lite | full\n"
  );
}

function main(argv) {
  let args;
  try {
    args = parseArgs(argv);
  } catch (err) {
    process.stderr.write(`error: ${err.message}\n`);
    printUsage(process.stderr);
    return 2;
  }

  if (args.help) {
    printUsage(process.stdout);
    return 0;
  }

  let filesChanged;
  let linesAdded;
  let linesDeleted;
  try {
    filesChanged = parseNonNegativeInteger(args.files, "files");
    linesAdded = parseNonNegativeInteger(args.added, "added");
    linesDeleted = parseNonNegativeInteger(args.deleted, "deleted");
  } catch (err) {
    process.stderr.write(`error: ${err.message}\n`);
    return 2;
  }

  const tier = classifyReviewTier({ filesChanged, linesAdded, linesDeleted });
  process.stdout.write(`${tier}\n`);
  return 0;
}

const invokedDirectly =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("/tier-classify.mjs") ||
  process.argv[1]?.endsWith("/tier-classify");

if (invokedDirectly) {
  process.exit(main(process.argv.slice(2)));
}
