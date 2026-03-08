import { getDocs } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { studentsCol, attendanceDateDoc, attendanceRecordsCol } from "../firebase.js";

async function computeAnalytics(courses) {
  let totalStudents = 0;
  let totalRecords = 0;
  let attendedRecords = 0;
  let coursesWithAttendance = 0;

  const studentStats = new Map();

  for (const course of courses) {
    const studentsSnap = await getDocs(studentsCol(course.id));
    totalStudents += studentsSnap.size;

    const attendanceDates = await getDocs(attendanceDateDoc(course.id, "temp").parent);
    if (attendanceDates.size > 0) coursesWithAttendance += 1;

    for (const day of attendanceDates.docs) {
      const recordsSnap = await getDocs(attendanceRecordsCol(course.id, day.id));
      totalRecords += recordsSnap.size;

      recordsSnap.docs.forEach((recordDoc) => {
        const record = recordDoc.data();
        if (record.status === "present" || record.status === "late") attendedRecords += 1;

        const key = `${course.id}:${recordDoc.id}`;
        const stat = studentStats.get(key) || {
          name: record.name || "Unknown",
          courseName: course.name,
          total: 0,
          attended: 0
        };

        stat.total += 1;
        if (record.status === "present" || record.status === "late") stat.attended += 1;
        studentStats.set(key, stat);
      });
    }
  }

  const attendanceRate = totalRecords ? Math.round((attendedRecords / totalRecords) * 100) : 0;
  const participation = courses.length ? Math.round((coursesWithAttendance / courses.length) * 100) : 0;

  const atRisk = [];
  studentStats.forEach((stat) => {
    const rate = stat.total ? Math.round((stat.attended / stat.total) * 100) : 0;
    if (rate < 75) {
      atRisk.push({
        name: stat.name,
        courseName: stat.courseName,
        rate
      });
    }
  });

  atRisk.sort((a, b) => a.rate - b.rate);

  return {
    totalStudents,
    totalRecords,
    attendanceRate,
    participation,
    atRisk
  };
}

function renderAnalytics(metrics) {
  document.getElementById("analytics-attendance-rate").textContent = `${metrics.attendanceRate}%`;
  document.getElementById("analytics-at-risk").textContent = String(metrics.atRisk.length);
  document.getElementById("analytics-total-records").textContent = String(metrics.totalRecords);
  document.getElementById("analytics-participation").textContent = `${metrics.participation}%`;

  const tbody = document.getElementById("at-risk-table-body");

  if (!metrics.atRisk.length) {
    tbody.innerHTML = "<tr><td colspan=\"3\">No at-risk students right now.</td></tr>";
    return;
  }

  tbody.innerHTML = metrics.atRisk
    .map((row) => `
      <tr>
        <td>${escapeHtml(row.name)}</td>
        <td>${escapeHtml(row.courseName)}</td>
        <td>${row.rate}%</td>
      </tr>
    `)
    .join("");
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value || "";
  return div.innerHTML;
}

export { computeAnalytics, renderAnalytics };
