// ---------------------------------------------------------------------------
// Fails when a documented fact has drifted from its source.
//
// Every check here exists because the claim it guards actually went stale. Add
// one whenever a number in a doc outlives the thing it described, rather than
// trusting a rule to catch it next time.
// ---------------------------------------------------------------------------

import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const failures = [];
const checked = [];

function check(name, fn) {
  try {
    const skip = fn();
    checked.push(skip ? `${name} (skipped: ${skip})` : name);
  } catch (err) {
    failures.push(`${name}: ${err.message}`);
  }
}

// --- The item-type catalog -------------------------------------------------
// Drifted 2026-08-01. Note the union's last entry sits below a comment that
// contains a semicolon, so any parser slicing to the first ';' silently drops
// it and reports one fewer. Strip comments before counting.
check('README item-type count matches KnownItemType', () => {
  const lines = readFileSync('src/api/types/item.ts', 'utf8').split(/\r?\n/);
  const start = lines.findIndex((l) => l.includes('export type KnownItemType'));
  if (start === -1) throw new Error('could not locate the union');
  const end = lines.findIndex(
    (l, i) => i > start && !l.trim().startsWith('//') && l.includes(';'),
  );
  if (end === -1) throw new Error('could not find the end of the union');

  const body = lines
    .slice(start, end + 1)
    .filter((l) => !l.trim().startsWith('//'))
    .join('\n');
  const actual = new Set([...body.matchAll(/'([A-Za-z0-9]+)'/g)].map((m) => m[1])).size;

  const readme = readFileSync('README.md', 'utf8');
  const claim = readme.match(/(\d+) recognized Fabric item types/);
  if (!claim) throw new Error('README no longer states a recognized-item-type count');
  if (Number(claim[1]) !== actual) {
    throw new Error(`README says ${claim[1]}, source has ${actual}`);
  }
});

// --- The backlog's current-release line -------------------------------------
// Drifted for four releases (v2.0.1 through v2.3.0) before anyone noticed, because
// the top of the backlog is read far more often than it is edited. .local/ is
// gitignored, so this is a local-only check and skips cleanly in CI.
check('TASKS.md current release matches the newest tag', () => {
  if (!existsSync('.local/TASKS.md')) return 'no .local/TASKS.md';

  let tag;
  try {
    tag = execFileSync('git', ['describe', '--tags', '--abbrev=0'], {
      encoding: 'utf8',
    }).trim();
  } catch {
    return 'no tags in this checkout';
  }

  const tasks = readFileSync('.local/TASKS.md', 'utf8');
  const claim = tasks.match(/\*\*Current release: (v[\d.]+)\*\*/);
  if (!claim) throw new Error('TASKS.md has no "Current release:" line');
  if (claim[1] !== tag) {
    throw new Error(`TASKS.md says ${claim[1]}, newest tag is ${tag}`);
  }
});

// --- Report ----------------------------------------------------------------

for (const name of checked) console.log(`  ok  ${name}`);
if (failures.length > 0) {
  console.error('\nDocumentation has drifted from source:\n');
  for (const f of failures) console.error(`  FAIL  ${f}`);
  console.error('\nFix the doc, or the source, before shipping.\n');
  process.exit(1);
}
console.log(`\n${checked.length} checks passed.`);
