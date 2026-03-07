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

    // Latest 3 records (Sorted by date DESC, then ID DESC as tie-breaker)
    const recent = [...(db.classRecords || [])]
        .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
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

function renderClassRecords(filter = '') {
    const list = document.getElementById('registro-list');
    if (!db.classRecords || db.classRecords.length === 0) {
        list.innerHTML = `<p class="text-center text-slate-400 py-6">No hay clases registradas aún.</p>`;
        return;
    }

    const query = filter.toLowerCase().trim();
    // Use a copy to avoid in-place sorting side effects. Sort by date DESC, then ID DESC.
    let records = [...db.classRecords].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

    if (query) {
        records = records.filter(r => {
            const course = db.courses.find(c => c.id === r.courseId);
            const courseName = course ? course.name.toLowerCase() : 'curso eliminado';
            const topic = (r.topic || '').toLowerCase();
            const notes = (r.notes || '').toLowerCase();
            const homework = (r.homework || '').toLowerCase();

            return courseName.includes(query) ||
                topic.includes(query) ||
                notes.includes(query) ||
                homework.includes(query);
        });
    }

    if (records.length === 0) {
        list.innerHTML = `
            <div class="py-12 text-center">
                <span class="material-symbols-outlined text-4xl text-slate-200 mb-2">search_off</span>
                <p class="text-slate-400 italic">No se encontraron registros para "${filter}"</p>
            </div>
        `;
        return;
    }

    list.innerHTML = records.map(r => {
        const course = db.courses.find(c => c.id === r.courseId);
        return `
            <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative group overflow-hidden">
                <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 w-12 text-center">
                        <p class="text-[10px] font-black uppercase text-slate-400 leading-tight">${r.date.split('-')[1] || ''}</p>
                        <p class="text-xl font-black text-primary leading-tight">${r.date.split('-')[2] || ''}</p>
                    </div>
                    
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start mb-1">
                            <h3 class="font-bold text-slate-900 dark:text-white truncate pr-10">${course ? course.name : 'Curso eliminado'}</h3>
                            <button onclick="deleteClassRecord(${r.id})" class="absolute right-2 top-2 size-10 flex items-center justify-center text-rose-500 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl transition-all active:scale-90" title="Eliminar registro">
                                <span class="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>
                        <p class="text-xs font-bold text-primary mb-1">${r.topic}</p>
                        
                        <div class="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-50 dark:border-slate-700/50">
                            <div>
                                <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Notas</p>
                                <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">${r.notes || '-'}</p>
                            </div>
                            <div>
                                <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Tarea</p>
                                <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">${r.homework || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
