param(
  [string]$TargetRepo = "C:\Users\PcGamerCasa.Ma\Desktop\realtime-agent-lab"
)

$ErrorActionPreference = "Stop"
$SourceRepo = $PSScriptRoot

if (-not (Test-Path "$TargetRepo\.git")) {
  throw "The existing Git repository was not found at $TargetRepo"
}

$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$Backup = "$TargetRepo-backup-$Timestamp"
Write-Host "Creating backup: $Backup"
Copy-Item $TargetRepo $Backup -Recurse -Force

Write-Host "Replacing the working tree while preserving .git..."
Get-ChildItem $TargetRepo -Force |
  Where-Object { $_.Name -ne ".git" } |
  Remove-Item -Recurse -Force

Get-ChildItem $SourceRepo -Force |
  Where-Object { $_.Name -notin @("PUSH_TO_GITHUB.ps1") } |
  Copy-Item -Destination $TargetRepo -Recurse -Force

Set-Location $TargetRepo

Write-Host "Installing and validating..."
npm install
npm run check
npm run docs:build

Write-Host "Committing..."
git add -A
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  git commit -m "feat: release Realtime Agent Lab reliability standard v1"
} else {
  Write-Host "No file changes to commit."
}

Write-Host "Pushing main..."
git branch -M main
git remote set-url origin "https://github.com/soufianeelseflo/realtime-agent-lab.git"
git push -u origin main

Write-Host "Publishing version tags..."
git tag -fa v1.0.0 -m "Realtime Agent Lab v1.0.0"
git push --force origin v1.0.0
git tag -fa v1 -m "Realtime Agent Lab v1"
git push --force origin v1

Write-Host "DONE: https://github.com/soufianeelseflo/realtime-agent-lab"
