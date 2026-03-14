# ⚡ Skill Creator

> Generate production-ready **Claude Skills** for any project stack — interactively, in seconds.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/marcelolimabh/skill-creator&env=ANTHROPIC_API_KEY)

---

## What is a Claude Skill?

A **Claude Skill** is a YAML file that gives Claude deep context about your project — your stack, architecture, coding conventions, security rules, and examples. It makes Claude behave like a senior developer who already knows your codebase.

Learn more: [Anthropic Skill Creator Guide](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf)

---

## Features

- 🌐 **Bilingual** — Portuguese (BR) and English interface
- 🎯 **3 project types** — Backend, Frontend, Fullstack
- 📋 **6 ready-made templates** — Spring Boot, Next.js, React Native, FastAPI, Vue 3, Go Microservice
- 🧙 **Guided wizard** — contextual questions per project type (9 for Backend/Frontend, 7 for Fullstack)
- 🤖 **AI-powered generation** — Claude API generates a detailed, production-ready skill
- 🔒 **Security validation** — automatic prompt injection and vulnerability analysis with a 0–100 score
- 📦 **Quad export** — YAML skill + `package.json` + CLI script + `SKILL.md`
- 🌙 **Dark mode** — automatic dark/light theme based on system preference
- 🔀 **Git versioning** — track skill changes with `git diff`
- 🐳 **Docker ready** — multi-stage Dockerfile included

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
│   │       ├── generate/route.ts  # Skill generation endpoint (Claude API)
│   │       └── validate/route.ts  # Security validation endpoint (Claude API)
│   └── components/
│       └── SkillCreator.tsx       # Main component (wizard, templates, i18n)
├── Dockerfile                     # Multi-stage build (deps → builder → runner)
├── next.config.mjs                # Next.js config (standalone output)
├── tsconfig.json                  # TypeScript configuration
├── .env.example                   # Environment variable reference
├── .gitignore
├── package.json
└── README.md
```

### `SkillCreator.tsx` — all-in-one component

The entire UI lives in a single self-contained React component that includes:

| Concern | Details |
|---|---|
| **i18n** | Full `en` / `pt` translations inline |
| **Wizard questions** | `BACKEND_Q` (9 steps), `FRONTEND_Q` (9 steps), `FULLSTACK_Q` (7 steps) |
| **Templates** | 6 pre-configured stacks (Spring Boot, Next.js, React Native, FastAPI, Vue 3, Go Microservice) |
| **API integration** | Calls `/api/generate` and `/api/validate` Next.js routes |
| **Security panel** | Displays score (0–100), issues list, and severity levels |
| **Export** | Downloads YAML, `package.json`, CLI script, and `SKILL.md` |

---

## How it works

```
User answers wizard
       │
       ▼
Claude API (claude-sonnet-4)
  → generates YAML skill
       │
       ▼
Claude API (security pass)
  → prompt injection check
  → vulnerability analysis
  → score 0–100
       │
       ▼
Download: YAML + package.json + CLI script + SKILL.md
```

---

## Using your generated skill

### With Claude Code

```bash
# Place the skill in your project
cp project-skill.yaml .claude/skills/

# Load in Claude Code
/skills load .claude/skills/project-skill.yaml
```

### Add a SKILL.md to your project root

The **Download MD** button generates a ready-to-use `SKILL.md` with your skill embedded:

```markdown
# SKILL.md

## Claude Skill
This project uses a custom Claude Skill.
File: `.claude/skills/project-skill.yaml`

## Skill content
(your generated YAML is embedded here)
```

### Track changes with Git

```bash
git add .claude/skills/
git commit -m "feat: add Claude skill for this project"

# After regenerating
git diff .claude/skills/project-skill.yaml
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
- New stack templates
- Additional language translations
- Extracting components (wizard, templates, results) from `SkillCreator.tsx`
- Skill Marketplace (share public skills)
- GitHub Actions integration

---

## Roadmap

- [x] Backend wizard (Java, Python, Go, Rust, C#, PHP, Ruby, Kotlin, Swift, C++)
- [x] Frontend wizard (React, Vue, Angular, React Native, Expo, Flutter…)
- [x] Fullstack wizard (Next.js, Nuxt, SvelteKit, Remix, Analog)
- [x] Security validation with score
- [x] Quad export (YAML + npm package + CLI script + SKILL.md)
- [x] Bilingual interface (EN + PT-BR)
- [x] Docker support
- [x] Dark mode (automatic via system preference)
- [x] Auto-generate `SKILL.md` alongside the skill
- [ ] Skill Marketplace — share and discover public skills
- [ ] Visual diff between skill versions
- [ ] GitHub Actions — regenerate skill on push
- [ ] Skill linting and schema validation
- [ ] Component extraction and refactoring

---

## License

MIT © [Marcelo](https://github.com/marcelolimabh)

---

## Acknowledgements

Built on top of:
- [Anthropic Claude API](https://docs.anthropic.com)
- [Claude Skill Creator Guide](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf)
- [skills.sh](https://skills.sh) — skill inspiration and patterns
