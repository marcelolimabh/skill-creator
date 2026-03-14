"use client";

import { useState, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Lang = "en" | "pt";
type Phase = "welcome" | "type" | "template" | "wizard" | "generating" | "result";
type ProjectType = "backend" | "frontend" | "fullstack";
type SecLevel = "safe" | "warning" | "danger";
type QType = "select" | "multi" | "text";

interface Question {
    id: string;
    label: string;
    type: QType;
    options?: string[] | Record<string, string[]>;
    depends?: string;
    placeholder?: string;
}

interface Template {
    id: string;
    icon: string;
    name: string;
    stack: "Backend" | "Frontend" | "Fullstack";
    desc: string;
    answers: Record<string, string | string[]> & { projectType: ProjectType };
}

interface SecurityResult {
    score: number;
    level: SecLevel;
    issues: { severity: "low" | "medium" | "high"; title: string; description: string }[];
    summary: string;
}

// ─── i18n ─────────────────────────────────────────────────────────────────────
const T: Record<Lang, Record<string, string>> = {
    en: {
        title: "Skill Creator", sub: "Generate production-ready Claude Skills",
        chooseLang: "Choose language", useTemplate: "Quick templates", startWizard: "Custom wizard",
        back: "Back", next: "Next", generate: "Generate Skill",
        generating: "Generating your skill…", validating: "Running security analysis…",
        downloadYaml: "Download YAML", downloadNpm: "Download npm package", downloadCli: "Download CLI",
        newSkill: "New skill", secReport: "Security report", skillOutput: "Generated skill",
        safe: "Safe", warning: "Warning", danger: "Danger", score: "Security score",
        copy: "Copy", copied: "Copied!", templates: "Quick-start templates",
        step: "Step", of: "of", projectType: "Project type",
        versionNote: "Versioning tip",
        diffNote: "Run `git diff .claude/skills/` to track skill changes over time.",
    },
    pt: {
        title: "Skill Creator", sub: "Gere Skills prontas para produção para o Claude",
        chooseLang: "Escolha o idioma", useTemplate: "Templates rápidos", startWizard: "Assistente personalizado",
        back: "Voltar", next: "Próximo", generate: "Gerar Skill",
        generating: "Gerando sua skill…", validating: "Executando análise de segurança…",
        downloadYaml: "Baixar YAML", downloadNpm: "Baixar pacote npm", downloadCli: "Baixar CLI",
        newSkill: "Nova skill", secReport: "Relatório de segurança", skillOutput: "Skill gerada",
        safe: "Seguro", warning: "Atenção", danger: "Perigo", score: "Score de segurança",
        copy: "Copiar", copied: "Copiado!", templates: "Templates rápidos",
        step: "Etapa", of: "de", projectType: "Tipo de projeto",
        versionNote: "Versionamento",
        diffNote: "Execute `git diff .claude/skills/` para rastrear mudanças na skill.",
    },
};

// ─── Questions ────────────────────────────────────────────────────────────────
const BACKEND_Q = (l: Lang): Question[] => [
    {
        id: "language", type: "select", label: l === "pt" ? "Linguagem de programação?" : "Programming language?",
        options: ["Java", "TypeScript", "Python", "Go", "Rust", "C#", "PHP", "Ruby", "Kotlin", "Swift", "C++"]
    },
    {
        id: "framework", type: "select", label: l === "pt" ? "Framework principal?" : "Main framework?", depends: "language",
        options: {
            Java: ["Spring Boot", "Quarkus", "Micronaut", "Jakarta EE", "Vert.x"],
            TypeScript: ["NestJS", "Express", "Fastify", "Hono", "tRPC"],
            Python: ["FastAPI", "Django", "Flask", "Litestar", "Tornado"],
            Go: ["Gin", "Echo", "Fiber", "Chi", "gRPC"],
            Rust: ["Actix-web", "Axum", "Rocket", "Warp"],
            "C#": [".NET 8 / ASP.NET Core", "Blazor Server", "gRPC", "Minimal API"],
            PHP: ["Laravel", "Symfony", "Slim"],
            Ruby: ["Rails", "Sinatra", "Hanami"],
            Kotlin: ["Ktor", "Spring Boot", "gRPC"],
            Swift: ["Vapor", "Hummingbird"],
            "C++": ["Boost.Beast", "Crow", "gRPC"]
        }
    },
    {
        id: "auth", type: "select", label: l === "pt" ? "Autenticação?" : "Authentication?",
        options: l === "pt" ? ["Nenhuma", "JWT", "OAuth2 / OpenID Connect", "Basic Auth", "API Key", "SAML", "Keycloak", "Auth0", "Firebase Auth"] :
            ["None", "JWT", "OAuth2 / OpenID Connect", "Basic Auth", "API Key", "SAML", "Keycloak", "Auth0", "Firebase Auth"]
    },
    {
        id: "architecture", type: "select", label: l === "pt" ? "Arquitetura?" : "Architecture?",
        options: ["MVC", "Hexagonal / Ports & Adapters", "Clean Architecture", "DDD + CQRS", "Microservices", "Serverless", "Event-Driven", "Modular Monolith"]
    },
    {
        id: "database", type: "multi", label: l === "pt" ? "Banco de dados?" : "Database(s)?",
        options: l === "pt" ? ["Nenhum", "PostgreSQL", "MySQL", "Oracle", "SQL Server", "MongoDB", "Redis", "Cassandra", "DynamoDB", "Elasticsearch", "Firebase"] :
            ["None", "PostgreSQL", "MySQL", "Oracle", "SQL Server", "MongoDB", "Redis", "Cassandra", "DynamoDB", "Elasticsearch", "Firebase"]
    },
    {
        id: "testing", type: "multi", label: l === "pt" ? "Estratégia de testes?" : "Testing strategy?",
        options: l === "pt" ? ["Nenhum", "Unit Tests", "Integration Tests", "E2E", "TDD", "BDD", "Contract Tests (Pact)"] :
            ["None", "Unit Tests", "Integration Tests", "E2E", "TDD", "BDD", "Contract Tests (Pact)"]
    },
    {
        id: "deploy", type: "select", label: l === "pt" ? "Onde vai rodar?" : "Deployment target?",
        options: ["Local / Dev", "Docker", "Kubernetes", "OCI", "AWS", "GCP", "Azure", "Vercel", "Bare Metal"]
    },
    {
        id: "extras", type: "multi", label: l === "pt" ? "Recursos adicionais?" : "Additional features?",
        options: l === "pt" ? ["Nenhum", "CI/CD", "Observabilidade (OpenTelemetry)", "Cache", "Kafka / RabbitMQ", "GraphQL", "gRPC", "WebSockets", "Feature Flags"] :
            ["None", "CI/CD", "Observability (OpenTelemetry)", "Cache", "Kafka / RabbitMQ", "GraphQL", "gRPC", "WebSockets", "Feature Flags"]
    },
    {
        id: "description", type: "text", label: l === "pt" ? "Descreva brevemente o projeto:" : "Briefly describe the project:",
        placeholder: l === "pt" ? "Ex: API de pagamentos PIX para banco digital…" : "e.g. REST API for a digital banking platform…"
    },
];

const FRONTEND_Q = (l: Lang): Question[] => [
    {
        id: "frontend_type", type: "select", label: l === "pt" ? "Tipo de frontend?" : "Frontend type?",
        options: ["Web App", "Mobile App", "Desktop App", "PWA", "Static Site"]
    },
    {
        id: "framework", type: "select", label: l === "pt" ? "Framework / biblioteca?" : "Framework / library?", depends: "frontend_type",
        options: {
            "Web App": ["React", "Vue 3", "Angular", "Svelte / SvelteKit", "Solid.js", "Qwik", "Astro", "Remix"],
            "Mobile App": ["React Native", "Expo", "Flutter", "Ionic", "NativeScript"],
            "Desktop App": ["Electron + React", "Electron + Vue", "Tauri + React", "Tauri + Vue"],
            "PWA": ["Next.js", "Nuxt 3", "Astro", "Vite + React"],
            "Static Site": ["Next.js (SSG)", "Nuxt (SSG)", "Astro", "Gatsby", "Hugo"]
        }
    },
    {
        id: "ui_lib", type: "select", label: l === "pt" ? "Biblioteca de UI?" : "UI library?",
        options: l === "pt" ? ["Nenhuma", "Tailwind CSS", "shadcn/ui", "MUI (Material)", "Ant Design", "Chakra UI", "Radix UI", "NativeBase"] :
            ["None", "Tailwind CSS", "shadcn/ui", "MUI (Material)", "Ant Design", "Chakra UI", "Radix UI", "NativeBase"]
    },
    {
        id: "state", type: "select", label: l === "pt" ? "Gerenciamento de estado?" : "State management?",
        options: l === "pt" ? ["Nenhum (Context API)", "Zustand", "Pinia", "Redux Toolkit", "Jotai", "Recoil", "XState", "MobX"] :
            ["None (Context API)", "Zustand", "Pinia", "Redux Toolkit", "Jotai", "Recoil", "XState", "MobX"]
    },
    {
        id: "data_fetch", type: "select", label: "Data fetching?",
        options: ["TanStack Query", "SWR", "Apollo Client", "tRPC", "Axios + custom hooks", "Native fetch"]
    },
    {
        id: "auth", type: "select", label: l === "pt" ? "Autenticação?" : "Authentication?",
        options: l === "pt" ? ["Nenhuma", "NextAuth.js", "Clerk", "Auth0", "Firebase Auth", "Supabase Auth", "Keycloak"] :
            ["None", "NextAuth.js", "Clerk", "Auth0", "Firebase Auth", "Supabase Auth", "Keycloak"]
    },
    {
        id: "testing", type: "multi", label: l === "pt" ? "Testes?" : "Testing?",
        options: l === "pt" ? ["Nenhum", "Vitest", "Jest", "React Testing Library", "Playwright", "Cypress", "Storybook"] :
            ["None", "Vitest", "Jest", "React Testing Library", "Playwright", "Cypress", "Storybook"]
    },
    {
        id: "deploy", type: "select", label: "Deploy?",
        options: ["Vercel", "Netlify", "AWS Amplify", "Firebase Hosting", "Cloudflare Pages", "Docker + Nginx", "App Store / Play Store"]
    },
    {
        id: "description", type: "text", label: l === "pt" ? "Descreva o projeto:" : "Describe the project:",
        placeholder: l === "pt" ? "Ex: App mobile de finanças pessoais com Expo…" : "e.g. Personal finance mobile app with Expo…"
    },
];

const FULLSTACK_Q = (l: Lang): Question[] => [
    {
        id: "frontend_fw", type: "select", label: l === "pt" ? "Framework frontend?" : "Frontend framework?",
        options: ["Next.js (React)", "Nuxt 3 (Vue)", "SvelteKit", "Remix", "Analog (Angular)", "Astro"]
    },
    {
        id: "backend_lang", type: "select", label: l === "pt" ? "Linguagem backend?" : "Backend language?",
        options: ["TypeScript (Node)", "Java", "Python", "Go", "C#", "Rust"]
    },
    {
        id: "backend_fw", type: "select", label: l === "pt" ? "Framework backend?" : "Backend framework?", depends: "backend_lang",
        options: {
            "TypeScript (Node)": ["NestJS", "tRPC", "Fastify", "Hono"],
            Java: ["Spring Boot", "Quarkus", "Micronaut"],
            Python: ["FastAPI", "Django", "Flask"],
            Go: ["Gin", "Echo", "Fiber"],
            "C#": ["ASP.NET Core", "Minimal API"],
            Rust: ["Axum", "Actix-web"]
        }
    },
    {
        id: "database", type: "multi", label: l === "pt" ? "Banco de dados?" : "Database?",
        options: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "PlanetScale", "Supabase", "Neon"]
    },
    {
        id: "auth", type: "select", label: l === "pt" ? "Autenticação?" : "Auth?",
        options: l === "pt" ? ["Nenhuma", "NextAuth.js", "Clerk", "Auth0", "Supabase Auth", "Custom JWT"] :
            ["None", "NextAuth.js", "Clerk", "Auth0", "Supabase Auth", "Custom JWT"]
    },
    {
        id: "deploy", type: "select", label: "Deploy?",
        options: ["Vercel", "Railway", "Render", "Fly.io", "AWS", "GCP", "Docker + VPS", "Kubernetes"]
    },
    {
        id: "description", type: "text", label: l === "pt" ? "Descreva o projeto:" : "Describe the project:",
        placeholder: l === "pt" ? "Ex: SaaS de gestão de tarefas…" : "e.g. Task management SaaS…"
    },
];

// ─── Templates ────────────────────────────────────────────────────────────────
const TEMPLATES: Template[] = [
    {
        id: "spring", icon: "☕", name: "Java Spring Boot API", stack: "Backend",
        desc: "Spring Boot + JWT + PostgreSQL + Hexagonal",
        answers: {
            projectType: "backend", language: "Java", framework: "Spring Boot", auth: "JWT",
            architecture: "Hexagonal / Ports & Adapters", database: ["PostgreSQL", "Redis"],
            testing: ["Unit Tests", "Integration Tests"], deploy: "Kubernetes",
            extras: ["CI/CD", "Observabilidade (OpenTelemetry)"], description: "Production REST API with Spring Boot"
        }
    },
    {
        id: "nextjs", icon: "▲", name: "Next.js Fullstack", stack: "Fullstack",
        desc: "Next.js 14 + NestJS + PostgreSQL + Clerk",
        answers: {
            projectType: "fullstack", frontend_fw: "Next.js (React)", backend_lang: "TypeScript (Node)",
            backend_fw: "NestJS", database: ["PostgreSQL", "Redis"], auth: "Clerk", deploy: "Vercel",
            description: "Fullstack SaaS with Next.js and NestJS"
        }
    },
    {
        id: "rn", icon: "📱", name: "React Native App", stack: "Frontend",
        desc: "Expo + Zustand + TanStack Query + Clerk",
        answers: {
            projectType: "frontend", frontend_type: "Mobile App", framework: "Expo",
            ui_lib: "NativeBase", state: "Zustand", data_fetch: "TanStack Query", auth: "Clerk",
            testing: ["Vitest", "React Testing Library"], deploy: "App Store / Play Store",
            description: "Cross-platform mobile app with Expo"
        }
    },
    {
        id: "fastapi", icon: "🐍", name: "Python FastAPI", stack: "Backend",
        desc: "FastAPI + async + PostgreSQL + OAuth2",
        answers: {
            projectType: "backend", language: "Python", framework: "FastAPI",
            auth: "OAuth2 / OpenID Connect", architecture: "Clean Architecture",
            database: ["PostgreSQL", "Redis"], testing: ["Unit Tests", "Integration Tests"],
            deploy: "AWS", extras: ["CI/CD", "Cache"], description: "Async REST API with FastAPI"
        }
    },
    {
        id: "vue", icon: "💚", name: "Vue 3 SPA", stack: "Frontend",
        desc: "Vue 3 + Pinia + TanStack Query + Tailwind",
        answers: {
            projectType: "frontend", frontend_type: "Web App", framework: "Vue 3",
            ui_lib: "Tailwind CSS", state: "Pinia", data_fetch: "TanStack Query", auth: "Auth0",
            testing: ["Vitest", "Playwright"], deploy: "Vercel", description: "Modern Vue 3 SPA"
        }
    },
    {
        id: "go", icon: "🐹", name: "Go Microservice", stack: "Backend",
        desc: "Gin + gRPC + Kafka + DDD",
        answers: {
            projectType: "backend", language: "Go", framework: "Gin", auth: "JWT",
            architecture: "DDD + CQRS", database: ["PostgreSQL", "Redis"],
            testing: ["Unit Tests", "Integration Tests"], deploy: "Kubernetes",
            extras: ["Kafka / RabbitMQ", "Observabilidade (OpenTelemetry)"],
            description: "High-throughput Go microservice"
        }
    },
];

// ─── API calls (via Next.js routes — não expõe a key no browser) ──────────────
async function generateSkillApi(answers: Record<string, unknown>): Promise<string> {
    const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
    });
    if (!res.ok) throw new Error(`Generate API error ${res.status}`);
    const data = await res.json();
    return data.yaml as string;
}

async function validateSkillApi(yaml: string): Promise<SecurityResult> {
    const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yaml }),
    });
    if (!res.ok) throw new Error(`Validate API error ${res.status}`);
    return res.json() as Promise<SecurityResult>;
}

// ─── Style helpers ────────────────────────────────────────────────────────────
const SEC_COLOR: Record<SecLevel, string> = { safe: "#1D9E75", warning: "#BA7517", danger: "#E24B4A" };
const SEC_BG: Record<SecLevel, string> = { safe: "#E1F5EE", warning: "#FAEEDA", danger: "#FCEBEB" };
const STACK_COLOR = { Backend: "#534AB7", Frontend: "#0F6E56", Fullstack: "#993C1D" };
const STACK_BG = { Backend: "#EEEDFE", Frontend: "#E1F5EE", Fullstack: "#FAECE7" };

// ─── Component ────────────────────────────────────────────────────────────────
export default function SkillCreator() {
    const [lang, setLang] = useState<Lang | null>(null);
    const [phase, setPhase] = useState<Phase>("welcome");
    const [projectType, setProjectType] = useState<ProjectType | null>(null);
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
    const [skillYaml, setSkillYaml] = useState("");
    const [security, setSecurity] = useState<SecurityResult | null>(null);
    const [loading, setLoading] = useState("");
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<"yaml" | "npm" | "cli">("yaml");

    const t = T[lang ?? "en"];

    const questions: Question[] =
        projectType === "frontend" ? FRONTEND_Q(lang ?? "en") :
            projectType === "fullstack" ? FULLSTACK_Q(lang ?? "en") :
                BACKEND_Q(lang ?? "en");

    const q = questions[step];

    const getOptions = (): string[] => {
        if (!q?.options) return [];
        if (q.depends && typeof q.options === "object" && !Array.isArray(q.options))
            return (q.options as Record<string, string[]>)[answers[q.depends] as string] ?? [];
        return q.options as string[];
    };

    const isAnswered = () => {
        if (!q) return false;
        if (q.type === "multi") return ((answers[q.id] as string[])?.length ?? 0) > 0;
        return !!answers[q.id];
    };

    const toggleMulti = (opt: string) => {
        const none = opt === "Nenhum" || opt === "None";
        const cur = ((answers[q.id] as string[]) ?? []).filter(x => x !== "Nenhum" && x !== "None");
        if (none) { setAnswers({ ...answers, [q.id]: [opt] }); return; }
        setAnswers({ ...answers, [q.id]: cur.includes(opt) ? cur.filter(x => x !== opt) : [...cur, opt] });
    };

    const generate = async (ans: Record<string, string | string[]>) => {
        setPhase("generating"); setError("");
        try {
            setLoading(t.generating);
            const yaml = await generateSkillApi({ ...ans, projectType });
            setSkillYaml(yaml.trim());

            setLoading(t.validating);
            const sec = await validateSkillApi(yaml);
            setSecurity(sec);
            setPhase("result");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
            setPhase("wizard");
        }
    };

    const handleNext = () => {
        if (step < questions.length - 1) setStep(step + 1);
        else generate(answers);
    };

    const handleTemplate = (tpl: Template) => {
        const { projectType: pt, ...rest } = tpl.answers;
        setProjectType(pt);
        setAnswers(rest);
        generate(tpl.answers);
    };

    // ── File generators ──────────────────────────────────────────────────────
    const getNpmPackage = () => JSON.stringify({
        name: "skill-creator-cli",
        version: "1.0.0",
        description: "Claude Skill generator for your project",
        bin: { "skill-creator": "./bin/skill-creator.js" },
        scripts: { start: "node bin/skill-creator.js" },
        keywords: ["claude", "anthropic", "skill", "ai", "cli"],
        license: "MIT",
        dependencies: { "fs-extra": "^11.0.0", prompts: "^2.4.2", chalk: "^5.3.0" }
    }, null, 2);

    const getCliScript = () =>
        `#!/usr/bin/env node
// Skill Creator CLI — auto-generated
// Usage: node skill-creator.js

const fs   = require('fs');
const path = require('path');

const SKILL_YAML = \`${skillYaml}\`;

const outputDir  = path.join(process.cwd(), '.claude', 'skills');
fs.mkdirSync(outputDir, { recursive: true });

const skillFile  = path.join(outputDir, 'project-skill.yaml');
fs.writeFileSync(skillFile, SKILL_YAML, 'utf8');

console.log('Skill written to:', skillFile);
console.log('Run: git diff .claude/skills/ to track changes.');
`;

    const download = (content: string, filename: string, mime: string) => {
        const a = Object.assign(document.createElement("a"), {
            href: URL.createObjectURL(new Blob([content], { type: mime })),
            download: filename,
        });
        a.click();
    };

    const tabContent = activeTab === "yaml" ? skillYaml
        : activeTab === "npm" ? getNpmPackage()
            : getCliScript();

    const copy = () => {
        navigator.clipboard.writeText(tabContent);
        setCopied(true); setTimeout(() => setCopied(false), 2000);
    };

    // ── Shared button style ───────────────────────────────────────────────────
    const optBtn = (active: boolean, color = "#534AB7"): React.CSSProperties => ({
        padding: "10px 12px", fontSize: 13, cursor: "pointer", textAlign: "left",
        borderRadius: "8px",
        border: active ? `1.5px solid ${color}` : "0.5px solid var(--color-border-secondary)",
        background: active ? `${color}22` : "var(--color-background-secondary)",
        color: active ? color : "var(--color-text-primary)",
        fontWeight: active ? 500 : 400,
        transition: "all 0.15s",
        width: "100%",
    });

    // ── WELCOME ───────────────────────────────────────────────────────────────
    if (phase === "welcome") return (
        <div style={{ padding: "2rem 1.5rem", maxWidth: 640, margin: "0 auto" }}>
            <h2 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 4px" }}>⚡ {t.title}</h2>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 24px" }}>{t.sub}</p>

            {!lang ? (
                <>
                    <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 12 }}>{t.chooseLang}:</p>
                    <div style={{ display: "flex", gap: 10 }}>
                        {(["en", "pt"] as Lang[]).map(l => (
                            <button key={l} onClick={() => setLang(l)}
                                style={{
                                    flex: 1, padding: 14, fontSize: 15, fontWeight: 500, cursor: "pointer",
                                    background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: 12
                                }}>
                                {l === "en" ? "🇺🇸  English" : "🇧🇷  Português"}
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 14 }}>
                        {lang === "pt" ? "Como deseja começar?" : "How do you want to start?"}
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                        {[
                            { icon: "📋", label: t.useTemplate, sub: lang === "pt" ? "6 templates prontos" : "6 ready-made templates", action: () => setPhase("template") },
                            { icon: "🧙", label: t.startWizard, sub: lang === "pt" ? "Wizard personalizado" : "Custom guided wizard", action: () => setPhase("type") },
                        ].map(o => (
                            <button key={o.label} onClick={o.action}
                                style={{
                                    padding: "18px 14px", textAlign: "left", cursor: "pointer",
                                    background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: 12
                                }}>
                                <div style={{ fontSize: 20, marginBottom: 8 }}>{o.icon}</div>
                                <div style={{ fontWeight: 500, fontSize: 14 }}>{o.label}</div>
                                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 3 }}>{o.sub}</div>
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setLang(null)}
                        style={{ fontSize: 12, color: "var(--color-text-secondary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        ← {lang === "pt" ? "Trocar idioma" : "Change language"}
                    </button>
                </>
            )}
        </div>
    );

    // ── PROJECT TYPE ──────────────────────────────────────────────────────────
    if (phase === "type") return (
        <div style={{ padding: "2rem 1.5rem", maxWidth: 640, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <button onClick={() => setPhase("welcome")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: 13 }}>← {t.back}</button>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>{t.projectType}</h3>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
                {([
                    { id: "backend" as ProjectType, icon: "⚙️", label: "Backend / API", desc: lang === "pt" ? "Java, Python, Go, Rust, C#…" : "Java, Python, Go, Rust, C#…" },
                    { id: "frontend" as ProjectType, icon: "🎨", label: "Frontend", desc: "React, Vue, Angular, React Native, Expo…" },
                    { id: "fullstack" as ProjectType, icon: "🔗", label: "Fullstack", desc: lang === "pt" ? "Next.js, Nuxt, SvelteKit + backend" : "Next.js, Nuxt, SvelteKit + backend" },
                ]).map(o => (
                    <button key={o.id} onClick={() => { setProjectType(o.id); setStep(0); setAnswers({}); setPhase("wizard"); }}
                        style={{
                            padding: 16, textAlign: "left", cursor: "pointer", background: "var(--color-background-secondary)",
                            border: "0.5px solid var(--color-border-secondary)", borderRadius: 12,
                            display: "flex", alignItems: "center", gap: 14
                        }}>
                        <span style={{ fontSize: 24 }}>{o.icon}</span>
                        <div>
                            <div style={{ fontWeight: 500, fontSize: 14 }}>{o.label}</div>
                            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>{o.desc}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    // ── TEMPLATES ─────────────────────────────────────────────────────────────
    if (phase === "template") return (
        <div style={{ padding: "2rem 1.5rem", maxWidth: 640, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <button onClick={() => setPhase("welcome")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: 13 }}>← {t.back}</button>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>{t.templates}</h3>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
                {TEMPLATES.map(tpl => (
                    <button key={tpl.id} onClick={() => handleTemplate(tpl)}
                        style={{
                            padding: "14px 16px", textAlign: "left", cursor: "pointer", background: "var(--color-background-primary)",
                            border: "0.5px solid var(--color-border-secondary)", borderRadius: 12,
                            display: "flex", alignItems: "center", gap: 14, width: "100%"
                        }}>
                        <span style={{ fontSize: 22, minWidth: 28 }}>{tpl.icon}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                                <span style={{ fontWeight: 500, fontSize: 14 }}>{tpl.name}</span>
                                <span style={{
                                    fontSize: 11, padding: "2px 8px", borderRadius: 20,
                                    background: STACK_BG[tpl.stack], color: STACK_COLOR[tpl.stack], fontWeight: 500
                                }}>
                                    {tpl.stack}
                                </span>
                            </div>
                            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{tpl.desc}</div>
                        </div>
                        <span style={{ color: "var(--color-text-secondary)", fontSize: 16 }}>→</span>
                    </button>
                ))}
            </div>
        </div>
    );

    // ── GENERATING ────────────────────────────────────────────────────────────
    if (phase === "generating") return (
        <div style={{ padding: "4rem 1.5rem", textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>⚙️</div>
            <p style={{ fontSize: 15, color: "var(--color-text-secondary)", margin: "0 0 20px" }}>{loading}</p>
            <div style={{ height: 3, background: "var(--color-background-secondary)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{
                    height: "100%", background: "#534AB7", borderRadius: 2,
                    animation: "pw 1.8s ease-in-out infinite alternate"
                }} />
            </div>
            <style>{`@keyframes pw{from{width:15%;margin-left:0}to{width:70%;margin-left:15%}}`}</style>
        </div>
    );

    // ── WIZARD ────────────────────────────────────────────────────────────────
    if (phase === "wizard") {
        const pct = Math.round(((step + 1) / questions.length) * 100);
        const opts = getOptions();
        return (
            <div style={{ padding: "2rem 1.5rem", maxWidth: 640, margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <button onClick={() => { if (step === 0) setPhase("type"); else setStep(step - 1); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: 13 }}>
                        ← {t.back}
                    </button>
                    <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                        {t.step} {step + 1} {t.of} {questions.length}
                    </span>
                </div>

                <div style={{ height: 3, background: "var(--color-background-secondary)", borderRadius: 2, marginBottom: 22, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "#534AB7", borderRadius: 2, width: `${pct}%`, transition: "width 0.3s ease" }} />
                </div>

                <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>{q.label}</p>

                {q.type === "text" ? (
                    <textarea value={(answers[q.id] as string) ?? ""} rows={3}
                        placeholder={q.placeholder}
                        onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                        style={{
                            width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 8,
                            border: "0.5px solid var(--color-border-secondary)",
                            background: "var(--color-background-secondary)",
                            color: "var(--color-text-primary)", resize: "vertical", boxSizing: "border-box"
                        }} />
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: 8 }}>
                        {opts.map(opt => {
                            const active = q.type === "multi"
                                ? ((answers[q.id] as string[]) ?? []).includes(opt)
                                : answers[q.id] === opt;
                            return (
                                <button key={opt}
                                    onClick={() => q.type === "multi" ? toggleMulti(opt) : setAnswers({ ...answers, [q.id]: opt })}
                                    style={optBtn(active)}>
                                    {active && q.type === "multi" ? "✓ " : ""}{opt}
                                </button>
                            );
                        })}
                    </div>
                )}

                {error && <p style={{ color: "#E24B4A", fontSize: 13, marginTop: 12 }}>{error}</p>}

                <button onClick={handleNext} disabled={!isAnswered()}
                    style={{
                        marginTop: 24, width: "100%", padding: 12, fontSize: 14, fontWeight: 500,
                        cursor: isAnswered() ? "pointer" : "not-allowed", borderRadius: 8, border: "none",
                        background: isAnswered() ? "#534AB7" : "var(--color-background-secondary)",
                        color: isAnswered() ? "#fff" : "var(--color-text-secondary)",
                        transition: "background 0.2s"
                    }}>
                    {step < questions.length - 1 ? `${t.next} →` : `${t.generate} →`}
                </button>
            </div>
        );
    }

    // ── RESULT ────────────────────────────────────────────────────────────────
    if (phase === "result") {
        const tabs = [
            { id: "yaml", label: "project-skill.yaml" },
            { id: "npm", label: "package.json" },
            { id: "cli", label: "bin/skill-creator.js" },
        ] as const;
        const sc = security!;

        return (
            <div style={{ padding: "1.5rem", maxWidth: 720, margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>✅ {t.skillOutput}</h3>
                    <button onClick={() => { setPhase("welcome"); setAnswers({}); setStep(0); setSkillYaml(""); setSecurity(null); setProjectType(null); }}
                        style={{
                            fontSize: 12, color: "var(--color-text-secondary)", background: "none",
                            border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, cursor: "pointer", padding: "6px 12px"
                        }}>
                        + {t.newSkill}
                    </button>
                </div>

                <div style={{
                    marginBottom: 14, padding: "12px 16px", borderRadius: 12,
                    background: SEC_BG[sc.level], border: `0.5px solid ${SEC_COLOR[sc.level]}`
                }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: sc.issues.length ? 8 : 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: SEC_COLOR[sc.level] }}>
                            🔒 {t.secReport} — {t.score}: {sc.score}/100
                        </span>
                        <span style={{
                            fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20,
                            background: SEC_COLOR[sc.level], color: "#fff"
                        }}>
                            {t[sc.level]}
                        </span>
                    </div>
                    {sc.issues.map((iss, i) => (
                        <div key={i} style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>
                            <strong style={{ color: "var(--color-text-primary)" }}>{iss.title}</strong> — {iss.description}
                        </div>
                    ))}
                    {sc.summary && <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "6px 0 0" }}>{sc.summary}</p>}
                    <div style={{ marginTop: 10, padding: "8px 10px", background: "rgba(0,0,0,0.04)", borderRadius: 8 }}>
                        <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0 }}>
                            💡 <strong>{t.versionNote}:</strong> {t.diffNote}
                        </p>
                    </div>
                </div>

                <div style={{ border: "0.5px solid var(--color-border-secondary)", borderRadius: 12, overflow: "hidden" }}>
                    <div style={{ display: "flex", borderBottom: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)" }}>
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: "8px 14px", fontSize: 12, cursor: "pointer", border: "none",
                                    background: activeTab === tab.id ? "var(--color-background-primary)" : "transparent",
                                    color: activeTab === tab.id ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                                    fontFamily: "var(--font-mono)",
                                    borderBottom: activeTab === tab.id ? "2px solid #534AB7" : "none",
                                    fontWeight: activeTab === tab.id ? 500 : 400
                                }}>
                                {tab.label}
                            </button>
                        ))}
                        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", paddingRight: 10 }}>
                            <button onClick={copy} style={{ fontSize: 11, cursor: "pointer", background: "none", border: "none", color: "var(--color-text-secondary)", padding: 0 }}>
                                {copied ? "✓ " + t.copied : t.copy}
                            </button>
                        </div>
                    </div>
                    <textarea readOnly value={tabContent} rows={16}
                        style={{
                            width: "100%", fontSize: 12, fontFamily: "var(--font-mono)", padding: 14,
                            background: "#1e1e2e", color: "#cdd6f4", border: "none", resize: "vertical",
                            boxSizing: "border-box", lineHeight: 1.6, display: "block"
                        }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
                    <button onClick={() => download(skillYaml, "project-skill.yaml", "text/yaml")}
                        style={{
                            padding: 10, fontSize: 12, fontWeight: 500, cursor: "pointer",
                            background: "#534AB7", color: "#fff", border: "none", borderRadius: 8
                        }}>
                        ↓ {t.downloadYaml}
                    </button>
                    <button onClick={() => download(getNpmPackage(), "package.json", "application/json")}
                        style={{
                            padding: 10, fontSize: 12, fontWeight: 500, cursor: "pointer",
                            background: "var(--color-background-secondary)", color: "var(--color-text-primary)",
                            border: "0.5px solid var(--color-border-secondary)", borderRadius: 8
                        }}>
                        ↓ {t.downloadNpm}
                    </button>
                    <button onClick={() => download(getCliScript(), "skill-creator.js", "text/javascript")}
                        style={{
                            padding: 10, fontSize: 12, fontWeight: 500, cursor: "pointer",
                            background: "var(--color-background-secondary)", color: "var(--color-text-primary)",
                            border: "0.5px solid var(--color-border-secondary)", borderRadius: 8
                        }}>
                        ↓ {t.downloadCli}
                    </button>
                </div>
            </div>
        );
    }

    return null;
}