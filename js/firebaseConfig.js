// Firebase initialization file using compat libraries
// Replace the config object below with your Firebase project's configuration
// taken from the Firebase console under project settings.
// This script expects the Firebase SDKs to be loaded via CDN prior to it.

// TODO: replace with your actual config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase using compat namespace
window.firebaseApp = firebase.initializeApp(firebaseConfig);
window.firebaseDb = firebase.firestore();
window.firebaseAuth = firebase.auth();

// export globals for other scripts
