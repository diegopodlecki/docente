
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** docente
- **Date:** 2026-02-25
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Repeated click on the same nav button does not break the view (Notas)
- **Test Code:** [TC001_Repeated_click_on_the_same_nav_button_does_not_break_the_view_Notas.py](./TC001_Repeated_click_on_the_same_nav_button_does_not_break_the_view_Notas.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/a98dd5e8-ce21-40fc-9076-1b2047940603
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 View Cursos list and course card details
- **Test Code:** [TC002_View_Cursos_list_and_course_card_details.py](./TC002_View_Cursos_list_and_course_card_details.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/55d862a2-62e0-4f0f-a759-5d4b2792de6e
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 Open Add Course modal from Cursos view
- **Test Code:** [TC003_Open_Add_Course_modal_from_Cursos_view.py](./TC003_Open_Add_Course_modal_from_Cursos_view.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/56d22de7-b28a-4f4b-8cdf-e0f5d473f6d1
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 Create a new course successfully and see it in the list
- **Test Code:** [TC004_Create_a_new_course_successfully_and_see_it_in_the_list.py](./TC004_Create_a_new_course_successfully_and_see_it_in_the_list.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/9f08c2f8-4a2d-4bc3-87c5-73d576c11d60
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 Newly created course shows schedule and default progress
- **Test Code:** [TC005_Newly_created_course_shows_schedule_and_default_progress.py](./TC005_Newly_created_course_shows_schedule_and_default_progress.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/b26fa6e1-dea0-4ad0-9796-1b0d85471679
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 Cancel Add Course modal without saving
- **Test Code:** [TC006_Cancel_Add_Course_modal_without_saving.py](./TC006_Cancel_Add_Course_modal_without_saving.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Add Course modal did not close after clicking 'Cancelar' (modal input fields with values remain present in the page DOM).
- The page did not return to a modal-free courses view after the cancel action (modal header/inputs still visible in interactive elements).
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/d5883160-b304-4154-adc3-8311f60ecbc5
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 Validation: missing course name shows error and prevents creation
- **Test Code:** [TC007_Validation_missing_course_name_shows_error_and_prevents_creation.py](./TC007_Validation_missing_course_name_shows_error_and_prevents_creation.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/6c2e3e4f-36b6-4488-a608-54103ef27957
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 Validation recovery: add course after initial missing-name error
- **Test Code:** [TC008_Validation_recovery_add_course_after_initial_missing_name_error.py](./TC008_Validation_recovery_add_course_after_initial_missing_name_error.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/9aa2a9d5-afd5-4976-ab08-51ba14ffd54f
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Toast appears after course creation and modal closes
- **Test Code:** [TC009_Toast_appears_after_course_creation_and_modal_closes.py](./TC009_Toast_appears_after_course_creation_and_modal_closes.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- ASSERTION: Expected toast text "Curso añadido" was not found; the displayed success toast text is "Curso creado correctamente".
- ASSERTION: Add Course modal was not dismissed after creating the course — inputs with ids 'course-name' and 'course-schedule' are still visible with the entered values.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/723f05de-3f71-44dc-926c-433b713663d5
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Mark a student as presente and finalize the attendance register for a selected course
- **Test Code:** [TC010_Mark_a_student_as_presente_and_finalize_the_attendance_register_for_a_selected_course.py](./TC010_Mark_a_student_as_presente_and_finalize_the_attendance_register_for_a_selected_course.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/8831486e-796b-4342-8a7c-eede1f0088d1
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 Mark a student as ausente, then change to presente, and finalize
- **Test Code:** [TC011_Mark_a_student_as_ausente_then_change_to_presente_and_finalize.py](./TC011_Mark_a_student_as_ausente_then_change_to_presente_and_finalize.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/000f6e01-0637-488a-808f-62f6cc5f62b5
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Switch courses and verify the student list updates for the selected course
- **Test Code:** [TC012_Switch_courses_and_verify_the_student_list_updates_for_the_selected_course.py](./TC012_Switch_courses_and_verify_the_student_list_updates_for_the_selected_course.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/6156c29f-5482-4c85-9927-cd88f0a9d950
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Finalize register with no attendance changes made
- **Test Code:** [TC013_Finalize_register_with_no_attendance_changes_made.py](./TC013_Finalize_register_with_no_attendance_changes_made.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/0a52017e-cd5e-421d-88e6-6413b8dca34a
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 Create a new task from '+ Nueva' and verify it appears in Pending with due date
- **Test Code:** [TC014_Create_a_new_task_from__Nueva_and_verify_it_appears_in_Pending_with_due_date.py](./TC014_Create_a_new_task_from__Nueva_and_verify_it_appears_in_Pending_with_due_date.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/9130f747-a110-4031-96bd-eafcd43ee62f
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015 Validate required title: blank title shows error and task is not created
- **Test Code:** [TC015_Validate_required_title_blank_title_shows_error_and_task_is_not_created.py](./TC015_Validate_required_title_blank_title_shows_error_and_task_is_not_created.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/9094199d-6a14-45d1-96bc-09364258da85
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016 Complete a pending task using 'Marcar Finalizada' and verify it moves to Completed
- **Test Code:** [TC016_Complete_a_pending_task_using_Marcar_Finalizada_and_verify_it_moves_to_Completed.py](./TC016_Complete_a_pending_task_using_Marcar_Finalizada_and_verify_it_moves_to_Completed.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/37220373-11b7-42e6-98ad-b7a6076f44cd
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017 Reopen a completed task using 'Reabrir' and verify it returns to Pending
- **Test Code:** [TC017_Reopen_a_completed_task_using_Reabrir_and_verify_it_returns_to_Pending.py](./TC017_Reopen_a_completed_task_using_Reabrir_and_verify_it_returns_to_Pending.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/eb4c5a8b-eb55-4c25-9518-9550d5078126
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018 Open Add Task modal using dashed 'Nueva Tarea' button at bottom
- **Test Code:** [TC018_Open_Add_Task_modal_using_dashed_Nueva_Tarea_button_at_bottom.py](./TC018_Open_Add_Task_modal_using_dashed_Nueva_Tarea_button_at_bottom.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/c47a9ddd-33e1-450e-90fa-d1a3517ee5ed
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC019 Create multiple tasks and verify both appear in Pending list
- **Test Code:** [TC019_Create_multiple_tasks_and_verify_both_appear_in_Pending_list.py](./TC019_Create_multiple_tasks_and_verify_both_appear_in_Pending_list.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Second created task 'Tarea B' not present in tasks list after creation.
- Only one newly-created task ('Tarea A') is visible; 'Tarea B' is missing.
- Attempts to locate 'Tarea B' via page search and scrolling failed.
- A 'Tarea añadida' toast appeared confirming creation but the DOM does not show the second task.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/e0d02699-6f59-48c6-adb7-87432455517c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC020 Cancel/close Add Task modal without creating a task
- **Test Code:** [null](./null)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/59d1ff6d-8f9e-44a7-ba5f-54d0c193c2b4
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC021 Create a task with title containing accents and punctuation
- **Test Code:** [null](./null)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/b038adf6-47a9-462a-9aaf-5b933e7a049a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC022 Open Notas view and verify performance summary widgets are visible
- **Test Code:** [null](./null)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/05808505-a03d-4a19-89ea-c1d618b5cb07
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC023 Verify total students count is displayed in Notas view
- **Test Code:** [null](./null)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/3b59a019-4185-47e9-a8de-2d365616ee2b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC024 Verify completed/total tasks ratio is displayed in Notas view
- **Test Code:** [null](./null)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/6af9a200-1c00-4752-a41a-0e1aff118ee6
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC025 Verify average grade per course shows 8.5 for each listed course
- **Test Code:** [null](./null)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/fe2883fb-cfa4-4220-80b0-9366cc300fef
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC026 Notas view content is accessible after switching away and back using bottom navigation
- **Test Code:** [null](./null)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/5149e853-0703-4938-9a28-9efe25bb7a05
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC027 Notas view renders without course data-dependent errors (baseline visibility checks)
- **Test Code:** [null](./null)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/019082d8-3d28-48c1-ada4-c72036c12e04
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC028 Enable dark mode from header toggle
- **Test Code:** [null](./null)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/b7633dbb-5188-4b29-ad2c-f38e57c5e042
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC029 Disable dark mode and return to light mode
- **Test Code:** [null](./null)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/8984a67e-db8b-473c-91a6-5df19ec58e55
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC030 Dark mode preference persists after reload
- **Test Code:** [null](./null)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/a8039a8c-7cb0-451b-8b53-755a482c794b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC031 Light mode preference persists after reload
- **Test Code:** [null](./null)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/803b39c8-1b4d-4898-86b9-5c6b3d10408f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC032 Dark mode toggle works from any main view
- **Test Code:** [null](./null)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/d5fd1cda-8e1d-46f9-858c-a5837e96e1f3
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC033 Rapid repeated toggling ends in correct final state (dark)
- **Test Code:** [null](./null)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/4b8df294-53d2-4244-8a8b-284cb6662871
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC034 Settings menu exposes both backup and restore actions
- **Test Code:** [null](./null)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4f52a021-b04e-4385-adb3-7455ae929696/8bdaba6a-bb53-4daa-9577-59e2dbf57e5b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **47.06** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---