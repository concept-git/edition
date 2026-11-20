/** Gate regressions: a report must not pass because a counter is missing, stale or rounded up. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coverageErrors, javaCoverage, javascriptCoverage, pythonCoverage, warningLines } from '../space.ts';

test('coverage compares exact counts and distinguishes a branch-free module from an empty report', () => {
  assert.deepEqual(coverageErrors('module', { lines: { covered: 9, total: 10 }, branches: { covered: 0, total: 0 } }, ['lines', 'branches']), []);
  assert.match(coverageErrors('module', { lines: { covered: 89999, total: 100000 } }, ['lines'])[0], /< 90/);
  for (const lines of [{ covered: 0, total: 0 }, { covered: -1, total: 10 }, { covered: 11, total: 10 }, { covered: NaN, total: 10 }]) {
    assert.equal(coverageErrors('module', { lines }, ['lines']).length, 1);
  }
  assert.equal(coverageErrors('missing', {}, ['lines', 'branches']).length, 2);
});

test('Java summary uses report counters rather than counters from the last class', () => {
  const xml = '<report><package><counter type="LINE" missed="0" covered="100"/></package><counter type="LINE" missed="8" covered="2"/><counter type="BRANCH" missed="1" covered="9"/><counter type="METHOD" missed="0" covered="3"/></report>';
  assert.deepEqual(javaCoverage(xml), { lines: { covered: 2, total: 10 }, branches: { covered: 9, total: 10 }, methods: { covered: 3, total: 3 } });
  assert.equal(coverageErrors('broken XML', javaCoverage(''), ['lines']).length, 1);
});

test('JavaScript and Python retain each metric instead of averaging different counters', () => {
  const metrics = { lines: { covered: 9, total: 10 }, branches: { covered: 4, total: 10 }, functions: { covered: 9, total: 10 }, statements: { covered: 9, total: 10 } };
  assert.deepEqual(javascriptCoverage({ total: metrics }), metrics);
  assert.equal(coverageErrors('js', metrics, Object.keys(metrics)).length, 1);
  assert.deepEqual(pythonCoverage({ totals: { covered_lines: 9, num_statements: 10, covered_branches: 4, num_branches: 10 } }), { lines: metrics.lines, branches: metrics.branches });
});

test('warning detection retains real diagnostics but accepts zero-warning summaries', () => {
  const diagnostics = ['[WARN] unsupported engine', 'x.java:3: warning: unchecked cast', '(node:1) ExperimentalWarning: flag', 'WARNING: runtime issue', 'Found 1 warning', 'Deprecated Gradle features were used'];
  assert.deepEqual(warningLines(diagnostics.join('\n')), diagnostics);
  assert.deepEqual(warningLines('0 errors and 0 warnings\nTests passed\n'), []);
});
