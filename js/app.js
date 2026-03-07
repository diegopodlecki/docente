let courseToDeleteId = null;
let activeManageCourseId = null;

// --- NAVIGATION ---
function navigate(viewId) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    document.getElementById('view-' + viewId).classList.add('active');

    const titles = { 'cursos': 'Mis Cursos', 'asistencia': 'Asistencia', 'tareas': 'Tareas', 'notas': 'Rendimiento', 'registro': 'Registro de Clase' };
    document.getElementById('header-title').textContent = titles[viewId];

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.add('text-slate-400', 'dark:text-slate-500');
        btn.classList.remove('text-primary');
        btn.querySelector('span').style.fontVariationSettings = "'FILL' 0";
        btn.querySelector('p').classList.replace('font-bold', 'font-medium');
    });

    const activeBtn = document.querySelector(`[data-view="${viewId}"]`);
    if (activeBtn) {
        activeBtn.classList.remove('text-slate-400', 'dark:text-slate-500');
        activeBtn.classList.add('text-primary');
        activeBtn.querySelector('span').style.fontVariationSettings = "'FILL' 1";
        activeBtn.querySelector('p').classList.replace('font-medium', 'font-bold');
    }

    if (viewId === 'cursos') renderCourses();
    if (viewId === 'asistencia') renderAttendance();
    if (viewId === 'tareas') renderTasks();
    if (viewId === 'notas') renderNotas();
    if (viewId === 'registro') {
        renderClassRecords();
        populateCourseSelect();
    }
}

// --- MODULE: COURSES ---
function renderCourses() {
    const list = document.getElementById('courses-list');
    list.innerHTML = db.courses.map(c => `
        <article class="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm relative group">
            <div class="h-28 relative" style="background: linear-gradient(135deg, ${c.color} 0%, #6394ff 100%);">
                <div class="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">${c.schedule}</div>
                
                <!-- Course Actions -->
                <div class="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="openEditCourse(${c.id})" class="size-8 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-colors">
                        <span class="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button onclick="deleteCourseRequest(${c.id})" class="size-8 bg-white/20 hover:bg-rose-500/80 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-colors">
                        <span class="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                </div>
            </div>
            <div class="p-5">
                <h3 class="text-xl font-bold mb-1">${c.name}</h3>
                <div class="flex items-center justify-between mb-4">
                    <p class="text-xs text-slate-500">${c.students.length} Estudiantes inscritos</p>
                    <button onclick="openManageStudents(${c.id})" class="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">group_add</span> Gestionar
                    </button>
                </div>
                <div class="space-y-2">
                    <div class="flex justify-between text-[11px] font-bold uppercase tracking-tight">
                        <span class="text-slate-400">Progreso</span>
                        <span class="text-primary">${c.progress}%</span>
                    </div>
                    <div class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div class="bg-primary h-full transition-all duration-700" style="width: ${c.progress}%"></div>
                    </div>
                </div>
            </div>
        </article>
    `).join('');
}

function handleNewCourse(e) {
    e.preventDefault();
    const name = document.getElementById('course-name').value;
    const schedule = document.getElementById('course-schedule').value;
    const newCourse = {
        id: Date.now(),
        name,
        schedule,
        progress: 0,
        color: '#2b6cee',
        students: [] // Start with no students
    };
    db.courses.push(newCourse);
    save();
    renderCourses();
    closeModal('course-modal');
    showToast('Curso añadido');
    e.target.reset();
}

// --- COURSE MANAGEMENT ACTIONS ---
function deleteCourseRequest(id) {
    courseToDeleteId = id;
    openModal('confirm-delete-modal');
}

function confirmDeleteCourse() {
    if (!courseToDeleteId) return;

    // Delete course
    db.courses = db.courses.filter(c => c.id !== courseToDeleteId);

    // Cleanup tasks
    db.tasks = db.tasks.filter(t => t.courseId !== courseToDeleteId);

    // Cleanup attendance & grades based on course ID in keys
    Object.keys(db.attendance).forEach(key => {
        if (key.includes(`_${courseToDeleteId}_`)) delete db.attendance[key];
    });
    Object.keys(db.grades || {}).forEach(key => {
        if (key.startsWith(`${courseToDeleteId}_`)) delete db.grades[key];
    });

    save();
    closeModal('confirm-delete-modal');
    showToast('Curso y datos asociados eliminados');
    renderCourses();
    courseToDeleteId = null;
}

function openEditCourse(id) {
    const course = db.courses.find(c => c.id === id);
    if (!course) return;
    document.getElementById('edit-course-id').value = course.id;
    document.getElementById('edit-course-name').value = course.name;
    document.getElementById('edit-course-schedule').value = course.schedule;
    openModal('edit-course-modal');
}

function handleEditCourse(e) {
    e.preventDefault();
    const id = Number(document.getElementById('edit-course-id').value);
    const name = document.getElementById('edit-course-name').value;
    const schedule = document.getElementById('edit-course-schedule').value;

    const course = db.courses.find(c => c.id === id);
    if (course) {
        course.name = name;
        course.schedule = schedule;
        save();
        renderCourses();
        closeModal('edit-course-modal');
        showToast('Curso editado');
    }
}

function openManageStudents(id) {
    activeManageCourseId = id;
    const course = db.courses.find(c => c.id === id);
    document.getElementById('manage-students-title').textContent = `Alumnos: ${course.name}`;
    renderManageStudents();
    openModal('manage-students-modal');
}

function renderManageStudents() {
    const course = db.courses.find(c => c.id === activeManageCourseId);
    const list = document.getElementById('manage-students-list');
    if (!course.students || course.students.length === 0) {
        list.innerHTML = `<p class="text-center text-slate-400 text-sm py-4">No hay alumnos en este curso.</p>`;
        return;
    }

    list.innerHTML = course.students.map(s => `
        <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div class="flex items-center gap-3">
                <div class="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">${s.name.charAt(0)}</div>
                <p class="text-sm font-bold">${s.name}</p>
            </div>
            <button onclick="removeStudent(${s.id})" class="p-2 text-rose-500 bg-rose-500/10 rounded-lg hover:bg-rose-500 hover:text-white transition-colors">
                <span class="material-symbols-outlined text-[16px]">person_remove</span>
            </button>
        </div>
    `).join('');
}

function handleAddStudent(e) {
    e.preventDefault();
    const input = document.getElementById('new-student-name');
    const name = input.value.trim();
    if (!name || !activeManageCourseId) return;

    const course = db.courses.find(c => c.id === activeManageCourseId);
    if (!course.students) course.students = [];
    course.students.push({ id: Date.now() + Math.random(), name });

    save();
    renderManageStudents();
    renderCourses(); // Updates student count on card
    input.value = '';
    showToast('Alumno añadido');
}

function removeStudent(studentId) {
    const course = db.courses.find(c => c.id === activeManageCourseId);
    if (!course) return;

    const confirmRemove = confirm("¿Eliminar este alumno del curso?");
    if (!confirmRemove) return;

    course.students = course.students.filter(s => s.id !== studentId);

    // Clean up attendance strings specifically for this student
    Object.keys(db.attendance).forEach(key => {
        if (key.includes(`_${studentId}`)) delete db.attendance[key];
    });

    save();
    renderManageStudents();
    renderCourses(); // Updates student count on card
    showToast('Alumno eliminado');
}

// --- MODULE: ATTENDANCE ---
function renderAttendance() {
    const filters = document.getElementById('attendance-course-filters');
    if (db.courses.length === 0) {
        filters.innerHTML = '';
        document.getElementById('attendance-list').innerHTML = `<p class="text-center text-slate-400 py-6">No tienes cursos activos.</p>`;
        return;
    }

    filters.innerHTML = db.courses.map((c, i) => `
        <button onclick="renderAttendanceList(${c.id})" class="px-4 py-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all ${i === 0 ? 'bg-primary text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800'}">${c.name}</button>
    `).join('');

    // Auto-select first course when entering view
    renderAttendanceList(db.courses[0].id);
}

function renderAttendanceList(courseId) {
    // Update active visual state for buttons
    const filters = document.getElementById('attendance-course-filters');
    Array.from(filters.children).forEach(btn => {
        if (btn.textContent === db.courses.find(c => c.id === courseId)?.name) {
            btn.className = "px-4 py-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all bg-primary text-white shadow-md";
        } else {
            btn.className = "px-4 py-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all bg-slate-100 dark:bg-slate-800";
        }
    });

    const course = db.courses.find(c => c.id === courseId);
    const list = document.getElementById('attendance-list');

    if (!course || !course.students || course.students.length === 0) {
        list.innerHTML = `<p class="text-center text-slate-400 py-6">Este curso aún no tiene alumnos.</p>`;
        return;
    }

    list.innerHTML = course.students.map((s) => {
        const status = db.attendance[`today_${courseId}_${s.id}`] || 'unchecked';
        return `
            <div class="flex items-center gap-4 p-4 active:bg-slate-50 dark:active:bg-slate-800 transition-colors">
                <div class="size-11 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400">${s.name.charAt(0)}</div>
                <div class="flex-1">
                    <p class="text-sm font-bold">${s.name}</p>
                    <p class="text-[10px] uppercase font-bold text-slate-400">${status === 'unchecked' ? 'Pendiente' : status}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="markAttendance(${courseId}, ${s.id}, 'presente')" class="size-8 rounded-lg flex items-center justify-center border-2 ${status === 'presente' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-100 dark:border-slate-800'}">
                        <span class="material-symbols-outlined text-sm">done</span>
                    </button>
                    <button onclick="markAttendance(${courseId}, ${s.id}, 'ausente')" class="size-8 rounded-lg flex items-center justify-center border-2 ${status === 'ausente' ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-100 dark:border-slate-800'}">
                        <span class="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function markAttendance(courseId, studentId, status) {
    db.attendance[`today_${courseId}_${studentId}`] = status;
    save();
    renderAttendanceList(courseId);
}

// --- MODULE: TASKS ---
function renderTasks() {
    const list = document.getElementById('tasks-list');
    list.innerHTML = db.tasks.map(t => `
        <div class="bg-white dark:bg-slate-800 border-2 ${t.status === 'completed' ? 'border-emerald-500/30' : 'border-primary shadow-lg shadow-primary/5'} p-5 rounded-[24px] transition-all">
            <div class="flex justify-between items-start mb-3">
                <span class="text-[10px] font-bold uppercase tracking-widest ${t.status === 'completed' ? 'text-emerald-500 bg-emerald-500/10' : 'text-primary bg-primary/10'} px-2 py-1 rounded-md">
                    ${t.status === 'completed' ? 'Completado' : 'Vence: ' + t.due}
                </span>
                <div class="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                     <span class="material-symbols-outlined text-sm">group</span> ${t.completions}/${t.total}
                </div>
            </div>
            <h3 class="font-bold text-lg mb-1 ${t.status === 'completed' ? 'line-through text-slate-400' : ''}">${t.title}</h3>
            <div class="flex gap-2 mt-4">
                <button onclick="toggleTaskStatus(${t.id})" class="flex-1 py-3 rounded-xl ${t.status === 'completed' ? 'bg-slate-100 dark:bg-slate-700 text-slate-500' : 'bg-primary text-white'} text-xs font-bold uppercase tracking-widest active:scale-95 transition-all">
                    ${t.status === 'completed' ? 'Reabrir' : 'Marcar Finalizada'}
                </button>
            </div>
        </div>
    `).join('') + `
        <button onclick="openModal('task-modal')" class="w-full py-8 rounded-[24px] border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 flex flex-col items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <span class="material-symbols-outlined text-3xl">add_circle</span>
            <p class="text-sm font-bold uppercase tracking-widest">Nueva Tarea</p>
        </button>
    `;
}

function toggleTaskStatus(taskId) {
    const task = db.tasks.find(t => t.id === taskId);
    task.status = task.status === 'completed' ? 'pending' : 'completed';
    save();
    renderTasks();
    showToast(task.status === 'completed' ? 'Tarea completada' : 'Tarea reabierta');
}

function handleNewTask(e) {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const due = document.getElementById('task-due').value;
    db.tasks.push({
        id: Date.now() + Math.random(),
        title,
        due,
        status: 'pending',
        completions: 0,
        total: db.courses[0]?.students.length || 30
    });
    save();
    renderTasks();
    closeModal('task-modal');
    showToast('Tarea añadida');
    e.target.reset();
}

// --- MODULE: NOTAS ---
function renderNotas() {
    const stats = document.getElementById('stats-summary');
    const totalStudents = db.courses.reduce((acc, c) => acc + (c.students?.length || 0), 0);
    const totalTasks = db.tasks.length;
    const completedTasks = db.tasks.filter(t => t.status === 'completed').length;

    stats.innerHTML = `
        <div class="bg-primary/10 p-4 rounded-2xl">
            <p class="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Total Alumnos</p>
            <p class="text-2xl font-black text-primary">${totalStudents}</p>
        </div>
        <div class="bg-emerald-500/10 p-4 rounded-2xl">
            <p class="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Tareas Listas</p>
            <p class="text-2xl font-black text-emerald-600">${completedTasks}/${totalTasks}</p>
        </div>
    `;

    const list = document.getElementById('grades-list');
    list.innerHTML = `
        <div class="flex justify-end mb-4">
            <button onclick="exportGradesCSV()" class="text-[10px] font-bold text-primary flex items-center gap-1 uppercase tracking-widest hover:underline">
                <span class="material-symbols-outlined text-xs">download</span> Exportar Todas
            </button>
        </div>
    ` + db.courses.map(c => {
        const { avg, count } = getCourseAverage(c.id);
        const displayAvg = count === 0 ? '-' : avg.toFixed(1);

        return `
        <div class="flex items-center justify-between py-2">
            <div class="flex-1" onclick="openGradebook(${c.id})" style="cursor: pointer;">
                <p class="text-sm font-bold hover:text-primary transition-colors">${c.name} <span class="material-symbols-outlined text-[12px] text-slate-400">edit</span></p>
                <p class="text-[10px] text-slate-400">${c.students?.length || 0} alumnos • ${count} notas</p>
            </div>
            <div class="text-lg font-black ${avg >= 6 ? 'text-primary' : (count === 0 ? 'text-slate-400' : 'text-rose-500')}">${displayAvg}</div>
        </div>
    `}).join('<div class="h-px bg-slate-100 dark:bg-slate-700 w-full my-2"></div>');
}

// --- MODULE: GRADEBOOK ---
function getCourseAverage(courseId) {
    const course = db.courses.find(c => c.id === courseId);
    if (!course || !course.students) return { avg: 0, count: 0 };

    let totalSum = 0;
    let totalGrades = 0;

    course.students.forEach(s => {
        const gradeKeys = Object.keys(db.grades || {}).filter(k => k.startsWith(`${courseId}_`) && k.endsWith(`_${s.id}`));

        gradeKeys.forEach(k => {
            const val = Number(db.grades[k]);
            if (!isNaN(val)) {
                totalSum += val;
                totalGrades++;
            }
        });
    });

    return {
        avg: totalGrades === 0 ? 0 : totalSum / totalGrades,
        count: totalGrades
    };
}

function openGradebook(courseId) {
    activeManageCourseId = courseId; // Reuse the variable
    const course = db.courses.find(c => c.id === courseId);
    document.getElementById('gradebook-title').textContent = `Calificaciones: ${course.name}`;
    renderGradebook();
    openModal('gradebook-modal');
}

function renderGradebook() {
    const course = db.courses.find(c => c.id === activeManageCourseId);
    const list = document.getElementById('gradebook-list');

    if (!course.students || course.students.length === 0) {
        list.innerHTML = `<p class="text-center text-slate-400 text-sm py-4">Agrega alumnos en la sección "Cursos" primero.</p>`;
        return;
    }

    list.innerHTML = course.students.map(s => {
        const finalGradeKey = `${course.id}_final_${s.id}`;
        const currentVal = db.grades[finalGradeKey] || '';

        return `
        <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-2">
            <div class="flex-1">
                <p class="text-sm font-bold">${s.name}</p>
            </div>
            <div class="flex items-center gap-2">
                <input type="number" min="0" max="10" step="0.1" 
                    value="${currentVal}" 
                    onchange="saveGrade(${course.id}, ${s.id}, this.value)"
                    placeholder="-"
                    class="w-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-center text-sm font-bold focus:ring-2 focus:ring-primary h-10">
            </div>
        </div>
    `;
    }).join('');
}

function saveGrade(courseId, studentId, value) {
    if (!db.grades) db.grades = {};
    const key = `${courseId}_final_${studentId}`;

    if (value === '' || isNaN(value)) {
        delete db.grades[key];
    } else {
        db.grades[key] = Number(value);
    }
    save();
    renderNotas(); // Update background
}

function exportAttendanceCSV() {
    let csv = "Curso,Estudiante,Estado\n";
    db.courses.forEach(c => {
        if (c.students) {
            c.students.forEach((s) => {
                const status = db.attendance[`today_${c.id}_${s.id}`] || 'Pendiente';
                csv += `"${c.name}","${s.name}",${status}\n`;
            });
        }
    });
    downloadCSV(csv, "reporte_asistencia.csv");
}

function exportGradesCSV() {
    let csv = "Curso,Estudiante,Nota Final\n";
    db.courses.forEach(c => {
        if (c.students) {
            c.students.forEach(s => {
                const finalGradeKey = `${c.id}_final_${s.id} `;
                const val = db.grades[finalGradeKey] || '-';
                csv += `"${c.name}","${s.name}",${val}\n`;
            });
        }
    });
    downloadCSV(csv, "reporte_notas.csv");
}

// --- MODULE: CLASS REGISTRY ---
function renderClassRecords() {
    const list = document.getElementById('registro-list');
    if (!db.classRecords || db.classRecords.length === 0) {
        list.innerHTML = `<p class="text-center text-slate-400 py-6">No hay clases registradas aún.</p>`;
        return;
    }

    list.innerHTML = db.classRecords.sort((a, b) => new Date(b.date) - new Date(a.date)).map(r => {
        const course = db.courses.find(c => c.id === r.courseId);
        return `
            <div class="bg-white dark:bg-slate-800 p-5 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm relative group">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-md">
                        ${r.date}
                    </span>
                    <button onclick="deleteClassRecord(${r.id})" class="text-slate-300 hover:text-rose-500 transition-colors">
                        <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                </div>
                <h3 class="font-bold text-lg text-slate-900 dark:text-white">${course ? course.name : 'Curso eliminado'}</h3>
                <p class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">${r.topic}</p>
                
                <div class="space-y-2 border-t border-slate-50 dark:border-slate-700 pt-3">
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Notas</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400">${r.notes || 'Sin notas'}</p>
                    </div>
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Tarea</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">${r.homework || 'Sin tarea'}</p>
                    </div>
                </div>
            </div>
                    `;
    }).join('');
}

function populateCourseSelect() {
    const select = document.getElementById('registro-course');
    const currentValue = select.value;
    select.innerHTML = '<option value="" disabled selected>Seleccionar Curso</option>' +
        db.courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    if (currentValue) select.value = currentValue;
}

function handleNewClassRecord(e) {
    e.preventDefault();
    const courseId = Number(document.getElementById('registro-course').value);
    const date = document.getElementById('registro-date').value;
    const topic = document.getElementById('registro-topic').value;
    const notes = document.getElementById('registro-notes').value;
    const homework = document.getElementById('registro-homework').value;

    if (!courseId || !date || !topic) return;

    const newRecord = {
        id: Date.now(),
        courseId,
        date,
        topic,
        notes,
        homework
    };

    if (!db.classRecords) db.classRecords = [];
    db.classRecords.push(newRecord);
    save();
    renderClassRecords();
    closeModal('registro-modal');
    showToast('Clase registrada correctamente');
    e.target.reset();
}

function deleteClassRecord(id) {
    if (!confirm('¿Eliminar este registro de clase?')) return;
    db.classRecords = db.classRecords.filter(r => r.id !== id);
    save();
    renderClassRecords();
    showToast('Registro eliminado');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    showToast('Archivo Excel (CSV) generado');
}

// Init
window.addEventListener('load', () => {
    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('Service Worker registrado', reg))
            .catch(err => console.warn('Error al registrar Service Worker', err));
    }

    // Incrementar contador de carga
    db.loadCount = (db.loadCount || 0) + 1;
    save();

    if (db.settings.darkMode) document.documentElement.classList.add('dark');

    if (!db.userName) {
        document.getElementById('welcome-modal').classList.remove('hidden');
    } else {
        updateGreeting();
    }

    navigate('cursos');
    console.log(`Sesión #${db.loadCount} iniciada.`);
});
