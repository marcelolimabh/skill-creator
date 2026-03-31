export interface ClaudeStructure {
  claudeMd: string;
  skills: ClaudeSkillFile[];
  hooks: ClaudeHookFile[];
  settings: ClaudeSettingsFile;  // .claude/settings.json — hook registration
  docs: ClaudeDocFile[];
  src?: ClaudeSrcFile[];
}

/** Represents .claude/settings.json — registers hooks into Claude Code events */
export interface ClaudeSettingsFile {
  content: string; // JSON string
}

export interface ClaudeSkillFile {
  filename: string;
  content: string;
  description: string;
}

export interface ClaudeHookFile {
  filename: string;
  content: string;
  event: string;
  description: string;
}

export interface ClaudeDocFile {
  filename: string;
  content: string;
  type: 'architecture' | 'api-reference' | 'onboarding' | 'guide';
  description: string;
}

export interface ClaudeSrcFile {
  filename: string;
  content: string;
  description: string;
}

export interface ClaudeProjectContext {
  projectName?: string;
  projectDescription?: string;
  framework: string;
  language: string;
  architecture?: string;
  database?: string[];
  authentication?: string;
  testing?: string[];
  deployment?: string;
  features?: string[];
}

export interface ClaudeTeamContext {
  teamSize?: 'solo' | 'small' | 'medium' | 'large';
  experience?: 'junior' | 'mid' | 'senior' | 'mixed';
  methodology?: 'agile' | 'waterfall' | 'kanban' | 'scrum';
  codeReviewProcess?: boolean;
  cicdPipeline?: boolean;
}

export interface ClaudeBusinessContext {
  industry?: string;
  businessGoals?: string[];
  qualityRequirements?: 'basic' | 'standard' | 'enterprise';
  performanceNeeds?: 'basic' | 'high' | 'extreme';
  securityRequirements?: 'basic' | 'standard' | 'high' | 'critical';
}