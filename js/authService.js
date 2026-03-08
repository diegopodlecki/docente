// authService.js
// Simple wrapper around Firebase Authentication using global firebaseAuth

(function() {
    const provider = new firebase.auth.GoogleAuthProvider();

    async function signInWithGoogle() {
        const result = await firebaseAuth.signInWithPopup(provider);
        return result.user;
    }

    async function signOutUser() {
        await firebaseAuth.signOut();
    }

    function getCurrentUser() {
        return firebaseAuth.currentUser;
    }

    function observeAuthState(callback) {
        return firebaseAuth.onAuthStateChanged(callback);
    }

    // expose globally
    window.authService = {
        signInWithGoogle,
        signOutUser,
        getCurrentUser,
        observeAuthState
    };
})();
