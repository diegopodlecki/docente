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

function renderDashboard() {
    const container = document.getElementById('dashboard-container');
    const coursesCount = document.getElementById('dash-courses-count');
    const recordsCount = document.getElementById('dash-records-count');
    const recentList = document.getElementById('dash-recent-list');

    // Update counts
    coursesCount.textContent = db.courses.length;
    recordsCount.textContent = (db.classRecords || []).length;

    // Latest 3 records
    const recent = [...(db.classRecords || [])]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

    if (recent.length === 0) {
        recentList.innerHTML = `<p class="text-center text-xs text-slate-400 py-4 italic">No hay registros recientes</p>`;
    } else {
        recentList.innerHTML = recent.map(r => {
            const course = db.courses.find(c => c.id === r.courseId);
            return `
                <div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div class="size-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-primary border border-slate-100 dark:border-slate-800">
                        <span class="material-symbols-outlined text-xl">history_edu</span>
                    </div>
                    <div class="flex-1 overflow-hidden">
                        <p class="text-xs font-bold truncate">${course ? course.name : 'Curso eliminado'}</p>
                        <p class="text-[10px] text-slate-500">${r.date} • ${r.topic}</p>
                    </div>
                </div>
            `;
        }).join('');
    }
}

function renderWeeklyAgenda() {
    const list = document.getElementById('weekly-agenda-list');
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

    if (db.courses.length === 0) {
        list.innerHTML = `<p class="text-center text-slate-400 py-6">No hay cursos configurados.</p>`;
        return;
    }

    list.innerHTML = days.map(day => {
        const dayCourses = db.courses.filter(c => (c.day || 'Lunes') === day);
        if (dayCourses.length === 0) return '';

        return `
            <div class="space-y-3">
                <div class="flex items-center gap-3">
                    <span class="size-2 rounded-full bg-primary"></span>
                    <h3 class="text-lg font-bold">${day}</h3>
                </div>
                <div class="grid grid-cols-1 gap-2">
                    ${dayCourses.map(c => `
                        <div class="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div>
                                <p class="font-bold text-slate-900 dark:text-white">${c.name}</p>
                                <p class="text-[10px] text-slate-500 font-medium uppercase tracking-wider">${c.schedule}</p>
                            </div>
                            <span class="material-symbols-outlined text-primary">event</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('') || `<p class="text-center text-slate-400 py-6">Asigna días a tus cursos para ver la agenda.</p>`;
}
