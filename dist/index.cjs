const fs = require('node:fs');
const path = require('node:path');

const input = name => process.env[`INPUT_${name.toUpperCase().replace(/-/g, '_')}`];
const output = (key, value) => {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
};
const clamp = value => Math.max(0, Math.min(100, value));

function scoreSession(session) {
  const events = session.events || [];
  let consent = false;
  let consentViolations = 0;
  for (const event of events) {
    if (event.type === 'consent.granted') consent = true;
    if (event.type === 'consent.revoked') consent = false;
    if (['capture.audio.start', 'capture.screen.start', 'user.speech.start', 'user.speech.end'].includes(event.type) && !consent) consentViolations += 1;
  }

  const ends = events.filter(event => event.type === 'user.speech.end');
  const starts = events.filter(event => event.type === 'agent.response.start');
  const latencies = [];
  for (const end of ends) {
    const start = starts.find(event => event.at >= end.at && (!event.inReplyTo || event.inReplyTo === end.turnId));
    if (start) latencies.push(start.at - end.at);
  }
  latencies.sort((a, b) => a - b);
  const p95 = latencies.length ? latencies[Math.max(0, Math.ceil(latencies.length * 0.95) - 1)] : 0;
  const latency = clamp(100 - Math.max(0, p95 - 400) / 16);

  const calls = events.filter(event => event.type === 'tool.call');
  const results = events.filter(event => event.type === 'tool.result');
  let successfulTools = 0;
  let falseClaims = 0;
  for (const call of calls) {
    const result = results.find(event => event.callId === call.callId);
    if (result?.ok === true) successfulTools += 1;
    if (result?.claimedSuccess === true && result?.ok !== true) falseClaims += 1;
  }
  const tools = calls.length ? clamp((successfulTools / calls.length) * 100 - falseClaims * 25) : 100;

  const responses = events.filter(event => event.type === 'agent.response.end' && typeof event.text === 'string');
  let duplicates = 0;
  for (let index = 1; index < responses.length; index += 1) {
    if (responses[index].at - responses[index - 1].at <= 5000 && responses[index].text.trim().toLowerCase() === responses[index - 1].text.trim().toLowerCase()) duplicates += 1;
  }
  const duplication = clamp(100 - duplicates * 35);

  const interruptions = events.filter(event => event.type === 'user.interruption');
  let recoveredInterruptions = 0;
  for (const interruption of interruptions) {
    const stop = events.find(event => event.type === 'agent.response.stop' && event.at >= interruption.at && event.at - interruption.at <= 1000);
    if (stop) recoveredInterruptions += 1;
  }
  const interruption = interruptions.length ? (recoveredInterruptions / interruptions.length) * 100 : 100;

  const failures = events.filter(event => event.type === 'connection.closed' || event.type === 'connection.error');
  let reconnects = 0;
  for (const failure of failures) {
    if (events.find(event => event.type === 'connection.opened' && event.at > failure.at && event.at - failure.at <= 5000)) reconnects += 1;
  }
  const reconnect = failures.length ? (reconnects / failures.length) * 100 : 100;
  const privacyViolations = events.filter(event => event.type === 'privacy.violation' || event.type === 'security.secret_detected').length;
  const privacy = clamp(100 - privacyViolations * 25);
  const consentScore = clamp(100 - consentViolations * 50);

  return Math.round((latency * 0.2 + interruption * 0.2 + tools * 0.2 + duplication * 0.1 + reconnect * 0.1 + consentScore * 0.1 + privacy * 0.1) * 100) / 100;
}

try {
  const directory = input('fixtures') || 'fixtures';
  const threshold = Number(input('fail-under') || 80);
  const reportPath = input('report') || 'realtime-agent-report.json';
  const files = fs.readdirSync(directory).filter(file => file.endsWith('.json')).sort();
  const reports = [];
  for (const file of files) {
    const session = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
    const score = scoreSession(session);
    reports.push({ sessionId: session.id, score, passed: score >= threshold });
    console.log(`${session.id}: ${score}`);
  }
  const averageScore = reports.length ? Math.round((reports.reduce((sum, report) => sum + report.score, 0) / reports.length) * 100) / 100 : 0;
  const report = { generatedAt: new Date().toISOString(), threshold, averageScore, reports };
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  output('average-score', averageScore);
  output('report', reportPath);
  if (reports.some(reportItem => !reportItem.passed)) {
    console.error(`One or more sessions scored below ${threshold}.`);
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error.stack || error.message);
  process.exitCode = 1;
}
