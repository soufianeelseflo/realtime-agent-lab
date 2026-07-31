import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('CLI prints help',()=>{
 const result=spawnSync(process.execPath,['packages/cli/bin/ral.js','help'],{encoding:'utf8'});
 assert.equal(result.status,0);
 assert.match(result.stdout,/validate/);
});
