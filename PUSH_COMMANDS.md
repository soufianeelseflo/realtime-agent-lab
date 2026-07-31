# Publish Commands

Replace `YOUR_GITHUB_USERNAME` and run these commands from the project folder.

## 1. Create an empty public GitHub repository

Repository name:

```text
realtime-agent-lab
```

Do not initialize it with a README, license, or `.gitignore` because those files already exist locally.

## 2. Replace placeholders

Windows PowerShell:

```powershell
$u = "YOUR_GITHUB_USERNAME"
Get-ChildItem -Recurse -File | ForEach-Object {
  $content = Get-Content $_.FullName -Raw
  if ($content -like "*YOUR_GITHUB_USERNAME*") {
    $content.Replace("YOUR_GITHUB_USERNAME", $u) | Set-Content $_.FullName -NoNewline
  }
}
```

WSL/Linux:

```bash
export GITHUB_USERNAME="YOUR_GITHUB_USERNAME"
grep -RIl 'YOUR_GITHUB_USERNAME' . --exclude-dir=.git |   xargs sed -i "s/YOUR_GITHUB_USERNAME/${GITHUB_USERNAME}/g"
```

## 3. Initialize and push

```bash
git init
git branch -M main
git add .
git commit -m "feat: launch Realtime Agent Lab maintained fork"
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/realtime-agent-lab.git
git push -u origin main
```

## 4. Create the first release

```bash
git tag -a v0.1.0 -m "Realtime Agent Lab v0.1.0"
git push origin v0.1.0
```

Then create a GitHub Release from tag `v0.1.0` and paste the `0.1.0` section from `CHANGELOG.md`.

## 5. Public profile

Before applying:

- make your GitHub profile public;
- add a profile photo and short technical bio;
- pin `realtime-agent-lab`;
- enable GitHub Discussions;
- enable private vulnerability reporting;
- create at least three real roadmap issues;
- do not create fake stars, contributors, downloads, or activity.
