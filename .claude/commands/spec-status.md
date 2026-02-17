---
description: Show the status of all D3 specifications, their decomposition into stories, and overall progress.
---

## What This Does

Provides a dashboard view of all specifications: their refinement state, linked epics/stories, and completion status.

---

## Workflow

### 1. Detect Provider
- Read CLAUDE.md for D3 config
- Get Spec Provider config (Cloud ID, spaceId, parent page)
- Get Story Provider config (Cloud ID, project key)

### 2. List All Specs
Fetch all child pages under the configured Specs parent page.

**MCP:** `mcp__atlassian__getConfluencePageDescendants` with the parent page ID from CLAUDE.md.

### 3. Analyze Each Spec

For each spec page:

#### a) Fetch spec content
**MCP:** `mcp__atlassian__getConfluencePage` with contentFormat: "markdown"

#### b) Assess spec completeness
Scan the spec body for:
- **Open Questions:** Count items marked `[OPEN QUESTION: ...]`, `[DECISION PENDING: ...]`, `[CLARIFICATION NEEDED: ...]`
- **Assumptions:** Count items marked `[ASSUMPTION: ...]`
- **Placeholder sections:** Count sections with `_To be defined_` or similar empty markers
- **Has Tech Spec:** Check if a `# Tech Spec:` section exists with content beyond placeholders

#### c) Find linked epic and stories
Search Jira for an epic matching the spec title:
**MCP:** `mcp__atlassian__searchJiraIssuesUsingJql`
**JQL:** `project = {project_key} AND issuetype = Epic AND summary ~ "{spec title}" ORDER BY created DESC`
**Fields:** summary, status

If epic found, fetch its child stories:
**JQL:** `project = {project_key} AND "Epic Link" = {epic_key} ORDER BY created ASC`
**Fields:** summary, status, issuetype

### 4. Display Dashboard

Present results in this format:

```
# D3 Spec Status Dashboard

## [Spec Title]
**Spec:** [Confluence URL]
**Spec Health:** [Open questions: X | Assumptions: Y | Placeholders: Z]
**Decomposition:** [Not started | Epic: KEY-123 (status)]
**Stories:**
| # | Key | Summary | Status |
|---|-----|---------|--------|
| 1 | KEY-124 | Story title | To Do |
| 2 | KEY-125 | Story title | Done |
**Progress:** [X/Y stories done]

---
[Repeat for each spec]
```

### 5. Show Action Summary

The summary is framed around the PO's goal: get specs refined and decomposed so devs can start coding. Done specs are collapsed — the focus is on what needs attention.

```
## What Needs Attention

### Decompose (unblock development)
Specs that are fully refined (no open questions) but have no epic/stories yet.

| Spec | Action |
|------|--------|
| [Title] | `/d3:decompose [title]` |

### Refine (unblock decomposition)
Specs with open questions or clarifications that must be resolved before stories can be created.

| Spec | Blockers | Suggested Action |
|------|----------|------------------|
| [Title] | X open questions, Y clarifications | `/d3:refine-spec [title]` — resolve [list top blockers] |
```

**Ordering:** Show sections top-to-bottom in priority order. Omit empty sections. Specs with an epic are excluded — they are out of the PO's queue.

---

## Status Classification

- **Decomposed**: Epic exists — out of PO's queue
- **Ready to Decompose**: No blocking open questions, no epic yet
- **Needs Refinement**: Has open questions or unresolved decisions

---

## Error Handling

| Issue | Action |
|-------|--------|
| No specs found | Report empty state, suggest `/d3:create-spec` |
| Spec has no matching epic | Show as "Not decomposed" |
| JQL returns no results | Show as "No stories" |
| Multiple epics match | Use most recent, warn user |
