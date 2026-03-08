import {
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { studentsRef, studentRef, serverTimestamp } from "../firebase.js";

function observeStudents(courseId, callback) {
  if (!courseId) {
    callback([]);
    return () => {};
  }

  return onSnapshot(studentsRef(courseId), (snap) => {
    const students = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => a.name.localeCompare(b.name));
    callback(students);
  });
}

async function saveStudent(courseId, draft) {
  const payload = {
    name: draft.name,
    email: draft.email,
    studentCode: draft.studentCode,
    notes: draft.notes || ""
  };

  if (draft.id) {
    await updateDoc(studentRef(courseId, draft.id), payload);
    return;
  }

  await addDoc(studentsRef(courseId), {
    ...payload,
    createdAt: serverTimestamp()
  });
}

async function removeStudent(courseId, studentId) {
  await deleteDoc(studentRef(courseId, studentId));
}

function renderStudents(students) {
  const tbody = document.getElementById("students-tbody");

  if (!students.length) {
    tbody.innerHTML = "<tr><td colspan=\"5\">No students for this course.</td></tr>";
    return;
  }

  tbody.innerHTML = students
    .map((s) => `
      <tr>
        <td>${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.email)}</td>
        <td>${escapeHtml(s.studentCode)}</td>
        <td>${escapeHtml(s.notes || "")}</td>
        <td>
          <div class="actions">
            <button class="btn-mini" data-action="edit-student" data-id="${s.id}">Edit</button>
            <button class="btn-mini danger" data-action="delete-student" data-id="${s.id}">Delete</button>
          </div>
        </td>
      </tr>
    `)
    .join("");
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value || "";
  return div.innerHTML;
}

export { observeStudents, saveStudent, removeStudent, renderStudents };
