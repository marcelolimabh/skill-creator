import { ClaudeProjectContext, ClaudeTeamContext, ClaudeBusinessContext } from '../types/claude-structure';

export function generateClaudeMd(
  projectContext: ClaudeProjectContext,
  teamContext: ClaudeTeamContext = {},
  businessContext: ClaudeBusinessContext = {}
): string {
  const { 
    projectName = 'My Project',
    projectDescription = 'A software project built with modern technologies',
    framework, 
    language, 
    architecture, 
    database, 
    authentication, 
    testing, 
    deployment, 
    features 
  } = projectContext;

  const { 
    teamSize = 'medium', 
    experience = 'mixed', 
    methodology = 'agile',
    codeReviewProcess = true,
    cicdPipeline = true
  } = teamContext;

  const {
    qualityRequirements = 'standard',
    performanceNeeds = 'standard', 
    securityRequirements = 'standard'
  } = businessContext;

  return `# Claude Code Brain 🧠

## Project Context
- **Name:** ${projectName}
- **Framework:** ${framework}
- **Language:** ${language}
${architecture ? `- **Architecture:** ${architecture}` : ''}
${database?.length ? `- **Database:** ${database.join(', ')}` : ''}
${authentication ? `- **Authentication:** ${authentication}` : ''}
${deployment ? `- **Deployment:** ${deployment}` : ''}

## Description
${projectDescription}

## Team Context
- **Size:** ${teamSize}
- **Experience:** ${experience}
- **Methodology:** ${methodology}
- **Code Review:** ${codeReviewProcess ? 'Required' : 'Optional'}
- **CI/CD:** ${cicdPipeline ? 'Automated' : 'Manual'}

## Quality Standards
- **Quality Requirements:** ${qualityRequirements}
- **Performance Needs:** ${performanceNeeds}
- **Security Requirements:** ${securityRequirements}

## Core Principles

### 🎯 Development Philosophy
1. **Code Quality First**: Prioritize maintainable, readable code over quick fixes
2. **Security by Design**: Consider security implications in every decision
3. **Performance Awareness**: Write efficient code that scales with user growth
4. **Test-Driven Mindset**: Ensure comprehensive test coverage for reliability

### 📋 Code Standards
- Follow ${language} best practices and conventions
- Use descriptive variable and function names
- Write self-documenting code with meaningful comments
- Maintain consistent code style across the project
${testing?.length ? `- Implement ${testing.join(', ')} testing strategies` : ''}

### 🔒 Security Rules
${securityRequirements === 'critical' ? `
- **CRITICAL SECURITY**: Never log sensitive data (passwords, API keys, tokens)
- Validate ALL user inputs with strict sanitization
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization checks
- Regular security audits and vulnerability scanning
- Encrypt sensitive data both at rest and in transit
` : securityRequirements === 'high' ? `
- Never expose sensitive information in logs or error messages
- Validate and sanitize all user inputs
- Use secure authentication mechanisms
- Follow OWASP security guidelines
- Regular security reviews of critical components
` : `
- Basic input validation and sanitization
- Secure password handling and storage
- Protected API endpoints
- Follow framework security best practices
`}

### ⚡ Performance Guidelines
${performanceNeeds === 'extreme' ? `
- **EXTREME PERFORMANCE**: Optimize for sub-100ms response times
- Implement caching at multiple levels (application, database, CDN)
- Use database indexing and query optimization
- Async/await for non-blocking operations
- Memory management and garbage collection awareness
- Performance monitoring and alerting
` : performanceNeeds === 'high' ? `
- Target sub-500ms response times for critical paths
- Implement appropriate caching strategies
- Optimize database queries and use indexing
- Use lazy loading and pagination for large datasets
- Monitor performance metrics regularly
` : `
- Reasonable response times (< 2 seconds)
- Basic caching where appropriate
- Efficient database queries
- Avoid obvious performance bottlenecks
`}

### 🏗️ Architecture Patterns
${architecture ? `
**Primary Pattern:** ${architecture}

${architecture.includes('Microservices') ? `
- Service isolation and independence
- API-first design with clear contracts
- Event-driven communication where appropriate
- Independent deployment and scaling
- Circuit breaker patterns for resilience
` : architecture.includes('Hexagonal') || architecture.includes('Clean') ? `
- Business logic isolation from external concerns
- Dependency inversion and injection
- Clear boundaries between layers
- Testable and maintainable code structure
` : architecture.includes('DDD') ? `
- Domain-driven design principles
- Bounded contexts and aggregates
- Rich domain models
- Command and Query Responsibility Segregation
` : `
- Follow ${architecture} principles consistently
- Maintain clear separation of concerns
- Use dependency injection where appropriate
`}` : `
- Keep business logic separate from framework code
- Use dependency injection for loose coupling
- Follow single responsibility principle
- Implement proper error handling and logging
`}

## Communication Style

### 🤖 How to Work with Claude
- **Be Specific**: Provide clear requirements and context
- **Incremental Changes**: Break large features into smaller, manageable tasks
- **Review Code**: Always review generated code before merging
- **Test Everything**: Run tests after any code changes
- **Document Decisions**: Keep track of architectural and design decisions

### 📝 Code Review Checklist
- [ ] Code follows project conventions and style guidelines
- [ ] Proper error handling and edge case coverage
- [ ] Security considerations addressed
- [ ] Performance implications considered
- [ ] Tests added/updated for new functionality
- [ ] Documentation updated if necessary
- [ ] No sensitive information exposed

## Memory & Context

### 🧠 Key Project Information
${features?.length ? `- **Features**: ${features.join(', ')}` : ''}
- **Latest architectural decisions**: Check /docs/architecture/ for recent ADRs
- **Common patterns**: Refer to /docs/patterns/ for established solutions
- **Team conventions**: See /docs/conventions/ for coding standards
- **Deployment process**: Follow /docs/deployment/ for release procedures

### 🔄 Workflow Integration
1. **Pre-commit**: Use hooks for code quality checks
2. **Development**: Follow feature branch workflow
3. **Review**: Mandatory code review process
4. **Testing**: Automated testing in CI/CD pipeline
5. **Deployment**: ${cicdPipeline ? 'Automated deployment to staging/production' : 'Manual deployment process'}

### 📊 Success Metrics
- **Code Quality**: Maintain high test coverage and low complexity
- **Performance**: Meet response time targets
- **Security**: Zero critical vulnerabilities
- **Reliability**: Minimal production incidents
- **Developer Experience**: Efficient development and deployment cycles

---

*This CLAUDE.md serves as the central brain for this project. Update it as the project evolves to maintain context and ensure consistent AI assistance.*

**Last updated**: ${new Date().toISOString().split('T')[0]}
**Generated by**: [Skill Creator](https://github.com/marcelolimabh/skill-creator)`;
}