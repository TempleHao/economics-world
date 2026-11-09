// W04L02 delayed-review regression tests. Run: node scripts/test-w04l02-review.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../lessons/w04-l02-tax-deadweight-loss.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/g)]
  .map(match => match[1]).filter(Boolean);
assert.equal(scripts.length, 1, 'Expected exactly one inline lesson script');
const source = scripts[0];
const start = Date.parse('2026-11-01T00:00:00Z');
const day = 86_400_000;
let passed = 0;

function record(round, dueAt, passedAt = new Date(start).toISOString()) {
  return JSON.stringify({ W04L02: { audit20261102: { passedAt, review: { round, dueAt, errors: 0 } } } });
}
function scenario(name, initial, check) {
  let clock = start;
  const storage = { ...initial };
  const nodes = new Map();
  const element = id => {
    if (!nodes.has(id)) nodes.set(id, {
      value: '', textContent: '', disabled: false,
      addEventListener() {},
    });
    return nodes.get(id);
  };
  const localStorage = {
    getItem: key => storage[key] ?? null,
    setItem: (key, value) => { storage[key] = value; },
  };
  class FakeDate extends Date {
    constructor(...args) { super(...(args.length ? args : [clock])); }
    static now() { return clock; }
  }
  const window = { finishExtra() {} };
  runInNewContext(source, {
    window, document: { getElementById: element }, localStorage, Date: FakeDate,
  }, { filename: 'w04-l02-tax-deadweight-loss.inline.js' });
  const context = {
    element, window, advance: days => { clock += days * day; },
    review: () => JSON.parse(storage['ew-depth-v1']).W04L02.audit20261102.review,
  };
  check(context);
  passed++;
  console.log('PASS ' + name);
}
scenario('no completion evidence locks review', {}, ({ element }) => {
  assert.equal(element('taxReviewAnswer').disabled, true);
});
scenario('future due date locks review', {
  'ew-depth-v1': record(0, new Date(start + day).toISOString()),
}, ({ element }) => assert.equal(element('taxReviewAnswer').disabled, true));
scenario('wrong answer retries the same round tomorrow', {
  'ew-depth-v1': record(0, new Date(start - 1000).toISOString()),
}, ({ element, window, review }) => {
  element('taxReviewAnswer').value = '44';
  window.taxReviewSubmit();
  assert.equal(review().round, 0);
  assert.equal(review().errors, 1);
  assert.equal(Date.parse(review().dueAt), start + day);
  assert.equal(element('taxReviewAnswer').disabled, true);
});
scenario('first correct answer schedules day seven', {
  'ew-depth-v1': record(0, new Date(start - 1000).toISOString()),
}, ({ element, window, review }) => {
  element('taxReviewAnswer').value = '45';
  window.taxReviewSubmit();
  assert.equal(review().round, 1);
  assert.equal(Date.parse(review().dueAt), start + 7 * day);
});
scenario('second correct answer schedules day thirty', {
  'ew-depth-v1': record(1, new Date(start - 1000).toISOString(), new Date(start - 7 * day).toISOString()),
}, ({ element, window, review }) => {
  element('taxReviewAnswer').value = '400';
  window.taxReviewSubmit();
  assert.equal(review().round, 2);
  assert.equal(Date.parse(review().dueAt), start + 23 * day);
});
scenario('third correct answer exits review', {
  'ew-depth-v1': record(2, new Date(start - 1000).toISOString(), new Date(start - 31 * day).toISOString()),
}, ({ element, window, review }) => {
  element('taxReviewAnswer').value = '1200';
  window.taxReviewSubmit();
  assert.equal(review().round, 3);
  assert.equal(review().dueAt, null);
  assert.equal(element('taxReviewAnswer').disabled, true);
});
for (const invalid of [-1, 4]) {
  scenario('invalid round ' + invalid + ' locks review', {
    'ew-depth-v1': record(invalid, new Date(start - 1000).toISOString()),
  }, ({ element }) => assert.equal(element('taxReviewAnswer').disabled, true));
}
scenario('invalid date locks review', {
  'ew-depth-v1': record(0, 'broken'),
}, ({ element }) => assert.equal(element('taxReviewAnswer').disabled, true));
console.log('W04L02 review: ' + passed + ' scenarios passed');
