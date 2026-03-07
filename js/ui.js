const modalTimeouts = {};
let toastTimeout;

// --- UI UTILS ---
function openModal(id) {
    if (modalTimeouts[id]) clearTimeout(modalTimeouts[id]);
    const m = document.getElementById(id);
    m.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    modalTimeouts[id] = setTimeout(() => {
        const panel = document.getElementById(id + '-panel');
        if (panel) panel.classList.remove('translate-y-full');
    }, 10);
}

function closeModal(id) {
    if (modalTimeouts[id]) clearTimeout(modalTimeouts[id]);
    const m = document.getElementById(id);
    const panel = document.getElementById(id + '-panel');
    if (panel) panel.classList.add('translate-y-full');

    // Immediate visual/interaction hide for robust testing
    m.classList.add('opacity-0', 'pointer-events-none');

    modalTimeouts[id] = setTimeout(() => m.classList.add('hidden'), 300);
}

function showToast(msg) {
    const t = document.getElementById('toast');
    document.getElementById('toast-msg').textContent = msg;
    t.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => t.classList.remove('show'), 3000);
}

function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    db.settings.darkMode = document.documentElement.classList.contains('dark');
    save();
}

function handleLogin(e) {
    e.preventDefault();
    const name = document.getElementById('user-name-input').value;
    db.userName = name;
    save();
    document.getElementById('welcome-modal').classList.add('hidden');
    updateGreeting();
    showToast(`¡Un gusto verte, ${name}!`);
}

function updateGreeting() {
    const greeting = document.getElementById('user-greeting');
    if (db.userName) {
        greeting.textContent = `¡Hola, ${db.userName}! 👋`;
    }
}
