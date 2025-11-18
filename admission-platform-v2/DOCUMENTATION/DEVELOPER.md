# Developer Guide

Complete setup and development guide for the Admission Platform v2.

---

## 🛠️ Development Environment Setup

### Required Tools
- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **pnpm**: v8.0.0 or higher (`npm install -g pnpm`)
- **Git**: Latest version
- **VS Code** (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Supabase (unofficial)

### Optional Tools
- **Docker** (for local Supabase)
- **React DevTools** (browser extension)
- **Expo CLI** (for mobile development)

---

## 📦 Project Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/admission-test.git
cd admission-test
git checkout NewCodeTypescript
cd admission-platform-v2
```

### 2. Install Dependencies
```bash
# Install all packages (monorepo)
pnpm install
```

### 3. Environment Configuration

Create `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Anthropic API (via Supabase Edge Function)
VITE_ANTHROPIC_PROXY_URL=https://your-project.supabase.co/functions/v1/generate-question

# Environment
VITE_ENV=development
```

### 4. Database Setup

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref your-project-ref

# Run migrations
npx supabase db push

# Generate TypeScript types
npx supabase gen types typescript --project-id your-project-id > packages/shared/src/types/database.ts
```

### 5. Run Development Server
```bash
# Run all apps (web + mobile)
pnpm dev

# Run specific app
pnpm --filter web dev
pnpm --filter mobile dev

# Run shared package in watch mode
pnpm --filter shared dev
```

---

## 🏗️ Project Structure

### Monorepo Organization
```
admission-platform-v2/
├── apps/
│   ├── web/                    # Web application
│   │   ├── src/
│   │   │   ├── features/       # Feature modules (organized by domain)
│   │   │   ├── components/     # UI components
│   │   │   ├── pages/          # Route pages
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── lib/            # Utilities
│   │   │   └── main.tsx        # Entry point
│   │   ├── public/             # Static assets
│   │   ├── index.html          # HTML template
│   │   ├── vite.config.ts      # Vite configuration
│   │   ├── tsconfig.json       # TypeScript config
│   │   └── package.json
│   │
│   └── mobile/                 # React Native app
│       ├── src/
│       │   ├── screens/
│       │   ├── navigation/
│       │   ├── components/
│       │   └── App.tsx
│       └── package.json
│
├── packages/
│   ├── shared/                 # Shared business logic (60-70% reuse)
│   │   ├── src/
│   │   │   ├── api/           # Supabase client & API calls
│   │   │   │   ├── client.ts          # Supabase instance
│   │   │   │   ├── auth.ts            # Auth operations
│   │   │   │   ├── tests.ts           # Test operations
│   │   │   │   └── questions.ts       # Question operations
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useTests.ts
│   │   │   │   └── useTestAttempt.ts
│   │   │   ├── types/         # TypeScript types
│   │   │   │   ├── database.ts        # Auto-generated from Supabase
│   │   │   │   ├── test.ts
│   │   │   │   └── question.ts
│   │   │   ├── utils/         # Utility functions
│   │   │   │   ├── validators/        # Input validation
│   │   │   │   ├── formatters/        # Data formatting
│   │   │   │   ├── sanitize.ts        # DOMPurify wrapper
│   │   │   │   └── encryption.ts      # Encryption utils
│   │   │   ├── stores/        # Zustand stores
│   │   │   │   ├── authStore.ts
│   │   │   │   └── testStore.ts
│   │   │   ├── constants/     # Constants
│   │   │   │   ├── routes.ts
│   │   │   │   ├── config.ts
│   │   │   │   └── messages.ts
│   │   │   └── validation/    # Zod schemas
│   │   │       ├── user.ts
│   │   │       ├── test.ts
│   │   │       └── question.ts
│   │   ├── __tests__/         # Tests
│   │   ├── vitest.config.ts   # Vitest configuration
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── ui/                    # UI component library
│   │   ├── src/
│   │   │   ├── button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── input/
│   │   │   ├── card/
│   │   │   ├── modal/
│   │   │   └── index.ts       # Export all components
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── test-engine/           # Test logic engine
│       ├── src/
│       │   ├── adapters/      # Test type adapters
│       │   │   ├── TestAdapter.ts      # Base interface
│       │   │   ├── GMATAdapter.ts      # GMAT logic
│       │   │   ├── SATAdapter.ts       # SAT logic
│       │   │   └── index.ts
│       │   ├── scoring/       # Scoring algorithms
│       │   │   ├── gmatscore.ts
│       │   │   └── satScore.ts
│       │   ├── timer/         # Timer service
│       │   │   └── TimerService.ts
│       │   └── navigation/    # Question navigation
│       │       └── NavigationService.ts
│       ├── tsconfig.json
│       └── package.json
│
├── supabase/
│   ├── migrations/            # SQL migrations
│   │   ├── 001_users_v2.sql
│   │   ├── 002_tests_v2.sql
│   │   ├── 003_questions_v2.sql
│   │   ├── 004_ai_questions.sql
│   │   └── 005_attempts.sql
│   └── functions/             # Edge Functions
│       ├── generate-question/
│       │   └── index.ts
│       └── claude-proxy/
│           └── index.ts
│
├── DOCUMENTATION/             # Documentation
├── package.json               # Root package.json
├── turbo.json                 # Turborepo pipeline
├── tsconfig.json              # Base TypeScript config
└── .env.example               # Environment template
```

---

## 🔐 Authentication & Navigation Flow

### Login Flow

The application implements intelligent post-login navigation based on user roles and test assignments:

```typescript
// 1. User logs in
// 2. Check must_change_password flag
//    → If true: Redirect to /change-password
// 3. After password change: Sign out and redirect to /login
// 4. On successful login:
//    → Check user roles:
//      - Single role (STUDENT):
//        - 1 test: Navigate to /home
//        - Multiple tests: Navigate to /test-selection
//        - 0 tests: Show error
//      - Single role (TUTOR/ADMIN): Navigate to /home (dashboard)
//      - Multiple roles: Navigate to /role-selection
```

### Authentication Components

#### Web Application
```typescript
// apps/web/src/components/ProtectedRoute.tsx
// Route-level authentication guard
<Route path="/test-selection" element={
  <ProtectedRoute requiredRoles={['STUDENT']}>
    <TestSelectionPage />
  </ProtectedRoute>
} />

// apps/web/src/components/Layout.tsx
// Shared layout with header, user info, logout
<Layout>
  {/* Page content */}
</Layout>
```

#### Mobile Application
```typescript
// apps/mobile/src/navigation/AppNavigator.tsx
// Stack navigator with all routes
<Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
<Stack.Screen name="TestSelection" component={TestSelectionScreen} />

// apps/mobile/src/components/Layout.tsx
// Shared mobile layout with header
<Layout>
  {/* Screen content */}
</Layout>
```

### Page-Level Security

Each protected page implements security checks in `useEffect`:

```typescript
// Example: TestSelectionPage
useEffect(() => {
  loadProfile();
}, []);

const loadProfile = async () => {
  const userProfile = await getCurrentProfile();

  if (!userProfile) {
    navigate('/login', { replace: true });
    return;
  }

  const roles = userProfile.roles as string[] || [];
  const tests = userProfile.tests as string[];

  // Security: Only students should access this page
  if (!roles.includes('STUDENT')) {
    navigate('/', { replace: true });
    return;
  }

  // Verify user has multiple tests (otherwise shouldn't be here)
  if (!tests || tests.length <= 1) {
    navigate('/', { replace: true });
    return;
  }

  setProfile(userProfile);
  setLoading(false);
};
```

### Database RPC Functions

For operations that require bypassing RLS (like password changes):

```sql
-- supabase/migrations/004_create_change_password_rpc.sql
CREATE OR REPLACE FUNCTION public.update_password_changed(user_auth_uid UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE "2V_profiles"
  SET
    must_change_password = false,
    last_password_change = now(),
    updated_at = now()
  WHERE auth_uid = user_auth_uid;

  RETURN FOUND;
END;
$$;
```

Usage in client code:
```typescript
// Call RPC instead of direct table update
const { data, error } = await supabase
  .rpc('update_password_changed', { user_auth_uid: user.id });
```

### Navigation Screens

#### Web Routes (Implemented)
- `/login` - Login page (public) ✅
- `/change-password` - Force password change (protected) ✅
- `/role-selection` - Choose role (protected, multi-role users) ✅
- `/test-selection` - Choose test (protected, STUDENT role, multiple tests) ✅
- `/` - Home/Dashboard (protected, role-specific) 🚧 In Progress

#### Mobile Screens (Implemented)
- `Login` - Login screen (public) ✅
- `ChangePassword` - Force password change (protected) ✅
- `RoleSelection` - Choose role (protected, multi-role users) ✅
- `TestSelection` - Choose test (protected, STUDENT role, multiple tests) ✅
- `Home` - Home/Dashboard (protected, role-specific) 🚧 In Progress

---

## 🎨 Coding Standards

### TypeScript

#### ALWAYS
- ✅ Use TypeScript (never JavaScript)
- ✅ Enable `strict` mode
- ✅ Define explicit types (no `any`)
- ✅ Use interfaces for objects
- ✅ Use type guards for runtime checks

#### NEVER
- ❌ Use `any` type (use `unknown` if needed)
- ❌ Disable TypeScript errors with `@ts-ignore`
- ❌ Use `var` (use `const` or `let`)

```typescript
// ✅ GOOD
interface User {
  id: string;
  email: string;
  role: 'student' | 'tutor';
}

function getUser(id: string): Promise<User | null> {
  // ...
}

// ❌ BAD
function getUser(id: any): any {
  // ...
}
```

### React

#### Component Structure
```tsx
// ✅ GOOD - Functional component with TypeScript
import { useState } from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      {loading ? 'Loading...' : label}
    </button>
  );
}
```

#### Hooks
- Use `useState` for component state
- Use `useQuery` (TanStack Query) for server state
- Use Zustand for global state
- Custom hooks for reusable logic

```typescript
// packages/shared/src/hooks/useAuth.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../api/client';

export function useAuth() {
  const { data: session, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    }
  });

  return { session, isLoading };
}
```

### Styling (Tailwind CSS)

```tsx
// ✅ GOOD - Tailwind with responsive classes
<div className="p-4 md:p-6 bg-white rounded-lg shadow">
  <h1 className="text-2xl md:text-3xl font-bold">Title</h1>
</div>

// ❌ BAD - Inline styles
<div style={{ padding: '16px', background: 'white' }}>
  <h1 style={{ fontSize: '24px' }}>Title</h1>
</div>
```

### API Calls (Supabase)

```typescript
// ✅ GOOD - Use shared API client
import { supabase } from '@admission/shared/api/client';

export async function getTests() {
  const { data, error } = await supabase
    .from('tests_v2')
    .select('*')
    .eq('is_active', true);

  if (error) throw error;
  return data;
}

// ❌ BAD - Direct fetch or inline Supabase init
const response = await fetch('https://...');
```

### Validation (Zod)

```typescript
// packages/shared/src/validation/user.ts
import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
});

export type UserInput = z.infer<typeof userSchema>;

// Usage
const result = userSchema.safeParse(input);
if (!result.success) {
  console.error(result.error);
}
```

---

## 🧪 Testing

### Unit Tests (Vitest)

```typescript
// packages/shared/src/utils/__tests__/sanitize.test.ts
import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '../sanitize';

describe('sanitizeHtml', () => {
  it('removes script tags', () => {
    const input = '<script>alert("xss")</script><p>Hello</p>';
    const output = sanitizeHtml(input);
    expect(output).toBe('<p>Hello</p>');
  });

  it('allows safe HTML', () => {
    const input = '<p>Hello <strong>world</strong></p>';
    const output = sanitizeHtml(input);
    expect(output).toBe(input);
  });
});
```

### Integration Tests

```typescript
// packages/shared/src/api/__tests__/tests.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { createTestClient } from '../test-utils';
import { getTests } from '../tests';

describe('getTests API', () => {
  beforeAll(async () => {
    // Setup test data
  });

  it('returns active tests', async () => {
    const tests = await getTests();
    expect(tests).toHaveLength(3);
    expect(tests[0].is_active).toBe(true);
  });
});
```

### E2E Tests (Playwright)

```typescript
// apps/web/e2e/student-test-flow.spec.ts
import { test, expect } from '@playwright/test';

test('student can complete GMAT test', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Login
  await page.fill('[data-testid="email"]', 'student@test.com');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="login-btn"]');

  // Choose test
  await expect(page.locator('h1')).toContainText('My Tests');
  await page.click('[data-testid="test-card-gmat"]');

  // Answer question
  await page.click('[data-testid="answer-a"]');
  await page.click('[data-testid="next-btn"]');

  // Verify
  await expect(page.locator('[data-testid="question-2"]')).toBeVisible();
});
```

---

## 🔐 Security Best Practices

### 1. No Hardcoded Secrets
```typescript
// ❌ BAD
const API_KEY = 'sk-ant-api03-...';

// ✅ GOOD
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
```

### 2. Input Validation
```typescript
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Validate + Sanitize
const schema = z.object({
  email: z.string().email(),
  name: z.string().transform(v => DOMPurify.sanitize(v))
});
```

### 3. RLS Policies
```sql
-- Always enable RLS
ALTER TABLE tests_v2 ENABLE ROW LEVEL SECURITY;

-- Strict policies
CREATE POLICY "Students see only assigned tests" ON tests_v2
FOR SELECT USING (
  id IN (
    SELECT test_id FROM test_assignments_v2
    WHERE student_id = auth.uid()
  )
);
```

### 4. Safe HTML Rendering
```tsx
import DOMPurify from 'isomorphic-dompurify';

// ❌ DANGEROUS
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SAFE
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

---

## 🚀 Deployment

### Build for Production
```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter web build
```

### Deploy Supabase Migrations
```bash
npx supabase db push --linked
```

### Deploy Edge Functions
```bash
npx supabase functions deploy generate-question
```

---

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: TypeScript errors after pulling new code
```bash
# Solution: Reinstall dependencies
pnpm install
pnpm --filter shared build
```

**Issue**: Supabase types out of sync
```bash
# Solution: Regenerate types
npx supabase gen types typescript --project-id your-project-id > packages/shared/src/types/database.ts
```

**Issue**: Port already in use
```bash
# Solution: Kill process or change port
# Kill:
npx kill-port 5173
# Or change vite.config.ts:
server: { port: 3000 }
```

---

**Last Updated**: 2025-11-15
