# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server at http://localhost:3000
npm run build        # Production build (standalone output)
npm run typecheck    # TypeScript validation (no emit)
npm run lint         # ESLint
npm run format       # Prettier formatting
npm run release      # typecheck + build + npm publish
```

**Environment setup** — copy `.env.example` to `.env.local` and set:
- `ANTHROPIC_API_KEY` (required) — Claude API key
- `NEXT_PUBLIC_APP_URL` (optional) — for OG tags
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (optional) — rate limiting
- `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` (optional) — analytics

## Architecture

This is a Next.js 14 (App Router) application that generates complete `.claude/` directory structures following the **Anthropic 2026 standard** for Claude Code integration.

### Generation Pipeline

The core flow is: user answers wizard questions → contexts are built → generators produce all artifacts.

**Entry point**: `src/components/SkillCreator.tsx` (~2000 lines) manages the entire UI lifecycle across phases: `welcome → type → template → wizard → generating → result`. It calls `generateClaudeStructure()` to produce the full package.

**Orchestrator**: `src/generators/structure.ts` coordinates all generators and returns a `ClaudePackage` with the full structure, a flat file list for export, and a stats summary.

**Generators** (each independent, all called by structure.ts):
- `src/generators/claude-md.ts` — CLAUDE.md (project brain)
- `src/generators/skills.ts` — 8 expert skills as `SKILL.md` files with YAML frontmatter
- `src/generators/hooks.ts` — 7 shell scripts + `.claude/settings.json` hook registry
- `src/generators/docs.ts` — 5 architecture documents (ADR, onboarding, contributing, API ref, ROI)

**Type system**: `src/types/claude-structure.ts` defines the three context types (`ClaudeProjectContext`, `ClaudeTeamContext`, `ClaudeBusinessContext`) and all output types (`ClaudeStructure`, `ClaudePackage`, etc.).

### API Routes

- **POST `/api/generate`** — Calls `claude-sonnet-4-20250514` to generate a custom skill from wizard answers. Returns `{ yaml: "<SKILL.md content>" }`.
- **POST `/api/validate`** — Calls Claude to security-audit generated SKILL.md content for prompt injection, data exfiltration, privilege escalation, etc. Returns `{ score, level, issues[], summary }` where score ≥ 80 = safe, 50–79 = warning, < 50 = danger.

### Output Format (Anthropic 2026 Standard)

Skills are stored as `.claude/skills/{name}/SKILL.md` with YAML frontmatter (`name`, `description`, `model`, `max_tokens`, `temperature`).

Hooks are shell scripts in `.claude/scripts/` registered in `.claude/settings.json` using Claude Code lifecycle events:
- `PreToolUse[Edit|Write]` → pre-commit, code-quality, security-scan
- `PostToolUse[Edit|Write]` → testing
- `PreToolUse[Bash]` → deployment-validation
- `PostToolUse[Bash]` → post-merge
- `Stop` → pre-push
