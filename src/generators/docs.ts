import { ClaudeDocFile, ClaudeProjectContext, ClaudeTeamContext, ClaudeBusinessContext } from '../types/claude-structure';

export function generateDocs(
  context: ClaudeProjectContext,
  teamContext: ClaudeTeamContext = {},
  businessContext: ClaudeBusinessContext = {}
): ClaudeDocFile[] {
  const docs: ClaudeDocFile[] = [];

  docs.push(generateArchitectureDecisionRecord(context, teamContext));
  docs.push(generateOnboardingGuide(context, teamContext));
  docs.push(generateContributingGuide(context, teamContext));
  docs.push(generateApiReferenceGuide(context));
  docs.push(generateRoiGuide(context, businessContext));

  return docs;
}

function generateArchitectureDecisionRecord(
  context: ClaudeProjectContext,
  team: ClaudeTeamContext
): ClaudeDocFile {
  const { projectName = 'Project', framework, language, architecture, database = [] } = context;

  return {
    filename: 'ADR-001-architecture-decisions.md',
    type: 'architecture',
    description: 'Architecture Decision Records — the "why" behind key technical choices',
    content: `# ADR-001: Core Architecture Decisions for ${projectName}

> **Status:** Accepted  
> **Date:** ${new Date().toISOString().split('T')[0]}  
> **Context:** Initial architecture definition for ${projectName}

---

## Context and Problem Statement

We need a scalable, maintainable architecture for ${projectName} built with ${framework} (${language}).
This ADR documents the key decisions made upfront to ensure the team builds consistently and Claude Code understands the system boundaries.

---

## Decision 1: Framework and Language Choice

### Decision
Use **${framework}** with **${language}** as the primary stack.

### Rationale
- Established ecosystem with strong community support
- Type safety and developer productivity (${language === 'TypeScript' ? 'TypeScript provides compile-time safety' : language === 'Go' ? 'Go provides excellent performance and concurrency' : language === 'Java' ? 'Java provides maturity and enterprise tooling' : 'proven production readiness'})
- Well-supported by Claude Code for AI-assisted development

### Consequences
- Positive: Consistent patterns, better tooling, AI assistance quality
- Negative: Onboarding curve for developers unfamiliar with ${framework}
- Mitigation: See onboarding guide in \`docs/onboarding.md\`

---

## Decision 2: Architecture Pattern${architecture ? ` — ${architecture}` : ''}

### Decision
${architecture ? `Adopt **${architecture}** as the primary architectural pattern.` : 'Define clear module boundaries with separation of concerns.'}

### Rationale
${architecture === 'Hexagonal / Ports & Adapters' ? `
- Business logic is fully isolated from infrastructure concerns
- Enables easy swapping of databases, APIs, and external services
- Facilitates thorough unit testing without real dependencies
- Claude Code can generate adapters independently per port contract
` : architecture === 'Clean Architecture' ? `
- Dependency rule enforced: inner layers know nothing about outer layers
- Business rules are the most stable part of the system
- Use cases are explicit and testable in isolation
- Claude Code can generate each layer independently
` : architecture === 'DDD + CQRS' ? `
- Domain model captures business complexity explicitly
- Commands and queries separated for clarity and scalability
- Bounded contexts prevent model corruption
- Claude Code can generate aggregates, events, and handlers independently
` : architecture === 'Microservices' ? `
- Each service owns its domain and data
- Independent deployment and scaling per service
- Clear API contracts between services
- Claude Code can generate each service independently
` : `
- Clear separation between presentation, business logic, and data layers
- Each module has a single, well-defined responsibility
- Enables AI-assisted development at the module level
`}

### Consequences
- Positive: Predictable structure, easier for AI to understand and generate code
- Teams must follow the pattern strictly — use linting and PR reviews

---

## Decision 3: Database Strategy

### Decision
${database.length > 0 ? `Use **${database.join(', ')}** for data persistence.` : 'Define the appropriate database based on data characteristics.'}

### Rationale
${database.includes('PostgreSQL') ? '- PostgreSQL: Relational integrity, JSONB for flexibility, mature ecosystem\n' : ''}${database.includes('Redis') ? '- Redis: Ultra-fast caching, session storage, pub/sub messaging\n' : ''}${database.includes('MongoDB') ? '- MongoDB: Schema flexibility for evolving domains\n' : ''}${database.includes('Elasticsearch') ? '- Elasticsearch: Full-text search with complex aggregations\n' : ''}- Avoid premature optimization — start simple, optimize with data

### Consequences
- Each database has a designated adapter/repository
- Connection pooling configured for production
- Migration strategy defined in \`/src/database/migrations/\`

---

## Decision 4: AI-Assisted Development Strategy

### Decision
Use **Claude Code** as the primary AI assistant with structured context via \`.claude/\` directory.

### Rationale
- Structured context (CLAUDE.md, skills, hooks) dramatically improves output quality
- Skills provide reusable workflows that prevent repetitive prompting
- Hooks enforce quality gates automatically
- Teams stop rewriting prompts and get consistent, high-quality output

### Implementation
\`\`\`
.claude/
├── CLAUDE.md          # Project brain — context, rules, conventions
├── skills/            # Reusable AI workflows
│   ├── review.md      # Code review workflow
│   ├── refactor.md    # Refactoring patterns
│   ├── testing.md     # Test generation workflow
│   └── release.md     # Release process
├── hooks/             # Quality gates and automation
│   ├── pre-commit.yml
│   ├── pre-push.yml
│   └── code-quality.yml
└── docs/              # Architecture decisions (this folder)
    ├── ADR-001-architecture-decisions.md
    └── onboarding.md
\`\`\`

### Consequences
- Positive: Consistent AI outputs, reduced prompt engineering overhead
- Positive: New team members onboard faster using AI-assisted workflows
- Positive: ROI on AI investment multiplied by quality of context

---

## Decision 5: Testing Strategy

### Decision
${context.testing?.length ? `Implement **${context.testing.join(', ')}** as the testing strategy.` : 'Define a testing pyramid appropriate to the domain.'}

### Rationale
- Fast feedback loop via unit tests (seconds)
- Confidence via integration tests (minutes)
- Regression prevention via E2E tests (pre-deploy)
- Claude Code can generate test cases from skill prompts

### Test Organization
\`\`\`
tests/
├── unit/           # Fast, isolated, no I/O
├── integration/    # Real database, mock external APIs
└── e2e/           # Full stack, staging environment
\`\`\`

---

## Consequences Summary

| Decision | ROI Impact | Maintenance Cost |
|----------|-----------|-----------------|
| ${framework} + ${language} | High — established patterns | Low — community support |
| ${architecture || 'Layered Architecture'} | High — predictable, AI-friendly | Medium — discipline required |
| Structured .claude/ | Very High — 10x AI quality | Low — update as patterns evolve |
| Testing strategy | High — fewer production issues | Medium — test maintenance |

---

## References

- [Architecture Patterns](https://martinfowler.com/architecture/)
- [Claude Code Best Practices](https://docs.anthropic.com/claude-code)
- [${framework} Documentation](https://www.google.com/search?q=${encodeURIComponent(framework + ' documentation')})

---

*Generated by Skill Creator — Keep this document updated as architecture evolves.*
*Next review: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}*
`,
  };
}

function generateOnboardingGuide(
  context: ClaudeProjectContext,
  team: ClaudeTeamContext
): ClaudeDocFile {
  const { projectName = 'Project', framework, language, database = [] } = context;

  return {
    filename: 'onboarding.md',
    type: 'onboarding',
    description: 'Developer onboarding guide for new team members',
    content: `# Developer Onboarding Guide — ${projectName}

> Welcome to the team! This guide gets you from zero to productive in the shortest possible time.
> **Estimated time:** ${team.experience === 'senior' ? '30 minutes' : team.experience === 'mid' ? '1-2 hours' : '2-4 hours'}

---

## Prerequisites

Before starting, ensure you have:

\`\`\`bash
# Check required tools
${language === 'TypeScript' || language === 'JavaScript' ? `node --version   # >= 18.0.0 required
npm --version    # >= 9.0.0 required` : language === 'Java' ? `java --version   # >= 17.0.0 required
mvn --version    # Maven 3.8+ required` : language === 'Python' ? `python --version # >= 3.11 required
pip --version    # pip 23+ required` : language === 'Go' ? `go version       # >= 1.21 required` : `# Check ${language} version`}
git --version    # 2.40+ recommended
docker --version # Latest stable
\`\`\`

---

## Step 1: Clone and Setup (5 min)

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd ${projectName.toLowerCase().replace(/\s+/g, '-')}

# Install dependencies
${language === 'TypeScript' || language === 'JavaScript' ? 'npm ci' : language === 'Java' ? 'mvn install' : language === 'Python' ? 'pip install -r requirements.txt' : language === 'Go' ? 'go mod download' : '# Install dependencies'}

# Setup environment
cp .env.example .env.local
# Edit .env.local with your local settings
\`\`\`

---

## Step 2: Configure Claude Code (10 min)

This project uses **Claude Code** with a structured \`.claude/\` directory for AI-assisted development.

\`\`\`bash
# Install Claude Code (if not installed)
npm install -g @anthropic-ai/claude-code

# Verify the .claude/ structure
ls .claude/
# Expected: CLAUDE.md  skills/  hooks/  docs/

# Read the project brain
cat .claude/CLAUDE.md
\`\`\`

### Using Skills (AI Workflows)

\`\`\`bash
# Code review workflow
/skill review

# Generate tests
/skill testing

# Refactor code
/skill refactor

# Prepare release
/skill release
\`\`\`

**Pro tip:** Read each skill file in \`.claude/skills/\` to understand available workflows.

---

## Step 3: Start Development Environment (5 min)

\`\`\`bash
# Start databases${database.includes('PostgreSQL') ? `
docker-compose up -d postgres` : ''}${database.includes('Redis') ? `
docker-compose up -d redis` : ''}${database.includes('MongoDB') ? `
docker-compose up -d mongodb` : ''}

# Run migrations
${language === 'TypeScript' ? 'npm run db:migrate' : language === 'Java' ? 'mvn flyway:migrate' : language === 'Python' ? 'python manage.py migrate' : '# Run migrations'}

# Start development server
${language === 'TypeScript' || language === 'JavaScript' ? 'npm run dev' : language === 'Java' ? 'mvn spring-boot:run' : language === 'Python' ? 'uvicorn main:app --reload' : language === 'Go' ? 'go run cmd/main.go' : '# Start dev server'}

# Run tests
${language === 'TypeScript' || language === 'JavaScript' ? 'npm run test' : language === 'Java' ? 'mvn test' : language === 'Python' ? 'pytest' : language === 'Go' ? 'go test ./...' : '# Run tests'}
\`\`\`

---

## Step 4: Understand the Architecture (15 min)

Read these documents in order:

1. **\`.claude/CLAUDE.md\`** — Project conventions and AI assistant rules
2. **\`docs/ADR-001-architecture-decisions.md\`** — Why we made key decisions
3. **\`README.md\`** — Project overview and structure

### Project Structure

\`\`\`
${projectName.toLowerCase().replace(/\s+/g, '-')}/
├── .claude/                # AI assistant configuration
│   ├── CLAUDE.md          # Project brain
│   ├── skills/            # Reusable AI workflows
│   ├── hooks/             # Quality gates
│   └── docs/              # Architecture decisions
├── src/                   # Source code
│   ├── domain/            # Business logic (no external deps)
│   ├── application/       # Use cases and orchestration
│   ├── infrastructure/    # Database, APIs, external services
│   └── presentation/      # Controllers, routes, DTOs
├── tests/                 # Test suites
├── docs/                  # Additional documentation
└── scripts/               # Development and deployment scripts
\`\`\`

---

## Step 5: First Contribution Workflow

\`\`\`bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
# Use Claude Code skills for AI assistance

# Commit (hooks run automatically)
git commit -m "feat: your feature description"
# Pre-commit hook will run: lint, format, unit tests

# Push
git push origin feature/your-feature-name
# Pre-push hook will run: full test suite, security scan

# Open Pull Request via GitHub/GitLab
\`\`\`

---

## Common Commands Reference

| Task | Command |
|------|---------|
| Start dev | \`${language === 'TypeScript' ? 'npm run dev' : language === 'Java' ? 'mvn spring-boot:run' : language === 'Python' ? 'uvicorn main:app --reload' : language === 'Go' ? 'go run cmd/main.go' : 'start dev'}\` |
| Run tests | \`${language === 'TypeScript' ? 'npm test' : language === 'Java' ? 'mvn test' : language === 'Python' ? 'pytest' : language === 'Go' ? 'go test ./...' : 'run tests'}\` |
| Lint | \`${language === 'TypeScript' ? 'npm run lint' : language === 'Java' ? 'mvn checkstyle:check' : language === 'Python' ? 'flake8 src/' : language === 'Go' ? 'golangci-lint run' : 'lint'}\` |
| Format | \`${language === 'TypeScript' ? 'npm run format' : language === 'Java' ? 'mvn spotless:apply' : language === 'Python' ? 'black src/' : language === 'Go' ? 'go fmt ./...' : 'format'}\` |
| Build | \`${language === 'TypeScript' ? 'npm run build' : language === 'Java' ? 'mvn package' : language === 'Python' ? 'python -m build' : language === 'Go' ? 'go build ./...' : 'build'}\` |
| AI review | \`/skill review\` (in Claude Code) |
| AI tests | \`/skill testing\` (in Claude Code) |

---

## Getting Help

1. **Check CLAUDE.md** — Most common patterns are documented there
2. **Use AI skills** — \`/skill\` commands in Claude Code
3. **Read ADRs** — Understand the "why" before changing patterns
4. **Ask the team** — No shame in asking questions

---

*Generated by Skill Creator. Update this guide when onboarding experience reveals gaps.*
`,
  };
}

function generateContributingGuide(
  context: ClaudeProjectContext,
  team: ClaudeTeamContext
): ClaudeDocFile {
  const { projectName = 'Project', language, framework } = context;

  return {
    filename: 'contributing.md',
    type: 'guide',
    description: 'Contribution guidelines and development standards',
    content: `# Contributing to ${projectName}

> This guide documents how we work together to maintain a high-quality, consistent codebase.
> Following these standards maximizes the effectiveness of AI-assisted development.

---

## Code Standards

### Commit Convention

We use **Conventional Commits** for clear, automatable history:

\`\`\`
<type>(<scope>): <description>

Types: feat | fix | docs | style | refactor | test | chore | perf
Scope: optional, module or layer name

Examples:
  feat(auth): add OAuth2 login with Google
  fix(api): handle null pointer in user service
  docs(adr): add decision record for caching strategy
  test(payment): add unit tests for refund calculation
  refactor(domain): extract payment validation to value object
\`\`\`

### Branch Strategy

\`\`\`
main              ← production-ready, protected
develop           ← integration branch
feature/<name>    ← new features
fix/<name>        ← bug fixes
chore/<name>      ← maintenance tasks
release/<version> ← release preparation
\`\`\`

### Pull Request Process

1. **Create branch** from \`develop\`
2. **Implement** using Claude Code skills when appropriate
3. **Self-review** using \`/skill review\` in Claude Code
4. **Push** — pre-push hooks run automatically
5. **Open PR** with descriptive title and linked issue
6. **Request review** from at least ${team.teamSize === 'solo' ? '0 reviewers (solo project)' : team.teamSize === 'small' ? '1 reviewer' : '2 reviewers'}
7. **Address feedback** — use AI assistance if helpful
8. **Squash merge** to keep history clean

---

## AI-Assisted Development Guidelines

### When to use Claude Code

| Task | Recommended AI Approach |
|------|------------------------|
| New feature | Start with \`/skill review\` context, then generate |
| Bug fix | Describe the issue, ask for root cause analysis |
| Refactoring | Use \`/skill refactor\` workflow |
| Tests | Use \`/skill testing\` for comprehensive test generation |
| Code review | Use \`/skill review\` before requesting human review |
| Documentation | Ask Claude to document based on existing patterns |

### AI Output Quality Rules

1. **Always review AI output** before committing — hooks help but humans are the final gate
2. **Never merge untested AI code** — run tests, check edge cases
3. **Document AI-generated decisions** — add comments for non-obvious choices
4. **Update CLAUDE.md** when patterns evolve — keep the brain current

---

## Architecture Rules

### ${language} Specific Standards

${language === 'TypeScript' ? `
- **No \`any\` types** except in explicit migration code with a \`// TODO: remove\` comment
- **Strict null checks** always enabled
- **Interfaces over types** for object shapes
- **async/await** over raw Promises
- **Dependency injection** for all external services (testability)
` : language === 'Java' ? `
- **No business logic in controllers** — delegate to service layer
- **Immutable domain objects** where possible
- **Constructor injection** for all dependencies
- **Avoid static methods** for logic that needs testing
- **Lombok** for boilerplate reduction (if configured)
` : language === 'Python' ? `
- **Type hints required** for all public functions
- **Pydantic models** for all data validation
- **async/await** for all I/O operations (FastAPI pattern)
- **Dependency injection** via FastAPI \`Depends()\`
` : language === 'Go' ? `
- **Explicit error handling** — never ignore errors
- **Interfaces defined at the consumer** (Go convention)
- **Context propagation** for all I/O operations
- **Table-driven tests** as the standard pattern
` : `
- Follow established patterns in the codebase
- Document non-obvious decisions
`}

### Forbidden Patterns

\`\`\`
❌ Business logic in presentation/controller layer
❌ Direct database access from anywhere except repositories
❌ Hardcoded secrets or configuration values
❌ Comments that describe WHAT (not WHY) — code should be self-documenting
❌ Functions longer than 50 lines without strong justification
❌ Untested public methods in domain/business layer
\`\`\`

---

## Review Checklist

Before approving a PR, verify:

- [ ] Tests cover the new behavior (unit + integration where applicable)
- [ ] No secrets or sensitive data in code
- [ ] Follows architecture patterns in ADR-001
- [ ] CLAUDE.md updated if new patterns were introduced
- [ ] Performance implications considered
- [ ] Error handling is explicit and meaningful

---

*Generated by Skill Creator. This document should be treated as a living guide.*
`,
  };
}

function generateApiReferenceGuide(context: ClaudeProjectContext): ClaudeDocFile {
  const { projectName = 'Project', framework, architecture, authentication } = context;

  return {
    filename: 'api-reference.md',
    type: 'api-reference',
    description: 'API design standards and reference documentation',
    content: `# API Reference and Design Standards — ${projectName}

> This document defines the API conventions used across the project.
> Claude Code uses these standards when generating new endpoints.

---

## API Design Principles

### 1. RESTful Resource Naming

\`\`\`
# Resources are nouns, always plural
GET    /api/v1/users          # List users
POST   /api/v1/users          # Create user
GET    /api/v1/users/:id      # Get user by ID
PUT    /api/v1/users/:id      # Replace user
PATCH  /api/v1/users/:id      # Update user fields
DELETE /api/v1/users/:id      # Delete user

# Nested resources for clear ownership
GET    /api/v1/users/:id/orders       # User's orders
POST   /api/v1/users/:id/orders       # Create order for user
\`\`\`

### 2. Response Envelope

All responses follow this structure:

\`\`\`json
// Success — single resource
{
  "data": { ... },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}

// Success — collection
{
  "data": [ ... ],
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z",
    "pagination": {
      "page": 1,
      "perPage": 20,
      "total": 120,
      "totalPages": 6
    }
  }
}

// Error
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "User with id '123' was not found",
    "details": { ... },
    "requestId": "req_abc123"
  }
}
\`\`\`

### 3. HTTP Status Codes

| Code | When to use |
|------|------------|
| 200 OK | Successful GET, PATCH, PUT |
| 201 Created | Successful POST (resource created) |
| 204 No Content | Successful DELETE |
| 400 Bad Request | Validation errors, malformed request |
| 401 Unauthorized | Missing or invalid authentication |
| 403 Forbidden | Authenticated but insufficient permissions |
| 404 Not Found | Resource doesn't exist |
| 409 Conflict | Duplicate resource, state conflict |
| 422 Unprocessable | Business logic validation failed |
| 429 Too Many Requests | Rate limit exceeded |
| 500 Internal Server Error | Unexpected server error |

### 4. Versioning Strategy

\`\`\`
# URL versioning (recommended for this project)
/api/v1/users    ← stable
/api/v2/users    ← new version when breaking changes needed

# Never remove v1 without a deprecation period of at least 6 months
# Add Deprecation header when deprecating:
# Deprecation: true
# Sunset: Sat, 01 Jan 2026 00:00:00 GMT
\`\`\`

---

## Authentication

${authentication && authentication !== 'None' && authentication !== 'Nenhuma' ? `
### ${authentication}

${authentication === 'JWT' ? `
\`\`\`http
# All protected endpoints require Bearer token
Authorization: Bearer <jwt-token>

# Token format (JWT claims)
{
  "sub": "user_id",
  "email": "user@example.com",
  "roles": ["user", "admin"],
  "iat": 1700000000,
  "exp": 1700086400
}

# Refresh token endpoint
POST /api/v1/auth/refresh
Body: { "refreshToken": "..." }
\`\`\`
` : authentication === 'OAuth2 / OpenID Connect' ? `
\`\`\`
# OAuth2 Authorization Code Flow
1. GET /api/v1/auth/authorize?client_id=...&redirect_uri=...&scope=...
2. User authenticates with provider
3. GET /callback?code=...
4. POST /api/v1/auth/token (exchange code for tokens)
5. Use access_token as Bearer in subsequent requests
\`\`\`
` : authentication === 'API Key' ? `
\`\`\`http
# API key in header (preferred)
X-API-Key: <your-api-key>

# Or in query string (less secure, for webhooks)
GET /api/v1/resource?apiKey=<your-api-key>
\`\`\`
` : `
Refer to the authentication implementation in \`src/infrastructure/auth/\` for details.
`}
` : `
This project currently has no authentication. Refer to the ADR if authentication is planned.
`}

---

## Common Error Codes

\`\`\`
VALIDATION_ERROR        — Input validation failed
RESOURCE_NOT_FOUND      — Requested resource doesn't exist
RESOURCE_ALREADY_EXISTS — Duplicate creation attempt
UNAUTHORIZED            — Authentication required
FORBIDDEN               — Insufficient permissions
RATE_LIMIT_EXCEEDED     — Too many requests
INTERNAL_ERROR          — Unexpected server error
\`\`\`

---

## Claude Code API Generation Prompt

When asking Claude to generate a new endpoint, use this template:

\`\`\`
Create a new [METHOD] /api/v1/[resource] endpoint following the conventions in:
- docs/api-reference.md (response envelope, status codes, error codes)
- ADR-001 (architecture pattern: ${architecture || 'layered'})
- CLAUDE.md (project conventions)

The endpoint should:
- [Describe business requirement]
- [List validation rules]
- [Describe authorization requirement]

Include: controller/route, service, repository, DTO/schema, unit tests
\`\`\`

---

*Generated by Skill Creator. Update when API conventions evolve.*
`,
  };
}

function generateRoiGuide(
  context: ClaudeProjectContext,
  business: ClaudeBusinessContext
): ClaudeDocFile {
  const { projectName = 'Project', framework, language } = context;
  const quality = business.qualityRequirements || 'standard';
  const security = business.securityRequirements || 'standard';

  return {
    filename: 'roi-and-best-practices.md',
    type: 'guide',
    description: 'ROI model and best practices for AI-assisted development',
    content: `# ROI & Best Practices for AI-Assisted Development — ${projectName}

> This document quantifies the value of structured AI usage and provides the practices that maximize return on investment.

---

## Why Structure Matters More Than Prompts

Most teams use AI as a "better search engine" — they describe problems and ask for solutions.
The 10x teams use AI as a **systematic force multiplier** by investing in structure.

\`\`\`
Common approach:          Structured approach:
  "Write me a login"  →    /skill auth → consistent, secure, tested
  "Review this code"  →    /skill review → predictable checklist
  "Write a test"      →    /skill testing → coverage-aligned tests
  
Result: Random quality     Result: Predictable quality
\`\`\`

---

## ROI Model for This Project

### Time Savings Estimates

| Activity | Without AI | With structured AI | Savings |
|----------|-----------|-------------------|---------|
| New feature implementation | 8h | 3-4h | **~55%** |
| Code review | 2h | 45min | **~60%** |
| Test generation | 3h | 45min | **~75%** |
| Bug investigation | 4h | 1-2h | **~60%** |
| Documentation | 3h | 30min | **~83%** |
| Onboarding new dev | 2 weeks | 3-5 days | **~65%** |

### Cost Impact (Monthly, 5-person team)

\`\`\`
Developer cost:          $50,000/month (avg $10k/person)
Efficiency gain:         ~60% on AI-assisted tasks
AI-assisted work:        ~40% of total work

Monthly value generated: $50,000 × 0.40 × 0.60 = $12,000/month
Annual value:            $144,000/year
Claude Code cost:        ~$500/month (5 seats)
ROI:                     2,300% annually
\`\`\`

---

## The .claude/ Directory as a Business Asset

Your \`.claude/\` directory is not just configuration — it's:

### 1. Institutional Knowledge Base
- **CLAUDE.md** → captures team conventions that survive turnover
- **docs/** → records the "why" that expensive engineers carry in their heads
- **skills/** → workflows that onboard junior developers to senior patterns

### 2. Quality Assurance System
- **hooks/** → automated quality gates that run on every commit
- Pre-commit hooks prevent ~70% of code review feedback from ever being needed
- Security scanning catches vulnerabilities before they reach production

### 3. Consistency Engine
- Every developer, every PR, every feature follows the same patterns
- AI generates code consistent with existing codebase, not generic examples
- New team members produce senior-level code from day one

---

## Best Practices for This Stack

### ${framework} + ${language} Specific

${language === 'TypeScript' ? `
**High-ROI Patterns:**
- Generate Zod/Joi validation schemas from TypeScript interfaces (Claude is excellent at this)
- Ask Claude to generate comprehensive types before implementing — types drive implementation
- Use \`/skill testing\` to generate tests first (TDD with AI amplification)
- Ask Claude to identify missing error handling edge cases

**Cost-Reduction Patterns:**
- Generate boilerplate (DTOs, repositories, controllers) in bulk
- Auto-generate Swagger/OpenAPI docs from controllers
- Generate migration files from schema changes
` : language === 'Java' ? `
**High-ROI Patterns:**
- Generate complete Spring Boot layers (Controller → Service → Repository) atomically
- Ask Claude to implement patterns from ADR (Hexagonal, DDD) consistently
- Generate Mockito test cases for complex service logic
- Auto-generate MapStruct mappers from DTO ↔ Entity definitions

**Cost-Reduction Patterns:**
- Generate repetitive CRUD operations in bulk
- Auto-generate OpenAPI spec from Spring annotations
- Generate liquibase/flyway migrations from entity changes
` : language === 'Python' ? `
**High-ROI Patterns:**
- Generate Pydantic models with full validation from requirements
- Ask Claude to add async support to existing synchronous functions
- Generate pytest fixtures for complex test scenarios
- Auto-generate FastAPI route handlers from Pydantic schemas

**Cost-Reduction Patterns:**
- Generate SQLAlchemy models from database schema
- Auto-generate Alembic migrations
- Generate type stubs for untyped libraries
` : language === 'Go' ? `
**High-ROI Patterns:**
- Generate interface-based designs (consumer-defined interfaces)
- Ask Claude to implement table-driven tests comprehensively
- Generate error types and wrapping patterns consistently
- Auto-generate OpenAPI spec from route handlers

**Cost-Reduction Patterns:**
- Generate struct validation logic
- Auto-generate mock implementations from interfaces
- Generate Makefile targets for common operations
` : `
- Follow the patterns established in CLAUDE.md
- Use skills for consistent, repeatable workflows
- Document new patterns in ADRs for future reference
`}

---

## Quality Gates — Investment vs. Return

| Gate | Implementation Cost | Value Delivered |
|------|--------------------|-----------------| 
| Pre-commit lint | 2h setup | Eliminates style feedback in reviews forever |
| Pre-push tests | 4h setup | Catches ~80% of regressions before they merge |
| Security scanning | 3h setup | Prevents security vulnerabilities entering codebase |
| Coverage thresholds | 2h setup | Ensures test investment doesn't degrade over time |
| **Total investment** | **~11h one-time** | **Saves 10-20h/month in review cycles** |

---

## Measuring AI Development Success

Track these metrics monthly:

\`\`\`
Velocity Metrics:
  - Story points completed per sprint (target: +40% vs pre-AI)
  - PR cycle time: open → merged (target: <24h for normal features)
  - Bug escape rate to production (target: -50%)

Quality Metrics:
  - Code review iterations per PR (target: ≤1.5 rounds)
  - Test coverage (target: ≥80%)
  - Security vulnerabilities found in audit (target: 0 critical)

Team Metrics:
  - Onboarding time for new developer (target: <1 week to first PR)
  - Time debugging vs building (target: <20% debugging)
  - Developer satisfaction score (target: ≥8/10)
\`\`\`

---

## The Compound Effect

Investing in \`.claude/\` quality compounds over time:

\`\`\`
Month 1: Setup .claude/ → 8h investment, 2h saved
Month 2: Team learns patterns → 5h saved
Month 3: Skills refined → 12h saved
Month 6: Institutional knowledge captured → 20h saved/month
Month 12: AI fully integrated → 40h+ saved/month

Cumulative ROI after 12 months: 15-20x initial investment
\`\`\`

---

## Action Items

- [ ] Update \`CLAUDE.md\` as new patterns emerge
- [ ] Add new skills when repetitive prompts are identified  
- [ ] Review and tighten hooks monthly
- [ ] Document new ADRs as architecture evolves
- [ ] Measure ROI quarterly and adjust investment accordingly

---

*Generated by Skill Creator. This is a living document — update with actual measurements from your team.*
`,
  };
}
