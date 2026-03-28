import { ClaudeHookFile, ClaudeProjectContext } from '../types/claude-structure';

export function generateHooks(context: ClaudeProjectContext): ClaudeHookFile[] {
  const hooks: ClaudeHookFile[] = [];

  hooks.push(generatePreCommitHook(context));
  hooks.push(generatePrePushHook(context));
  hooks.push(generatePostMergeHook(context));
  hooks.push(generateCodeQualityHook(context));
  hooks.push(generateSecurityScanHook(context));
  hooks.push(generateTestingHook(context));
  hooks.push(generateDeploymentValidationHook(context));

  return hooks;

}

function generatePreCommitHook(context: ClaudeProjectContext): ClaudeHookFile {
  const { language, framework, testing } = context;

  return {
    filename: 'pre-commit.yml',
    event: 'pre-commit',
    description: 'Automated quality checks before each commit to ensure code standards',
    content: `# Pre-commit Hook Configuration
# Runs automatically before each commit to ensure code quality and consistency

name: Pre-commit Quality Gate
description: Automated checks to maintain code quality and prevent issues

# Quality checks to perform before allowing commit
checks:
  # Code formatting and style
  - name: "Code Formatting"
    description: "Ensure consistent code style across the project"
    commands:
      ${language === 'TypeScript' || language === 'JavaScript' ? `
      - "npm run lint --fix"
      - "npm run format"
      ` : language === 'Java' ? `
      - "mvn spotless:apply"
      - "mvn checkstyle:check"
      ` : language === 'Python' ? `
      - "black ."
      - "flake8 ."
      - "isort ."
      ` : language === 'Go' ? `
      - "go fmt ./..."
      - "go vet ./..."
      - "golangci-lint run"
      ` : `
      - "# Add language-specific formatting commands"
      `}
    failure_action: "block_commit"
    
  # Static code analysis
  - name: "Static Analysis"
    description: "Detect potential bugs and security issues"
    commands:
      ${language === 'TypeScript' ? `
      - "npm run typecheck"
      - "npx eslint src/ --ext .ts,.tsx"
      ` : language === 'Java' ? `
      - "mvn compile"
      - "mvn spotbugs:check"
      ` : language === 'Python' ? `
      - "mypy src/"
      - "bandit -r src/"
      ` : `
      - "# Add language-specific analysis commands"
      `}
    failure_action: "block_commit"

  # Unit tests
  ${testing?.includes('Unit Tests') ? `
  - name: "Unit Tests"
    description: "Run fast unit tests to catch basic issues"
    commands:
      ${language === 'TypeScript' || language === 'JavaScript' ? `
      - "npm run test:unit"
      ` : language === 'Java' ? `
      - "mvn test"
      ` : language === 'Python' ? `
      - "pytest tests/unit/"
      ` : language === 'Go' ? `
      - "go test ./..."
      ` : `
      - "# Add unit test command"
      `}
    failure_action: "block_commit"
    timeout: 300 # 5 minutes max
  ` : ''}

  # Security checks
  - name: "Security Scan"
    description: "Check for secrets and basic security issues"
    commands:
      - "git secrets --scan"
      - "npm audit --audit-level moderate || true"
    failure_action: "warn"

  # Documentation updates
  - name: "Documentation Check"
    description: "Ensure documentation is updated when needed"
    commands:
      - "# Check if public API changes require doc updates"
      - "git diff --cached --name-only | grep -E '\\.(${language === 'TypeScript' ? 'ts|tsx' : language === 'Java' ? 'java' : language === 'Python' ? 'py' : 'go'})$' | head -1 | xargs -I {} echo 'Remember to update docs for: {}'"
    failure_action: "warn"

# Custom rules for this project
project_rules:
  # Prevent large files
  - name: "File Size Check"
    description: "Prevent accidentally committing large files"
    command: "find . -type f -size +10M | grep -v node_modules | grep -v .git"
    failure_message: "Large files detected. Use Git LFS or exclude from repository."
    failure_action: "block_commit"

  # Ensure proper commit message format
  - name: "Commit Message Format"
    description: "Enforce conventional commit message format"
    pattern: "^(feat|fix|docs|style|refactor|test|chore)(\\(.+\\))?: .{1,50}"
    examples:
      - "feat: add user authentication"
      - "fix(api): handle null pointer exception"
      - "docs: update API documentation"
    failure_action: "block_commit"

  # Branch protection
  - name: "Branch Protection"
    description: "Prevent direct commits to protected branches"
    protected_branches: ["main", "master", "production"]
    failure_message: "Direct commits to protected branches are not allowed. Use pull requests."
    failure_action: "block_commit"

# Automation helpers
automation:
  # Auto-fix common issues
  auto_fixes:
    - "Remove trailing whitespace"
    - "Fix imports organization"
    - "Update copyright headers"
    - "Generate/update API documentation"

  # Suggestions for developers
  suggestions:
    - "Run 'npm run dev' to start development server"
    - "Use 'git commit --no-verify' to bypass hooks in emergency"
    - "See CONTRIBUTING.md for development guidelines"

# Performance settings
performance:
  # Skip expensive checks for small changes
  skip_conditions:
    - "Only markdown files changed"
    - "Only documentation updated"
    - "Only test files modified"

  # Parallel execution for faster feedback
  parallel: true
  max_concurrent: 4

# Integration with development tools
integrations:
  # IDE integration
  vscode:
    settings: ".vscode/settings.json"
    extensions: ".vscode/extensions.json"
  
  # CI/CD integration  
  github_actions: ".github/workflows/ci.yml"
  
# Metrics and reporting
metrics:
  # Track hook performance
  execution_time: true
  success_rate: true
  
  # Developer experience metrics
  bypass_frequency: true
  failure_reasons: true

# Help and documentation
help:
  troubleshooting: |
    Common issues and solutions:
    
    1. Hook too slow:
       - Use 'git commit --no-verify' for urgent commits
       - Configure skip_conditions for your use case
    
    2. False positives:
       - Update the hook configuration
       - Add exceptions for special cases
    
    3. Setup issues:
       - Run 'npm install' to ensure dependencies
       - Check that pre-commit tools are installed
  
  contact: |
    Questions about this hook configuration?
    - Check project documentation
    - Ask in team chat
    - Create an issue in the repository

# Generated by Skill Creator
metadata:
  version: "1.0.0"
  generated_date: "${new Date().toISOString().split('T')[0]}"
  project_framework: "${framework}"
  project_language: "${language}"
  last_updated: "${new Date().toISOString().split('T')[0]}"
`
  };
}

function generatePrePushHook(context: ClaudeProjectContext): ClaudeHookFile {
  const { testing, deployment } = context;

  return {
    filename: 'pre-push.yml',
    event: 'pre-push',
    description: 'Comprehensive testing and validation before pushing code to remote',
    content: `# Pre-push Hook Configuration
# Runs before pushing to ensure code is ready for collaboration/deployment

name: Pre-push Validation Gate
description: Comprehensive testing and validation before pushing changes

# Validation pipeline
validation_pipeline:
  # Extended test suite
  - name: "Full Test Suite"
    description: "Run comprehensive tests before sharing code"
    stages:
      ${testing?.includes('Unit Tests') ? `
      - name: "Unit Tests"
        command: "npm run test:unit"
        required: true
        timeout: 600
      ` : ''}
      
      ${testing?.includes('Integration Tests') ? `
      - name: "Integration Tests" 
        command: "npm run test:integration"
        required: true
        timeout: 900
      ` : ''}
      
      ${testing?.includes('E2E') ? `
      - name: "E2E Tests"
        command: "npm run test:e2e"
        required: false # Can be slow, make optional
        timeout: 1800
      ` : ''}

  # Performance regression tests
  - name: "Performance Validation"
    description: "Ensure no significant performance regressions"
    commands:
      - "npm run test:performance"
      - "npm run benchmark"
    threshold_checks:
      - metric: "api_response_time"
        max_increase: "20%" # Don't allow >20% regression
      - metric: "memory_usage"
        max_increase: "15%"
    failure_action: "warn"

  # Security validation
  - name: "Security Checks"
    description: "Advanced security scanning before push"
    commands:
      - "npm audit --audit-level high"
      - "npm run security:scan"
      - "git log --oneline HEAD~10..HEAD | grep -i -E '(password|secret|key|token)' && exit 1 || true"
    failure_action: "block_push"

  # Build verification
  - name: "Build Verification"
    description: "Ensure code builds successfully in clean environment"
    commands:
      - "npm run clean"
      - "npm ci"
      - "npm run build"
    cache_policy: "no_cache" # Force clean build
    failure_action: "block_push"

# Branch-specific rules
branch_rules:
  main:
    - name: "Production Readiness"
      description: "Extra checks for main branch pushes"
      requirements:
        - "All tests must pass"
        - "Code coverage >= 80%"
        - "No TODO comments in production code"
        - "All environment configs verified"
      
  develop:
    - name: "Development Standards"
      description: "Standard checks for development branch"
      requirements:
        - "Core tests must pass"
        - "Basic linting compliance"
        - "No merge conflicts"

  feature/*:
    - name: "Feature Branch Validation"
      description: "Validation for feature branches"
      requirements:
        - "Unit tests for new code"
        - "Integration tests where applicable"
        - "Documentation updates"

# Deployment readiness (if applicable)
${deployment ? `
deployment_checks:
  - name: "Deployment Configuration"
    description: "Validate deployment configuration and environment setup"
    checks:
      ${deployment === 'Docker' ? `
      - name: "Docker Build"
        command: "docker build -t test-image ."
        required: true
      - name: "Container Security"
        command: "docker scan test-image"
        required: false
      ` : deployment === 'Kubernetes' ? `
      - name: "Kubernetes Manifest Validation"
        command: "kubectl apply --dry-run=client -f k8s/"
        required: true
      - name: "Helm Chart Validation"
        command: "helm template . | kubectl apply --dry-run=client -f -"
        required: true
      ` : deployment === 'AWS' ? `
      - name: "CloudFormation Validation"
        command: "aws cloudformation validate-template --template-body file://infrastructure/template.yaml"
        required: true
      ` : `
      - name: "Deployment Config Check"
        command: "# Add deployment-specific validation"
        required: false
      `}

  - name: "Environment Variables"
    description: "Ensure all required environment variables are documented"
    command: "grep -r 'process.env\\|os.getenv\\|System.getenv' src/ | cut -d: -f2 | sort | uniq"
    validation: "documented_in_env_example"
` : ''}

# Quality gates
quality_gates:
  # Code coverage requirements
  coverage:
    minimum: 70
    target: 85
    exclude_patterns:
      - "**/*.test.*"
      - "**/tests/**"
      - "**/*.spec.*"

  # Complexity thresholds
  complexity:
    max_cyclomatic: 10
    max_cognitive: 15
    max_function_length: 50

  # Documentation requirements
  documentation:
    api_coverage: 80 # API endpoints must be documented
    public_methods: 90 # Public methods must have documentation

# Performance monitoring
performance_monitoring:
  # Track hook execution time
  metrics:
    - execution_time
    - success_rate
    - failure_reasons
    - developer_bypass_rate

  # Performance targets for the hook itself
  targets:
    max_execution_time: "5 minutes"
    success_rate_target: "95%"

# Developer experience
developer_experience:
  # Provide helpful feedback
  feedback:
    on_success: "✅ All checks passed! Your code is ready to push."
    on_failure: "❌ Some checks failed. See details above."
    on_warning: "⚠️ Warnings detected. Consider addressing before pushing."

  # Emergency bypass
  emergency_bypass:
    command: "git push --no-verify"
    warning: "Emergency bypass used. Please address issues in follow-up commit."
    notification: "team_slack_channel" # Optional team notification

  # Helpful commands
  suggested_commands:
    fix_linting: "npm run lint --fix"
    run_tests: "npm run test"
    check_coverage: "npm run test:coverage"
    view_performance: "npm run test:performance"

# Team collaboration features
collaboration:
  # Notify team of significant changes
  notifications:
    - condition: "large_changeset" # >100 files changed
      action: "notify_team"
      message: "Large changeset detected. Consider breaking into smaller PRs."
    
    - condition: "api_changes"
      action: "notify_api_team"
      message: "API changes detected. Review breaking changes."

  # Automatic issue creation for failures
  issue_automation:
    create_issue_on: "repeated_failures"
    issue_template: ".github/ISSUE_TEMPLATE/hook_failure.md"

# Continuous improvement
continuous_improvement:
  # Collect metrics for hook optimization
  analytics:
    - track: "most_common_failures"
    - track: "slowest_checks"
    - track: "developer_satisfaction"

  # Automatic suggestions
  optimization_suggestions:
    - "Consider caching dependencies to speed up builds"
    - "Parallel test execution could reduce wait time"
    - "Skip expensive checks for documentation-only changes"

# Generated metadata
metadata:
  version: "1.0.0"
  generated_date: "${new Date().toISOString().split('T')[0]}"
  hook_type: "pre-push"
  estimated_execution_time: "2-5 minutes"
  last_updated: "${new Date().toISOString().split('T')[0]}"
`
  };
}

function generatePostMergeHook(context: ClaudeProjectContext): ClaudeHookFile {
  return {
    filename: 'post-merge.yml',
    event: 'post-merge',
    description: 'Automatic setup and synchronization after merge operations',
    content: `# Post-merge Hook Configuration
# Automatic actions after successful merges to keep environment synchronized

name: Post-merge Synchronization
description: Automatic environment updates and cleanup after merges

# Synchronization actions
sync_actions:
  # Dependency management
  - name: "Dependency Sync"
    description: "Update dependencies when package files change"
    triggers:
      - "package*.json changed"
      - "requirements*.txt changed"  
      - "go.mod changed"
      - "pom.xml changed"
      - "Cargo.toml changed"
    commands:
      - "npm ci"
      - "npm run postinstall || true"
    notifications:
      success: "✅ Dependencies updated successfully"
      failure: "❌ Dependency update failed. Run 'npm ci' manually."

  # Database migrations
  - name: "Database Migration"
    description: "Run pending database migrations"
    triggers:
      - "migrations/ directory changed"
      - "database/ directory changed"
    commands:
      - "npm run db:migrate"
      - "npm run db:seed:dev || true"
    conditions:
      - "development_environment"
    notifications:
      success: "✅ Database migrations applied"
      failure: "❌ Migration failed. Check database connection."

  # Environment configuration
  - name: "Environment Setup"
    description: "Update environment configuration"
    triggers:
      - ".env.example changed"
      - "config/ directory changed"
    commands:
      - "cp .env.example .env.local || true"
      - "npm run config:validate || true"
    notifications:
      info: "ℹ️ Environment files updated. Check .env.local configuration."

  # Code generation
  - name: "Code Generation"
    description: "Regenerate auto-generated code"
    triggers:
      - "schema/ directory changed"
      - "*.graphql changed"
      - "openapi.yaml changed"
    commands:
      - "npm run generate"
      - "npm run codegen"
    notifications:
      success: "✅ Code generation completed"

# Cleanup operations
cleanup_operations:
  # Remove obsolete files
  - name: "Cleanup Obsolete Files"
    description: "Remove files that are no longer needed"
    actions:
      - "rm -rf node_modules/.cache || true"
      - "rm -rf dist/ || true"
      - "rm -rf build/ || true"
    conditions:
      - "major_dependency_update"

  # Clear caches
  - name: "Cache Cleanup"
    description: "Clear various caches after significant changes"
    triggers:
      - "webpack.config.js changed"
      - "vite.config.ts changed"
      - "next.config.js changed"
    commands:
      - "npm run clean"
      - "rm -rf .next/cache || true"
      - "rm -rf node_modules/.cache || true"

# Team notifications
team_notifications:
  # Significant changes
  - name: "Breaking Changes Alert"
    description: "Notify team of potentially breaking changes"
    triggers:
      - "major_version_bump"
      - "api_schema_changes"
      - "database_schema_changes"
    message: |
      🚨 Breaking changes detected in latest merge:
      - Check migration guides
      - Update your local environment
      - Review API documentation
    channels: ["#dev-team", "#api-changes"]

  # New feature announcements
  - name: "Feature Announcements"
    description: "Announce new features to the team"
    triggers:
      - "feature_branch_merged"
    message: |
      🎉 New feature merged: {feature_name}
      - Documentation: {docs_link}
      - Testing guide: {test_guide}
    channels: ["#feature-updates"]

# Development environment health checks
health_checks:
  # Verify critical services
  - name: "Service Health Check"
    description: "Verify that critical services are accessible"
    checks:
      - name: "Database Connection"
        command: "npm run db:ping"
        timeout: 10
      
      - name: "External API Connectivity"
        command: "npm run health:external-apis"
        timeout: 15
        
      - name: "Local Server Startup"
        command: "timeout 30 npm run dev:test || true"
        timeout: 35

  # Environment validation
  - name: "Environment Validation"
    description: "Ensure development environment is properly configured"
    checks:
      - "Required environment variables are set"
      - "Development certificates are valid"
      - "Required ports are available"
      - "Development tools are installed"

# Automation suggestions
automation_suggestions:
  # Suggest useful commands
  - name: "Development Commands"
    description: "Suggest relevant commands based on changes"
    suggestions:
      database_changes: "Run 'npm run db:reset' to refresh local database"
      api_changes: "Run 'npm run test:api' to verify API compatibility"
      frontend_changes: "Run 'npm run dev' to see changes locally"
      test_changes: "Run 'npm run test' to verify test suite"

# Performance optimization
performance_optimization:
  # Background tasks
  background_tasks:
    - "Precompile frequently used templates"
    - "Warm up development server cache"
    - "Index search documents"
    - "Generate development data"

  # Parallel execution
  parallel_execution:
    enabled: true
    max_concurrent: 3
    priority_order:
      - "dependency_sync"
      - "database_migration"
      - "code_generation"

# Security measures
security_measures:
  # Scan for secrets in new code
  - name: "Secret Scanning"
    description: "Check merged code for accidentally committed secrets"
    command: "git log --oneline HEAD~5..HEAD | xargs git show | grep -E '(password|secret|key|token)='"
    failure_action: "alert_security_team"

  # Dependency vulnerability check
  - name: "Vulnerability Assessment"
    description: "Check new dependencies for known vulnerabilities"
    command: "npm audit --audit-level high"
    failure_action: "create_security_issue"

# Rollback preparation
rollback_preparation:
  # Backup critical data
  - name: "Development Backup"
    description: "Backup development data before significant changes"
    triggers:
      - "schema_migration"
      - "major_update"
    commands:
      - "npm run backup:dev"
    retention: "7 days"

# Integration with development tools
tool_integrations:
  # IDE configuration updates
  ide_updates:
    vscode:
      - "Update workspace settings"
      - "Refresh extension recommendations"
    
  # Update development documentation
  docs_updates:
    - "Regenerate API documentation"
    - "Update development guides"
    - "Refresh troubleshooting guides"

# Metrics and monitoring
metrics:
  # Track hook effectiveness
  tracking:
    - "Successful synchronizations"
    - "Failed operations and reasons"
    - "Time saved through automation"
    - "Developer satisfaction scores"

  # Performance metrics
  performance:
    - "Hook execution time"
    - "Background task completion"
    - "Cache hit rates"

# Error handling and recovery
error_handling:
  # Graceful failure handling
  failure_recovery:
    - "Log detailed error information"
    - "Suggest manual recovery steps"
    - "Notify relevant team members"
    - "Create recovery documentation"

  # Retry mechanisms
  retry_policy:
    max_attempts: 3
    backoff_strategy: "exponential"
    retry_conditions:
      - "network_timeout"
      - "temporary_service_unavailable"

# Generated metadata
metadata:
  version: "1.0.0"
  generated_date: "${new Date().toISOString().split('T')[0]}"
  hook_type: "post-merge"
  estimated_execution_time: "30-90 seconds"
  last_updated: "${new Date().toISOString().split('T')[0]}"
`
  };
}

function generateCodeQualityHook(context: ClaudeProjectContext): ClaudeHookFile {
  const { language, framework } = context;
  
  return {
    filename: 'code-quality.yml',
    event: 'code-analysis',
    description: 'Continuous code quality monitoring and improvement suggestions',
    content: `# Code Quality Hook Configuration
# Continuous monitoring and improvement of code quality metrics

name: Code Quality Monitor
description: Automated code quality assessment and improvement guidance

# Quality metrics tracking
quality_metrics:
  # Code complexity analysis
  complexity:
    - name: "Cyclomatic Complexity"
      threshold: 10
      measurement: "per_function"
      action_on_exceed: "warn_and_suggest_refactor"
      
    - name: "Cognitive Complexity" 
      threshold: 15
      measurement: "per_function"
      action_on_exceed: "require_documentation"
      
    - name: "Nesting Depth"
      threshold: 4
      measurement: "per_function"
      action_on_exceed: "suggest_guard_clauses"

  # Code coverage tracking
  coverage:
    - name: "Line Coverage"
      minimum: 70
      target: 85
      trend_tracking: true
      
    - name: "Branch Coverage"
      minimum: 65
      target: 80
      
    - name: "Function Coverage"
      minimum: 80
      target: 95

  # Code quality indicators
  quality_indicators:
    - name: "Duplicated Code"
      threshold: "5%" # Max 5% duplicated lines
      detection: "semantic_similarity"
      
    - name: "Technical Debt Ratio"
      threshold: "15%" # Max 15% of development time for debt
      calculation: "sonarqube_method"
      
    - name: "Maintainability Index"
      minimum: 70 # 0-100 scale
      factors: ["complexity", "size", "documentation"]

# Language-specific quality rules
${language}_quality_rules:
  ${language === 'TypeScript' ? `
  typescript_specific:
    - name: "Type Safety"
      rules:
        - "No 'any' types except in migration code"
        - "Strict null checks enabled"
        - "No implicit returns"
        - "Prefer interfaces over type aliases for object types"
      
    - name: "Modern JavaScript Practices"
      rules:
        - "Use const/let instead of var"
        - "Prefer async/await over Promises"
        - "Use optional chaining and nullish coalescing"
        - "Avoid function declarations in blocks"
  ` : language === 'Java' ? `
  java_specific:
    - name: "Java Best Practices"
      rules:
        - "Prefer composition over inheritance"
        - "Use appropriate collection types"
        - "Proper exception handling"
        - "Resource management with try-with-resources"
        
    - name: "Spring Framework Conventions"
      rules:
        - "Proper dependency injection"
        - "Use of appropriate annotations"
        - "Stateless service design"
        - "Proper transaction boundaries"
  ` : language === 'Python' ? `
  python_specific:
    - name: "Python Style Guide (PEP 8)"
      rules:
        - "Function and variable naming conventions"
        - "Proper import organization"
        - "Line length limits (88 characters)"
        - "Use of type hints"
        
    - name: "Pythonic Code Patterns"
      rules:
        - "Use list comprehensions appropriately"
        - "Context managers for resource handling"
        - "Duck typing over explicit type checking"
        - "Avoid mutable default arguments"
  ` : `
  general_quality_rules:
    - "Consistent naming conventions"
    - "Appropriate function and class sizes"
    - "Clear and meaningful comments"
    - "Proper error handling"
  `}

# Automated code analysis
automated_analysis:
  # Static analysis tools
  static_analysis:
    ${language === 'TypeScript' || language === 'JavaScript' ? `
    - tool: "ESLint"
      config: ".eslintrc.json"
      rules: "strict"
      auto_fix: true
      
    - tool: "TypeScript Compiler"
      strict_mode: true
      no_implicit_any: true
      
    - tool: "SonarJS"
      quality_gate: "strict"
      bug_threshold: 0
      vulnerability_threshold: 0
    ` : language === 'Java' ? `
    - tool: "SpotBugs"
      effort: "max"
      confidence: "medium"
      
    - tool: "PMD"
      rule_sets: ["best-practices", "security"]
      
    - tool: "Checkstyle"
      config: "google_checks.xml"
      
    - tool: "SonarJava"
      quality_gate: "strict"
    ` : language === 'Python' ? `
    - tool: "Flake8"
      max_line_length: 88
      ignore: ["E203", "W503"]
      
    - tool: "Pylint"
      disable: ["C0111"] # Missing docstring
      
    - tool: "Bandit"
      confidence: "medium"
      severity: "medium"
      
    - tool: "mypy"
      strict: true
      warn_unused_ignores: true
    ` : `
    - tool: "Generic linter for ${language}"
      configuration: "project_specific"
    `}

  # Runtime analysis
  runtime_analysis:
    - name: "Performance Profiling"
      triggers: ["performance_test_run"]
      metrics: ["cpu_usage", "memory_allocation", "response_time"]
      
    - name: "Memory Leak Detection"
      frequency: "weekly"
      threshold: "5% memory growth per hour"
      
    - name: "Security Vulnerability Scanning"
      frequency: "daily"
      tools: ["dependency_scanner", "code_scanner"]

# Quality improvement automation
quality_improvement:
  # Automated refactoring suggestions
  refactoring_suggestions:
    - pattern: "long_method"
      threshold: 30 # lines
      suggestion: "Consider breaking this method into smaller, focused methods"
      
    - pattern: "large_class"
      threshold: 500 # lines
      suggestion: "This class might have too many responsibilities"
      
    - pattern: "duplicate_code"
      threshold: 6 # lines
      suggestion: "Consider extracting this code into a shared function"
      
    - pattern: "complex_conditional"
      threshold: 5 # nested levels
      suggestion: "Consider using early returns or strategy pattern"

  # Code generation assistance
  code_generation:
    - trigger: "missing_tests"
      action: "generate_test_template"
      template: "jest_unit_test" # or appropriate for language
      
    - trigger: "missing_documentation"
      action: "generate_doc_template"
      format: "jsdoc" # or appropriate for language
      
    - trigger: "missing_error_handling"
      action: "suggest_error_patterns"

# Code review automation
automated_review:
  # Pre-review checks
  pre_review_checks:
    - "All tests pass"
    - "Code coverage meets minimum threshold"
    - "No critical security issues"
    - "Documentation updated for public APIs"
    - "Performance impact assessed"

  # Review comment generation
  review_comments:
    - category: "best_practices"
      severity: "suggestion"
      auto_generate: true
      
    - category: "security"
      severity: "must_fix"
      auto_generate: true
      require_human_review: true
      
    - category: "performance"
      severity: "consider"
      auto_generate: true
      include_benchmarks: true

# Quality trend monitoring
trend_monitoring:
  # Historical tracking
  metrics_tracking:
    - "Code coverage trends over time"
    - "Technical debt accumulation rate"
    - "Bug introduction and resolution rates"
    - "Code review cycle time"
    - "Refactoring frequency and impact"

  # Quality regression detection
  regression_detection:
    - metric: "test_coverage"
      threshold_decrease: "5%"
      action: "block_merge"
      
    - metric: "complexity_score"
      threshold_increase: "20%"
      action: "require_explanation"
      
    - metric: "duplicate_code"
      threshold_increase: "10%"
      action: "suggest_refactor"

# Team quality culture
quality_culture:
  # Knowledge sharing
  knowledge_sharing:
    - "Weekly code quality tips"
    - "Best practice examples from codebase"
    - "Refactoring success stories"
    - "Quality metric dashboards"

  # Gamification
  gamification:
    - "Code quality improvement leaderboard"
    - "Technical debt reduction achievements"
    - "Test coverage improvement rewards"
    - "Clean code contribution recognition"

  # Learning opportunities
  learning_opportunities:
    - "Automated code review training"
    - "Refactoring workshops"
    - "Security awareness sessions"
    - "Performance optimization guides"

# Integration with development workflow
workflow_integration:
  # IDE integration
  ide_plugins:
    - "Real-time quality feedback"
    - "Refactoring suggestions"
    - "Code completion based on patterns"
    - "Instant documentation generation"

  # CI/CD integration
  cicd_integration:
    - "Quality gate enforcement"
    - "Automated quality reporting"
    - "Performance regression detection"
    - "Security vulnerability blocking"

# Reporting and dashboards
reporting:
  # Quality dashboards
  dashboards:
    - name: "Team Quality Overview"
      metrics: ["coverage", "complexity", "debt_ratio"]
      frequency: "daily"
      
    - name: "Code Health Trends"
      metrics: ["quality_trends", "improvement_velocity"]
      frequency: "weekly"
      
    - name: "Technical Debt Analysis"
      metrics: ["debt_hotspots", "remediation_estimates"]
      frequency: "monthly"

  # Automated reports
  reports:
    - type: "quality_summary"
      recipients: ["team_leads", "architects"]
      frequency: "weekly"
      
    - type: "improvement_recommendations"
      recipients: ["development_team"]
      frequency: "monthly"

# Generated metadata
metadata:
  version: "1.0.0"
  generated_date: "${new Date().toISOString().split('T')[0]}"
  framework: "${framework}"
  language: "${language}"
  hook_type: "code-quality"
  last_updated: "${new Date().toISOString().split('T')[0]}"
`
  };
}

function generateSecurityScanHook(context: ClaudeProjectContext): ClaudeHookFile {
  return {
    filename: 'security-scan.yml',
    event: 'security-check',
    description: 'Automated security scanning and vulnerability detection',
    content: `# Security Scan Hook Configuration
# Comprehensive security scanning and vulnerability management

name: Security Scanner
description: Automated security vulnerability detection and remediation guidance

# Security scan types
scan_types:
  # Static Application Security Testing (SAST)
  sast:
    - name: "Source Code Security Scan"
      description: "Analyze source code for security vulnerabilities"
      tools:
        - "semgrep"
        - "bandit" # Python
        - "eslint-plugin-security" # JavaScript/TypeScript
        - "spotbugs-security" # Java
      severity_levels: ["critical", "high", "medium", "low"]
      auto_fix: ["low", "medium"] # Only auto-fix lower severity issues
      
    - name: "Secrets Detection"
      description: "Scan for accidentally committed secrets and credentials"
      tools:
        - "git-secrets"
        - "truffleHog"
        - "detect-secrets"
      patterns:
        - "API keys"
        - "Database passwords"
        - "Private keys"
        - "OAuth tokens"
        - "AWS credentials"
      failure_action: "block_commit"

  # Dynamic Application Security Testing (DAST)
  dast:
    - name: "Running Application Scan"
      description: "Test running application for security vulnerabilities"
      tools:
        - "zap" # OWASP ZAP
        - "burp-suite"
      test_scenarios:
        - "SQL injection testing"
        - "XSS vulnerability detection"
        - "Authentication bypass attempts"
        - "Authorization testing"
      environment: "security_testing"

  # Software Composition Analysis (SCA)
  sca:
    - name: "Dependency Vulnerability Scan"
      description: "Check third-party dependencies for known vulnerabilities"
      tools:
        - "npm audit"
        - "snyk"
        - "safety" # Python
        - "bundler-audit" # Ruby
      databases:
        - "National Vulnerability Database"
        - "GitHub Security Advisories"
        - "Snyk Vulnerability Database"
      auto_remediation:
        - "Update to patched versions"
        - "Apply security patches"
        - "Suggest alternative packages"

# Security policies
security_policies:
  # Vulnerability severity handling
  severity_handling:
    critical:
      action: "immediate_block"
      notification: "security_team_urgent"
      sla: "4_hours"
      escalation: "ciso"
      
    high:
      action: "block_merge"
      notification: "security_team"
      sla: "24_hours"
      escalation: "security_lead"
      
    medium:
      action: "warning"
      notification: "dev_team"
      sla: "7_days"
      tracking: "required"
      
    low:
      action: "log"
      notification: "weekly_report"
      sla: "30_days"
      tracking: "optional"

  # Compliance requirements
  compliance:
    standards: ["OWASP_Top_10", "CWE_Top_25", "SANS_Top_25"]
    frameworks: ["ISO_27001", "SOC_2", "PCI_DSS"]
    reporting: "automated_compliance_reports"

# Security testing automation
automated_testing:
  # Authentication and authorization testing
  auth_testing:
    - name: "Authentication Bypass Testing"
      scenarios:
        - "SQL injection in login forms"
        - "JWT token manipulation"
        - "Session fixation attacks"
        - "Password reset vulnerabilities"
      
    - name: "Authorization Testing"
      scenarios:
        - "Privilege escalation attempts"
        - "Horizontal privilege violations"
        - "API endpoint access control"
        - "Resource-level permissions"

  # Input validation testing
  input_validation:
    - name: "Injection Attack Testing"
      attack_vectors:
        - "SQL injection"
        - "NoSQL injection"
        - "Command injection"
        - "LDAP injection"
        - "XPath injection"
      
    - name: "Cross-Site Scripting (XSS) Testing"
      types:
        - "Reflected XSS"
        - "Stored XSS"
        - "DOM-based XSS"
      payloads: "owasp_xss_payloads"

  # Business logic testing
  business_logic:
    - name: "Workflow Bypass Testing"
      scenarios:
        - "Step skipping in multi-step processes"
        - "Parameter tampering"
        - "Race condition exploitation"
        - "Time-of-check vs time-of-use"

# Security monitoring
security_monitoring:
  # Real-time threat detection
  threat_detection:
    - name: "Anomaly Detection"
      metrics:
        - "Unusual API call patterns"
        - "Failed authentication attempts"
        - "Data exfiltration indicators"
        - "Privilege escalation attempts"
      thresholds:
        - "5 failed logins in 5 minutes"
        - "Large data downloads"
        - "Access outside normal hours"
      
    - name: "Security Event Correlation"
      sources:
        - "Application logs"
        - "Web server logs"
        - "Database audit logs"
        - "Network traffic logs"

  # Security metrics tracking
  metrics:
    - "Mean time to detect (MTTD) security issues"
    - "Mean time to respond (MTTR) to incidents"
    - "Number of vulnerabilities by severity"
    - "Security test coverage percentage"
    - "False positive rates by scan type"

# Incident response automation
incident_response:
  # Automated response procedures
  automated_responses:
    - trigger: "critical_vulnerability_detected"
      actions:
        - "Block deployment pipeline"
        - "Notify security team immediately"
        - "Create incident ticket"
        - "Quarantine affected components"
      
    - trigger: "active_attack_detected"
      actions:
        - "Rate limit suspicious sources"
        - "Alert SOC team"
        - "Enable enhanced logging"
        - "Prepare incident response plan"

  # Escalation procedures
  escalation:
    - level_1: "Development team notification"
      timeframe: "15 minutes"
      responsibilities: ["Initial assessment", "Basic remediation"]
      
    - level_2: "Security team involvement"
      timeframe: "1 hour"
      responsibilities: ["Security analysis", "Impact assessment"]
      
    - level_3: "Management escalation"
      timeframe: "4 hours"
      responsibilities: ["Business impact review", "External communication"]

# Security remediation
remediation:
  # Automated fixes
  automated_fixes:
    - vulnerability_type: "outdated_dependency"
      action: "update_to_secure_version"
      validation: "regression_testing"
      
    - vulnerability_type: "missing_security_header"
      action: "add_security_headers"
      headers: ["CSP", "HSTS", "X-Frame-Options"]
      
    - vulnerability_type: "weak_cryptography"
      action: "upgrade_crypto_algorithms"
      standards: "current_best_practices"

  # Manual remediation guidance
  remediation_guides:
    - vulnerability: "SQL_injection"
      guide: |
        1. Use parameterized queries or prepared statements
        2. Validate and sanitize all user inputs
        3. Implement least-privilege database access
        4. Consider using an ORM with built-in protections
      
    - vulnerability: "XSS"
      guide: |
        1. Encode all user-controlled data in HTML output
        2. Use Content Security Policy (CSP) headers
        3. Validate inputs on both client and server
        4. Sanitize data before storing in database

# Security training integration
security_training:
  # Just-in-time training
  contextual_training:
    - trigger: "vulnerability_introduced"
      content: "Secure coding practices for detected issue type"
      delivery: "interactive_tutorial"
      
    - trigger: "security_scan_failure"
      content: "Understanding and fixing specific vulnerabilities"
      delivery: "guided_remediation"

  # Regular security awareness
  awareness_program:
    - frequency: "monthly"
      content: "Latest security threats and mitigation"
      format: "security_newsletter"
      
    - frequency: "quarterly"
      content: "Hands-on security testing workshop"
      format: "interactive_session"

# Integration with development tools
tool_integration:
  # IDE security plugins
  ide_integration:
    - plugin: "security_linter"
      real_time_feedback: true
      vulnerability_highlighting: true
      fix_suggestions: true
      
    - plugin: "secure_code_assistant"
      context_aware_guidance: true
      pattern_detection: true

  # CI/CD security gates
  cicd_integration:
    - stage: "build"
      checks: ["secret_scanning", "sast_analysis"]
      blocking: true
      
    - stage: "test"
      checks: ["dast_scanning", "api_security_testing"]
      blocking: false # Allow with warnings
      
    - stage: "deploy"
      checks: ["final_security_validation"]
      blocking: true

# Security documentation
documentation:
  # Automated documentation generation
  auto_documentation:
    - "Security architecture diagrams"
    - "Threat model updates"
    - "Security control inventory"
    - "Compliance mapping documents"

  # Security runbooks
  runbooks:
    - "Security incident response procedures"
    - "Vulnerability management process"
    - "Security testing guidelines"
    - "Secure development standards"

# Generated metadata
metadata:
  version: "1.0.0"
  generated_date: "${new Date().toISOString().split('T')[0]}"
  hook_type: "security-scan"
  compliance_frameworks: ["OWASP", "CIS", "NIST"]
  last_updated: "${new Date().toISOString().split('T')[0]}"
`
  };
}

function generateTestingHook(context: ClaudeProjectContext): ClaudeHookFile {
  const { testing, language } = context;

  return {
    filename: 'testing-automation.yml',
    event: 'test-execution',
    description: 'Comprehensive test automation and quality assurance',
    content: `# Testing Automation Hook Configuration
# Comprehensive testing strategy and quality assurance automation

name: Testing Automation Suite
description: Automated testing pipeline with quality gates and intelligent test execution

# Test execution strategy
test_strategy:
  # Test pyramid implementation
  test_pyramid:
    ${testing?.includes('Unit Tests') ? `
    unit_tests:
      percentage: 70
      execution_time_target: "< 5 minutes"
      parallel_execution: true
      coverage_target: 85
      tools: ["${language === 'JavaScript' || language === 'TypeScript' ? 'Jest/Vitest' : language === 'Java' ? 'JUnit 5' : language === 'Python' ? 'pytest' : 'language-specific'}"]
    ` : ''}
    
    ${testing?.includes('Integration Tests') ? `
    integration_tests:
      percentage: 20
      execution_time_target: "< 15 minutes"
      parallel_execution: limited
      coverage_focus: "critical_paths"
      tools: ["${language === 'JavaScript' || language === 'TypeScript' ? 'Supertest' : language === 'Java' ? 'Testcontainers' : language === 'Python' ? 'pytest-django' : 'integration-framework'}"]
    ` : ''}
    
    ${testing?.includes('E2E') ? `
    e2e_tests:
      percentage: 10
      execution_time_target: "< 30 minutes"
      parallel_execution: false
      focus: "critical_user_journeys"
      tools: ["Playwright", "Cypress"]
    ` : ''}

# Intelligent test execution
intelligent_testing:
  # Test selection based on changes
  change_based_testing:
    - name: "Affected Tests Detection"
      description: "Run only tests affected by code changes"
      algorithm: "dependency_analysis"
      fallback: "run_all_tests"
      confidence_threshold: 80
      
    - name: "Risk-Based Test Selection"
      description: "Prioritize tests based on risk and impact"
      factors:
        - "Code complexity changes"
        - "Historical failure rates"
        - "Business criticality"
        - "Recent deployment issues"

  # Flaky test management
  flaky_test_management:
    - detection: "statistical_analysis"
      threshold: "2_failures_in_10_runs"
      action: "quarantine_and_investigate"
      
    - retry_strategy: "exponential_backoff"
      max_retries: 3
      retry_conditions: ["network_timeout", "resource_unavailable"]

# Test quality assurance
test_quality:
  # Test code quality standards
  test_code_standards:
    - "Test naming conventions (Given-When-Then)"
    - "Test isolation and independence"
    - "Appropriate use of mocking and stubbing"
    - "Test data management and cleanup"
    - "Clear assertion messages"

  # Test coverage analysis
  coverage_analysis:
    line_coverage:
      minimum: 70
      target: 85
      exclude_patterns: ["**/*.test.*", "**/mocks/**"]
      
    branch_coverage:
      minimum: 65
      target: 80
      
    mutation_testing:
      enabled: true
      threshold: 75
      tools: ["Stryker", "PIT"]

# Test environments
test_environments:
  # Environment configuration
  environments:
    unit:
      isolation: "complete"
      external_dependencies: "mocked"
      database: "in_memory"
      execution: "parallel"
      
    integration:
      isolation: "service_level"
      external_dependencies: "containerized"
      database: "test_instance"
      execution: "sequential_per_service"
      
    e2e:
      isolation: "user_journey"
      external_dependencies: "staging_equivalent"
      database: "staging_like"
      execution: "sequential"

  # Environment health checks
  health_checks:
    - name: "Database Connectivity"
      command: "npm run db:health-check"
      timeout: 30
      
    - name: "External Service Mock Status"
      command: "curl -f http://localhost:3001/health"
      timeout: 10
      
    - name: "Test Data Seeding"
      command: "npm run test:seed"
      timeout: 60

# Test data management
test_data_management:
  # Test data strategies
  data_strategies:
    - name: "Builder Pattern"
      description: "Create test objects with builders for flexibility"
      use_cases: ["Unit tests", "Integration tests"]
      
    - name: "Factory Pattern"
      description: "Generate realistic test data"
      use_cases: ["Load testing", "E2E tests"]
      
    - name: "Fixture Files"
      description: "Static test data for predictable scenarios"
      use_cases: ["Golden path testing", "Regression tests"]

  # Data lifecycle management
  data_lifecycle:
    - phase: "setup"
      actions: ["Create fresh test data", "Seed required entities"]
      
    - phase: "execution"
      actions: ["Maintain data consistency", "Handle concurrent access"]
      
    - phase: "cleanup"
      actions: ["Remove test artifacts", "Reset database state"]

# Performance testing
performance_testing:
  # Load testing scenarios
  load_testing:
    - name: "API Performance Tests"
      tool: "Artillery/k6"
      scenarios:
        - "Normal load (100 users/second)"
        - "Peak load (500 users/second)"
        - "Stress test (1000+ users/second)"
      thresholds:
        - "95th percentile < 200ms"
        - "Error rate < 0.1%"
        - "Throughput > 1000 RPS"
        
    - name: "Database Performance"
      scenarios:
        - "Query performance under load"
        - "Connection pool stress testing"
        - "Large dataset operations"
      monitoring:
        - "Query execution time"
        - "Connection pool utilization"
        - "Database CPU and memory"

  # Performance regression detection
  regression_detection:
    - metric: "response_time"
      threshold: "20% increase"
      comparison: "last_5_builds"
      action: "flag_for_review"
      
    - metric: "memory_usage"
      threshold: "15% increase"
      comparison: "baseline"
      action: "performance_investigation"

# Test reporting and analytics
reporting:
  # Test execution reporting
  execution_reports:
    - format: "HTML dashboard"
      metrics: ["pass_rate", "execution_time", "coverage"]
      audience: "development_team"
      
    - format: "JUnit XML"
      integration: "CI/CD_pipeline"
      artifact_storage: "build_artifacts"
      
    - format: "Slack notification"
      triggers: ["test_failure", "coverage_drop"]
      recipients: "dev_channel"

  # Test analytics
  analytics:
    - "Test execution trends over time"
    - "Most frequently failing tests"
    - "Test execution time analysis"
    - "Coverage trend analysis"
    - "Flaky test identification"

# Continuous testing
continuous_testing:
  # Real-time feedback
  real_time_testing:
    - trigger: "code_change"
      tests: "affected_unit_tests"
      max_execution_time: "2_minutes"
      
    - trigger: "pull_request"
      tests: "full_test_suite"
      parallel_execution: true
      
    - trigger: "merge_to_main"
      tests: "comprehensive_suite_plus_e2e"
      deployment_gate: true

  # Background testing
  background_testing:
    - schedule: "hourly"
      tests: "smoke_tests"
      environment: "staging"
      
    - schedule: "nightly"
      tests: "full_regression_suite"
      environment: "pre_production"
      
    - schedule: "weekly"
      tests: "performance_and_security_tests"
      environment: "dedicated_testing"

# Test automation best practices
best_practices:
  # Test design principles
  design_principles:
    - "Write tests before or alongside code (TDD/BDD)"
    - "Keep tests simple and focused"
    - "Use descriptive test names and clear assertions"
    - "Avoid test interdependencies"
    - "Regular test refactoring and maintenance"

  # Test maintenance
  maintenance:
    - "Regular review of test effectiveness"
    - "Removal of obsolete or redundant tests"
    - "Update tests when requirements change"
    - "Performance optimization of slow tests"
    - "Documentation of complex test scenarios"

# Quality gates
quality_gates:
  # Pre-merge requirements
  pre_merge:
    - "All unit tests must pass"
    - "Code coverage must not decrease"
    - "No new high-severity issues"
    - "Performance tests within thresholds"
    
  # Pre-deployment requirements
  pre_deployment:
    - "Full test suite passes"
    - "E2E tests validate critical paths"
    - "Performance benchmarks met"
    - "Security tests pass"

# Integration with development workflow
workflow_integration:
  # IDE integration
  ide_features:
    - "Run tests on file save"
    - "Debug failing tests easily"
    - "Coverage visualization"
    - "Test result notifications"

  # Git hooks integration
  git_hooks:
    - "Run relevant tests on pre-commit"
    - "Validate test quality on pre-push"
    - "Update test documentation on post-merge"

# Team collaboration
collaboration:
  # Shared testing resources
  shared_resources:
    - "Common test utilities and helpers"
    - "Shared test data builders"
    - "Reusable test fixtures"
    - "Test environment templates"

  # Knowledge sharing
  knowledge_sharing:
    - "Testing best practices documentation"
    - "Test writing workshops"
    - "Code review focus on test quality"
    - "Regular testing retrospectives"

# Generated metadata
metadata:
  version: "1.0.0"
  generated_date: "${new Date().toISOString().split('T')[0]}"
  language: "${language}"
  testing_frameworks: ${JSON.stringify(testing || ['Basic testing'])}
  hook_type: "testing-automation"
  last_updated: "${new Date().toISOString().split('T')[0]}"
`
  };
}

function generateDeploymentValidationHook(context: ClaudeProjectContext): ClaudeHookFile {
  const { deployment, framework } = context;

  return {
    filename: 'deployment-validation.yml',
    event: 'pre-deployment',
    description: 'Comprehensive deployment readiness validation and safety checks',
    content: `# Deployment Validation Hook Configuration
# Comprehensive pre-deployment validation to ensure safe and successful releases

name: Deployment Validation Gateway
description: Multi-stage validation process before production deployment

# Deployment readiness checks
readiness_checks:
  # Code quality validation
  code_quality:
    - name: "Code Quality Gate"
      requirements:
        - "All tests passing with >85% coverage"
        - "No critical or high security vulnerabilities"
        - "Code complexity within acceptable limits"
        - "All static analysis checks passed"
      blocking: true
      
    - name: "Documentation Validation"
      requirements:
        - "API documentation updated for changes"
        - "Deployment notes provided"
        - "Breaking changes documented"
        - "Rollback procedures documented"
      blocking: false

  # Environment validation
  environment_validation:
    ${deployment === 'Kubernetes' ? `
    kubernetes:
      - name: "Cluster Health Check"
        validations:
          - "All nodes healthy and ready"
          - "Sufficient cluster resources available"
          - "Required namespaces exist"
          - "RBAC permissions configured"
        
      - name: "Configuration Validation"
        validations:
          - "ConfigMaps and Secrets exist"
          - "Persistent volumes available"
          - "Network policies configured"
          - "Service mesh configuration valid"
    ` : deployment === 'AWS' ? `
    aws:
      - name: "AWS Resources Validation"
        validations:
          - "Auto Scaling Groups healthy"
          - "Load Balancers operational"
          - "RDS instances available"
          - "CloudFormation stacks valid"
          
      - name: "IAM Permissions Check"
        validations:
          - "Service roles have required permissions"
          - "Cross-service access configured"
          - "Security groups properly configured"
    ` : deployment === 'Docker' ? `
    docker:
      - name: "Container Validation"
        validations:
          - "Docker images build successfully"
          - "Container security scan passed"
          - "Resource limits configured"
          - "Health checks defined"
          
      - name: "Registry Validation"
        validations:
          - "Images pushed to registry"
          - "Image tags properly versioned"
          - "Registry access permissions"
    ` : `
    general:
      - name: "Infrastructure Health"
        validations:
          - "Target servers accessible"
          - "Required services running"
          - "Database connectivity verified"
          - "External dependencies available"
    `}

# Deployment safety checks
safety_checks:
  # Backup verification
  backup_verification:
    - name: "Database Backup"
      description: "Ensure recent database backup exists"
      requirements:
        - "Backup completed within last 24 hours"
        - "Backup integrity verified"
        - "Restore procedure tested"
      automation: "pre_deployment_backup"
      
    - name: "Configuration Backup"
      description: "Backup current configuration"
      requirements:
        - "Application configuration stored"
        - "Infrastructure configuration versioned"
        - "Environment variables documented"

  # Rollback preparation
  rollback_preparation:
    - name: "Rollback Plan Validation"
      requirements:
        - "Previous version available"
        - "Rollback procedure documented and tested"
        - "Database migration rollback scripts ready"
        - "Feature flags configured for quick disable"
      
    - name: "Monitoring and Alerting"
      requirements:
        - "Health check endpoints responding"
        - "Monitoring dashboards configured"
        - "Alert rules for critical metrics"
        - "On-call rotation confirmed"

# Performance validation
performance_validation:
  # Load testing
  load_testing:
    - name: "Pre-deployment Load Test"
      description: "Validate performance under expected load"
      scenarios:
        - "Normal traffic simulation"
        - "Peak load simulation"
        - "Database performance under load"
      success_criteria:
        - "Response time < 200ms (95th percentile)"
        - "Error rate < 0.1%"
        - "Resource utilization < 70%"
      
    - name: "Capacity Planning Validation"
      description: "Ensure sufficient capacity for expected traffic"
      checks:
        - "Auto-scaling policies tested"
        - "Resource limits appropriate"
        - "Database connection pools sized correctly"

# Security validation
security_validation:
  # Security posture check
  security_posture:
    - name: "Vulnerability Assessment"
      description: "Final security scan before deployment"
      scans:
        - "Container/image vulnerability scan"
        - "Infrastructure security scan"
        - "Application security scan"
        - "Dependency vulnerability check"
      blocking_severity: "critical"
      
    - name: "Security Configuration"
      description: "Validate security settings"
      checks:
        - "TLS/SSL certificates valid and current"
        - "Security headers configured"
        - "Access controls properly configured"
        - "Secrets management verified"

  # Compliance validation
  compliance:
    - name: "Regulatory Compliance"
      description: "Ensure compliance requirements are met"
      frameworks: ["SOC 2", "ISO 27001", "GDPR"]
      checks:
        - "Data handling procedures compliant"
        - "Audit logging configured"
        - "Privacy controls implemented"
        - "Incident response procedures ready"

# Business validation
business_validation:
  # Feature validation
  feature_validation:
    - name: "Feature Toggle Validation"
      description: "Ensure new features can be safely enabled/disabled"
      requirements:
        - "Feature flags configured"
        - "Gradual rollout plan defined"
        - "A/B testing setup validated"
        - "Rollback triggers defined"
        
    - name: "Business Logic Validation"
      description: "Validate critical business workflows"
      test_scenarios:
        - "User registration and authentication"
        - "Payment processing (if applicable)"
        - "Core business transactions"
        - "Data integrity checks"

  # Impact assessment
  impact_assessment:
    - name: "Change Impact Analysis"
      description: "Assess potential impact of changes"
      analysis:
        - "Breaking changes identified and communicated"
        - "Backward compatibility verified"
        - "Integration points tested"
        - "Third-party service dependencies validated"

# Deployment strategy validation
deployment_strategy:
  # Deployment method validation
  deployment_methods:
    blue_green:
      - "Blue environment healthy and ready"
      - "Green environment deployed and tested"
      - "Switch mechanism validated"
      - "Rollback plan confirmed"
      
    canary:
      - "Canary deployment configuration verified"
      - "Traffic splitting rules defined"
      - "Success metrics established"
      - "Automatic rollback triggers set"
      
    rolling:
      - "Rolling update configuration validated"
      - "Health checks configured"
      - "Resource availability confirmed"
      - "Zero-downtime deployment verified"

# Communication and coordination
communication:
  # Stakeholder notification
  notifications:
    - name: "Deployment Announcement"
      recipients: ["development_team", "qa_team", "product_team"]
      content:
        - "Deployment timeline"
        - "Features being deployed"
        - "Potential impact areas"
        - "Contact information for issues"
        
    - name: "Maintenance Window Communication"
      recipients: ["customers", "support_team", "operations"]
      content:
        - "Maintenance window schedule"
        - "Expected service impact"
        - "Support contact information"

  # Coordination checks
  coordination:
    - "All team members aware of deployment"
    - "Support team prepared for potential issues"
    - "Operations team on standby"
    - "Product team ready for feature validation"

# Post-deployment preparation
post_deployment:
  # Monitoring preparation
  monitoring_setup:
    - name: "Enhanced Monitoring"
      description: "Prepare enhanced monitoring for post-deployment"
      setup:
        - "Real-user monitoring activated"
        - "Performance dashboards ready"
        - "Error tracking configured"
        - "Business metrics tracking enabled"
        
    - name: "Alert Configuration"
      description: "Configure alerts for early issue detection"
      alerts:
        - "Application error rate thresholds"
        - "Performance degradation alerts"
        - "Business metric anomalies"
        - "Infrastructure health alerts"

  # Validation checklist
  validation_checklist:
    - name: "Post-deployment Validation Plan"
      checks:
        - "Smoke tests for critical functionality"
        - "Performance baseline establishment"
        - "User acceptance validation"
        - "Integration health verification"

# Automated validation execution
automation:
  # Validation pipeline
  validation_pipeline:
    stages:
      - name: "Pre-validation Setup"
        duration: "5 minutes"
        actions: ["Environment preparation", "Tool initialization"]
        
      - name: "Core Validations"
        duration: "15-30 minutes"
        actions: ["Security scans", "Performance tests", "Integration tests"]
        
      - name: "Final Checks"
        duration: "5 minutes"
        actions: ["Configuration validation", "Readiness confirmation"]

  # Parallel execution
  parallel_execution:
    enabled: true
    max_concurrent: 3
    execution_groups:
      - "Security and compliance checks"
      - "Performance and load testing"
      - "Integration and functionality testing"

# Decision gates
decision_gates:
  # Go/No-go criteria
  deployment_approval:
    automatic_approval:
      conditions:
        - "All validation checks passed"
        - "No critical issues detected"
        - "Performance within acceptable limits"
        - "Security posture validated"
        
    manual_approval_required:
      conditions:
        - "Medium-risk changes detected"
        - "Performance slightly outside limits"
        - "Minor security concerns identified"
        
    deployment_blocked:
      conditions:
        - "Critical security vulnerabilities"
        - "Performance significantly degraded"
        - "Integration tests failing"
        - "Backup/rollback procedures incomplete"

# Generated metadata
metadata:
  version: "1.0.0"
  generated_date: "${new Date().toISOString().split('T')[0]}"
  deployment_target: "${deployment || 'generic'}"
  framework: "${framework}"
  hook_type: "deployment-validation"
  estimated_execution_time: "20-45 minutes"
  last_updated: "${new Date().toISOString().split('T')[0]}"
`
  };
}