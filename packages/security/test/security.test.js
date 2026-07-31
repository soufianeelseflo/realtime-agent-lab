import test from 'node:test';
import assert from 'node:assert/strict';
import { scanText, redactText } from '../src/index.js';

test('detects and redacts secrets', () => {
  const input = 'key sk-proj-abcdefghijklmnopqrstuvwxyz and me@example.com';
  assert.ok(scanText(input).length >= 2);
  assert.doesNotMatch(redactText(input), /sk-proj-/);
});
