import fs from 'node:fs';
const benchmark=JSON.parse(fs.readFileSync('benchmark-results/latest.json','utf8'));
const rows=benchmark.reports.map(r=>`<tr><td>${r.sessionId}</td><td>${r.language}</td><td>${r.score}</td><td>${r.grade}</td><td>${r.findings.length}</td></tr>`).join('');
let html=fs.readFileSync('site/template.html','utf8');
html=html.replace('{{AVERAGE}}',benchmark.summary.averageScore).replace('{{SESSIONS}}',benchmark.summary.sessions).replace('{{ROWS}}',rows).replace('{{GENERATED}}',benchmark.generatedAt);
fs.writeFileSync('site/index.html',html);console.log('Built site/index.html');
