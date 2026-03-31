import { ClaudeHookFile, ClaudeProjectContext } from '../types/claude-structure';

// ── Main export ─────────────────────────────────────────────────────────────

export function generateHooks(context: ClaudeProjectContext): ClaudeHookFile[] {
  return [
    generatePreCommitHook(context),
    generatePrePushHook(context),
    generatePostMergeHook(context),
    generateCodeQualityHook(context),
    generateSecurityScanHook(context),
    generateTestingHook(context),
    generateDeploymentValidationHook(context),
  ];
}

/**
 * Generates .claude/settings.json — the official Anthropic 2026 hook registry.
 * Maps Claude Code lifecycle events to the shell scripts in .claude/scripts/.
 *
 * Event reference:
 *   PreToolUse  → fires BEFORE Claude calls a tool (Edit, Write, Bash, etc.)
 *   PostToolUse → fires AFTER a tool completes
 *   Notification → fires when Claude needs user attention
 *   Stop        → fires when the session ends
 */
export function generateSettingsJson(hooks: ClaudeHookFile[]): string {
  const scriptDir = '.claude/scripts';
  const hasHook = (name: string) => hooks.some((h) => h.filename === name);

  const settings = {
    hooks: {
      // Before Claude edits / writes files — run quality + commit checks
      PreToolUse: [
        {
          matcher: 'Edit|Write|MultiEdit',
          hooks: [
            ...(hasHook('pre-commit.sh')
              ? [{ type: 'command', command: `${scriptDir}/pre-commit.sh` }]
              : []),
            ...(hasHook('code-quality.sh')
              ? [{ type: 'command', command: `${scriptDir}/code-quality.sh` }]
              : []),
            ...(hasHook('security-scan.sh')
              ? [{ type: 'command', command: `${scriptDir}/security-scan.sh` }]
              : []),
          ],
        },
        // Before Claude runs bash commands — validate deployments
        {
          matcher: 'Bash',
          hooks: [
            ...(hasHook('deployment-validation.sh')
              ? [{ type: 'command', command: `${scriptDir}/deployment-validation.sh` }]
              : []),
          ],
        },
      ],

      // After Claude edits / writes files — run tests and post-commit checks
      PostToolUse: [
        {
          matcher: 'Edit|Write|MultiEdit',
          hooks: [
            ...(hasHook('testing.sh')
              ? [{ type: 'command', command: `${scriptDir}/testing.sh` }]
              : []),
          ],
        },
        // After bash commands (git pull/merge) — sync environment
        {
          matcher: 'Bash',
          hooks: [
            ...(hasHook('post-merge.sh')
              ? [{ type: 'command', command: `${scriptDir}/post-merge.sh` }]
              : []),
          ],
        },
      ],

      // Before session ends — optionally run pre-push checks
      Stop: [
        {
          matcher: '',
          hooks: [
            ...(hasHook('pre-push.sh')
              ? [{ type: 'command', command: `${scriptDir}/pre-push.sh` }]
              : []),
          ],
        },
      ],
    },
  };

  return JSON.stringify(settings, null, 2);
}

// ── Individual hook scripts ──────────────────────────────────────────────────

function generatePreCommitHook(context: ClaudeProjectContext): ClaudeHookFile {
  const { language, testing } = context;

  const lintCmd =
    language === 'TypeScript' || language === 'JavaScript'
      ? 'npm run lint --fix && npm run format'
      : language === 'Java'
        ? 'mvn spotless:apply && mvn checkstyle:check'
        : language === 'Python'
          ? 'black . && flake8 . && isort .'
          : language === 'Go'
            ? 'go fmt ./... && go vet ./...'
            : '# Add language-specific formatting';

  const typeCmd =
    language === 'TypeScript'
      ? '\n# Type checking\nnpx tsc --noEmit || { echo "❌ TypeScript errors found"; exit 1; }'
      : '';

  const testCmd =
    testing?.includes('Unit Tests')
      ? language === 'TypeScript' || language === 'JavaScript'
        ? '\n# Unit tests\nnpm run test:unit -- --passWithNoTests || { echo "❌ Unit tests failed"; exit 1; }'
        : language === 'Python'
          ? '\n# Unit tests\npytest tests/unit/ -x -q || { echo "❌ Unit tests failed"; exit 1; }'
          : language === 'Java'
            ? '\n# Unit tests\nmvn test -q || { echo "❌ Unit tests failed"; exit 1; }'
            : ''
      : '';

  return {
    filename: 'pre-commit.sh',
    event: 'PreToolUse[Edit|Write]',
    description: 'Quality gate before file edits — lint, format, type-check, fast unit tests',
    content: `#!/usr/bin/env bash
# .claude/scripts/pre-commit.sh
# Pre-commit quality gate — triggered by Claude Code before file edits
# Also usable as a Git hook: cp .claude/scripts/pre-commit.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
set -euo pipefail

echo "🔍 Running pre-commit checks..."

# Lint & format
${lintCmd} || { echo "❌ Lint/format failed"; exit 1; }
${typeCmd}
${testCmd}

# Check for secrets
if command -v git-secrets &>/dev/null; then
  git secrets --scan || { echo "❌ Secrets detected in staged files"; exit 1; }
fi

# Block large files
LARGE=$(git diff --cached --name-only | xargs -I {} find {} -size +10M 2>/dev/null)
if [ -n "$LARGE" ]; then
  echo "❌ Large files detected (>10MB): $LARGE"
  exit 1
fi

echo "✅ Pre-commit checks passed"
`,
  };
}

function generatePrePushHook(context: ClaudeProjectContext): ClaudeHookFile {
  const { testing, language } = context;

  const fullTestCmd =
    testing?.includes('Unit Tests') || testing?.includes('Integration Tests')
      ? language === 'TypeScript' || language === 'JavaScript'
        ? 'npm run test -- --passWithNoTests'
        : language === 'Python'
          ? 'pytest -x -q'
          : language === 'Java'
            ? 'mvn verify -q'
            : 'echo "# Add test command"'
      : 'echo "⚠️  No test suite configured"';

  const buildCmd =
    language === 'TypeScript' || language === 'JavaScript'
      ? 'npm run build'
      : language === 'Java'
        ? 'mvn package -DskipTests -q'
        : language === 'Python'
          ? 'pip check'
          : 'echo "# Add build command"';

  return {
    filename: 'pre-push.sh',
    event: 'Stop',
    description: 'Full validation before pushing — runs complete test suite and build',
    content: `#!/usr/bin/env bash
# .claude/scripts/pre-push.sh
# Pre-push validation — triggered at session end by Claude Code
# Also usable as a Git hook: cp .claude/scripts/pre-push.sh .git/hooks/pre-push && chmod +x .git/hooks/pre-push
set -euo pipefail

echo "🚀 Running pre-push validation..."

# Full test suite
echo "▶ Running tests..."
${fullTestCmd} || { echo "❌ Tests failed — fix before pushing"; exit 1; }

# Build verification
echo "▶ Verifying build..."
${buildCmd} || { echo "❌ Build failed"; exit 1; }

# Dependency audit
if command -v npm &>/dev/null && [ -f package.json ]; then
  npm audit --audit-level high || echo "⚠️  Dependency vulnerabilities found (review before pushing)"
fi

# Check for TODO/FIXME in staged code
TODOS=$(git diff origin/HEAD..HEAD --unified=0 | grep "^+" | grep -E "(TODO|FIXME|HACK|XXX)" | wc -l)
if [ "$TODOS" -gt 0 ]; then
  echo "⚠️  $TODOS TODO/FIXME markers in new code — consider addressing"
fi

echo "✅ Pre-push validation passed"
`,
  };
}

function generatePostMergeHook(context: ClaudeProjectContext): ClaudeHookFile {
  const { language } = context;

  const depsCmd =
    language === 'TypeScript' || language === 'JavaScript'
      ? 'npm ci'
      : language === 'Python'
        ? 'pip install -r requirements.txt -q'
        : language === 'Java'
          ? 'mvn dependency:resolve -q'
          : language === 'Go'
            ? 'go mod download'
            : 'echo "# Add dependency sync command"';

  return {
    filename: 'post-merge.sh',
    event: 'PostToolUse[Bash]',
    description: 'Auto-sync after merge — updates dependencies and runs migrations',
    content: `#!/usr/bin/env bash
# .claude/scripts/post-merge.sh
# Post-merge sync — triggered by Claude Code after bash commands (git pull/merge)
# Also usable as a Git hook: cp .claude/scripts/post-merge.sh .git/hooks/post-merge && chmod +x .git/hooks/post-merge
set -euo pipefail

# Only run when relevant files changed
CHANGED=$(git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD 2>/dev/null || echo "")

echo "🔄 Running post-merge sync..."

# Sync dependencies when lockfiles change
if echo "$CHANGED" | grep -qE "(package-lock\.json|yarn\.lock|requirements.*\.txt|go\.sum|pom\.xml)"; then
  echo "▶ Syncing dependencies..."
  ${depsCmd} || echo "⚠️  Dependency sync failed — run manually"
fi

# Run pending migrations when migration files change
if echo "$CHANGED" | grep -qE "(migrations?/|prisma/|flyway/|alembic/)"; then
  echo "▶ Running database migrations..."
  if command -v npm &>/dev/null && [ -f package.json ]; then
    npm run db:migrate 2>/dev/null || echo "⚠️  Migration failed — check database connection"
  fi
fi

# Clear build cache on config changes
if echo "$CHANGED" | grep -qE "(webpack\.config|vite\.config|next\.config|tsconfig)"; then
  echo "▶ Clearing build cache..."
  rm -rf .next/cache node_modules/.cache dist 2>/dev/null || true
fi

echo "✅ Post-merge sync complete"
`,
  };
}

function generateCodeQualityHook(context: ClaudeProjectContext): ClaudeHookFile {
  const { language, framework } = context;

  const analyzeCmd =
    language === 'TypeScript'
      ? 'npx eslint --ext .ts,.tsx src/ --max-warnings 0'
      : language === 'JavaScript'
        ? 'npx eslint src/ --max-warnings 0'
        : language === 'Python'
          ? 'pylint src/ --fail-under=7.0 && mypy src/ --ignore-missing-imports'
          : language === 'Java'
            ? 'mvn spotbugs:check -q && mvn pmd:check -q'
            : language === 'Go'
              ? 'golangci-lint run ./...'
              : 'echo "# Add static analysis command"';

  return {
    filename: 'code-quality.sh',
    event: 'PreToolUse[Edit|Write]',
    description: 'Static analysis and code quality enforcement before Claude edits files',
    content: `#!/usr/bin/env bash
# .claude/scripts/code-quality.sh
# Code quality gate — triggered by Claude Code before file edits (PreToolUse)
# Ensures Claude's changes comply with project quality standards
set -euo pipefail

# Skip on non-source files
INPUT_FILE="\${CLAUDE_TOOL_INPUT_FILE:-}"
if [ -n "$INPUT_FILE" ]; then
  case "$INPUT_FILE" in
    *.md|*.json|*.yml|*.yaml|*.txt|*.lock) echo "⏭  Skipping quality checks for $INPUT_FILE"; exit 0 ;;
  esac
fi

echo "📊 Running code quality checks (${framework})..."

# Static analysis
${analyzeCmd} || { echo "❌ Code quality gate failed — fix issues before proceeding"; exit 1; }

# Complexity check (if complexipy/lizard available)
if command -v lizard &>/dev/null; then
  lizard src/ --CCN 15 -w || echo "⚠️  High cyclomatic complexity detected"
fi

echo "✅ Code quality checks passed"
`,
  };
}

function generateSecurityScanHook(context: ClaudeProjectContext): ClaudeHookFile {
  const { language } = context;

  const sastCmd =
    language === 'TypeScript' || language === 'JavaScript'
      ? 'npx audit-ci --moderate'
      : language === 'Python'
        ? 'bandit -r src/ -ll -q'
        : language === 'Java'
          ? 'mvn org.owasp:dependency-check-maven:check -q'
          : language === 'Go'
            ? 'gosec ./...'
            : 'echo "# Add SAST tool"';

  return {
    filename: 'security-scan.sh',
    event: 'PreToolUse[Edit|Write]',
    description: 'Security vulnerability scan before Claude edits — blocks dangerous patterns',
    content: `#!/usr/bin/env bash
# .claude/scripts/security-scan.sh
# Security gate — triggered by Claude Code before file edits (PreToolUse)
# Detects secrets, vulnerabilities, and dangerous code patterns
set -euo pipefail

echo "🔒 Running security scan..."

# Secret detection in working directory
if command -v detect-secrets &>/dev/null; then
  detect-secrets scan --baseline .secrets.baseline 2>/dev/null || true
elif command -v trufflehog &>/dev/null; then
  trufflehog filesystem . --only-verified --no-update 2>/dev/null || true
else
  # Fallback: grep for common secret patterns in staged/modified files
  PATTERNS="(password|secret|api_key|private_key|token)\\s*=\\s*['\"][^'\"]{8,}['\"]"
  if git diff --name-only 2>/dev/null | xargs grep -rEi "$PATTERNS" 2>/dev/null; then
    echo "❌ Potential secrets detected in modified files"
    exit 1
  fi
fi

# Dependency vulnerability scan
${sastCmd} || echo "⚠️  Security vulnerabilities found — review before committing"

# Check for dangerous patterns Claude should not introduce
DANGEROUS="(eval\\(|exec\\(|shell_exec|__import__\\('os'\\)|subprocess\\.call)"
if git diff --name-only 2>/dev/null | xargs grep -rEn "$DANGEROUS" 2>/dev/null; then
  echo "⚠️  Potentially dangerous code pattern detected — review carefully"
fi

echo "✅ Security scan complete"
`,
  };
}

function generateTestingHook(context: ClaudeProjectContext): ClaudeHookFile {
  const { testing, language } = context;

  const unitCmd =
    testing?.includes('Unit Tests')
      ? language === 'TypeScript' || language === 'JavaScript'
        ? 'npm run test:unit -- --passWithNoTests --bail'
        : language === 'Python'
          ? 'pytest tests/unit/ -x -q --tb=short'
          : language === 'Java'
            ? 'mvn test -q'
            : language === 'Go'
              ? 'go test ./... -short'
              : 'echo "# Add unit test command"'
      : 'echo "ℹ️  Unit tests not configured for this project"';

  const coverageCmd =
    testing?.includes('Unit Tests')
      ? language === 'TypeScript' || language === 'JavaScript'
        ? '\n# Coverage check\nnpm run test:coverage -- --passWithNoTests 2>/dev/null | tail -5 || true'
        : ''
      : '';

  return {
    filename: 'testing.sh',
    event: 'PostToolUse[Edit|Write]',
    description: 'Auto-runs affected tests after Claude edits files to catch regressions',
    content: `#!/usr/bin/env bash
# .claude/scripts/testing.sh
# Test automation — triggered by Claude Code after file edits (PostToolUse)
# Runs the test suite to catch regressions introduced by Claude's changes
set -euo pipefail

# Skip if no test files exist yet
if ! find . -name "*.test.*" -o -name "*.spec.*" -o -name "test_*.py" 2>/dev/null | grep -q .; then
  echo "ℹ️  No test files found yet — skipping"
  exit 0
fi

echo "🧪 Running tests after file edit..."

${unitCmd} || { echo "❌ Tests failed — Claude's changes may have introduced a regression"; exit 1; }
${coverageCmd}

echo "✅ Tests passed"
`,
  };
}

function generateDeploymentValidationHook(context: ClaudeProjectContext): ClaudeHookFile {
  const { deployment, language } = context;

  const deployValidation =
    deployment === 'Docker'
      ? `# Validate Dockerfile if changed
if git diff --name-only 2>/dev/null | grep -qE "(Dockerfile|docker-compose)"; then
  docker build -t validation-build . --quiet || { echo "❌ Docker build failed"; exit 1; }
  echo "✅ Docker build OK"
fi`
      : deployment === 'Kubernetes'
        ? `# Validate Kubernetes manifests
if command -v kubectl &>/dev/null; then
  find k8s/ -name "*.yaml" 2>/dev/null | xargs -I{} kubectl apply --dry-run=client -f {} || echo "⚠️  Kubernetes manifest validation failed"
fi`
        : deployment === 'AWS'
          ? `# Validate CloudFormation if changed
if git diff --name-only 2>/dev/null | grep -qE "(\\.yaml|\\.json)" | grep -q "infrastructure"; then
  aws cloudformation validate-template --template-body file://infrastructure/template.yaml 2>/dev/null || echo "⚠️  CloudFormation validation failed"
fi`
          : `# Generic deployment validation
echo "ℹ️  No specific deployment target configured"`;

  const envCheck =
    language === 'TypeScript' || language === 'JavaScript'
      ? `# Check required environment variables are documented
if [ -f .env.example ]; then
  MISSING=$(comm -23 <(grep -oE "^[A-Z_]+" .env.example | sort) <(env | grep -oE "^[A-Z_]+" | sort))
  if [ -n "$MISSING" ]; then
    echo "⚠️  Missing env vars (see .env.example): $MISSING"
  fi
fi`
      : '';

  return {
    filename: 'deployment-validation.sh',
    event: 'PreToolUse[Bash]',
    description: 'Validates deployment config before Claude runs bash commands',
    content: `#!/usr/bin/env bash
# .claude/scripts/deployment-validation.sh
# Deployment validation — triggered by Claude Code before bash commands (PreToolUse)
# Guards against invalid deployment config changes
set -euo pipefail

# Only run when deployment-related files are involved
BASH_CMD="\${CLAUDE_TOOL_INPUT_COMMAND:-}"
if ! echo "$BASH_CMD" | grep -qE "(deploy|push|release|publish|docker|kubectl|aws|gcloud|heroku)"; then
  exit 0  # Skip for non-deployment commands
fi

echo "🚀 Running deployment validation..."

${deployValidation}

${envCheck}

echo "✅ Deployment validation passed"
`,
  };
}