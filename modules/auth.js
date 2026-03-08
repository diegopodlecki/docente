import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { auth, googleProvider, teacherRef, serverTimestamp } from "../firebase.js";

function observeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

async function loginGoogle() {
  return signInWithPopup(auth, googleProvider);
}

async function logout() {
  return signOut(auth);
}

async function ensureTeacherProfile(user) {
  if (!user) return;

  const ref = teacherRef(user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      name: user.displayName || "Teacher",
      email: user.email || "",
      photoURL: user.photoURL || "",
      createdAt: serverTimestamp()
    });
  }
}

function renderTeacherProfile(user) {
  document.getElementById("teacher-name").textContent = user?.displayName || "Teacher";
  document.getElementById("teacher-email").textContent = user?.email || "";

  const photo = document.getElementById("teacher-photo");
  photo.src = user?.photoURL || "";
  photo.style.visibility = user?.photoURL ? "visible" : "hidden";
}

export { observeAuth, loginGoogle, logout, ensureTeacherProfile, renderTeacherProfile };
