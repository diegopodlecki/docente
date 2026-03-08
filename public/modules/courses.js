import {
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { coursesRef, courseRef, serverTimestamp } from "../firebase.js";

function observeCourses(teacherId, callback) {
  const q = query(coursesRef, where("teacherId", "==", teacherId));
  return onSnapshot(q, (snap) => {
    const courses = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => a.name.localeCompare(b.name));
    callback(courses);
  });
}

async function saveCourse(teacherId, draft) {
  if (draft.id) {
    await updateDoc(courseRef(draft.id), {
      name: draft.name,
      section: draft.section,
      subject: draft.subject
    });
    return;
  }

  await addDoc(coursesRef, {
    teacherId,
    name: draft.name,
    section: draft.section,
    subject: draft.subject,
    createdAt: serverTimestamp()
  });
}

async function removeCourse(courseId) {
  await deleteDoc(courseRef(courseId));
}

function renderCourses(courses) {
  const tbody = document.getElementById("courses-tbody");

  if (!courses.length) {
    tbody.innerHTML = "<tr><td colspan=\"4\">No courses yet.</td></tr>";
    return;
  }

  tbody.innerHTML = courses
    .map((c) => `
      <tr>
        <td>${escapeHtml(c.name)}</td>
        <td>${escapeHtml(c.section)}</td>
        <td>${escapeHtml(c.subject)}</td>
        <td>
          <div class="actions">
            <button class="btn-mini" data-action="edit-course" data-id="${c.id}">Edit</button>
            <button class="btn-mini danger" data-action="delete-course" data-id="${c.id}">Delete</button>
          </div>
        </td>
      </tr>
    `)
    .join("");
}

function renderCourseSelectors(courses, selectedStudentsCourse = "", selectedAttendanceCourse = "") {
  const studentsSelect = document.getElementById("students-course-select");
  const attendanceSelect = document.getElementById("attendance-course-select");

  const options = [
    '<option value="">Select course</option>',
    ...courses.map((c) => `<option value="${c.id}">${escapeHtml(c.name)} (${escapeHtml(c.section)})</option>`)
  ].join("");

  studentsSelect.innerHTML = options;
  attendanceSelect.innerHTML = options;

  if (selectedStudentsCourse) studentsSelect.value = selectedStudentsCourse;
  if (selectedAttendanceCourse) attendanceSelect.value = selectedAttendanceCourse;
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value || "";
  return div.innerHTML;
}

export { observeCourses, saveCourse, removeCourse, renderCourses, renderCourseSelectors };
