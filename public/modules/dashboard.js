import { getDocs } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { studentsRef, attendanceRecordsRef } from "../firebase.js";

async function computeDashboardMetrics(courses, todayDate) {
  let totalStudents = 0;
  let todayTotal = 0;
  let todayPresentOrLate = 0;

  for (const course of courses) {
    const studentsSnap = await getDocs(studentsRef(course.id));
    totalStudents += studentsSnap.size;

    const recordsSnap = await getDocs(attendanceRecordsRef(course.id, todayDate));
    todayTotal += recordsSnap.size;

    recordsSnap.docs.forEach((d) => {
      const status = d.data().status;
      if (status === "present" || status === "late") todayPresentOrLate += 1;
    });
  }

  const todayAttendance = todayTotal ? Math.round((todayPresentOrLate / todayTotal) * 100) : 0;

  return {
    totalCourses: courses.length,
    totalStudents,
    todayAttendance
  };
}

function renderDashboardCards(metrics) {
  document.getElementById("metric-courses").textContent = String(metrics.totalCourses || 0);
  document.getElementById("metric-students").textContent = String(metrics.totalStudents || 0);
  document.getElementById("metric-today").textContent = `${metrics.todayAttendance || 0}%`;
}

export { computeDashboardMetrics, renderDashboardCards };
