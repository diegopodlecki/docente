import {
  getDocs,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import {
  db,
  studentsRef,
  attendanceDayRef,
  attendanceRecordsRef,
  attendanceRecordRef,
  serverTimestamp,
  writeBatch
} from "../firebase.js";

const validStatuses = ["present", "absent", "late"];

async function loadAttendance(courseId, date) {
  const studentsSnap = await getDocs(studentsRef(courseId));
  const students = studentsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const recordsSnap = await getDocs(attendanceRecordsRef(courseId, date));
  const statusMap = new Map();
  recordsSnap.docs.forEach((d) => statusMap.set(d.id, d.data().status));

  return students.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    studentCode: s.studentCode,
    status: statusMap.get(s.id) || "present"
  }));
}

function renderAttendance(rows) {
  const host = document.getElementById("attendance-list");

  if (!rows.length) {
    host.innerHTML = "<p>No students available for attendance.</p>";
    return;
  }

  host.innerHTML = rows
    .map((r) => `
      <div class="attendance-row" data-id="${r.id}">
        <div>
          <strong>${escapeHtml(r.name)}</strong>
          <p>${escapeHtml(r.email)} | ${escapeHtml(r.studentCode || "-")}</p>
        </div>
        <div class="status-group">
          ${validStatuses.map((status) => `<button class="status-btn ${r.status === status ? "active" : ""} ${status}" data-status="${status}">${status}</button>`).join("")}
        </div>
      </div>
    `)
    .join("");
}

function bindAttendanceStatusClicks(getRows, setRows) {
  document.getElementById("attendance-list").addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.classList.contains("status-btn")) return;

    const parent = target.closest(".attendance-row");
    if (!parent) return;

    const id = parent.getAttribute("data-id");
    const status = target.getAttribute("data-status");
    if (!id || !validStatuses.includes(status)) return;

    const next = getRows().map((row) => row.id === id ? { ...row, status } : row);
    setRows(next);
    renderAttendance(next);
  });
}

async function saveAttendance(teacherId, courseId, date, rows) {
  await setDoc(attendanceDayRef(courseId, date), {
    teacherId,
    updatedAt: serverTimestamp()
  }, { merge: true });

  const batch = writeBatch(db);

  rows.forEach((row) => {
    batch.set(attendanceRecordRef(courseId, date, row.id), {
      status: validStatuses.includes(row.status) ? row.status : "absent",
      timestamp: serverTimestamp()
    }, { merge: true });
  });

  await batch.commit();
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value || "";
  return div.innerHTML;
}

export { loadAttendance, renderAttendance, bindAttendanceStatusClicks, saveAttendance };
