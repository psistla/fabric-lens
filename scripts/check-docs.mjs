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

// --- Item colour families vs their CSS tokens -------------------------------
// ItemTypeBadge composes `var(--item-${token})` at runtime, so a family in the
// map with no matching token in index.css yields an unstyled badge rather than
// an error. Lives here and not in a unit test because Vitest cannot read the
// stylesheet: the Tailwind v4 plugin intercepts `.css`, and `?raw` comes back
// empty.
check('every item colour family has tokens in both themes', () => {
  const constants = readFileSync('src/utils/constants.ts', 'utf8');
  const map = constants.match(/const ITEM_TYPE_TOKENS[\s\S]*?\n\};/);
  if (!map) throw new Error('could not locate ITEM_TYPE_TOKENS');

  const families = new Set([...map[0].matchAll(/:\s*'([a-z-]+)'/g)].map((m) => m[1]));
  families.add('default'); // itemTypeToken's fallback, never a map value

  const css = readFileSync('src/index.css', 'utf8');
  const rootAt = css.indexOf(':root {');
  const darkAt = css.indexOf('.dark {');
  if (rootAt === -1 || darkAt === -1) throw new Error('could not locate :root / .dark blocks');
  const themes = { light: css.slice(rootAt, darkAt), dark: css.slice(darkAt) };

  const missing = [];
  for (const family of families) {
    for (const [theme, block] of Object.entries(themes)) {
      for (const suffix of ['', '-bg']) {
        if (!block.includes(`--item-${family}${suffix}:`)) {
          missing.push(`--item-${family}${suffix} (${theme})`);
        }
      }
    }
  }
  if (missing.length > 0) throw new Error(`undefined tokens: ${missing.join(', ')}`);
});

// --- The DESIGN_GUIDE item palette ------------------------------------------
// Drifted 2026-08-11: v2.4.0 added four families and this list still showed
// eight the next day, while CLAUDE.md step 10 sends every design audit to it.
// Checks hex values and not just names, because the second drift (2026-08-17)
// was three colours darkened for AA while every family name stayed put.
// .local/ is gitignored, so this skips cleanly in CI.
check('DESIGN_GUIDE item palette matches index.css', () => {
  if (!existsSync('.local/DESIGN_GUIDE.md')) return 'no .local/DESIGN_GUIDE.md';

  const constants = readFileSync('src/utils/constants.ts', 'utf8');
  const map = constants.match(/const ITEM_TYPE_TOKENS[\s\S]*?\n\};/);
  if (!map) throw new Error('could not locate ITEM_TYPE_TOKENS');
  const families = new Set([...map[0].matchAll(/:\s*'([a-z-]+)'/g)].map((m) => m[1]));
  families.add('default');

  const css = readFileSync('src/index.css', 'utf8');
  const rootAt = css.indexOf(':root {');
  const darkAt = css.indexOf('.dark {');
  if (rootAt === -1 || darkAt === -1) throw new Error('could not locate :root / .dark blocks');
  const light = css.slice(rootAt, darkAt);

  // Both sides parsed with the same literal. An earlier version built this
  // regex with `new RegExp(`...\s*...`)`, where the template literal ate the
  // backslash, so it matched nothing and the check passed vacuously.
  const palette = (text) =>
    new Map(
      [...text.matchAll(/--item-([a-z-]+):\s*(#[0-9A-Fa-f]{6})/g)].map((m) => [
        m[1],
        m[2].toUpperCase(),
      ]),
    );

  const guide = readFileSync('.local/DESIGN_GUIDE.md', 'utf8');
  const shipped = palette(light);
  const documented = palette(guide);

  const problems = [];
  for (const family of families) {
    const actual = shipped.get(family);
    if (!actual) continue; // check 3 already owns missing tokens
    const claimed = documented.get(family);
    if (!claimed) problems.push(`--item-${family} missing from DESIGN_GUIDE`);
    else if (claimed !== actual) {
      problems.push(`--item-${family}: DESIGN_GUIDE says ${claimed}, index.css has ${actual}`);
    }
  }

  const stated = guide.match(/\/\* (\d+) families as of/);
  if (stated && Number(stated[1]) !== families.size) {
    problems.push(`DESIGN_GUIDE states ${stated[1]} families, there are ${families.size}`);
  }

  if (problems.length > 0) throw new Error(problems.join('; '));
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
