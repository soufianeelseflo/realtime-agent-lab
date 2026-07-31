import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeOpenAIRealtime } from '../src/index.js';
import { validateSession } from '../../spec/src/index.js';

test('normalizes OpenAI realtime logs to RAL spec',()=>{
 const s=normalizeOpenAIRealtime([{at:10,type:'session.created'},{at:20,type:'input_audio_buffer.speech_started',item_id:'u1'}]);
 assert.equal(validateSession(s).valid,true);
});
