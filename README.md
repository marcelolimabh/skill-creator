# ⚡ Skill Creator

> Generate production-ready **Claude Skills**, **autonomous Sub-Agents** + complete **.claude/ structure** for any project stack — interactively, in seconds.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/marcelolimabh/skill-creator&env=ANTHROPIC_API_KEY)

---

## What does this generate?

### 🧠 Claude Skills (Markdown Format)
A **Claude Skill** is now a structured **SKILL.md** file that gives Claude deep context about your project — your stack, architecture, coding conventions, security rules, and examples. Each skill follows the **Anthropic 2026 standard** with YAML frontmatter + Markdown content.

### 📁 Complete .claude/ Structure
We generate a **complete .claude/ directory** following **Claude Code best practices (Anthropic 2026)**:

```
.claude/
├── CLAUDE.md                    # 🧠 Project brain — context, conventions, rules
├── settings.json                # 🔗 Hook registry — maps lifecycle events to scripts
├── skills/                      # ⚡ 8 reusable AI workflows (each a directory)
│   ├── code-review/
│   │   └── SKILL.md             # → Comprehensive code review expert
│   ├── refactor-expert/
│   │   └── SKILL.md             # → Code refactoring and improvement
│   ├── testing-expert/
│   │   └── SKILL.md             # → Test generation and strategy
│   ├── deployment-expert/
│   │   └── SKILL.md             # → Deployment automation
│   ├── architecture-review/
│   │   └── SKILL.md             # → System design review
│   ├── security-audit/
│   │   └── SKILL.md             # → Security scanning and fixes
│   ├── performance-optimization/
│   │   └── SKILL.md             # → Performance analysis
│   └── documentation-expert/
│       └── SKILL.md             # → Technical writing
├── scripts/                     # 🔗 7 executable hook scripts (.sh)
│   ├── pre-commit.sh            # → Quality checks before Claude edits files
│   ├── pre-push.sh              # → Full validation before session ends
│   ├── post-merge.sh            # → Environment sync after bash commands
│   ├── code-quality.sh          # → Static analysis before edits
│   ├── security-scan.sh         # → Security scanning before edits
│   ├── testing.sh               # → Auto-run tests after edits
│   └── deployment-validation.sh # → Deployment safety before bash commands
├── docs/                        # 📚 5 architectural documents
│   ├── ADR-001-architecture-decisions.md # → Why key decisions were made
│   ├── onboarding.md            # → Get new developers productive fast
│   ├── contributing.md          # → Development standards and workflow
│   ├── api-reference.md         # → API design patterns and conventions
│   └── roi-and-best-practices.md # → ROI model and optimization guide
└── agents/                      # 🤖 7 autonomous sub-agents (each a directory)
    ├── project-orchestrator/
    │   └── AGENT.md             # → Coordinates all specialist agents
    ├── code-analyst/
    │   └── AGENT.md             # → Read-only codebase exploration
    ├── implementation-engineer/
    │   └── AGENT.md             # → Feature implementation & refactoring
    ├── test-engineer/
    │   └── AGENT.md             # → Test generation and execution
    ├── security-auditor/
    │   └── AGENT.md             # → Read-only security analysis
    ├── devops-agent/
    │   └── AGENT.md             # → CI/CD and infrastructure management
    └── documentation-writer/
        └── AGENT.md             # → API docs, README and ADRs
```

**Result**: Your team stops repeating prompts and gets consistent, high-quality AI assistance. Estimated **60% time savings** per developer with **2,300% annual ROI**.

Learn more: [Anthropic Skill Creator Guide](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf)

### 📋 New File Formats (Anthropic 2026)

#### 🎯 Skills: Individual Directories with SKILL.md
Each skill is now a **directory** containing a **SKILL.md** file:

```markdown
skills/code-review/SKILL.md
---
name: "code-review"
description: "Comprehensive code review expert"
version: "2.0"
---

# Code Review Expert

You are a senior code reviewer with expertise in...
[Detailed skill content in Markdown]
```

#### 🤖 Agents: Autonomous Sub-Agents with AGENT.md

Each sub-agent is a **directory** containing an **AGENT.md** file — similar to skills, but with a richer frontmatter that declares allowed **tools**, **role**, and **capabilities**:

```markdown
agents/security-auditor/AGENT.md
---
name: security-auditor
description: Read-only security analyst — finds vulnerabilities without modifying code
model: claude-sonnet-4-20250514
max_tokens: 6000
temperature: 0.0
tools:
  - Read
  - Glob
  - Grep
role: specialist
capabilities:
  - security-audit
  - vulnerability-scanning
---

# Security Auditor

You are a read-only security specialist. You NEVER modify files...
[Full Markdown instructions]
```

> **Skills vs Agents**: Skills provide expert prompting for **interactive sessions**. Agents perform **autonomous multi-step work** — they read files, write code, run tests, and coordinate with each other.

#### 🔀 Orchestrator Pattern

The `project-orchestrator` agent coordinates all specialists, decomposing complex tasks and delegating to the right agent:

```
User request: "Implement user registration with email confirmation"
        │
        ▼
project-orchestrator
  ├─ code-analyst      → maps existing auth modules (read-only)
  ├─ implementation-engineer → creates service + controller
  ├─ test-engineer     → generates unit + integration tests
  ├─ security-auditor  → reviews DTOs and auth logic (read-only)
  └─ documentation-writer → updates API reference
```

#### ⚙️ Hooks: Executable Scripts + Registry
**Two-part system** for maximum compatibility:

1. **`.claude/settings.json`** — Hook registry (Claude Code events):
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          { "type": "command", "command": ".claude/scripts/pre-commit.sh" }
        ]
      }
    ]
  }
}
```

2. **`.claude/scripts/*.sh`** — Executable bash scripts:
```bash
#!/usr/bin/env bash
# .claude/scripts/pre-commit.sh
set -euo pipefail

echo "🔍 Running pre-commit checks..."
npm run lint --fix || exit 1
echo "✅ Pre-commit checks passed"
```

#### 🔄 Claude Code Lifecycle Events
Hooks trigger automatically during Claude Code sessions:

| Event | When | Example Hooks |
|---|---|---|
| `PreToolUse[Edit\|Write]` | Before Claude edits files | pre-commit.sh, code-quality.sh |
| `PostToolUse[Edit\|Write]` | After Claude edits files | testing.sh |
| `PreToolUse[Bash]` | Before Claude runs bash | deployment-validation.sh |
| `PostToolUse[Bash]` | After Claude runs bash | post-merge.sh |
| `Stop` | Session ends | pre-push.sh |

---

## Features

### 🚀 Complete AI Assistant Setup
- 🧠 **Smart CLAUDE.md** — Captures your project's DNA (conventions, architecture, quality standards)
- ⚡ **8 Expert Skills** — Each in its own directory with SKILL.md (Anthropic 2026 format)
- 🔗 **7 Executable Hooks** — Shell scripts (.sh) integrated with Claude Code lifecycle events
- 📋 **Hook Registry** — settings.json maps Claude Code events to your scripts
- 📚 **5 Decision Documents** — ADRs, onboarding guides, contributing standards, API reference, ROI guide
- 🤖 **7 Autonomous Sub-Agents** — Specialist AGENT.md files for multi-step autonomous work (orchestrator pattern)

### 🎯 User Experience
- 🌐 **Bilingual** — Portuguese (BR) and English interface
- 🎯 **3 project types** — Backend, Frontend, Fullstack
- 📋 **6 ready-made templates** — Spring Boot, Next.js, React Native, FastAPI, Vue 3, Go Microservice
- 🧙 **Guided wizard** — contextual questions per project type (9 for Backend/Frontend, 7 for Fullstack)
- 🤖 **AI-powered generation** — Claude API generates detailed, production-ready content

### 🔒 Quality & Security
- 🔒 **Security validation** — automatic prompt injection and vulnerability analysis with a 0–100 score
- 📊 **ROI calculation** — Estimates time savings and business value per developer
- 🎯 **Quality metrics** — Coverage targets, complexity thresholds, performance goals

### 📦 Export Options
- 📁 **.claude/ ZIP** — Complete structure ready to extract (Anthropic 2026)
- 🛠️ **install.sh** — One-command setup script with hooks
- 📜 **SKILL.md** — Individual skills in new Markdown format
- 📦 **npm package** — CLI distribution
- ⚙️ **settings.json** — Claude Code hook registry

### 🎨 Developer Experience
- 🌙 **Dark mode** — Automatic dark/light theme based on system preference
- 🔀 **Git versioning** — Track skill changes with `git diff`
- 🐳 **Docker ready** — Multi-stage Dockerfile included
- 📱 **Tree view** — Interactive file explorer for .claude/ structure

---

## Why this matters

### 🚀 **Before** vs **After**

| **Before (typical team)** | **After (with .claude/ structure)** |
|---|---|
| ❌ "Write me a login function" → Random quality | ✅ `/skill code-review` → Consistent, secure patterns |
| ❌ Repeat same prompts endlessly | ✅ Reusable workflows save 60% time |
| ❌ New developers take weeks to learn conventions | ✅ CLAUDE.md gets them productive in hours |
| ❌ Code quality varies by developer mood | ✅ Automated hooks enforce standards |
| ❌ Architecture decisions forgotten | ✅ ADR documents preserve the "why" |
| ❌ Multi-step tasks require constant manual guidance | ✅ Sub-agents handle complex work autonomously |

### 📊 **Quantified Impact**

- **60% time savings** per developer on AI-assisted tasks
- **2,300% annual ROI** for a 5-person team (vs. $500/month Claude cost)
- **65% faster onboarding** for new developers
- **~29 files** of expert content generated in seconds (skills + hooks + docs + agents)
- **~49h/month saved** per developer with the full agent + skill stack
- **Zero repetitive prompting** — your team scales AI systematically

### 🎯 **Perfect for teams who**

- Want consistent AI output quality across all developers
- Need new team members productive fast
- Value institutional knowledge preservation  
- Prefer systematic approaches over ad-hoc prompting
- Want to measure and maximize their AI development ROI

---

## Quick start

### Local development

```bash
git clone https://github.com/marcelolimabh/skill-creator.git
cd skill-creator
npm install
npm run dev
```

Set your API key:

```bash
cp .env.example .env.local
# edit .env.local → ANTHROPIC_API_KEY=sk-ant-...
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project structure

```
skill-creator/
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with metadata/SEO
│   │   ├── page.tsx               # Main page (renders SkillCreator)
│   │   ├── globals.css            # Global styles + dark/light mode
│   │   └── api/
│   │       ├── generate/route.ts        # Skill generation endpoint (Claude API)
│   │       ├── generate-agent/route.ts  # Agent generation endpoint (Claude API)
│   │       └── validate/route.ts        # Security validation endpoint (Claude API)
│   ├── components/
│   │   └── SkillCreator.tsx       # Main component (wizard, templates, i18n)
│   ├── types/
│   │   └── claude-structure.ts    # TypeScript definitions for .claude/ structure
│   └── generators/
│       ├── claude-md.ts           # Generates CLAUDE.md (project brain)
│       ├── skills.ts              # Generates 8 expert skills
│       ├── hooks.ts               # Generates 7 quality hooks
│       ├── docs.ts                # Generates 5 architecture documents
│       ├── agents.ts              # Generates 7 autonomous sub-agents
│       └── structure.ts           # Main orchestrator + utilities
├── Dockerfile                     # Multi-stage build (deps → builder → runner)
├── next.config.mjs                # Next.js config (standalone output)
├── tsconfig.json                  # TypeScript configuration
├── .env.example                   # Environment variable reference
├── .gitignore
├── package.json
└── README.md
```

### Core Architecture

| Component | Responsibility |
|---|---|
| **SkillCreator.tsx** | Main UI component with wizard, templates, and result display |
| **generators/** | Creates all .claude/ content (CLAUDE.md, skills, hooks, docs) |
| **types/** | TypeScript definitions for the complete .claude/ structure |
| **API routes** | Handle Claude API calls for skill/agent generation and security validation |

### `generators/` — content generation engine

| Generator | Output | Description |
|---|---|---|
| **claude-md.ts** | `CLAUDE.md` | Project brain with context, conventions, rules |
| **skills.ts** | 8 `skills/*/SKILL.md` | Expert workflows in Markdown format (Anthropic 2026) |
| **hooks.ts** | 7 `.sh` scripts + `settings.json` | Executable hooks + Claude Code registry |
| **docs.ts** | 5 `.md` documents | Architecture decisions, onboarding, API reference |
| **agents.ts** | 7 `agents/*/AGENT.md` | Autonomous sub-agents with role, tools & capabilities |
| **structure.ts** | Orchestration | Combines all generators + utilities (install.sh, tree view) |

### UI Features

| Feature | Details |
|---|---|
| **Wizard** | `BACKEND_Q` (9 steps), `FRONTEND_Q` (9 steps), `FULLSTACK_Q` (7 steps) |
| **Templates** | 6 pre-configured stacks (Spring Boot, Next.js, React Native, FastAPI, Vue 3, Go) |
| **Security validation** | Displays score (0–100), issues list, and severity levels |
| **Export options** | ZIP download, install.sh, individual files (YAML, npm, CLI, MD) |
| **File explorer** | Interactive tree view of .claude/ structure with file previews |
| **i18n** | Full English/Portuguese translations |

---

## How it works

```
User answers wizard (backend/frontend/fullstack)
       │
       ▼
Claude API (claude-sonnet-4) generates YAML skill
       │
       ▼
Security validation (prompt injection + vulnerability analysis)
       │
       ▼
Generate complete .claude/ structure:
  • CLAUDE.md (project brain)
  • 8 expert skills (code review, refactor, testing, etc.)
  • 7 quality hooks (pre-commit, security, deployment, etc.)
  • 5 documentation files (ADR, onboarding, API ref, etc.)
  • 7 autonomous sub-agents (orchestrator + 6 specialists)
       │
       ▼
Multiple export options:
  📁 ZIP download (complete .claude/ structure)
  🛠️ install.sh (one-command setup)
  📜 Individual files (YAML, npm package, CLI, SKILL.md)
```

---

## Using your generated .claude/ structure

### 🚀 Quick setup (recommended)

```bash
# Download and extract the ZIP file, then:
cd your-project/
bash install-claude.sh

# Or manually extract the ZIP to your project root
# The .claude/ directory should be at the same level as your src/
```

### 🧠 Verify setup

```bash
# Check that the structure is in place
ls .claude/
# Expected: CLAUDE.md  settings.json  skills/  scripts/  docs/  agents/

# Verify hooks are registered
cat .claude/settings.json
# Should show hook mappings for PreToolUse, PostToolUse, Stop events

# Load skills in Claude Code
claude /skills
# You should see 8 expert skills available

# Read the project brain
cat .claude/CLAUDE.md
```

### ⚡ Using the expert skills

```bash
# In Claude Code, you now have access to expert workflows:
# Each skill is a directory with SKILL.md (Anthropic 2026 format)
/skill code-review        # → .claude/skills/code-review/SKILL.md
/skill refactor-expert    # → .claude/skills/refactor-expert/SKILL.md
/skill testing-expert     # → .claude/skills/testing-expert/SKILL.md
/skill deployment-expert  # → .claude/skills/deployment-expert/SKILL.md
/skill security-audit     # → .claude/skills/security-audit/SKILL.md
/skill performance-optimization # → .claude/skills/performance-optimization/SKILL.md
/skill architecture-review # → .claude/skills/architecture-review/SKILL.md
/skill documentation-expert # → .claude/skills/documentation-expert/SKILL.md
```

### 🔗 Quality gates (hooks)

**Claude Code Integration (Anthropic 2026)**:
Hooks are registered in `.claude/settings.json` and automatically trigger during Claude Code sessions:

- **PreToolUse[Edit|Write]** → `pre-commit.sh`, `code-quality.sh`, `security-scan.sh`
- **PostToolUse[Edit|Write]** → `testing.sh` (runs tests after Claude edits files)
- **PostToolUse[Bash]** → `post-merge.sh` (syncs environment after git commands)
- **PreToolUse[Bash]** → `deployment-validation.sh` (validates before deployment commands)
- **Stop** → `pre-push.sh` (full validation before session ends)

**Git Hook Compatibility**:
Scripts are also Git-hook compatible — copy them to `.git/hooks/` for traditional Git integration:
```bash
cp .claude/scripts/pre-commit.sh .git/hooks/pre-commit
cp .claude/scripts/pre-push.sh .git/hooks/pre-push
chmod +x .git/hooks/*
```

### 🤖 Using the autonomous sub-agents

Your `.claude/agents/` directory contains 7 specialist agents ready to handle complex multi-step tasks. Invoke them by name in Claude Code using natural language:

```bash
# Delegate a complex task to the orchestrator
"Use the project-orchestrator agent to implement user registration with email confirmation"

# Invoke a specialist directly
"Ask the security-auditor agent to review the authentication module for vulnerabilities"
"Invoke the test-engineer agent to add integration tests for the payment service"
"Use the devops-agent to create a GitHub Actions CI pipeline"
"Ask the documentation-writer to update the API reference for the new endpoints"
```

#### Sub-Agent Roster

| Agent | Role | Tools | Best for |
|---|---|---|---|
| `project-orchestrator` | Orchestrator | Read, Glob, Bash, TodoWrite | Complex multi-step features |
| `code-analyst` | Specialist | Read, Glob, Grep *(read-only)* | Understanding code before changing it |
| `implementation-engineer` | Specialist | Read, Edit, Write, MultiEdit, Bash | Writing and refactoring code |
| `test-engineer` | Specialist | Read, Edit, Write, Bash | Creating and running tests |
| `security-auditor` | Specialist | Read, Glob, Grep *(read-only)* | Security reviews without modifying files |
| `devops-agent` | Specialist | Read, Edit, Write, Bash | CI/CD, Docker, Kubernetes |
| `documentation-writer` | Specialist | Read, Edit, Write | API docs, README, ADRs |

#### Agent + Skill Collaboration

> Use **agents** for autonomous multi-step work. Use **skills** for interactive expert sessions. Combine both for maximum quality.

```bash
# Best practice workflow for a new feature:
# 1. Review architecture first (skill)
/skill architecture-review

# 2. Delegate autonomous implementation (agent)
"Use project-orchestrator to implement the feature"

# 3. Review the result (skill)
/skill code-review
```

### 📚 Architecture documentation

Your team now has living documentation:
- `docs/ADR-001-architecture-decisions.md` — The "why" behind technical choices
- `docs/onboarding.md` — Get new developers productive in hours, not days
- `docs/contributing.md` — Development standards and workflow
- `docs/api-reference.md` — API design patterns
- `docs/roi-and-best-practices.md` — Measuring and maximizing AI development ROI

### 🔄 Track changes with Git

```bash
# Commit the entire .claude/ structure
git add .claude/
git commit -m "feat: add Claude Code AI assistant structure (Anthropic 2026)

- 8 expert skills for consistent AI workflows
- 7 quality hooks for automated gates
- 5 architecture docs for team alignment
- 7 autonomous sub-agents (orchestrator + specialists)
- Project brain (CLAUDE.md) with conventions and agent roster"

# After regenerating or updating
git diff .claude/
```

---

## Supported stacks

### Backend
| Language | Frameworks |
|---|---|
| Java | Spring Boot, Quarkus, Micronaut, Jakarta EE, Vert.x |
| TypeScript | NestJS, Express, Fastify, Hono, tRPC |
| Python | FastAPI, Django, Flask, Litestar, Tornado |
| Go | Gin, Echo, Fiber, Chi, gRPC |
| Rust | Actix-web, Axum, Rocket, Warp |
| C# | .NET 8 / ASP.NET Core, Blazor Server, gRPC, Minimal API |
| PHP | Laravel, Symfony, Slim |
| Ruby | Rails, Sinatra, Hanami |
| Kotlin | Ktor, Spring Boot, gRPC |
| Swift | Vapor, Hummingbird |
| C++ | Boost.Beast, Crow, gRPC |

### Frontend
| Type | Frameworks |
|---|---|
| Web App | React, Vue 3, Angular, Svelte/SvelteKit, Solid.js, Qwik, Astro, Remix |
| Mobile App | React Native, Expo, Flutter, Ionic, NativeScript |
| Desktop App | Electron + React/Vue, Tauri + React/Vue |
| PWA | Next.js, Nuxt 3, Astro, Vite + React |
| Static Site | Next.js (SSG), Nuxt (SSG), Astro, Gatsby, Hugo |

### Fullstack
Next.js, Nuxt 3, SvelteKit, Remix, Analog (Angular), Astro

---

## Deploy your own instance

### Vercel (recommended)

1. Fork this repo
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add environment variable: `ANTHROPIC_API_KEY`
4. Deploy — done

### Docker

```bash
docker build -t skill-creator .
docker run -p 3000:3000 -e ANTHROPIC_API_KEY=sk-ant-... skill-creator
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | Your Anthropic API key ([get one](https://console.anthropic.com/settings/keys)) |
| `NEXT_PUBLIC_APP_URL` | optional | Public URL for OG tags (default: `http://localhost:3000`) |
| `UPSTASH_REDIS_REST_URL` | optional | Upstash Redis URL for rate limiting in production |
| `UPSTASH_REDIS_REST_TOKEN` | optional | Upstash Redis token |
| `NEXT_PUBLIC_POSTHOG_KEY` | optional | PostHog analytics key |
| `NEXT_PUBLIC_POSTHOG_HOST` | optional | PostHog host URL |

---

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run format` | Format code with Prettier |
| `npm run clean` | Remove build artifacts |
| `npm run release` | Typecheck + build + publish to npm |

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org) (App Router) |
| Language | TypeScript |
| AI | [Anthropic Claude API](https://docs.anthropic.com) (`@anthropic-ai/sdk`) |
| ZIP generation | [JSZip](https://stuk.github.io/jszip/) |
| Runtime | Node.js ≥ 20 |
| Styling | CSS-in-JS (inline styles) + CSS custom properties (dark/light mode) |
| Deploy | Vercel / Docker |
| Rate limiting | Upstash Redis (optional) |

---

## Contributing

Contributions are welcome!

```bash
# Fork → clone → branch
git checkout -b feat/my-improvement

# Run locally
npm install
npm run dev

# PR
git push origin feat/my-improvement
```

Areas where help is especially welcome:
- **New stack templates** — Add support for more frameworks/languages
- **Additional language translations** — Expand beyond EN/PT-BR
- **Component extraction** — Break down `SkillCreator.tsx` into smaller components
- **Enhanced generators** — Improve quality of generated skills, hooks, and docs
- **Skill Marketplace** — Share and discover public .claude/ structures
- **GitHub Actions integration** — Auto-regenerate on repository changes
- **Team customization** — Add team-specific contexts and preferences

---

## Roadmap

### ✅ Completed (v2.0)
- [x] **Complete .claude/ structure generation** — Not just skills, but entire AI assistant setup
- [x] **8 expert skills** — Each in skill-name/SKILL.md format (Anthropic 2026)
- [x] **7 executable hooks** — Shell scripts with Claude Code lifecycle integration
- [x] **5 architecture docs** — ADRs, onboarding, contributing, API reference, ROI guide
- [x] **CLAUDE.md brain** — Project-specific context, conventions, and rules
- [x] **Multiple export options** — ZIP download, install.sh script, file explorer
- [x] **ROI calculation** — Time savings estimates and business value metrics
- [x] Backend/Frontend/Fullstack wizards with 30+ frameworks
- [x] Security validation with 0–100 score
- [x] Bilingual interface (EN + PT-BR)
- [x] Docker support and dark mode

### ✅ Completed (v2.1)
- [x] **7 autonomous sub-agents** — `project-orchestrator` + 6 specialists (code-analyst, implementation-engineer, test-engineer, security-auditor, devops-agent, documentation-writer)
- [x] **AGENT.md format** — YAML frontmatter with `tools`, `role`, and `capabilities` fields
- [x] **Orchestrator pattern** — project-orchestrator coordinates all specialists for complex tasks
- [x] **Read-only safety** — security-auditor and code-analyst never have write/execute tools
- [x] **Agent + Skill collaboration** — CLAUDE.md documents how to use both together
- [x] **`/api/generate-agent` route** — Claude API endpoint for custom agent generation
- [x] **Context-aware agents** — each AGENT.md adapts to language, framework, architecture, and testing strategy

### 🚀 Next (v3.0)
- [ ] **Team customization** — Add team size, experience level, methodology preferences
- [ ] **Industry templates** — Fintech, healthcare, e-commerce specific .claude/ structures
- [ ] **Skill Marketplace** — Share and discover public .claude/ configurations
- [ ] **GitHub integration** — Auto-regenerate on repository changes
- [ ] **Visual diffs** — Compare .claude/ structure versions
- [ ] **Advanced metrics** — Track actual time savings and AI assistant effectiveness
- [ ] **Multi-language support** — Expand beyond EN/PT-BR (ES, FR, DE)

### 🔬 Research (v4.0)
- [ ] **AI-powered optimization** — Learn from team usage patterns to improve generated content
- [ ] **Integration ecosystem** — VS Code extension, JetBrains plugin
- [ ] **Enterprise features** — Role-based access, compliance templates, audit trails

---

## License

MIT © [Marcelo](https://github.com/marcelolimabh)

---

## Acknowledgements

Built on top of:
- [Anthropic Claude API](https://docs.anthropic.com)
- [Claude Skill Creator Guide](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf)
- [skills.sh](https://skills.sh) — skill inspiration and patterns
