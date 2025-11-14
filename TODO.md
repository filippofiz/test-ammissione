# TODO - ADMISSION_TEST

**Last Updated**: 2025-11-14 (auto-updated by Claude Code)
**Sprint**: GMAT + AI Question Generation (Week 1-4)
**Team**: Claude Code AI Development Team

---

## 🎯 OBIETTIVO ATTUALE
**Complete rewrite in TypeScript with GMAT + AI Question Generation as MVP**
- Get GMAT Data Insights questions working (all 5 types)
- AI question generator (Anthropic Claude) operational
- Students can take GMAT tests end-to-end
- Mobile-responsive design (iPad/tablets working)

**Success Metrics**:
- [ ] Student can complete GMAT test on mobile device
- [ ] AI can generate Data Sufficiency questions (quality reviewed)
- [ ] Tutor can generate and review AI questions
- [ ] Test coverage >80%
- [ ] Lighthouse score >90

---

## ⏱️ TIME TRACKING

### Current Session
- **Started**: 2025-11-14 (today)
- **Phase**: Phase 0 - Project Setup
- **Estimated Total**: 12 weeks
- **Time Spent This Session**: ~2 hours (audit + setup)

### Phase Breakdown
- Phase 0 (Setup): Day 1-2 (IN PROGRESS)
- Phase 1 (Database): Day 3-5
- Phase 2 (Packages): Week 1-2
- Phase 3 (AI Generation): Week 2-3 🔥 PRIORITY
- Phase 4 (Web App): Week 3-4
- Phase 5 (Mobile): Week 5-6
- Phase 6 (Migration): Week 1-6 (parallel)
- Phase 7 (Testing): Week 6
- Phase 8 (Deploy): Week 6

---

## ✅ COMPLETATO (NON RIFARE!)

### Phase 0: Project Setup - STABLE ✅
**Completed**: 2025-11-14
**Files**:
- `admission-platform-v2/package.json`
- `admission-platform-v2/turbo.json`
- `admission-platform-v2/tsconfig.json`
- `admission-platform-v2/.gitignore`
- `admission-platform-v2/.env.example`
- `IMPLEMENTATION_PLAN.md`
- `.claude_instructions` (updated)

**Test Coverage**: N/A (config files)
**Performance**: N/A
**Riusabile**: Base setup ✅
**Branch**: NewCodeTypescript
**Author**: @claude-code

**Changes Made**:
- Created monorepo structure with Turborepo
- Set up TypeScript configuration (strict mode)
- Created pnpm workspaces (apps/, packages/)
- Set up Supabase folder structure
- Created implementation tracker (IMPLEMENTATION_PLAN.md)
- Updated .claude_instructions to reflect Vite + apps/ structure

**⚠️ NON MODIFICARE** - This is the foundation structure

---

### Complete Codebase Audit - COMPLETED ✅
**Completed**: 2025-11-14
**Duration**: ~1.5 hours
**Files Analyzed**: 42 JS files, 21 HTML files, SQL migrations

**Key Findings**:
- 11 hardcoded API keys (CRITICAL SECURITY ISSUE)
- 403 console.log statements
- 100% code duplication (italiano/ = inglese/)
- Monolithic files (test.js = 3,148 lines)
- No mobile responsiveness
- Flawed table logic

**Decision**: Complete rewrite justified
**Recommendation**: TypeScript + React + proper architecture

**⚠️ REFERENCE ONLY** - See audit report in conversation history

---

## 🔄 IN CORSO (NON DUPLICARE!)

### Create TODO.md with strict format - IN PROGRESS 🔄
**Started**: 2025-11-14
**Assigned**: @claude-code
**Branch**: NewCodeTypescript
**ETA**: 2025-11-14 (today, within 30 minutes)
**Bloccato da**: [niente]

**Progress**:
- [x] Read old TODO.md
- [x] Create new format
- [ ] Add all tasks from IMPLEMENTATION_PLAN.md
- [ ] Commit to git

**Files**:
- `TODO.md` (this file)

---

## 📋 DA FARE (priorità)

### WEEK 1 - FOUNDATION (CRITICAL PATH)

#### 1. Create DOCUMENTATION/ folder - CRITICAL 🔴
**Priority**: HIGH
**Estimated**: 2 hours
**Dependencies**: None
**Assigned**: Unassigned

**Tasks**:
- [ ] Create DOCUMENTATION/ folder
- [ ] Create README.md (project overview)
- [ ] Create DEVELOPER.md (setup guide)
- [ ] Create DATABASE.md (schema documentation)
- [ ] Create SECURITY.md (security policies)
- [ ] Create API.md (API documentation)
- [ ] Create EDGE_CASES.md (edge case catalog)
- [ ] Create USER_MANUAL.md (user guide)

**Files to create**: 8 markdown files

---

#### 2. Phase 1: Database Migrations (NEW TABLES) - CRITICAL 🔴
**Priority**: HIGHEST (BLOCKING)
**Estimated**: 8 hours (Day 3-5)
**Dependencies**: None
**Assigned**: Unassigned

**Tasks**:
- [ ] Create `supabase/migrations/001_users_v2.sql`
- [ ] Create `supabase/migrations/002_tests_v2.sql`
- [ ] Create `supabase/migrations/003_questions_v2.sql`
- [ ] Create `supabase/migrations/004_ai_questions.sql`
- [ ] Create `supabase/migrations/005_attempts.sql`
- [ ] Set up RLS policies on all tables
- [ ] Test migrations on dev Supabase project
- [ ] Generate TypeScript types from schema

**Deliverables**:
- Clean database schema (normalized, categorized)
- All RLS policies verified
- TypeScript types auto-generated

**Blockers**: Need Supabase project credentials

---

#### 3. Setup Testing Infrastructure - IMPORTANT 🟠
**Priority**: HIGH
**Estimated**: 4 hours
**Dependencies**: Phase 0 complete
**Assigned**: Unassigned

**Tasks**:
- [ ] Install Vitest
- [ ] Configure coverage reporting (>80% target)
- [ ] Set up test utilities
- [ ] Create example test file
- [ ] Add pre-commit hook (tests must pass)
- [ ] Configure CI/CD testing

**Files**:
- `packages/shared/vitest.config.ts`
- `packages/shared/src/__tests__/example.test.ts`
- `.husky/pre-commit`

---

#### 4. Create packages/shared - CRITICAL 🔴
**Priority**: HIGH (BLOCKING for Phase 3)
**Estimated**: 6 hours
**Dependencies**: Database migrations
**Assigned**: Unassigned

**Tasks**:
- [ ] Create package.json
- [ ] Create tsconfig.json
- [ ] Create src/api/client.ts (Supabase client)
- [ ] Create src/types/database.ts (auto-generated)
- [ ] Create src/types/test.ts
- [ ] Create src/types/question.ts
- [ ] Create src/validation/ (Zod schemas)
- [ ] Create src/utils/sanitize.ts (DOMPurify)
- [ ] Add tests for all utilities

**Deliverables**: Shared package ready for use

---

### WEEK 2 - AI GENERATION (PRIORITY FEATURE) 🔥

#### 5. AI Question Generation System - PRIORITY 🔥
**Priority**: HIGHEST
**Estimated**: 16 hours (Week 2-3)
**Dependencies**: Database migrations, shared package
**Assigned**: Unassigned

**Tasks**:
- [ ] Create Supabase Edge Function: generate-question
- [ ] Store Anthropic API key in Supabase Vault
- [ ] Create prompt templates (all 5 DI types)
- [ ] Implement Data Sufficiency generator
- [ ] Implement Two-Part Analysis generator
- [ ] Implement Table Analysis generator
- [ ] Implement Graphics Interpretation generator
- [ ] Implement Multi-Source Reasoning generator
- [ ] Create review queue UI
- [ ] Implement approve/reject workflow
- [ ] Track AI learning metrics
- [ ] Add tests (quality checks)

**Deliverables**:
- AI can generate GMAT DI questions
- Tutor can review and approve
- Quality metrics tracked

**This is our MVP feature - prioritize over everything else**

---

#### 6. Create packages/ui - Component Library
**Priority**: MEDIUM
**Estimated**: 12 hours
**Dependencies**: None (can work in parallel)
**Assigned**: Unassigned

**Tasks**:
- [ ] Set up package with Tailwind CSS
- [ ] Install shadcn/ui
- [ ] Create Button component
- [ ] Create Input / TextArea
- [ ] Create Select / MultiSelect
- [ ] Create Card
- [ ] Create Modal / Dialog
- [ ] Create Toast notifications
- [ ] Create Loading spinner
- [ ] Create Progress bar
- [ ] Create Timer component
- [ ] Create Question card
- [ ] Add Storybook for component preview
- [ ] Add tests for all components
- [ ] Make mobile-responsive (min 44px touch targets)

**Components**: 20+ total
**Test Coverage Target**: >90%

---

#### 7. Create packages/test-engine - Test Logic
**Priority**: MEDIUM
**Estimated**: 10 hours
**Dependencies**: shared package
**Assigned**: Unassigned

**Tasks**:
- [ ] Create TestAdapter interface
- [ ] Create GMATAdapter (adaptive logic)
- [ ] Create SATAdapter (adaptive modules)
- [ ] Create TimerService
- [ ] Create NavigationService
- [ ] Create ScoringService
- [ ] Add tests for adapters

**Deliverables**: Test engine ready for web + mobile

---

### WEEK 3-4 - WEB APPLICATION

#### 8. Create apps/web - React App
**Priority**: HIGH
**Estimated**: 20 hours
**Dependencies**: All packages complete
**Assigned**: Unassigned

**Tasks**:
- [ ] Initialize Vite + React + TypeScript
- [ ] Set up React Router
- [ ] Set up TanStack Query
- [ ] Set up Zustand stores
- [ ] Create auth pages (login, register)
- [ ] Create student dashboard
- [ ] Create test taking UI (GMAT focus)
- [ ] Create question renderers (all 5 DI types)
- [ ] Create results page
- [ ] Create tutor dashboard
- [ ] Create AI question generator UI
- [ ] Mobile-responsive design
- [ ] Add E2E tests (Playwright)

**Deliverables**: Working web app

---

### WEEK 5-6 - MOBILE APP (Lower Priority)

#### 9. Create apps/mobile - React Native App
**Priority**: MEDIUM (after web MVP)
**Estimated**: 16 hours
**Dependencies**: Web app complete, packages tested
**Assigned**: Unassigned

**Tasks**:
- [ ] Initialize React Native + Expo
- [ ] Set up navigation (React Navigation)
- [ ] Reuse shared packages (60-70% code reuse)
- [ ] Create mobile-specific UI adaptations
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Add offline support (SQLite cache)

**Deliverables**: Native mobile app

---

### ONGOING - DATA MIGRATION (Parallel Work)

#### 10. Data Migration Scripts
**Priority**: MEDIUM (can do in parallel)
**Estimated**: 12 hours (spread across weeks)
**Dependencies**: New database schema created
**Assigned**: Unassigned

**Tasks**:
- [ ] Export users from old DB
- [ ] Export tests from old DB
- [ ] Export questions from old DB
- [ ] Export test results from old DB
- [ ] Run AI auto-categorization on questions
- [ ] Convert PDFs to LaTeX
- [ ] Import cleaned data to new DB
- [ ] Verify data integrity
- [ ] Create rollback scripts

**Deliverables**: All data migrated with improvements

---

## ⚠️ CODICE DA RIUTILIZZARE

### From OLD codebase (read-only reference):
- **DON'T COPY/PASTE** - Use as reference only
- `inglese/test.js` - Test flow logic (rewrite in TypeScript)
- `inglese/dashboard.js` - Analytics algorithms (extract to shared)
- `inglese/gmat/data-insights/` - DI question structures (reference for AI prompts)
- `supabase/functions/claude-proxy/` - Edge function pattern (improve security)

### NEW shared code (MUST use):
- `packages/shared/api/client.ts` - ALWAYS use for Supabase queries
- `packages/shared/utils/sanitize.ts` - ALWAYS sanitize user input
- `packages/shared/validation/` - ALWAYS validate with Zod schemas
- `packages/ui/` - ALWAYS use component library (no custom buttons!)

---

## 🚫 DEPRECATO/NON USARE

### OLD Code (Legacy - ONLY for reference):
- ❌ `inglese/*.js` - JavaScript vanilla (use TypeScript)
- ❌ `italiano/` - 100% duplication (use i18n instead)
- ❌ Hardcoded Supabase keys - (use env variables)
- ❌ Direct `fetch()` - (use shared API client)
- ❌ `innerHTML` - (use DOMPurify + safe rendering)
- ❌ `localStorage` - (use sessionStorage or Zustand)
- ❌ PDF rendering - (migrate to LaTeX + KaTeX)

### Patterns to AVOID:
- ❌ Monolithic files >500 lines
- ❌ Global variables
- ❌ `any` type in TypeScript
- ❌ Inline SQL queries
- ❌ Missing error handling
- ❌ No tests

---

## 📊 PROGRESS METRICS

### Overall Progress (33 major milestones):
- ✅ Completed: 2/33 (6%)
- 🔄 In Progress: 1/33 (3%)
- 📋 To Do: 30/33 (91%)

### Phase Progress:
- Phase 0 (Setup): ████████░░ 80% (4/5)
- Phase 1 (Database): ░░░░░░░░░░ 0% (0/5)
- Phase 2 (Packages): ░░░░░░░░░░ 0% (0/3)
- Phase 3 (AI Gen): ░░░░░░░░░░ 0% (0/3) 🔥
- Phase 4 (Web App): ░░░░░░░░░░ 0% (0/5)
- Phase 5 (Mobile): ░░░░░░░░░░ 0% (0/2)
- Phase 6 (Migration): ░░░░░░░░░░ 0% (0/4)
- Phase 7 (Testing): ░░░░░░░░░░ 0% (0/3)
- Phase 8 (Deploy): ░░░░░░░░░░ 0% (0/3)

### Test Coverage:
- Target: >80%
- Current: 0% (no tests yet)

### Security Score:
- API keys: 🔴 Exposed in old code (to be removed)
- RLS: 🟡 Partially implemented (to be audited)
- Input validation: 🔴 Missing (to be added)
- Target: 🟢 All green

---

## 🔥 HOTFIXES & URGENT

*None currently*

---

## 💡 IDEE / BACKLOG (Nice to Have)

### Future Features (After MVP):
- [ ] AI-powered answer explanations
- [ ] Adaptive difficulty algorithm (IRT-based)
- [ ] Real-time collaborative tutoring
- [ ] Video question explanations
- [ ] Gamification (badges, leaderboards)
- [ ] Integration with external test prep platforms
- [ ] Offline mode for mobile app
- [ ] Multi-language support (beyond IT/EN)

---

## 📝 NOTES

### Important Decisions:
1. **Rewrite vs Refactor**: COMPLETE REWRITE chosen (justified by audit)
2. **Tech Stack**: TypeScript + React + Vite + Supabase
3. **Priority**: GMAT + AI generation first
4. **Mobile**: React Native with 60-70% code sharing
5. **Database**: New schema with proper categorization + LaTeX support

### Blockers:
- Need Supabase project credentials for Phase 1
- Need Anthropic API key for Phase 3

### Risks:
- AI question quality - mitigated by human review workflow
- Data migration complexity - mitigated by incremental approach
- Timeline (12 weeks aggressive) - mitigated by MVP-first approach

---

## 📞 TEAM COORDINATION

**Current Sprint**: Week 1 - Foundation
**Next Sync**: Daily updates in this file
**Blockers**: Report immediately in this section

---

**LAST UPDATED**: 2025-11-14
**NEXT REVIEW**: Daily (automatic by Claude Code)
