# TestSprite AI Testing Report (MCP) — Docente App

---

## 1️⃣ Document Metadata
- **Project Name:** Docente App - Pro
- **Date:** 2026-02-25
- **Prepared by:** TestSprite AI Team
- **Test Scope:** Full codebase (frontend)
- **Total Tests:** 34
- **Pass Rate:** 47.06% (16/34)

---

## 2️⃣ Requirement Validation Summary

### Navigation (1 test)

| Test ID | Title | Status | Analysis |
|---------|-------|--------|----------|
| TC001 | Repeated click on the same nav button does not break the view (Notas) | ✅ Passed | Navigation remains stable when clicking the already-active nav button multiple times. View and content persist correctly. |

---

### Course Management (8 tests)

| Test ID | Title | Status | Analysis |
|---------|-------|--------|----------|
| TC002 | View Cursos list and course card details | ✅ Passed | Courses list renders correctly with card details including name, schedule, student count, and progress bar. |
| TC003 | Open Add Course modal from Cursos view | ✅ Passed | The "+" button successfully opens the Add Course modal with all expected form fields visible. |
| TC004 | Create a new course successfully and see it in the list | ✅ Passed | New course creation works end-to-end; course name appears in the list after submission. |
| TC005 | Newly created course shows schedule and default progress | ✅ Passed | Schedule and 0% progress correctly displayed for newly created courses. |
| TC006 | Cancel Add Course modal without saving | ❌ **Failed** | **Bug:** Modal DOM elements remain in page after clicking "Cancelar". The modal uses CSS `translate-y-full` animation with a 300ms `setTimeout` to add `hidden`, but the test checks visibility before the animation completes. The course data was not persisted (correct), but modal dismissal timing is fragile. |
| TC007 | Validation: missing course name shows error and prevents creation | ✅ Passed | HTML5 `required` attribute blocks form submission when course name is empty. |
| TC008 | Validation recovery: add course after initial missing-name error | ✅ Passed | After correcting the empty field, the course is created successfully. |
| TC009 | Toast appears after course creation and modal closes | ❌ **Failed** | **Bug:** Test expected toast text "Curso añadido" but the actual toast message is "Curso creado correctamente" (line 449 in `index.html`). Additionally, the modal dismissal animation timing issue (same as TC006) caused the second assertion to fail. |

---

### Attendance Tracking (4 tests)

| Test ID | Title | Status | Analysis |
|---------|-------|--------|----------|
| TC010 | Mark a student as "presente" and finalize attendance | ✅ Passed | Full attendance workflow works: navigate to Asistencia, select course, mark student present, and finalize. |
| TC011 | Mark student "ausente" then change to "presente" and finalize | ✅ Passed | Attendance status can be toggled between absent and present before finalizing. |
| TC012 | Switch courses and verify student list updates | ✅ Passed | Course filter correctly switches the displayed attendance list to the selected course's students. |
| TC013 | Finalize register with no attendance changes made | ✅ Passed | App handles gracefully when no marks are made before finalization. |

---

### Task Management (7 tests)

| Test ID | Title | Status | Analysis |
|---------|-------|--------|----------|
| TC014 | Create a new task from "+ Nueva" | ✅ Passed | New task creation works correctly with title and due date displayed in the pending list. |
| TC015 | Validate required title: blank title shows error | ✅ Passed | HTML5 `required` attribute blocks task creation with empty title. |
| TC016 | Complete a pending task using "Marcar Finalizada" | ✅ Passed | Task status toggles to "completed" and "Reabrir" button appears. |
| TC017 | Reopen a completed task using "Reabrir" | ✅ Passed | Tasks can be reopened, returning to pending state with "Marcar Finalizada" button. |
| TC018 | Open Add Task modal using dashed "Nueva Tarea" button | ✅ Passed | The alternate task creation button at the bottom works as expected. |
| TC019 | Create multiple tasks and verify both appear | ❌ **Failed** | **Bug:** After creating "Tarea A" and "Tarea B" sequentially, only "Tarea A" is visible. The second task ("Tarea B") was created (toast appeared) but doesn't appear in the DOM. Possible race condition in `renderTasks()` or localStorage timing. |
| TC020 | Cancel/close Add Task modal without creating | ❌ Failed (Timeout) | Test execution timed out after 15 minutes. |
| TC021 | Create task with accents and punctuation | ❌ Failed (Timeout) | Test execution timed out after 15 minutes. |

---

### Grades / Performance View (6 tests)

| Test ID | Title | Status | Analysis |
|---------|-------|--------|----------|
| TC022 | Open Notas view and verify performance summary widgets | ❌ Failed (Timeout) | Test execution timed out after 15 minutes. |
| TC023 | Verify total students count in Notas view | ❌ Failed (Timeout) | Test execution timed out after 15 minutes. |
| TC024 | Verify completed/total tasks ratio in Notas | ❌ Failed (Timeout) | Test execution timed out after 15 minutes. |
| TC025 | Verify average grade per course shows 8.5 | ❌ Failed (Timeout) | Test execution timed out after 15 minutes. |
| TC026 | Notas view accessible after switching away and back | ❌ Failed (Timeout) | Test execution timed out after 15 minutes. |
| TC027 | Notas view renders without data-dependent errors | ❌ Failed (Timeout) | Test execution timed out after 15 minutes. |

---

### Dark Mode Toggle (5 tests)

| Test ID | Title | Status | Analysis |
|---------|-------|--------|----------|
| TC028 | Enable dark mode from header toggle | ❌ Failed (Timeout) | Test execution timed out after 15 minutes. |
| TC029 | Disable dark mode and return to light mode | ❌ Failed (Timeout) | Test execution timed out after 15 minutes. |
| TC030 | Dark mode preference persists after reload | ❌ Failed (Timeout) | Test execution timed out after 15 minutes. |
| TC031 | Light mode preference persists after reload | ❌ Failed (Timeout) | Test execution timed out after 15 minutes. |
| TC032 | Dark mode toggle works from any main view | ❌ Failed (Timeout) | Test execution timed out after 15 minutes. |
| TC033 | Rapid repeated toggling ends in correct final state | ❌ Failed (Timeout) | Test execution timed out after 15 minutes. |

---

### Data Backup & Restore (1 test)

| Test ID | Title | Status | Analysis |
|---------|-------|--------|----------|
| TC034 | Settings menu exposes both backup and restore actions | ❌ Failed (Timeout) | Test execution timed out after 15 minutes. |

---

## 3️⃣ Coverage & Matching Metrics

- **47.06%** of tests passed (16/34)

| Requirement | Total Tests | ✅ Passed | ❌ Failed |
|-------------|-------------|-----------|-----------|
| Navigation | 1 | 1 | 0 |
| Course Management | 8 | 6 | 2 |
| Attendance Tracking | 4 | 4 | 0 |
| Task Management | 8 | 4 | 4 |
| Grades / Performance | 6 | 0 | 6 |
| Dark Mode Toggle | 6 | 0 | 6 |
| Data Backup & Restore | 1 | 0 | 1 |

---

## 4️⃣ Key Gaps / Risks

### 🔴 Critical Bugs Found (3)

1. **TC009 — Wrong toast message:**  The toast for course creation says "Curso creado correctamente" but certain test expectations use "Curso añadido". While this is a test-expectation mismatch, it reveals inconsistency — the code at line 449 uses the text `'Curso creado correctamente'`.

2. **TC006/TC009 — Modal dismissal timing:** The `closeModal()` function applies CSS animation first, then adds `hidden` class after 300ms delay. Automated tests checking modal visibility immediately after the cancel/close action may find DOM elements still present. Consider using a more deterministic close mechanism.

3. **TC019 — Multiple task creation race condition:** Creating two tasks in rapid succession causes the second task not to appear in the DOM. This could be a re-render timing issue in `renderTasks()` or a localStorage save conflict.

### 🟡 Infrastructure Issues (15 timeout failures)

Tests TC020–TC034 all timed out after 15 minutes. These cover **Grades/Performance**, **Dark Mode**, and **Data Backup** features. The timeouts are likely caused by:
- Test runner concurrency limits on the free tier
- The static HTML server being single-threaded under concurrent test load
- Network latency between the tunnel proxy and the local server

### 📋 Recommendations

1. **Fix modal close timing** — Add a state check or use `transitionend` event instead of `setTimeout` for deterministic modal dismissal.
2. **Investigate task rendering** — Add a short delay or use `requestAnimationFrame` in `renderTasks()` to ensure DOM updates complete before subsequent operations.
3. **Re-run timed-out tests** — Tests TC020–TC034 should be retried individually to confirm if failures are infrastructure-related or actual bugs.
4. **Standardize toast messages** — Ensure consistent terminology across the application.

---
