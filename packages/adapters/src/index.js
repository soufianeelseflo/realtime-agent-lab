const event = (at,type,extra={}) => ({at:Number(at)||0,type,...extra});

export function normalizeOpenAIRealtime(records, meta={}) {
  const events=[];
  for (const r of records) {
    if (r.type==='session.created') events.push(event(r.at,'connection.opened'));
    else if (r.type==='input_audio_buffer.speech_started') events.push(event(r.at,'user.speech.start',{turnId:r.item_id}));
    else if (r.type==='input_audio_buffer.speech_stopped') events.push(event(r.at,'user.speech.end',{turnId:r.item_id}));
    else if (r.type==='response.created') events.push(event(r.at,'agent.response.start',{turnId:r.response?.id}));
    else if (r.type==='response.done') events.push(event(r.at,'agent.response.end',{turnId:r.response?.id,text:r.text||''}));
    else if (r.type==='response.cancelled') events.push(event(r.at,'agent.response.stop',{turnId:r.response_id}));
    else if (r.type==='error') events.push(event(r.at,'connection.error',{message:r.error?.message||r.message}));
  }
  return makeSession('openai-realtime',events,meta);
}

export function normalizeGeminiLive(records, meta={}) {
  const events=[];
  for (const r of records) {
    if (r.kind==='connected') events.push(event(r.at,'connection.opened'));
    else if (r.kind==='input-start') events.push(event(r.at,'user.speech.start',{turnId:r.turnId}));
    else if (r.kind==='input-end') events.push(event(r.at,'user.speech.end',{turnId:r.turnId}));
    else if (r.kind==='model-start') events.push(event(r.at,'agent.response.start',{turnId:r.turnId}));
    else if (r.kind==='model-end') events.push(event(r.at,'agent.response.end',{turnId:r.turnId,text:r.text||''}));
    else if (r.kind==='interrupted') events.push(event(r.at,'agent.response.stop',{turnId:r.turnId}));
  }
  return makeSession('gemini-live',events,meta);
}

export function normalizeTwilioMediaStream(records, meta={}) {
  const events=[];
  for (const r of records) {
    if (r.event==='start') events.push(event(r.at,'connection.opened'));
    else if (r.event==='mark' && r.mark?.name==='user-speech-start') events.push(event(r.at,'user.speech.start',{turnId:r.turnId}));
    else if (r.event==='mark' && r.mark?.name==='user-speech-end') events.push(event(r.at,'user.speech.end',{turnId:r.turnId}));
    else if (r.event==='stop') events.push(event(r.at,'connection.closed'));
  }
  return makeSession('twilio-media-streams',events,meta);
}

export function normalizeGenericWebSocket(records, meta={}) {
  const events=records.map(r=>event(r.at,r.type,r.data||{}));
  return makeSession('generic-websocket',events,meta);
}

function makeSession(provider,events,meta) {
  return {specVersion:'1.0',id:meta.id||`${provider}-${Date.now()}`,language:meta.language||'und',startedAt:meta.startedAt||new Date().toISOString(),metadata:{provider,...meta.metadata},events:[{at:0,type:'consent.granted'},...events].sort((a,b)=>a.at-b.at)};
}
