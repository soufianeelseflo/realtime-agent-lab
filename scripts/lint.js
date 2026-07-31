import fs from 'node:fs';
import path from 'node:path';

const roots = ['packages', 'scripts', 'tests', 'dist'];
const files = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(js|cjs)$/.test(entry.name)) files.push(file);
  }
}

for (const directory of roots) {
  if (fs.existsSync(directory)) walk(directory);
}

let failed = false;
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('\t')) {
    console.error(`${file}: tabs are not allowed`);
    failed = true;
  }
  const lines = text.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    if (/\s+$/.test(lines[index])) {
      console.error(`${file}:${index + 1}: trailing whitespace`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log(`Linted ${files.length} JavaScript files.`);
