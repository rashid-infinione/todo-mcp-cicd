# TodoMVC — Playwright + GitHub Actions + GitHub MCP

Playwright tests running in GitHub Actions CI/CD, with Claude Code
using the **GitHub MCP server** to genuinely interact with the pipeline.

---

## What MCP actually does here

```
Claude Code sidebar (you type a prompt)
         ↓
GitHub MCP server  ─────────────────────────────────────────────────┐
         ↓                                                          │
list_workflow_runs    → reads your real GitHub Actions run status   │
get_workflow_run      → checks which browsers passed / failed       │
list_workflow_run_jobs → finds the exact failed step               │
create_issue          → files a GitHub issue with the details       │
create_issue_comment  → posts results to a pull request            │
create_workflow_dispatch → triggers a new CI run                   │
                                                                    │
All through natural language. Zero manual API calls needed. ────────┘
```

---

## Project structure

```
todo-mcp-cicd/
│
├── .github/workflows/
│   └── playwright.yml      ← GitHub Actions CI (3 browsers in parallel)
│
├── tests/
│   └── todo.spec.ts        ← 18 Playwright tests for TodoMVC
│
├── .mcp.json               ← Registers Playwright MCP (project-scoped)
├── PROMPTS.md              ← 7 real MCP prompts for CI interaction
│
├── .vscode/
│   ├── launch.json
│   └── extensions.json
│
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

---

## Setup

### Step 1 — Install and set up locally

```bash
npm install
npm run setup       # installs all 3 Playwright browser binaries
npm run test:chrome # verify tests pass locally first
```

### Step 2 — Push to GitHub

```bash
git init
git add .
git commit -m "feat: Playwright CI/CD with GitHub MCP"
git remote add origin https://github.com/YOUR_USERNAME/todo-mcp-cicd.git
git push -u origin main
```

GitHub Actions runs automatically. Watch it in the **Actions tab**.

### Step 3 — Create a GitHub Personal Access Token (PAT)

This is what lets Claude talk to your GitHub repo via MCP.

1. Go to **github.com → Settings → Developer settings**
2. Click **Personal access tokens → Fine-grained tokens → Generate new token**
3. Give it access to your `todo-mcp-cicd` repo with these permissions:
   - **Actions** → Read-only  (to check CI runs)
   - **Issues** → Read and write  (to create bug issues)
   - **Pull requests** → Read and write  (to post PR comments)
   - **Contents** → Read-only  (to read repo files)
4. Copy the token — you only see it once

### Step 4 — Register GitHub MCP in Claude Code

Run this in the VS Code terminal (NOT inside Claude Code chat):

```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp \
  -H "Authorization: Bearer YOUR_PAT_HERE"
```

Verify it registered:

```bash
claude mcp list
# playwright
# github       ← must appear here
```

### Step 5 — Register Playwright MCP too

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

---

## Using Claude Code with GitHub MCP

Open the Claude Code sidebar (✦ spark icon) and paste any prompt
from **PROMPTS.md**.

### Example — check CI and create an issue if it failed

```
Use the GitHub MCP to list the latest workflow runs for
YOUR_USERNAME/todo-mcp-cicd

If any jobs failed, create a GitHub issue with the title
"CI Failure: [browser] failed on run #[number]" and label it "bug"
```

Claude calls `list_workflow_runs`, reads the status, then calls
`create_issue` — all automatically, no manual GitHub navigation.

---

## Local scripts

```bash
npm test             # all 3 browsers
npm run test:chrome  # chromium only (fastest)
npm run test:ui      # interactive Playwright UI
npm run report       # open HTML report
```

---

## GitHub MCP tools available

| Tool                       | What it does                            |
|----------------------------|-----------------------------------------|
| list_workflow_runs         | See all recent CI runs + pass/fail      |
| get_workflow_run           | Details of one specific run             |
| list_workflow_run_jobs     | Which jobs/browsers failed              |
| create_issue               | File a bug issue automatically          |
| list_issues                | See open issues                         |
| create_issue_comment       | Post results to a PR                    |
| create_workflow_dispatch   | Trigger a new CI run manually           |

---

## Important notes

- The PAT is stored in `~/.claude.json` — never commit it
- `.mcp.json` only registers Playwright MCP (safe to commit, no secrets)
- GitHub MCP is registered locally via CLI so your token stays private
- The `@modelcontextprotocol/server-github` npm package is deprecated as of
  April 2025 — use the HTTP transport shown above instead
