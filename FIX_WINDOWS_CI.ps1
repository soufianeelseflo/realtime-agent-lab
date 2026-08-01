$ErrorActionPreference = 'Stop'

if (-not (Test-Path '.git')) {
    throw 'Open PowerShell inside your realtime-agent-lab-v1 repository folder, then run this script again.'
}

Write-Host 'Syncing repository...'
git fetch origin
git pull --ff-only origin main

$lint = @'
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

  // CRLF is a valid Windows line ending. Remove only the terminal carriage return
  // before checking for actual trailing spaces or tabs.
  const lines = text.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].endsWith('\r') ? lines[index].slice(0, -1) : lines[index];
    if (/[ \t]+$/.test(line)) {
      console.error(`${file}:${index + 1}: trailing whitespace`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log(`Linted ${files.length} JavaScript files.`);
'@

Set-Content -Path 'scripts/lint.js' -Value $lint -Encoding utf8
Set-Content -Path '.gitattributes' -Value "* text=auto eol=lf`n*.ps1 text eol=crlf`n" -Encoding ascii

$replacements = @{
    'actions/setup-node@v6' = 'actions/setup-node@v7'
    'actions/configure-pages@v5' = 'actions/configure-pages@v6'
    'actions/upload-pages-artifact@v4' = 'actions/upload-pages-artifact@v5'
    'actions/dependency-review-action@v4' = 'actions/dependency-review-action@v5'
    'ossf/scorecard-action@v2.4.3' = 'ossf/scorecard-action@v2.4.4'
}

Get-ChildItem '.github/workflows' -Filter '*.yml' | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    foreach ($pair in $replacements.GetEnumerator()) {
        $content = $content.Replace($pair.Key, $pair.Value)
    }
    Set-Content -Path $_.FullName -Value $content -Encoding utf8
}

Write-Host 'Running local verification...'
npm ci
npm run check
npm run docs:build

Write-Host 'Committing and pushing...'
git add -A
$changes = git status --porcelain
if ($changes) {
    git commit -m 'fix: make CI cross-platform and update GitHub Actions'
    git push origin main
} else {
    Write-Host 'No new files to commit.'
}

$tag = 'v1.0.1'
if (git tag -l $tag) {
    git tag -d $tag | Out-Null
}
git tag -a $tag -m 'Realtime Agent Lab v1.0.1'
git push --force origin $tag

Write-Host ''
Write-Host 'DONE: main and v1.0.1 were pushed.' -ForegroundColor Green
Write-Host 'Now enable Dependency graph here:' -ForegroundColor Yellow
Write-Host 'https://github.com/soufianeelseflo/realtime-agent-lab/settings/security_analysis'
