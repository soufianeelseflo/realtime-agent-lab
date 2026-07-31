import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { validateSession } from '../packages/spec/src/index.js';
import { evaluateSession } from '../packages/evaluator/src/index.js';

test('all benchmark fixtures are valid', () => {
  for (const file of fs.readdirSync('fixtures').filter(name => name.endsWith('.json'))) {
    const session = JSON.parse(fs.readFileSync(path.join('fixtures', file), 'utf8'));
    assert.equal(validateSession(session).valid, true, file);
  }
});

test('invalid consent fixture is rejected', () => {
  const session = JSON.parse(fs.readFileSync('fixtures-invalid/consent-violation.json', 'utf8'));
  assert.equal(validateSession(session).valid, false);
});

test('happy path receives an A grade',()=>{
 const session=JSON.parse(fs.readFileSync('fixtures/happy-path-en.json','utf8'));
 assert.match(evaluateSession(session).grade,/^A/);
});
