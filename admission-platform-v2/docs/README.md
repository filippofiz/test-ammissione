# Admission Platform v2

**Version**: 2.0.0
**Status**: 🚧 In Development (Complete Rewrite)
**Start Date**: 2025-11-14
**Tech Stack**: TypeScript + React + Vite + Supabase

---

## 📖 Overview

Modern test preparation platform for standardized tests (SAT, GMAT, Italian university entrance exams) with AI-powered question generation, adaptive testing, and comprehensive analytics.

### Key Features
- ✅ **GMAT Data Insights** - All 5 question types (DS, TPA, TA, GI, MSR)
- 🤖 **AI Question Generation** - Powered by Anthropic Claude
- 📱 **Mobile-First Design** - Responsive on all devices (iPad/tablets)
- 🧪 **Adaptive Testing** - SAT and GMAT adaptive algorithms
- 📊 **Advanced Analytics** - Detailed performance tracking
- 🌍 **Multi-language** - Italian & English (via i18n)
- 🔐 **Secure** - RLS policies, input validation, DOMPurify sanitization

---

## 🏗️ Architecture

### Monorepo Structure (Turborepo)
```
admission-platform-v2/
├── apps/
│   ├── web/              # React + Vite web app
│   └── mobile/           # React Native mobile app
├── packages/
│   ├── shared/           # 60-70% code reuse
│   ├── ui/               # Component library
│   └── test-engine/      # Test logic engine
├── supabase/
│   ├── migrations/       # Database schema
│   └── functions/        # Edge Functions
└── DOCUMENTATION/        # This folder
```

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build**: Vite + Turborepo
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: TanStack Query + Zustand
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **AI**: Anthropic Claude (via Edge Functions)
- **Testing**: Vitest + Playwright
- **Mobile**: React Native + Expo

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥18.0.0
- pnpm ≥8.0.0
- Supabase account
- Anthropic API key (for AI generation)

### Installation
```bash
# Clone repository
git clone https://github.com/your-org/admission-test.git
cd admission-test/admission-platform-v2

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run migrations
cd supabase
npx supabase db push

# Generate types
npx supabase gen types typescript --local > packages/shared/src/types/database.ts

# Start development
pnpm dev
```

---

## 📚 Documentation

- **[DEVELOPER.md](./DEVELOPER.md)** - Development setup and guidelines
- **[DATABASE.md](./DATABASE.md)** - Database schema and migrations
- **[API.md](./API.md)** - API documentation and endpoints
- **[SECURITY.md](./SECURITY.md)** - Security policies and best practices
- **[EDGE_CASES.md](./EDGE_CASES.md)** - Edge cases and testing strategies
- **[USER_MANUAL.md](./USER_MANUAL.md)** - End-user documentation

---

## 🎯 Project Goals

### MVP (Week 1-4)
1. ✅ GMAT test taking experience (all question types)
2. 🤖 AI question generation (Data Sufficiency priority)
3. 📱 Mobile-responsive design
4. 👨‍🏫 Tutor dashboard (assign tests, review AI questions)
5. 📊 Student results analytics

### Completed
- ✅ React Native mobile app
- ✅ Multi-platform authentication (Web + Mobile)
- ✅ Role-based navigation system
- ✅ Force password change on first login
- ✅ Multi-language support (English + Italian)

### Future (Post-MVP)
- SAT adaptive testing
- Italian test support (TOLC, Bocconi)
- Test-taking interface
- Offline support
- Advanced analytics (IRT-based difficulty)

---

## 🔐 Security

- **No hardcoded secrets** - All credentials in environment variables
- **RLS enabled** - Row Level Security on all tables
- **Input validation** - Zod schemas + DOMPurify sanitization
- **HTTPS only** - Enforced SSL/TLS
- **WCAG AAA** - Accessibility compliance

See [SECURITY.md](./SECURITY.md) for details.

---

## 🧪 Testing

### Coverage Targets
- Unit tests: >80%
- Integration tests: Critical paths covered
- E2E tests: User flows validated
- Performance: Lighthouse score >90

### Running Tests
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

---

## 📊 Progress Tracking

See **[TODO.md](../TODO.md)** for detailed progress tracking.

### Current Status (2025-11-15)
- Phase 0 (Setup): ██████████ 100% ✅
- Phase 1 (Database): ████████░░ 80% (Tables & Migrations created, RPC functions implemented)
- Phase 2 (Authentication & Navigation): ██████████ 100% ✅
  - ✅ Login flow with password change enforcement
  - ✅ Role selection for multi-role users
  - ✅ Test selection for students with multiple tests
  - ✅ Multi-layer security (Route, Page, RLS)
  - ✅ Web (React + Vite) fully functional
  - ✅ Mobile (React Native + Expo) fully functional
- Phase 3 (AI Gen): ░░░░░░░░░░ 0% 🔥 NEXT PRIORITY

---

## 👥 Team

**Development**: Claude Code AI Development Team
**Project Manager**: [Your Name]
**Security**: [Security Team]

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/admission-test/issues)
- **Slack**: #admission-test
- **Email**: support@uptoten.it

---

## 📄 License

Proprietary - Up to Ten © 2025

---

**Last Updated**: 2025-11-15
**Version**: 2.0.0-alpha.2
