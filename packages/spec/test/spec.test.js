import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSession } from '../src/index.js';

test('accepts an ordered consented session', () => {
  const result = validateSession({specVersion:'1.0',id:'x',startedAt:new Date().toISOString(),events:[{at:0,type:'consent.granted'},{at:1,type:'user.speech.start'}]});
  assert.equal(result.valid, true);
});

test('rejects capture before consent', () => {
  const result = validateSession({specVersion:'1.0',id:'x',startedAt:new Date().toISOString(),events:[{at:0,type:'user.speech.start'}]});
  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /consent/);
});
