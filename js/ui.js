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

async function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    await dataService.updateSettings({ darkMode: isDark });
}

async function handleLogin(e) {
    e.preventDefault();
    const name = document.getElementById('user-name-input').value;
    await dataService.setUserName(name);
    document.getElementById('welcome-modal').classList.add('hidden');
    await updateGreeting();
    showToast(`¡Un gusto verte, ${name}!`);
}

async function updateGreeting() {
    const greeting = document.getElementById('user-greeting');
    const userName = await dataService.getUserName();
    if (userName) {
        greeting.textContent = `¡Hola, ${userName}! 👋`;
    }
}

async function renderDashboard() {
    const container = document.getElementById('dashboard-container');
    const coursesCount = document.getElementById('dash-courses-count');
    const recordsCount = document.getElementById('dash-records-count');
    const recentList = document.getElementById('dash-recent-list');

    const courses = await dataService.getCourses();
    const classRecords = await dataService.getClassRecords();

    // Update counts
    coursesCount.textContent = courses.length;
    recordsCount.textContent = classRecords.length;

    // Latest 3 records (Sorted by fecha DESC, then ID DESC as tie-breaker)
    const recent = [...classRecords]
        .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id)
        .slice(0, 3);

    if (recent.length === 0) {
        recentList.innerHTML = `<p class="text-center text-xs text-slate-400 py-4 italic">No hay registros recientes</p>`;
    } else {
        recentList.innerHTML = recent.map(r => {
            const course = courses.find(c => c.id === r.cursoId);
            return `
                <div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div class="size-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-primary border border-slate-100 dark:border-slate-800">
                        <span class="material-symbols-outlined text-xl">history_edu</span>
                    </div>
                    <div class="flex-1 overflow-hidden">
                        <p class="text-xs font-bold truncate">${course ? course.nombre : 'Curso eliminado'}</p>
                        <p class="text-[10px] text-slate-500">${r.fecha} • ${r.tema}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    if (typeof renderStatistics === 'function') {
        renderStatistics();
    }
}

async function renderWeeklyAgenda() {
    const list = document.getElementById('weekly-agenda-list');
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

    const courses = await dataService.getCourses();

    if (courses.length === 0) {
        list.innerHTML = `<p class="text-center text-slate-400 py-6">No hay cursos configurados.</p>`;
        return;
    }

    list.innerHTML = days.map(day => {
        const dayCourses = courses.filter(c => (c.day || 'Lunes') === day);
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
                                <p class="font-bold text-slate-900 dark:text-white">${c.nombre}</p>
                                <p class="text-[10px] text-slate-500 font-medium uppercase tracking-wider">${c.schedule} • ${c.año}</p>
                            </div>
                            <span class="material-symbols-outlined text-primary">event</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('') || `<p class="text-center text-slate-400 py-6">Asigna días a tus cursos para ver la agenda.</p>`;
}

async function renderClassRecords(filter = '') {
    const list = document.getElementById('registro-list');
    const classRecords = await dataService.getClassRecords();
    const courses = await dataService.getCourses();

    if (!classRecords || classRecords.length === 0) {
        list.innerHTML = `<p class="text-center text-slate-400 py-6">No hay clases registradas aún.</p>`;
        return;
    }

    const query = filter.toLowerCase().trim();
    // Use a copy to avoid in-place sorting side effects. Sort by fecha DESC, then ID DESC.
    let records = [...classRecords].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);

    // Actualizar el contador total/filtrado
    const updateCounter = (count) => {
        const counter = document.getElementById('registro-total-count');
        if (counter) counter.textContent = count;
    };

    if (query) {
        records = records.filter(r => {
            const course = courses.find(c => c.id === r.cursoId);
            const courseName = course ? course.nombre.toLowerCase() : 'curso eliminado';
            const tema = (r.tema || '').toLowerCase();
            const notes = (r.notes || '').toLowerCase();
            const homework = (r.homework || '').toLowerCase();
            const fecha = (r.fecha || '').toLowerCase();

            return courseName.includes(query) ||
                tema.includes(query) ||
                notes.includes(query) ||
                homework.includes(query) ||
                fecha.includes(query);
        });
    }

    updateCounter(records.length);

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
        const course = courses.find(c => c.id === r.cursoId);
        return `
            <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative group overflow-hidden">
                <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 w-12 text-center">
                        <p class="text-[10px] font-black uppercase text-slate-400 leading-tight">${r.fecha.split('-')[1] || ''}</p>
                        <p class="text-xl font-black text-primary leading-tight">${r.fecha.split('-')[2] || ''}</p>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start mb-1">
                            <h3 class="font-bold text-slate-900 dark:text-white truncate pr-10">${course ? course.nombre : 'Curso eliminado'}</h3>
                            <div class="flex gap-1 absolute right-2 top-2">
                                <button onclick="openEditClassRecord('${r.id}')" class="size-10 flex items-center justify-center text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-all active:scale-90 mr-1" title="Editar registro">
                                    <span class="material-symbols-outlined text-lg">edit</span>
                                </button>
                                <button onclick="deleteClassRecord('${r.id}')" class="size-10 flex items-center justify-center text-rose-500 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl transition-all active:scale-90" title="Eliminar registro">
                                    <span class="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        </div>
                        <p class="text-xs font-bold text-primary mb-1">${r.tema}</p>
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

    // Modal de edición (solo uno en el DOM)
    if (!document.getElementById('edit-class-modal')) {
        const modal = document.createElement('div');
        modal.id = 'edit-class-modal';
        modal.className = 'hidden fixed inset-0 z-50 flex items-center justify-center bg-black/30';
        modal.innerHTML = `
            <div id="edit-class-modal-panel" class="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl translate-y-full transition-transform">
                <h2 class="text-lg font-bold mb-4">Editar registro de clase</h2>
                <form id="edit-class-form" class="space-y-3">
                    <input type="hidden" id="edit-class-id">
                    <div>
                        <label class="block text-xs font-bold mb-1">Fecha</label>
                        <input type="date" id="edit-class-fecha" class="w-full p-2 rounded border border-slate-200 dark:bg-slate-900">
                    </div>
                    <div>
                        <label class="block text-xs font-bold mb-1">Tema</label>
                        <input type="text" id="edit-class-tema" class="w-full p-2 rounded border border-slate-200 dark:bg-slate-900">
                    </div>
                    <div>
                        <label class="block text-xs font-bold mb-1">Notas</label>
                        <textarea id="edit-class-notes" class="w-full p-2 rounded border border-slate-200 dark:bg-slate-900"></textarea>
                    </div>
                    <div>
                        <label class="block text-xs font-bold mb-1">Tarea</label>
                        <textarea id="edit-class-homework" class="w-full p-2 rounded border border-slate-200 dark:bg-slate-900"></textarea>
                    </div>
                    <div class="flex justify-end gap-2 mt-4">
                        <button type="button" onclick="closeModal('edit-class-modal')" class="px-4 py-2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white font-bold">Cancelar</button>
                        <button type="submit" class="px-4 py-2 rounded bg-primary text-white font-bold">Guardar</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('edit-class-form').onsubmit = handleEditClassRecord;
    }
}

// Abre el modal de edición y carga los datos
window.openEditClassRecord = async function(id) {
    const records = await dataService.getClassRecords();
    const record = records.find(r => r.id == id);
    if (!record) return;
    document.getElementById('edit-class-id').value = record.id;
    document.getElementById('edit-class-fecha').value = record.fecha;
    document.getElementById('edit-class-tema').value = record.tema;
    document.getElementById('edit-class-notes').value = record.notes || '';
    document.getElementById('edit-class-homework').value = record.homework || '';
    openModal('edit-class-modal');
}

// Maneja el submit del modal de edición
async function handleEditClassRecord(e) {
    e.preventDefault();
    const id = document.getElementById('edit-class-id').value;
    const fecha = document.getElementById('edit-class-fecha').value;
    const tema = document.getElementById('edit-class-tema').value;
    const notes = document.getElementById('edit-class-notes').value;
    const homework = document.getElementById('edit-class-homework').value;
    await dataService.updateClass({ id, fecha, tema, notes, homework });
    closeModal('edit-class-modal');
    showToast('Registro actualizado');
    if (typeof renderClassRecords === 'function') renderClassRecords();
}
}
