import { ClaudeStructure, ClaudeProjectContext, ClaudeTeamContext, ClaudeBusinessContext } from '../types/claude-structure';
import { generateClaudeMd } from './claude-md';
import { generateSkills } from './skills';
import { generateHooks, generateSettingsJson } from './hooks';
import { generateDocs } from './docs';
import { generateAgents } from './agents';

export interface GeneratedFile {
  path: string;
  content: string;
  description: string;
}

export interface ClaudePackage {
  structure: ClaudeStructure;
  files: GeneratedFile[];
  summary: ClaudePackageSummary;
}

export interface ClaudePackageSummary {
  totalFiles: number;
  skillsCount: number;
  hooksCount: number;
  docsCount: number;
  agentsCount: number;
  estimatedTimeSavings: string;
  keyBenefits: string[];
}

export function generateClaudeStructure(
  context: ClaudeProjectContext,
  teamContext: ClaudeTeamContext = {},
  businessContext: ClaudeBusinessContext = {}
): ClaudePackage {
  // Generate all components
  const claudeMd = generateClaudeMd(context, teamContext, businessContext);
  const skills = generateSkills(context);
  const hooks = generateHooks(context);
  const docs = generateDocs(context, teamContext, businessContext);
  const agents = generateAgents(context);

  // Generate .claude/settings.json — registers hooks into Claude Code events
  const settingsContent = generateSettingsJson(hooks);
  const settings = { content: settingsContent };

  const structure: ClaudeStructure = { claudeMd, skills, hooks, settings, docs, agents };

  // Build flat file list with paths
  const files: GeneratedFile[] = [
    {
      path: '.claude/CLAUDE.md',
      content: claudeMd,
      description: 'Project brain — context, conventions and rules for Claude Code',
    },
    // .claude/settings.json — Claude Code hook registry (Anthropic 2026 standard)
    {
      path: '.claude/settings.json',
      content: settingsContent,
      description: 'Claude Code hook registry — maps lifecycle events to scripts',
    },
    // .claude/skills/<name>/SKILL.md
    ...skills.map((s) => ({
      path: `.claude/skills/${s.filename}`,  // e.g. .claude/skills/code-review/SKILL.md
      content: s.content,
      description: s.description,
    })),
    // .claude/scripts/*.sh — executable hook scripts
    ...hooks.map((h) => ({
      path: `.claude/scripts/${h.filename}`,  // e.g. .claude/scripts/pre-commit.sh
      content: h.content,
      description: h.description,
    })),
    ...docs.map((d) => ({
      path: `.claude/docs/${d.filename}`,
      content: d.content,
      description: d.description,
    })),
    // .claude/agents/<name>/AGENT.md — autonomous sub-agents (Anthropic 2026 standard)
    ...agents.map((a) => ({
      path: `.claude/agents/${a.filename}`,  // e.g. .claude/agents/code-analyst/AGENT.md
      content: a.content,
      description: a.description,
    })),
  ];

  const summary: ClaudePackageSummary = buildSummary(context, skills.length, hooks.length, docs.length, agents.length);

  return { structure, files, summary };
}

function buildSummary(
  context: ClaudeProjectContext,
  skillsCount: number,
  hooksCount: number,
  docsCount: number,
  agentsCount: number
): ClaudePackageSummary {
  const totalFiles = 1 + skillsCount + hooksCount + docsCount + agentsCount; // 1 for CLAUDE.md + settings.json

  // Estimate time savings based on team context and structure quality
  const baseSavingsPerMonth =
    skillsCount * 2 +   // Each skill saves ~2h/month
    hooksCount * 1.5 +  // Each hook saves ~1.5h/month
    docsCount * 0.5 +   // Each doc saves ~0.5h/month
    agentsCount * 3;    // Each agent saves ~3h/month (autonomous multi-step work)

  const estimatedHours = Math.round(baseSavingsPerMonth);

  const keyBenefits = [
    `${skillsCount} reusable AI workflows — stop rewriting prompts`,
    `${hooksCount} automated quality gates — enforce standards automatically`,
    `${docsCount} architecture documents — the "why" is always accessible`,
    `${agentsCount} autonomous sub-agents — complex tasks delegated automatically`,
    `1 project brain (CLAUDE.md) — consistent AI context every session`,
    `Estimated ${estimatedHours}h/month saved per developer`,
    `New developers productive in days, not weeks`,
    `AI output quality improves as CLAUDE.md matures`,
  ];

  return {
    totalFiles,
    skillsCount,
    hooksCount,
    docsCount,
    agentsCount,
    estimatedTimeSavings: `~${estimatedHours}h/month per developer`,
    keyBenefits,
  };
}

// ── Utility: generate a shell install script ────────────────────────────────

export function generateInstallScript(pkg: ClaudePackage): string {
  const fileList = pkg.files
    .map((f) => {
      const dir = f.path.split('/').slice(0, -1).join('/');
      const escapedContent = f.content
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "'\\''");
      return `mkdir -p "${dir}" && cat > "${f.path}" << 'SKILL_CREATOR_EOF'\n${f.content}\nSKILL_CREATOR_EOF`;
    })
    .join('\n\n');

  return `#!/bin/bash
# Generated by Skill Creator
# Installs .claude/ structure for optimal Claude Code usage (Anthropic 2026 standard)
# Usage: bash install-claude.sh

set -e

echo "🤖 Setting up .claude/ structure..."
echo "   This will create ${pkg.summary.totalFiles} files in your project"
echo ""

${fileList}

# Make hook scripts executable
chmod +x .claude/scripts/*.sh 2>/dev/null || true

echo ""
echo "✅ .claude/ structure installed successfully!"
echo ""
echo "📁 Created (Anthropic 2026 Standard):"
echo "   .claude/CLAUDE.md                      → Project brain"
echo "   .claude/settings.json                  → Hook registry for Claude Code"
echo "   .claude/skills/ (${pkg.summary.skillsCount} skill dirs)  → AI workflows (skill-name/SKILL.md format)"
echo "   .claude/scripts/ (${pkg.summary.hooksCount} scripts)     → Executable hooks (.sh) + lifecycle integration"
echo "   .claude/docs/   (${pkg.summary.docsCount} files)         → Architecture docs"
echo "   .claude/agents/ (${pkg.summary.agentsCount} agents)      → Autonomous sub-agents (agent-name/AGENT.md format)"
echo ""
echo "🚀 Next steps:"
echo "   1. Review and customize .claude/CLAUDE.md"
echo "   2. Test Claude Code integration:"
echo "      claude --debug                         # See hooks executing"
echo "      claude /skill code-review              # Test skills"
echo "      # Invoke an agent: 'Use the security-auditor agent to review the auth module'"
echo "   3. Optional Git hooks integration:"
echo "      cp .claude/scripts/pre-commit.sh .git/hooks/pre-commit"
echo "      cp .claude/scripts/pre-push.sh .git/hooks/pre-push"
echo "      chmod +x .git/hooks/pre-*"
echo "   4. Commit: git add .claude/ && git commit -m 'feat: add Claude Code AI structure (Anthropic 2026)'"
echo ""
echo "💡 Your hooks will auto-trigger during Claude Code sessions (PreToolUse, PostToolUse, Stop events)"
echo "🤖 Sub-agents handle complex multi-step tasks autonomously — invoke via natural language in Claude Code"
`;
}

// ── Utility: generate a structured tree view ───────────────────────────────

export function generateTreeView(pkg: ClaudePackage): string {
  const { skillsCount, hooksCount, docsCount, agentsCount } = pkg.summary;

  const skillLines = pkg.structure.skills
    .map((s) => `│   ├── ${s.filename.padEnd(35)} # ${s.description.slice(0, 50)}`)
    .join('\n');

  const hookLines = pkg.structure.hooks
    .map((h) => `│   ├── ${h.filename.padEnd(35)} # ${h.description.slice(0, 50)}`)
    .join('\n');

  const docLines = pkg.structure.docs
    .map((d) => `│   ├── ${d.filename.padEnd(35)} # ${d.description.slice(0, 50)}`)
    .join('\n');

  const agentLines = pkg.structure.agents
    .map((a) => `│   ├── ${a.filename.padEnd(35)} # ${a.description.slice(0, 50)}`)
    .join('\n');

  return `.claude/
├── CLAUDE.md                               # Project brain — context, rules, conventions
├── settings.json                           # Hook registry — Claude Code lifecycle events
│
├── skills/ (${skillsCount} skill dirs — each contains SKILL.md)
${skillLines}
│
├── scripts/ (${hooksCount} hook scripts — .sh executables)
${hookLines}
│
├── docs/ (${docsCount} files)
${docLines}
│
└── agents/ (${agentsCount} sub-agents — each contains AGENT.md)
${agentLines}

Total: ${pkg.summary.totalFiles} files
Estimated value: ${pkg.summary.estimatedTimeSavings}
`;
}
