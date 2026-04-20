# Claude Code Prompts — GitHub MCP + CI/CD

These prompts use the **GitHub MCP server** to genuinely interact
with your GitHub Actions CI pipeline. Claude reads real run data,
finds real failures, and creates real GitHub issues.

Replace `YOUR_USERNAME` and `todo-mcp-cicd` with your actual values.

---

## PROMPT 1 — Check latest CI run status

```
Use the GitHub MCP to list the latest workflow runs for
YOUR_USERNAME/todo-mcp-cicd

Tell me:
- Which run number just completed
- Did it pass or fail
- Which browsers passed and which failed
```

---

## PROMPT 2 — Find failing tests and create a GitHub issue

```
Use the GitHub MCP to do the following:

1. Get the latest workflow run for YOUR_USERNAME/todo-mcp-cicd
2. If any jobs failed, find out which browser and which step failed
3. Create a GitHub issue in the same repo with:
   - Title: "CI Failure: Playwright tests failed on [browser] — run #[number]"
   - Body: include the failed browser, run number, run URL, and today's date
   - Label: "bug"
```

---

## PROMPT 3 — Full CI health check after a push

```
Use the GitHub MCP to:

1. List the last 3 workflow runs for YOUR_USERNAME/todo-mcp-cicd
2. Show me the pass/fail status of each run and each browser
3. If there is a pattern of failures (same test failing repeatedly),
   create a GitHub issue flagging it as a flaky test
```

---

## PROMPT 4 — Comment on a PR with test results

```
Use the GitHub MCP to:

1. Find the most recent open pull request in YOUR_USERNAME/todo-mcp-cicd
2. Get the CI run status for that PR's latest commit
3. Post a comment on the PR summarising the test results:
   - How many tests passed
   - Which browsers were tested
   - A link to the Actions run
```

---

## PROMPT 5 — Use Playwright MCP to reproduce a failure, then file an issue

```
Use playwright mcp to open https://demo.playwright.dev/todomvc

Try this scenario that may have failed in CI:
- Add 3 todos
- Complete the third one
- Click the "Completed" filter
- Verify only 1 item is shown

If the scenario fails, use the GitHub MCP to create an issue in
YOUR_USERNAME/todo-mcp-cicd describing exactly what went wrong,
with steps to reproduce.
```

---

## PROMPT 6 — Trigger a manual workflow run

```
Use the GitHub MCP to trigger a manual workflow_dispatch run
for the "Playwright Tests" workflow in YOUR_USERNAME/todo-mcp-cicd
on the main branch.

Then wait a moment and check the status of the triggered run.
```

---

## PROMPT 7 — Morning CI briefing

```
Use the GitHub MCP to give me a morning CI briefing for
YOUR_USERNAME/todo-mcp-cicd:

- How many runs happened in the last 24 hours
- Overall pass rate
- Any open issues labelled "bug"
- Any failing runs that don't yet have a corresponding issue
  (if found, create one automatically)
```

---

## What GitHub MCP tools Claude actually calls

When you send these prompts, Claude uses real GitHub API tools:

| Claude does this          | GitHub MCP tool called              |
|---------------------------|-------------------------------------|
| Check CI run status       | list_workflow_runs                  |
| Get run details           | get_workflow_run                    |
| See which jobs failed     | list_workflow_run_jobs              |
| Create a bug issue        | create_issue                        |
| Post a PR comment         | create_issue_comment                |
| Trigger a workflow        | create_workflow_dispatch            |
| List open issues          | list_issues                         |
