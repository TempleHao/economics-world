// W04L02 delayed-review regression tests. Run: node scripts/test-w04l02-review.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../lessons/w04-l02-tax-deadweight-loss.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
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
    getStorage: key => storage[key],
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
scenario('legacy learning state remains unchanged', {
  'ew-state-v02': JSON.stringify({ xp: 160, completedLessons: ['W03L01'] }),
  'ew-depth-v1': record(0, new Date(start - 1000).toISOString()),
}, ({ element, window, getStorage }) => {
  const before = getStorage('ew-state-v02');
  element('taxReviewAnswer').value = '45';
  window.taxReviewSubmit();
  assert.equal(getStorage('ew-state-v02'), before);
});
scenario('malformed depth JSON locks review without deleting it', {
  'ew-depth-v1': '{broken',
}, ({ element, getStorage }) => {
  assert.equal(element('taxReviewAnswer').disabled, true);
  assert.equal(getStorage('ew-depth-v1'), '{broken');
});
console.log('W04L02 review: ' + passed + ' scenarios passed');


// Home queue integration: execute the production dueDepthReviews() implementation.
const siteSource = readFileSync(new URL('../site.js', import.meta.url), 'utf8');
const queueStart = siteSource.indexOf('function dueDepthReviews(){');
const queueEnd = siteSource.indexOf('\n/* home */', queueStart);
assert.ok(queueStart >= 0 && queueEnd > queueStart, 'Home queue function must exist');
const queueSource = siteSource.slice(queueStart, queueEnd);
function homeQueue(depth, now = start) {
  const LESSONS = [
    { id: 'W04L02', path: 'lessons/w04-l02-tax-deadweight-loss.html' },
    { id: 'W03L03', path: 'lessons/w03-l03-elasticity.html' },
    { id: 'W04L01', path: 'lessons/w04-l01-surplus-efficiency.html' },
  ];
  const localStorage = { getItem: key => key === 'ew-depth-v1' ? depth : null };
  const result = runInNewContext(queueSource + '\ndueDepthReviews()', {
    LESSONS, localStorage, Date: class extends Date { static now() { return now; } },
  });
  return Array.from(result, item => item.id);
}
const homeRecord = (round, dueAt) => JSON.stringify({
  W04L02: { audit20261102: { passedAt: new Date(start - day).toISOString(), review: { round, dueAt } } },
});
assert.deepEqual(homeQueue(homeRecord(0, new Date(start - 1).toISOString())), ['W04L02']);
assert.deepEqual(homeQueue(homeRecord(0, new Date(start + day).toISOString())), []);
assert.deepEqual(homeQueue(homeRecord(3, null)), []);
assert.deepEqual(homeQueue(homeRecord(-1, new Date(start - 1).toISOString())), []);
assert.deepEqual(homeQueue(homeRecord(0, 'broken')), []);
assert.deepEqual(homeQueue('{broken'), []);
assert.deepEqual(homeQueue(JSON.stringify({
  W04L01: { audit20261101: { passedAt: new Date(start - day).toISOString(), review: { stage: 0, dueAt: new Date(start - 1).toISOString() } } },
})), ['W04L01']);
const elasticityRecord = (round, due) => JSON.stringify({
  W03L03: { audit20261119: { passedAt: new Date(start - day).toISOString(), review: { round, due } } },
});
assert.deepEqual(homeQueue(elasticityRecord(0, new Date(start - 1).toISOString())), ['W03L03']);
assert.deepEqual(homeQueue(elasticityRecord(1, new Date(start + day).toISOString())), []);
assert.deepEqual(homeQueue(elasticityRecord(3, new Date(start - 1).toISOString())), []);
assert.deepEqual(homeQueue(elasticityRecord(-1, new Date(start - 1).toISOString())), []);
assert.deepEqual(homeQueue(elasticityRecord(0, 'broken')), []);
console.log('PASS W03L03 home queue: due, future, completed, invalid round/date');
assert.ok(siteSource.includes("'<a href=\"./'") || siteSource.includes('href="./'), 'Home must render review links');
console.log('PASS home queue: due, future, completed, invalid, legacy and navigation link');


// W03L03 real inline-script regression: preserve legacy state and exercise the review clock.
const elasticityHtml = readFileSync(new URL('../lessons/w03-l03-elasticity.html', import.meta.url), 'utf8');
const elasticityScripts = [...elasticityHtml.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/g)].map(x => x[1]).filter(Boolean);
assert.equal(elasticityScripts.length, 1, 'W03L03 must have one inline lesson script');
function elasticityScenario(name, round, dueOffset, answer, expectedRound, expectedOffset) {
  let clock = start;
  const due = new Date(start + dueOffset * day).toISOString();
  const legacy = JSON.stringify({xp: 180, completedLessons: ['W03L01'], mistakes: [{concept:'old'}]});
  const storage = {
    'ew-state-v02': legacy,
    'ew-depth-v1': JSON.stringify({W03L03:{audit20261119:{passedAt:new Date(start-day).toISOString(),review:{round,due}}}}),
  };
  const nodes = new Map();
  const element = id => {
    if (!nodes.has(id)) nodes.set(id, {
      value: id==='elastic-price'?'100':id==='elastic-slope'?'1':id==='cross-price'?'120':id==='cross-slope'?'0.5':'',
      textContent:'', disabled:false, classList:{add(){},remove(){}},
      addEventListener(type, fn){this['on'+type]=fn;}, scrollIntoView(){},
    });
    return nodes.get(id);
  };
  class FakeDate extends Date {
    constructor(...args){super(...(args.length?args:[clock]));}
    static now(){return clock;}
  }
  const window = {};
  const localStorage = {
    getItem:key=>storage[key]??null,
    setItem:(key,value)=>{storage[key]=value;},
  };
  const document = {getElementById:element,querySelectorAll:()=>[]};
  runInNewContext(elasticityScripts[0], {window,document,localStorage,Date:FakeDate,finishExtra(){}},
    {filename:'w03-l03-elasticity.inline.js'});
  const input = element('elastic-review-answer');
  assert.equal(input.disabled, dueOffset>0 || round===3, name+' lock state');
  if (answer!==null) {
    input.value=String(answer);
    element('elastic-review-check').onclick();
    const result=JSON.parse(storage['ew-depth-v1']).W03L03.audit20261119.review;
    assert.equal(result.round,expectedRound,name+' round');
    assert.equal(Date.parse(result.due),start+expectedOffset*day,name+' next due');
    assert.equal(element('elastic-review-answer').disabled,true,name+' locks after submit');
  }
  assert.equal(storage['ew-state-v02'],legacy,name+' legacy state unchanged');
  console.log('PASS W03L03 '+name);
}
elasticityScenario('future locks',0,1,null,0,1);
elasticityScenario('wrong answer retries tomorrow',0,-1,0,0,1);
elasticityScenario('round 1 schedules day 7',0,-1,0.53,1,7);
elasticityScenario('round 2 schedules day 30 from initial completion',1,-1,-0.47,2,23);
elasticityScenario('round 3 completes',2,-1,0,3,0);
elasticityScenario('completed stays locked',3,-1,null,3,-1);
