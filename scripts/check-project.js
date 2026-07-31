import fs from 'node:fs';
const required=['README.md','LICENSE','SECURITY.md','CONTRIBUTING.md','GOVERNANCE.md','action.yml','dist/index.cjs','packages/spec/schema/session.schema.json','benchmark-results/latest.json','packages/evaluator/schema/report.schema.json','CITATION.cff','MAINTAINERS.md'];
const missing=required.filter(f=>!fs.existsSync(f));
if(missing.length){console.error(`Missing: ${missing.join(', ')}`);process.exit(1);}console.log(`Project structure validated (${required.length} required artifacts).`);
