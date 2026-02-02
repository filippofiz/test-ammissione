# GMATPreparationPage Redesign - Implementation Tracker

> **Status**: Planning Complete - Awaiting Approval
> **Last Updated**: 2026-01-29
> **Branch**: gmat-integrations

---

## Overview

Redesign the GMATPreparationPage with:
- Fixed sidebar (1/3 width) with cycle info and analytics
- Scrollable content (2/3 width) with reorganized sections
- Tutor/Student view toggle
- Test lock/unlock feature
- Dedicated materials page with visibility restrictions

---

## Implementation Progress

### Phase 1: Create Base Components
| Step | Description | Status | Notes |
|------|-------------|--------|-------|
| 1.1 | Create `GMATSidebar.tsx` | ✅ Complete | Created with cycle display, analytics, quick actions |
| 1.2 | Create `GMATViewToggle.tsx` | ✅ Complete | Amber banner with tutor/student toggle |
| 1.3 | Create `GMATTestCard.tsx` with lock animation | ✅ Complete | Full lock animation, color schemes, all states |

### Phase 2: Restructure GMATPreparationPage
| Step | Description | Status | Notes |
|------|-------------|--------|-------|
| 2.1 | Update layout to 1/3 + 2/3 split | ✅ Complete | Sidebar + main content layout with responsive design |
| 2.2 | Reorder content sections | ✅ Complete | New order: Initial Assessment → Training → Assessments → Simulations |
| 2.3 | Rename "Mock Simulations" to "Simulations" | ✅ Complete | All visible references renamed + emojis replaced with icons |
| 2.4 | Integrate GMATSidebar component | ✅ Complete | Already integrated in Step 2.1 |
| 2.5 | Integrate GMATViewToggle component | ✅ Complete | Already integrated in Step 2.1 |

### Phase 3: Test Lock/Unlock Feature
| Step | Description | Status | Notes |
|------|-------------|--------|-------|
| 3.1 | Add lock animation styles | ✅ Complete | Lock overlay + keyframe animations added to page |
| 3.2 | Add lock/unlock state management | ✅ Complete | trainingAssignments state + handlers added |
| 3.3 | Add API functions to `gmat.ts` | ✅ Complete | Using existing 2V_test_assignments table |
| 3.4 | Implement lock/unlock UI in GMATTestCard | ✅ Complete | Lock/unlock buttons visible in tutor view |

### Phase 4: Create GMATMaterialPage
| Step | Description | Status | Notes |
|------|-------------|--------|-------|
| 4.1 | Create `GMATMaterialPage.tsx` | ✅ Complete | Student view with PDF viewer modal |
| 4.2 | Implement visibility restrictions | ✅ Complete | Hidden: Assessments, Context, Slides for students |
| 4.3 | Add routes to `App.tsx` | ✅ Complete | /student/gmat-materials and /tutor/student/:id/gmat-materials-view |
| 4.4 | Add navigation links | ✅ Complete | Sidebar "View Study Materials" button linked |

### Phase 5: Final Polish (Initial)
| Step | Description | Status | Notes |
|------|-------------|--------|-------|
| 5.1 | Responsive design (mobile) | ✅ Complete | Layout uses lg:flex-row for responsive |
| 5.2 | Build verification | ✅ Complete | No TS errors in GMAT files (pre-existing errors in other files) |
| 5.3 | Manual testing | ⬜ Pending | Ready for user testing |

---

## Phase 2 Improvements (January 2026)

### Phase 2.1: Cycle Manager Fix
| Step | Description | Status | Notes |
|------|-------------|--------|-------|
| 2.1.1 | Add "Set Cycle" button when no cycle exists | ✅ Complete | Shows in sidebar for tutors when gmatProgress is null |

### Phase 2.2: Remove Materials Section from Main View
| Step | Description | Status | Notes |
|------|-------------|--------|-------|
| 2.2.1 | Remove Cycle-Based Training Materials section | ✅ Complete | Removed section + unused code/interfaces |
| 2.2.2 | Update GMATMaterialPage filtering (templates, context) | ✅ Complete | Filters: templates, Assessments, Slides, Context (except overview) |

### Phase 2.3: Simulations - Manual Unlock
| Step | Description | Status | Notes |
|------|-------------|--------|-------|
| 2.3.1 | Add simulation_unlocked DB column | ⬜ Pending | |
| 2.3.2 | Add unlock/lock API functions | ⬜ Pending | |
| 2.3.3 | Update UI for manual unlock | ⬜ Pending | |

### Phase 2.4: Topic Training UI Improvements
| Step | Description | Status | Notes |
|------|-------------|--------|-------|
| 2.4.1 | Add GMAT_STRUCTURE for topic ordering | ⬜ Pending | |
| 2.4.2 | Add section icons to topic rows | ⬜ Pending | |
| 2.4.3 | Reorganize tutor/student buttons | ⬜ Pending | |

### Phase 2.5: Section Assessments Improvements
| Step | Description | Status | Notes |
|------|-------------|--------|-------|
| 2.5.1 | Add section assessment lock/unlock API | ⬜ Pending | |
| 2.5.2 | Add lock/unlock UI for tutors | ⬜ Pending | |
| 2.5.3 | Reorganize buttons | ⬜ Pending | |

### Phase 2.6: Initial Assessment Section
| Step | Description | Status | Notes |
|------|-------------|--------|-------|
| 2.6.1 | Add visibility control (hide/show) | ⬜ Pending | |
| 2.6.2 | Add results visibility toggle | ⬜ Pending | |
| 2.6.3 | Fix redirect navigation | ⬜ Pending | |

### Phase 2.7: Sidebar Simplification
| Step | Description | Status | Notes |
|------|-------------|--------|-------|
| 2.7.1 | Simplify to training/assessment progress only | ⬜ Pending | |
| 2.7.2 | Add "View Full Analytics" button | ⬜ Pending | |
| 2.7.3 | Create GMATAnalyticsModal component | ⬜ Pending | |

---

## Detailed Step Specifications

### Step 1.1: Create GMATSidebar.tsx

**File**: `apps/web/src/components/gmat/GMATSidebar.tsx`

**Contents**:
- Student info display (tutor view only): name, email, avatar
- Cycle display with color coding:
  - Foundation: blue
  - Development: purple
  - Excellence: gold
- Progress analytics:
  - Circular progress indicator
  - Questions seen count
  - Assessments completed (0/3 section + mock)
  - Training tests progress
- Estimated GMAT score (if mock completed)
- Quick actions (tutor view):
  - "Change Cycle" button → opens GMATCycleManager modal
  - "View Materials" button → navigates to GMATMaterialPage

**Props**:
```typescript
interface GMATSidebarProps {
  studentId?: string;
  studentInfo?: { full_name: string; email: string; avatar_url?: string };
  gmatProgress: GMATProgress | null;
  placementResult: PlacementResult | null;
  sectionAssessments: SectionAssessments;
  mockSimulation: MockSimulation | null;
  trainingCompletions: Map<string, TrainingCompletion>;
  totalTrainingTests: number;
  isTutorView: boolean;
  viewMode: 'tutor' | 'student';
  onChangeCycle?: () => void;
}
```

---

### Step 1.2: Create GMATViewToggle.tsx

**File**: `apps/web/src/components/gmat/GMATViewToggle.tsx`

**Purpose**: Allow tutors to preview exactly what students see

**UI**: Segmented control with "Tutor View" | "Student Preview"

**Props**:
```typescript
interface GMATViewToggleProps {
  viewMode: 'tutor' | 'student';
  onToggle: (mode: 'tutor' | 'student') => void;
}
```

**Styling**: Amber banner at top of content area

---

### Step 1.3: Create GMATTestCard.tsx

**File**: `apps/web/src/components/gmat/GMATTestCard.tsx`

**Features**:
- Display test info (name, questions, time)
- Show completion status and score
- Lock/unlock button (tutor view only)
- Lock overlay animation (copy from StudentTestsPage lines 42-169)
- Start/Retake/View Results buttons

**Props**:
```typescript
interface GMATTestCardProps {
  title: string;
  subtitle?: string;
  questionCount: number;
  timeMinutes: number;
  completion?: { score_percentage: number; completed_at: string };
  isLocked: boolean;
  isAvailable: boolean;
  showLockControls: boolean;
  onLock?: () => void;
  onUnlock?: () => void;
  onStart: () => void;
  onViewResults?: () => void;
  colorScheme: 'blue' | 'purple' | 'green' | 'indigo';
}
```

---

### Step 2.1: Update Layout to 1/3 + 2/3 Split

**File**: `apps/web/src/pages/GMATPreparationPage.tsx`

**Change from**:
```tsx
<Layout pageTitle={...}>
  <div className="flex-1 p-4 md:p-8">
    <div className="max-w-7xl mx-auto">
      {/* Single column content */}
    </div>
  </div>
</Layout>
```

**Change to**:
```tsx
<Layout pageTitle={...} noScroll>
  <div className="flex h-[calc(100vh-80px)]">
    {/* Sidebar - 1/3 width */}
    <aside className="w-1/3 max-w-md bg-white border-r border-gray-200 overflow-y-auto">
      <GMATSidebar ... />
    </aside>

    {/* Main Content - 2/3 width */}
    <main className="flex-1 overflow-y-auto p-6">
      {isTutorView && <GMATViewToggle ... />}
      {/* Content sections */}
    </main>
  </div>
</Layout>
```

---

### Step 2.2: Reorder Content Sections

**New order in main scroll area**:

1. **Initial Assessment** (lines ~400-600)
   - Placement assessment status
   - Pending validation banner
   - Score and suggested cycle

2. **Topic Training Tests** (lines ~949-1126)
   - Grouped by section (QR, DI, VR)
   - Each with training1, training2, assessment

3. **Section Assessments** (lines ~665-796)
   - QR, DI, VR assessment cards
   - Progress toward simulation readiness

4. **Simulations** (lines ~799-947)
   - Rename from "Mock Simulations"
   - Full GMAT practice tests

5. **Materials Link** (new)
   - Button/card linking to dedicated GMATMaterialPage

---

### Step 3.3: Add API Functions to gmat.ts

**File**: `apps/web/src/lib/api/gmat.ts`

**New functions**:

```typescript
// Interface for GMAT test assignment
interface GMATTestAssignment {
  id: string;
  student_id: string;
  test_type: 'gmat_training' | 'gmat_assessment' | 'gmat_mock';
  test_id: string;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

// Get all GMAT test assignments for a student
export async function getGMATTestAssignments(
  studentId: string
): Promise<GMATTestAssignment[]>

// Create or update a GMAT test assignment
export async function upsertGMATTestAssignment(
  studentId: string,
  testType: string,
  testId: string,
  status: 'locked' | 'unlocked'
): Promise<void>
```

---

### Step 4.1: Create GMATMaterialPage.tsx

**File**: `apps/web/src/pages/GMATMaterialPage.tsx`

**Features**:
- Materials grouped by section > topic > material_type
- Lock/unlock controls (tutor view)
- View/Download PDF buttons
- PDF viewer modal

**Visibility restrictions** (student view hides):
- Assessments section
- Context section
- Slides section

**Always visible**:
- Reference section (formula sheets)

---

### Step 4.3: Add Routes to App.tsx

**File**: `apps/web/src/App.tsx`

**New routes**:
```tsx
<Route path="/student/gmat-materials" element={<GMATMaterialPage />} />
<Route path="/tutor/student/:studentId/gmat-materials" element={<GMATMaterialPage />} />
```

---

## Files to Modify

| File | Action |
|------|--------|
| `apps/web/src/pages/GMATPreparationPage.tsx` | Major restructure |
| `apps/web/src/lib/api/gmat.ts` | Add lock/unlock API functions |
| `apps/web/src/App.tsx` | Add new routes |
| `apps/web/src/components/gmat/GMATSidebar.tsx` | **Create new** |
| `apps/web/src/components/gmat/GMATViewToggle.tsx` | **Create new** |
| `apps/web/src/components/gmat/GMATTestCard.tsx` | **Create new** |
| `apps/web/src/pages/GMATMaterialPage.tsx` | **Create new** |

---

## Verification Checklist

### After Each Step
- [ ] No TypeScript errors (`pnpm build` passes)
- [ ] UI renders correctly
- [ ] User confirmation received

### Final Testing
- [ ] Tutor view: sidebar, toggle, lock/unlock, materials
- [ ] Student view: correct content, locked items hidden
- [ ] Responsive: mobile layout stacks correctly
- [ ] Navigation: all links work

---

## Change Log

| Date | Step | Change Description |
|------|------|-------------------|
| 2026-01-29 | - | Initial plan created |

