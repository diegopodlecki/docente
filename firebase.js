import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  serverTimestamp,
  writeBatch
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: "select_account" });

const teacherRef = (teacherId) => doc(db, "teachers", teacherId);
const coursesRef = collection(db, "courses");
const courseRef = (courseId) => doc(db, "courses", courseId);
const studentsRef = (courseId) => collection(db, "courses", courseId, "students");
const studentRef = (courseId, studentId) => doc(db, "courses", courseId, "students", studentId);
const attendanceDayRef = (courseId, date) => doc(db, "courses", courseId, "attendance", date);
const attendanceRecordsRef = (courseId, date) => collection(db, "courses", courseId, "attendance", date, "records");
const attendanceRecordRef = (courseId, date, studentId) => doc(db, "courses", courseId, "attendance", date, "records", studentId);

export {
  auth,
  db,
  googleProvider,
  teacherRef,
  coursesRef,
  courseRef,
  studentsRef,
  studentRef,
  attendanceDayRef,
  attendanceRecordsRef,
  attendanceRecordRef,
  serverTimestamp,
  writeBatch,
  doc
};
