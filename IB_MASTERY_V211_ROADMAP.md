# IB MASTERY v211 — Integrated Product Roadmap

## Board of Experts — Production Codebase Audit

**Codebase:** `IBMasterySuite.jsx` (26,201 lines) | **Build:** v210 | **Date:** 2026-03-01

---

## DELIVERABLE 1: The Friction Top-5

### F1. The Monolith Tax (UAT/SIT Expert)
The 26,201-line single file contains ~6,975 lines of pure data constants (`THEMES`: 4,297 lines, `PBQ`: 1,924 lines), ~342 lines of **inlined minified jsPDF/omggif libraries**, and 10,166 lines of JSX render. The Firebase Cloud Function deployment is now **consistently failing** with `MODULE_NOT_FOUND` / OOM during function analysis because the bundled output exceeds Node's default heap. A parallel modular architecture already exists at `src/components/ib-mastery/` with 30+ extracted files — but the monolith doesn't use it. Every deploy is a coin flip.

### F2. Inconsistent Visual Hierarchy (UI Designer)
Three competing card systems coexist: the `Card` component (shadow, no border by default), `ScrollCard` (shadow, optional border), and **194 raw inline `border:` declarations** scattered across ad-hoc `<div>` elements. `StatBox` uses border-only, no shadow — the opposite of `Card`. The `.sm-card` CSS override forces `border: none !important`, which silently overrides the `interactive` prop on `Card`. The result: no consistent visual weight system. Some cards float, some are flat, some have borders that get nuked by the theme.

### F3. AI Grading Prompt Doesn't Request Structured AO Scores (Examiner)
The Criterion Proficiency bar chart (lines 18896-18941) uses regex to parse `AO1: 5`, `Criterion A: 3/5` from the AI's markdown response. But the AI grading prompt (line 14750) **never explicitly asks for AO scores** for non-humanities subjects. The `HUMANITIES_RUBRICS` injection (line 14784) only fires for subjects in `HUMANITIES_SUBJECTS`. For Math AI, Sports Science, and English — the most common subjects — the criterion bars will always be empty because the AI has no instruction to output `AO1: X` format scores.

### F4. Sidebar Dims But Still Captures Layout Space (UX Designer)
The sidebar opacity-dim during `studyMode === 'active'` (line 15928) is implemented but architecturally incomplete. The sidebar still occupies 60px of `marginLeft` on the content area (line 16015: `ml-[60px]`). The dimmed sidebar is a visual ghost occupying real estate. Additionally, the hover-to-reveal uses `e.currentTarget.style.opacity` (imperative DOM mutation) which doesn't trigger React re-renders and may conflict with React's reconciliation.

### F5. No Daily Goal Persistence Loop (CX Expert)
The Daily Commitment bar (implemented at ~line 25042) counts today's sessions from `repo`, but it has no configurable goal storage. The hardcoded `profile?.dailyGoal || 3` fallback means the user can never change their daily target — there's no UI to set it. The `profile` object's shape doesn't include `dailyGoal`. Without persistence, the feature is static decoration, not a behavioral loop.

---

## DELIVERABLE 2: The Integrated Roadmap

| # | Task | Expert | Impact | Effort | Priority |
|---|------|--------|--------|--------|----------|
| 1 | **Extract data constants** to fix deploy OOM | UAT/SIT | Critical — deploy is broken | Medium (move files, update imports) | P0 — Ship blocker |
| 2 | **Add AO scoring instruction** to AI grading prompt for all subjects | Examiner | High — criterion bars currently empty for 3/4 subjects | Low (add 3 lines to prompt template) | P1 |
| 3 | **Unify card visual hierarchy** — single `CardBase` component, remove 194 inline borders | UI Designer | Medium — visual polish | High (194 scattered replacements) | P2 |
| 4 | **Sidebar collapse to zero-width** during active study + reclaim `ml-[60px]` | UX / Student | Medium — focus improvement | Low (conditional className) | P1 |
| 5 | **Add `dailyGoal` to profile** + settings UI + persistence | CX / Game Designer | Medium — retention mechanic | Low (~20 lines) | P1 |
| 6 | **Trend arrows everywhere** — unify computation into helper function | Teacher | Medium — actionable intelligence | Low (extract to helper, call in 4 places) | P2 |
| 7 | **Escape-key dismissal** for Daily Orders overlay | Student | Low — QoL | Trivial (3 lines) | P3 |
| 8 | **Wire monolith to `ib-mastery/` modules** — full Great Split | UAT/SIT | High — maintainability | Very High (weeks of work) | P3 — Deferred |

---

## DELIVERABLE 3: Technical Implementation Plan

### Fix 1: Extract Data Constants to Fix Deploy OOM (P0)

**Root Cause:** Firebase's `frameworksBackend` bundles the entire Next.js app into a Cloud Function. The 26K-line JSX with ~7K lines of inlined data constants causes the function analysis step to OOM (`Timeout after 10000`).

**File:** `src/components/IBMasterySuite.jsx`

**Step 1a — Extract `THEMES` (4,297 lines)**

The `THEMES` constant at lines 1961-6257 is already duplicated in `src/components/ib-mastery/constants/skinCss.js`. Move it out:

```javascript
// NEW FILE: src/components/themes.js
// Move lines 1961-6257 from IBMasterySuite.jsx
export const THEMES = { /* ... */ };
```

In `IBMasterySuite.jsx`, replace with:
```javascript
// Line 1961 — replace the entire THEMES block with:
import { THEMES } from './themes';
```

**Step 1b — Extract `PBQ` question bank (1,924 lines)**

Lines 6258-8181. Already duplicated in `src/components/ib-mastery/data/preBuiltQuestions.js`:

```javascript
// NEW FILE: src/components/pbq.js
// Move lines 6258-8181 from IBMasterySuite.jsx
export const PBQ = { /* ... */ };
```

Replace with:
```javascript
import { PBQ } from './pbq';
```

**Step 1c — Extract `MARINES` SVG data (490 lines)**

Lines 1382-1872:

```javascript
// NEW FILE: src/components/marines.js
// Move lines 1382-1872
export const MARINES = { /* ... */ };
```

**Step 1d — Move jsPDF/omggif to npm packages**

Lines 13763-13994 contain minified library blobs loaded via `eval`-style `<script>` injection. Replace with:

```bash
npm install jspdf omggif
```

Then replace `loadJsPDF()` (line ~13763) with:
```javascript
const loadJsPDF = async () => {
  const { jsPDF } = await import('jspdf');
  return jsPDF;
};
```

**Expected Result:** Reduces `IBMasterySuite.jsx` from ~26,201 to ~19,000 lines. The Cloud Function bundler no longer OOMs because the data constants are tree-shaken into separate chunks.

---

### Fix 2: Add AO Scoring to AI Prompt for All Subjects (P1)

**File:** `src/components/IBMasterySuite.jsx`, line ~14809

**Problem:** The grading prompt only requests criterion breakdowns for humanities subjects (guarded by `if (isHumanities && HUMANITIES_RUBRICS[...])`). For Math AI, Sports Science, English — the criterion proficiency bars at line 18896 parse nothing because the AI never outputs `AO1: X` format.

**Fix:** Add a universal AO scoring instruction to the prompt for ALL subjects, after the humanities-specific `rubricPrompt`:

```javascript
// Line 14809 — find the prompt assembly line:
const prompt = `Grade this study session:\n\n${qa}...`;

// CHANGE TO:
const aoInstruction = !isHumanities ? `\n\nAfter grading all questions, provide an Assessment Objective breakdown:
AO1 (Knowledge & Understanding): X/7
AO2 (Application & Analysis): X/7
AO3 (Synthesis & Evaluation): X/7
Score each AO from 1-7 based on the student's demonstrated ability across all questions.` : '';

// Then append ${aoInstruction} to the prompt string
```

**Verification:** After deploying, run a Math AI study session. The Detailed Analysis should now show `AO1: X/7`, `AO2: X/7`, `AO3: X/7` in the AI response, and the existing regex parser at line 18899 will pick them up automatically.

---

### Fix 3: Sidebar Collapse During Active Study (P1)

**File:** `src/components/IBMasterySuite.jsx`

**Current state (line 15928):**
```jsx
style={{ width: sidebarOpen ? 190 : 60, background: '#FFFFFF', borderRight: `1px solid ${IRON_BORDER}`,
  opacity: studyMode === 'active' ? 0.2 : 1, transition: 'opacity 0.3s, width 0.3s' }}
onMouseEnter={e => { if (studyMode === 'active') e.currentTarget.style.opacity = '1'; }}
onMouseLeave={e => { if (studyMode === 'active') e.currentTarget.style.opacity = '0.2'; }}>
```

**Replace line 15928 with:**
```jsx
style={{
  width: studyMode === 'active' ? 0 : (sidebarOpen ? 190 : 60),
  background: '#FFFFFF',
  borderRight: studyMode === 'active' ? 'none' : `1px solid ${IRON_BORDER}`,
  opacity: 1,
  transition: 'width 0.3s, opacity 0.3s',
  overflow: 'hidden',
  pointerEvents: studyMode === 'active' ? 'none' : 'auto',
}}>
```

Remove the `onMouseEnter`/`onMouseLeave` handlers — they use imperative DOM mutation.

**Then fix the content area (line 16015):**
```jsx
// CURRENT:
className={`... ${sidebarOpen ? 'ml-[190px]' : 'ml-[60px]'} ...`}

// CHANGE TO:
className={`... ${studyMode === 'active' ? 'ml-0' : sidebarOpen ? 'ml-[190px]' : 'ml-[60px]'} ...`}
```

**Result:** During active study, the sidebar fully collapses to `width: 0` and the content area reclaims the full viewport width.

---

### Fix 4: Daily Goal Persistence (P1)

**File:** `src/components/IBMasterySuite.jsx`

**Step 4a — Profile read.** The `profile?.dailyGoal || 3` fallback already works. No schema change needed — `saveProfile()` persists whatever keys are on the profile object.

**Step 4b — Add settings UI in Machine Spirit tab (line ~24421):**

```jsx
<div style={{ marginBottom: 16 }}>
  <label style={{ color: SHELL_TEXT_DIM, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
    fontFamily: SHELL_MONO, display: 'block', marginBottom: 8 }}>DAILY SESSION GOAL</label>
  <div style={{ display: 'flex', gap: 6 }}>
    {[1, 2, 3, 4, 5].map(n => (
      <button key={n} onClick={() => saveProfile({ ...profile, dailyGoal: n })}
        style={{
          width: 40, height: 40, borderRadius: 8, fontSize: 14, fontWeight: 800,
          cursor: 'pointer', border: 'none',
          background: (profile?.dailyGoal || 3) === n ? `${accent}15` : '#F3F4F6',
          color: (profile?.dailyGoal || 3) === n ? accent : '#6B7280',
          boxShadow: (profile?.dailyGoal || 3) === n ? `0 0 0 2px ${accent}40` : 'none',
        }}>{n}</button>
    ))}
  </div>
</div>
```

**Result:** The daily commitment bar reads `profile.dailyGoal`, which persists to localStorage via `saveProfile()`. The user can configure 1-5 sessions.

---

### Fix 5: Unified Trend Helper Function (P2)

**File:** `src/components/IBMasterySuite.jsx`

**Step 5a — Define helper after `getSubjectEffectiveGrade` (line ~8228):**

```javascript
function getSubjectTrend(subjectName, repo) {
  const sessions = (repo || [])
    .filter(r => r.subject === subjectName && r.type === 'study' && (r.aiGrade || r.grade))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = sessions[0]?.aiGrade || sessions[0]?.grade || null;
  const prev = sessions[1]?.aiGrade || sessions[1]?.grade || null;
  if (!latest || !prev) return { arrow: null, diff: null, color: '#6B7280' };
  const diff = latest - prev;
  return {
    arrow: diff > 0 ? '▲' : diff < 0 ? '▼' : '—',
    diff,
    color: diff > 0 ? '#16A34A' : diff < 0 ? '#DC2626' : '#6B7280',
    label: `${diff > 0 ? '+' : ''}${diff} from last session`,
  };
}
```

**Step 5b — Replace 4 inline trend computations** (Grade Gaps line ~25293, Chapter Master line ~25484, Intel weekly line ~19900, topic weakness line ~12716) with:

```javascript
const trend = getSubjectTrend(s.name, repo);
// Render:
{trend.arrow && <span style={{ color: trend.color, fontSize: 11, fontWeight: 800 }}
  title={trend.label}>{trend.arrow} {trend.diff > 0 ? '+' : ''}{trend.diff}</span>}
```

---

## Deploy Note

The current build compiles successfully (`npm run build` passes) but **Firebase deployment is consistently failing** with Cloud Function OOM. **Fix 1 (data extraction) must be implemented before any further deploys.** The `THEMES` constant alone (4,297 lines of CSS template literals) is the primary contributor.

**Immediate workaround:** `firebase deploy --only hosting --except functions` to skip function rebuild (only works if existing function version is compatible).

---

## Monolith Structure Reference

| Section | Lines | Size | Extractable? |
|---------|-------|------|-------------|
| Scroll/UI primitives | 11-1379 | 1,369 | Yes — already in `ib-mastery/shared/` |
| `MARINES` SVG data | 1382-1872 | 490 | Yes — pure data |
| `THEMES` CSS tokens | 1961-6257 | 4,297 | Yes — already in `ib-mastery/constants/skinCss.js` |
| `PBQ` question bank | 6258-8181 | 1,924 | Yes — already in `ib-mastery/data/preBuiltQuestions.js` |
| Utility functions | 8182-10010 | 1,829 | Yes — already in `ib-mastery/utils/` |
| **IBMasterySuite main** | **10011-25950** | **15,940** | Partially — tabs can extract |
| Tab: `study/exam` | 17320-19870 | 2,551 | Yes — `ib-mastery/tabs/TrialByOrdeal.jsx` |
| Tab: `repository` | 22094-24420 | 2,327 | Yes — new `Repository.jsx` |
| Tab: `intel` | 19871-21690 | 1,820 | Yes — `ib-mastery/tabs/AnnalsOfConflict.jsx` |
| jsPDF/omggif blobs | 13763-13994 | 342 | Yes — replace with npm packages |

**Target:** Reduce monolith from 26,201 → ~12,000 lines (Phase 1 data extraction), then → ~5,000 lines (Phase 2 tab extraction using existing `ib-mastery/tabs/`).
