import { assertValidSession } from '../../spec/src/index.js';
import { scanObject } from '../../security/src/index.js';

const round = n => Math.round(n * 100) / 100;
const clamp = n => Math.max(0, Math.min(100, n));
const percentile = (values, p) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a,b)=>a-b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index];
};

function latencyMetric(events) {
  const ends = events.filter(e=>e.type==='user.speech.end');
  const starts = events.filter(e=>e.type==='agent.response.start');
  const latencies=[];
  for (const end of ends) {
    const start = starts.find(s => s.at >= end.at && (!s.inReplyTo || s.inReplyTo === end.turnId));
    if (start) latencies.push(start.at - end.at);
  }
  const p95 = percentile(latencies,95);
  const score = p95 === null ? 100 : clamp(100 - Math.max(0,p95-400)/16);
  return {score:round(score),samples:latencies.length,p50:percentile(latencies,50),p95,max:latencies.length?Math.max(...latencies):null};
}

function interruptionMetric(events) {
  const interruptions = events.filter(e=>e.type==='user.interruption');
  const recovery=[];
  for (const interruption of interruptions) {
    const stop = events.find(e=>e.type==='agent.response.stop' && e.at>=interruption.at && e.at<=interruption.at+3000);
    recovery.push(stop ? stop.at-interruption.at : null);
  }
  const successes=recovery.filter(v=>v!==null && v<=1000).length;
  return {score: interruptions.length?round(successes/interruptions.length*100):100,total:interruptions.length,successful:successes,recoveryMs:recovery};
}

function toolMetric(events) {
  const calls=events.filter(e=>e.type==='tool.call');
  const results=events.filter(e=>e.type==='tool.result');
  let success=0, falseClaims=0;
  for (const call of calls) {
    const result=results.find(r=>r.callId===call.callId);
    if (result?.ok===true) success++;
    if (result?.claimedSuccess===true && result?.ok!==true) falseClaims++;
  }
  const base=calls.length?success/calls.length*100:100;
  return {score:round(clamp(base-falseClaims*25)),calls:calls.length,successful:success,falseClaims};
}

function duplicateMetric(events) {
  const outputs=events.filter(e=>e.type==='agent.response.end' && typeof e.text==='string');
  let duplicates=0;
  for (let i=1;i<outputs.length;i++) {
    const a=outputs[i-1], b=outputs[i];
    if (b.at-a.at<=5000 && a.text.trim().toLowerCase()===b.text.trim().toLowerCase()) duplicates++;
  }
  return {score:round(clamp(100-duplicates*35)),outputs:outputs.length,duplicates};
}

function reconnectMetric(events) {
  const closes=events.filter(e=>e.type==='connection.closed' || e.type==='connection.error');
  let recovered=0; const recoveryMs=[];
  for (const close of closes) {
    const open=events.find(e=>e.type==='connection.opened' && e.at>close.at);
    if (open && open.at-close.at<=5000) {recovered++; recoveryMs.push(open.at-close.at);} else recoveryMs.push(null);
  }
  return {score:closes.length?round(recovered/closes.length*100):100,failures:closes.length,recovered,recoveryMs};
}

function consentMetric(events) {
  let consent=false, violations=0, captures=0;
  const captureTypes=new Set(['capture.audio.start','capture.screen.start','user.speech.start','user.speech.end']);
  for (const e of events) {
    if (e.type==='consent.granted') consent=true;
    if (e.type==='consent.revoked') consent=false;
    if (captureTypes.has(e.type)) {captures++; if (!consent) violations++;}
  }
  return {score:round(clamp(100-violations*50)),captures,violations};
}

function privacyMetric(session) {
  const explicit=session.events.filter(e=>e.type==='privacy.violation' || e.type==='security.secret_detected').length;
  const detected=scanObject(session).length;
  const total=explicit+detected;
  return {score:round(clamp(100-total*25)),violations:explicit,detectedSecrets:detected};
}

export function evaluateSession(session, options={}) {
  assertValidSession(session);
  const metrics={
    latency:latencyMetric(session.events),
    interruption:interruptionMetric(session.events),
    tools:toolMetric(session.events),
    duplication:duplicateMetric(session.events),
    reconnect:reconnectMetric(session.events),
    consent:consentMetric(session.events),
    privacy:privacyMetric(session)
  };
  const weights={latency:.20,interruption:.20,tools:.20,duplication:.10,reconnect:.10,consent:.10,privacy:.10};
  const score=round(Object.entries(weights).reduce((sum,[k,w])=>sum+metrics[k].score*w,0));
  const grade=score>=95?'A+':score>=90?'A':score>=80?'B':score>=70?'C':score>=60?'D':'F';
  const findings=[];
  if (metrics.latency.p95!==null && metrics.latency.p95>1200) findings.push({severity:'high',code:'latency.p95',message:`P95 response latency is ${metrics.latency.p95}ms.`});
  if (metrics.interruption.score<100) findings.push({severity:'high',code:'interruption.failed',message:'The agent did not stop within 1000ms after every interruption.'});
  if (metrics.tools.falseClaims) findings.push({severity:'critical',code:'tool.false-success',message:'The agent claimed tool success without a successful result.'});
  if (metrics.duplication.duplicates) findings.push({severity:'medium',code:'output.duplicate',message:'Duplicate agent responses were detected.'});
  if (metrics.consent.violations) findings.push({severity:'critical',code:'consent.capture-without-consent',message:'Capture occurred without active consent.'});
  if (metrics.privacy.detectedSecrets || metrics.privacy.violations) findings.push({severity:'critical',code:'privacy.leak',message:'Potential secrets or explicit privacy violations were detected.'});
  return {schemaVersion:'1.0',generatedAt:new Date().toISOString(),sessionId:session.id,language:session.language||'und',score,grade,passed:score>=(options.failUnder??0),threshold:options.failUnder??0,metrics,findings};
}

export function benchmarkSessions(sessions, options={}) {
  const reports=sessions.map(s=>evaluateSession(s, options));
  const average=reports.length?round(reports.reduce((s,r)=>s+r.score,0)/reports.length):0;
  return {schemaVersion:'1.0',generatedAt:new Date().toISOString(),summary:{sessions:reports.length,averageScore:average,passed:reports.filter(r=>r.passed).length,failed:reports.filter(r=>!r.passed).length},reports};
}
