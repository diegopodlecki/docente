import {
  observeAuth,
  loginGoogle,
  logout,
  ensureTeacherProfile,
  renderTeacherProfile
} from "./modules/auth.js";
import { computeDashboardMetrics, renderDashboardCards } from "./modules/dashboard.js";
import {
  observeCourses,
  saveCourse,
  removeCourse,
  renderCourses,
  renderCourseSelectors
} from "./modules/courses.js";
import {
  observeStudents,
  saveStudent,
  removeStudent,
  renderStudents
} from "./modules/students.js";
import {
  loadAttendance,
  renderAttendance,
  bindAttendanceStatusClicks,
  saveAttendance
} from "./modules/attendance.js";

const state = {
  user: null,
  courses: [],
  students: [],
  selectedStudentsCourseId: "",
  selectedAttendanceCourseId: "",
  attendanceRows: [],
  unsubCourses: null,
  unsubStudents: null
};

const viewTitles = {
  dashboard: "Dashboard",
  courses: "Courses",
  students: "Students",
  attendance: "Attendance"
};

const $ = (id) => document.getElementById(id);

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function setView(view) {
  document.querySelectorAll(".view").forEach((el) => {
    el.classList.toggle("active", el.id === `view-${view}`);
  });

  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });

  $("header-title").textContent = viewTitles[view] || "Dashboard";
}

function openModal(id) {
  $(id).classList.remove("hidden");
}

function closeModal(id) {
  $(id).classList.add("hidden");
}

function resetCourseForm() {
  $("course-id").value = "";
  $("course-name").value = "";
  $("course-section").value = "";
  $("course-subject").value = "";
  $("course-modal-title").textContent = "Create Course";
}

function resetStudentForm() {
  $("student-id").value = "";
  $("student-name").value = "";
  $("student-email").value = "";
  $("student-code").value = "";
  $("student-notes").value = "";
  $("student-modal-title").textContent = "Add Student";
}

async function refreshDashboard() {
  const metrics = await computeDashboardMetrics(state.courses, todayISO());
  renderDashboardCards(metrics);
}

function subscribeCourses() {
  if (state.unsubCourses) state.unsubCourses();

  state.unsubCourses = observeCourses(state.user.uid, (courses) => {
    state.courses = courses;
    renderCourses(courses);
    renderCourseSelectors(courses, state.selectedStudentsCourseId, state.selectedAttendanceCourseId);
    refreshDashboard();
  });
}

function subscribeStudents() {
  if (state.unsubStudents) state.unsubStudents();

  state.unsubStudents = observeStudents(state.selectedStudentsCourseId, (students) => {
    state.students = students;
    renderStudents(students);
    refreshDashboard();
  });
}

function initAuth() {
  $("login-btn").addEventListener("click", async () => {
    try {
      await loginGoogle();
    } catch (error) {
      console.error(error);
      alert("Google login failed. Verify Firebase config and authorized domains.");
    }
  });

  $("logout-btn").addEventListener("click", () => logout());

  observeAuth(async (user) => {
    state.user = user;

    if (!user) {
      $("auth-view").classList.remove("hidden");
      $("app-view").classList.add("hidden");
      if (state.unsubCourses) state.unsubCourses();
      if (state.unsubStudents) state.unsubStudents();
      renderCourses([]);
      renderStudents([]);
      renderAttendance([]);
      renderDashboardCards({ totalCourses: 0, totalStudents: 0, todayAttendance: 0 });
      return;
    }

    await ensureTeacherProfile(user);
    renderTeacherProfile(user);

    $("auth-view").classList.add("hidden");
    $("app-view").classList.remove("hidden");

    subscribeCourses();
    setView("dashboard");
  });
}

function initNavigation() {
  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });

  $("qa-new-course").addEventListener("click", () => {
    resetCourseForm();
    openModal("course-modal");
  });

  $("qa-new-student").addEventListener("click", () => setView("students"));
  $("qa-attendance").addEventListener("click", () => setView("attendance"));
}

function initModals() {
  $("open-course-modal").addEventListener("click", () => {
    resetCourseForm();
    openModal("course-modal");
  });

  $("open-student-modal").addEventListener("click", () => {
    if (!state.selectedStudentsCourseId) {
      alert("Select a course first.");
      return;
    }
    resetStudentForm();
    openModal("student-modal");
  });

  document.querySelectorAll("[data-close]").forEach((el) => {
    el.addEventListener("click", () => closeModal(el.getAttribute("data-close")));
  });
}

function initCourseCrud() {
  $("course-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const draft = {
      id: $("course-id").value.trim(),
      name: $("course-name").value.trim(),
      section: $("course-section").value.trim(),
      subject: $("course-subject").value.trim()
    };

    if (!draft.name || !draft.section || !draft.subject) {
      alert("Complete all course fields.");
      return;
    }

    await saveCourse(state.user.uid, draft);
    closeModal("course-modal");
    resetCourseForm();
  });

  $("courses-tbody").addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const action = target.dataset.action;
    const id = target.dataset.id;
    if (!action || !id) return;

    if (action === "edit-course") {
      const course = state.courses.find((c) => c.id === id);
      if (!course) return;

      $("course-id").value = id;
      $("course-name").value = course.name;
      $("course-section").value = course.section;
      $("course-subject").value = course.subject;
      $("course-modal-title").textContent = "Edit Course";
      openModal("course-modal");
      return;
    }

    if (action === "delete-course") {
      if (!window.confirm("Delete this course?")) return;
      await removeCourse(id);

      if (state.selectedStudentsCourseId === id) {
        state.selectedStudentsCourseId = "";
        subscribeStudents();
      }

      if (state.selectedAttendanceCourseId === id) {
        state.selectedAttendanceCourseId = "";
        state.attendanceRows = [];
        renderAttendance([]);
      }
    }
  });
}

function initStudentCrud() {
  $("students-course-select").addEventListener("change", (event) => {
    state.selectedStudentsCourseId = event.target.value;
    subscribeStudents();
  });

  $("student-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!state.selectedStudentsCourseId) {
      alert("Select a course first.");
      return;
    }

    const draft = {
      id: $("student-id").value.trim(),
      name: $("student-name").value.trim(),
      email: $("student-email").value.trim(),
      studentCode: $("student-code").value.trim(),
      notes: $("student-notes").value.trim()
    };

    if (!draft.name || !draft.email || !draft.studentCode) {
      alert("Complete required student fields.");
      return;
    }

    await saveStudent(state.selectedStudentsCourseId, draft);
    closeModal("student-modal");
    resetStudentForm();
  });

  $("students-tbody").addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const action = target.dataset.action;
    const id = target.dataset.id;
    if (!action || !id) return;

    if (action === "edit-student") {
      const student = state.students.find((s) => s.id === id);
      if (!student) return;

      $("student-id").value = id;
      $("student-name").value = student.name;
      $("student-email").value = student.email;
      $("student-code").value = student.studentCode;
      $("student-notes").value = student.notes || "";
      $("student-modal-title").textContent = "Edit Student";
      openModal("student-modal");
      return;
    }

    if (action === "delete-student") {
      if (!window.confirm("Delete this student?")) return;
      await removeStudent(state.selectedStudentsCourseId, id);
    }
  });
}

function initAttendance() {
  $("attendance-date").value = todayISO();

  $("attendance-course-select").addEventListener("change", (event) => {
    state.selectedAttendanceCourseId = event.target.value;
  });

  $("load-attendance-btn").addEventListener("click", async () => {
    const courseId = state.selectedAttendanceCourseId || $("attendance-course-select").value;
    const date = $("attendance-date").value;

    if (!courseId || !date) {
      alert("Select course and date.");
      return;
    }

    state.selectedAttendanceCourseId = courseId;
    state.attendanceRows = await loadAttendance(courseId, date);
    renderAttendance(state.attendanceRows);
  });

  $("save-attendance-btn").addEventListener("click", async () => {
    const courseId = state.selectedAttendanceCourseId || $("attendance-course-select").value;
    const date = $("attendance-date").value;

    if (!courseId || !date) {
      alert("Select course and date.");
      return;
    }

    if (!state.attendanceRows.length) {
      alert("Load students first.");
      return;
    }

    await saveAttendance(state.user.uid, courseId, date, state.attendanceRows);
    alert("Attendance saved.");
    refreshDashboard();
  });

  bindAttendanceStatusClicks(
    () => state.attendanceRows,
    (nextRows) => {
      state.attendanceRows = nextRows;
    }
  );
}

function init() {
  initAuth();
  initNavigation();
  initModals();
  initCourseCrud();
  initStudentCrud();
  initAttendance();
}

init();
