# 🏛️ EOMS Design System — MASTER.md
### Single Source of Truth for EOMS Presentation Layer

<!-- taste-skill:dials VARIANCE=low MOTION=subtle DENSITY=medium -->

---

## 1. Brand Identity & Design Principles

The **Employee Onboarding Management System (EOMS)** is an executive-grade orchestration platform built for high-growth corporate tech ecosystems in India (Bengaluru, Hyderabad, Pune, Gurugram).

### Core Principles
1. **Calm Authority & Progressive Disclosure**: Replaces administrative clutter with clean white space, subtle sage gradients, and tabular clarity. Primary data is visible immediately; secondary details live within accessible modals and slide-overs.
2. **Tabular Precision & Zero Slop**: Every number, date, and metric aligns on tabular grids (`font-feature-settings: 'tnum'`). No generic stock card layouts, no emoji clutter—100% crisp Lucide SVG iconography.
3. **Intentional Feedback & Physical Restraint**: Transitions use calibrated spring/ease timing (180–220ms). Animations convey state changes (e.g. task progress recalculated, card expansion) without gratuitous bouncing.

---

## 2. Taste Calibration Dials

| Dial | Setting | Concrete Behavioral Rules |
|---|:---:|---|
| **VARIANCE** | `Low` | Rigid layout consistency. Cards across Employee Directory, Onboarding, Documents, and LMS share identical corner radii (`--r-md` / `--r-lg`), border weights (`1px solid var(--border-subtle)`), and header hierarchies. |
| **MOTION** | `Subtle` | 180ms ease-out for hover states; 220ms spring (`damping: 24, stiffness: 300`) for modal entry/exit and card scale. No floating/looping idle animations. |
| **DENSITY** | `Medium` | Balanced for desktop enterprise workflows: 14–16px base font, 40–44px input and button heights, 16–20px card padding (`--sp-4` to `--sp-5`). Minimum 44×44px interactive tap target area. |

---

## 3. Design Tokens Architecture

### 3.1 Color Tokens (Sage & Slate Palette)
```css
:root {
  /* Sage Foundation */
  --sage-50:    #F0F9EC;
  --sage-100:   #DCF0D3;
  --sage-200:   #B8DBA8;
  --sage-300:   #8EC87E;
  --sage-400:   #61AE55;
  --sage-500:   #4A9B6B;
  --sage-600:   #3A8458;
  --sage-700:   #2B7A4B;
  --sage-800:   #1E5E39;
  --sage-900:   #1A3C2A;

  /* Surfaces & Containers */
  --bg-app:          var(--sage-50);
  --bg-surface:      #FFFFFF;
  --bg-surface-tint: #EBF7E4;
  --bg-surface-hover:#F3FBF0;
  --bg-subtle:       var(--sage-100);
  --dark-panel:      #1C2B20;
  --dark-panel-hover:#243629;

  /* Borders & Dividers */
  --border-subtle:   #D2E8C8;
  --border-default:  #B8D8A8;
  --border-strong:   #8EC87E;
  --border-focus:    var(--sage-600);

  /* Primary Accent */
  --primary:         var(--sage-700);
  --primary-hover:   var(--sage-800);
  --primary-active:  var(--sage-900);
  --primary-light:   var(--sage-100);
  --primary-ring:    rgba(43, 122, 75, 0.2);

  /* Typography */
  --text-primary:    #111B14;
  --text-secondary:  #3D5C47;
  --text-muted:      #7FA08A;
  --text-inverse:    #FFFFFF;

  /* Semantic Feedback & Task Priorities */
  --priority-critical-bg:     #FEF2F2;
  --priority-critical-border: #FECACA;
  --priority-critical-text:   #DC2626;

  --priority-high-bg:         #FFFBEB;
  --priority-high-border:     #FDE68A;
  --priority-high-text:       #D97706;

  --priority-medium-bg:       #EFF6FF;
  --priority-medium-border:   #BFDBFE;
  --priority-medium-text:     #2563EB;

  --priority-low-bg:          #F3F4F6;
  --priority-low-border:      #E5E7EB;
  --priority-low-text:        #4B5563;
}
```

### 3.2 Spacing & Radii
- Spacing: `--sp-1` (4px), `--sp-2` (8px), `--sp-3` (12px), `--sp-4` (16px), `--sp-5` (20px), `--sp-6` (24px), `--sp-8` (32px).
- Radii: `--r-sm` (4px), `--r-md` (8px), `--r-lg` (12px), `--r-full` (9999px).

---

## 4. Component Standards

### 4.1 "Add Employee" Credential Form Pattern
- **Layout**: 2-column grid grouping "Work Email" and "Initial Password" side by side.
- **Password Input**:
  - Requires minimum 8 characters.
  - Interactive eye toggle (`Eye` / `EyeOff` from `lucide-react`) allowing HR to review the password before submission.
  - Subtext helper explaining credentials policy for new hires.

### 4.2 Onboarding Cohort Card Pattern
- **Card Container**: `$hoverable` styled container with visual lift on hover (`transform: translateY(-2px); box-shadow: 0 4px 12px rgba(27,60,42,0.08)`). Cursor set to `pointer` indicating clickability.
- **Header Slot**:
  - Employee Avatar + Full Name + Job Position.
  - Plan Status Badge (`Completed`, `On Track`, `In Progress`).
- **Plan & Priority Chips**:
  - Assigned Curriculum / Template Title pill (e.g. `Engineering 90-Day Ramp-Up`).
  - Active Priority Tag: Displays the highest pending task priority (`Critical` 🔴, `High` 🟡, or `Medium` 🔵) so managers see urgent bottlenecks instantly.
- **Progress Gauge**: SVG `RadialProgress` ring with tabular percentage label.

### 4.3 Plan Roadmap Detail Modal Pattern
- **Modal Dimensions**: Width 720px max, responsive with full-height scroll on small screens.
- **Header**: Employee profile, Department, Tech Hub, Start Date, Target Date, and live recalculated progress bar.
- **Phased Checklists**: Accordion or chronological list of phases (Pre-boarding, Day 1, Week 1, 30 Days, 60 Days, 90 Days).
- **Task Row Item**:
  - Checkbox or status icon (`not_started`, `in_progress`, `completed`).
  - Title and category badge (`Compliance`, `IT Setup`, `Training`, `Management`).
  - Priority badge chip with exact semantic coloring.
- **Action Toolbar**:
  - "+ Add Priority Task" button visible to Admins, HR, and Managers.
  - Inline sub-form to input task title, priority (`critical`, `high`, `medium`, `low`), and assign to a specific phase checklist.

### 4.4 "Assign Plan" Modal Pattern
- **Employee Selector**: Lists all employees. Employees without an active plan are badged `(Awaiting Plan)`, appearing at the top of the list.
- **Smart Assignment Engine**:
  - If the selected employee has **no plan**: creates a new `OnboardingPlan` linked to the chosen template.
  - If the selected employee **already has a plan**: seamlessly appends the template's phases and tasks (or selected priority task) to their existing plan without throwing 409 Conflict.
