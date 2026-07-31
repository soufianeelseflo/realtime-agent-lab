import fs from 'node:fs';
import { evaluateSession } from '../../packages/evaluator/src/index.js';
const session=JSON.parse(fs.readFileSync('fixtures/happy-path-en.json','utf8'));
console.log(evaluateSession(session));
