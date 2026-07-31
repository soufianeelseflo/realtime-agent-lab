import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSession } from '../src/index.js';

const base={specVersion:'1.0',id:'ok',startedAt:'2026-08-01T00:00:00.000Z',events:[
 {at:0,type:'consent.granted'},
 {at:100,type:'user.speech.start'},
 {at:1000,type:'user.speech.end',turnId:'u1'},
 {at:1400,type:'agent.response.start',turnId:'a1',inReplyTo:'u1'},
 {at:1800,type:'agent.response.end',turnId:'a1',text:'Done'}
]};

test('scores a healthy session highly',()=>assert.ok(evaluateSession(base).score>=95));

test('penalizes false tool success',()=>{
 const session=structuredClone(base);
 session.events.push({at:2000,type:'tool.call',callId:'c1',name:'book'});
 session.events.push({at:2200,type:'tool.result',callId:'c1',ok:false,claimedSuccess:true});
 assert.ok(evaluateSession(session).metrics.tools.score<80);
});
