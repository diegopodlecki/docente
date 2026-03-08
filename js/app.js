// authService will be available globally after its script loads
let courseToDeleteId = null;
let activeManageCourseId = null;

// --- NAVIGATION ---
async function navigate(viewId) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    document.getElementById('view-' + viewId).classList.add('active');

    const titles = { 'cursos': 'Mis Cursos', 'asistencia': 'Asistencia', 'tareas': 'Tareas', 'notas': 'Rendimiento', 'registro': 'Registro', 'agenda': 'Agenda Semanal', 'calendario': 'Calendario' };
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

    // Dashboard Visibility
    const dash = document.getElementById('dashboard-container');
    if (viewId === 'cursos') {
        dash.classList.remove('hidden');
        await renderDashboard();
    } else {
        dash.classList.add('hidden');
    }

    if (viewId === 'cursos') await renderCourses();
    if (viewId === 'asistencia') await renderAttendance();
    if (viewId === 'tareas') await renderTasks();
    if (viewId === 'notas') await renderNotas();
    if (viewId === 'registro') {
        const searchInput = document.getElementById('registro-search');
        if (searchInput) searchInput.value = '';
        await renderClassRecords();
        await populateCourseSelect();
    }
    if (viewId === 'agenda') await renderWeeklyAgenda();
    if (viewId === 'calendario' && typeof renderCalendar === 'function') {
        await renderCalendar();
    }
}

async function navigateAndFocusSearch() {
    await navigate('registro');
    // Pequeño timeout para permitir que la vista se haga visible (display: block)
    // antes de intentar poner el foco, garantizando que el teclado se abra en móviles.
    setTimeout(() => {
        const searchInput = document.getElementById('registro-search');
        if (searchInput) {
            searchInput.focus();
        }
    }, 50);
}

// --- MODULE: COURSES ---
async function renderCourses() {
    const list = document.getElementById('courses-list');
    const courses = await dataService.getCourses();
    list.innerHTML = courses.map(c => `
        <article class="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm relative group">
            <div class="h-28 relative" style="background: linear-gradient(135deg, ${c.color} 0%, #6394ff 100%);">
                <div class="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">${c.schedule} • ${c.año}</div>
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
                <h3 class="text-xl font-bold mb-1">${c.nombre}</h3>
                <p class="text-xs text-slate-500">${c.students.length} Estudiantes inscritos</p>
            </div>
        </article>
    `).join('');
}

async function handleNewCourse(e) {
    e.preventDefault();
    const nombre = document.getElementById('course-name').value;
    const año = document.getElementById('course-year').value;
    const day = document.getElementById('course-day').value;
    const schedule = document.getElementById('course-schedule').value;
    const newCourse = {
        id: Date.now(),
        nombre,
        año,
        day,
        schedule,
        progress: 0,
        color: '#2b6cee',
        students: [] // Start with no students
    };
    await dataService.addCourse(newCourse);
    await renderCourses();
    // update selectors
    await populateCourseSelect();
    await populateCourseSelect('quick-course');
    closeModal('course-modal');
    showToast('Curso añadido');
    e.target.reset();
}

// --- COURSE MANAGEMENT ACTIONS ---
function deleteCourseRequest(id) {
    courseToDeleteId = id;
    openModal('confirm-delete-modal');
}

async function confirmDeleteCourse() {
    if (!courseToDeleteId) return;

    await dataService.deleteCourse(courseToDeleteId);

    closeModal('confirm-delete-modal');
    showToast('Curso y datos asociados eliminados');
    await renderCourses();
    await populateCourseSelect();
    await populateCourseSelect('quick-course');
    courseToDeleteId = null;
}

async function openEditCourse(id) {
    const course = await dataService.getCourseById(id);
    if (!course) return;
    document.getElementById('edit-course-id').value = course.id;
    document.getElementById('edit-course-name').value = course.nombre;
    document.getElementById('edit-course-year').value = course.año || new Date().getFullYear();
    document.getElementById('edit-course-day').value = course.day || 'Lunes';
    document.getElementById('edit-course-schedule').value = course.schedule;
    openModal('edit-course-modal');
}

async function handleEditCourse(e) {
    e.preventDefault();
    const id = Number(document.getElementById('edit-course-id').value);
    const nombre = document.getElementById('edit-course-name').value;
    const año = document.getElementById('edit-course-year').value;
    const day = document.getElementById('edit-course-day').value;
    const schedule = document.getElementById('edit-course-schedule').value;

    await dataService.updateCourse(id, { nombre, año, day, schedule });
    await renderCourses();
    closeModal('edit-course-modal');
    showToast('Curso editado');
}

async function openManageStudents(id) {
    activeManageCourseId = id;
    const course = await dataService.getCourseById(id);
    document.getElementById('manage-students-title').textContent = `Alumnos: ${course.nombre}`;
    await renderManageStudents();
    openModal('manage-students-modal');
}

async function renderManageStudents() {
    const course = await dataService.getCourseById(activeManageCourseId);
    if (!course) return;
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

async function handleAddStudent(e) {
    e.preventDefault();
    const input = document.getElementById('new-student-name');
    const name = input.value.trim();
    if (!name || !activeManageCourseId) return;

    const newStudent = { id: Date.now() + Math.random(), name };
    await dataService.addStudentToCourse(activeManageCourseId, newStudent);

    await renderManageStudents();
    await renderCourses(); // Updates student count on card
    input.value = '';
    showToast('Alumno añadido');
}

async function removeStudent(studentId) {
    if (!activeManageCourseId) return;

    const confirmRemove = confirm("¿Eliminar este alumno del curso?");
    if (!confirmRemove) return;

    await dataService.removeStudentFromCourse(activeManageCourseId, studentId);
    await dataService.deleteAttendanceByStudent(studentId);

    await renderManageStudents();
    await renderCourses(); // Updates student count on card
    showToast('Alumno eliminado');
}

// --- MODULE: ATTENDANCE ---
async function renderAttendance() {
    const filters = document.getElementById('attendance-course-filters');
    const courses = await dataService.getCourses();

    if (courses.length === 0) {
        filters.innerHTML = '';
        document.getElementById('attendance-list').innerHTML = `<p class="text-center text-slate-400 py-6">No tienes cursos activos.</p>`;
        return;
    }

    filters.innerHTML = courses.map((c, i) => `
        <button onclick="renderAttendanceList(${c.id})" class="px-4 py-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all ${i === 0 ? 'bg-primary text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800'}">${c.nombre}</button>
    `).join('');

    // Auto-select first course when entering view
    await renderAttendanceList(courses[0].id);
}

async function renderAttendanceList(courseId) {
    const courses = await dataService.getCourses();
    const attendance = await dataService.getAttendance();

    // Update active visual state for buttons
    const filters = document.getElementById('attendance-course-filters');
    Array.from(filters.children).forEach(btn => {
        if (btn.textContent === courses.find(c => c.id === courseId)?.nombre) {
            btn.className = "px-4 py-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all bg-primary text-white shadow-md";
        } else {
            btn.className = "px-4 py-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all bg-slate-100 dark:bg-slate-800";
        }
    });

    const course = courses.find(c => c.id === courseId);
    const list = document.getElementById('attendance-list');

    if (!course || !course.students || course.students.length === 0) {
        list.innerHTML = `<p class="text-center text-slate-400 py-6">Este curso aún no tiene alumnos.</p>`;
        return;
    }

    list.innerHTML = course.students.map((s) => {
        const status = attendance[`today_${courseId}_${s.id}`] || 'unchecked';
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

async function markAttendance(courseId, studentId, status) {
    await dataService.setAttendance(`today_${courseId}_${studentId}`, status);
    await renderAttendanceList(courseId);
}

// --- MODULE: TASKS ---
async function renderTasks() {
    const list = document.getElementById('tasks-list');
    const tasks = await dataService.getTasks();
    const courses = await dataService.getCourses();

    list.innerHTML = tasks.map(t => `
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

async function toggleTaskStatus(taskId) {
    const tasks = await dataService.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    task.status = task.status === 'completed' ? 'pending' : 'completed';
    await dataService.updateTask(task);
    await renderTasks();
    showToast(task.status === 'completed' ? 'Tarea completada' : 'Tarea reabierta');
}

async function handleNewTask(e) {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const due = document.getElementById('task-due').value;
    const courses = await dataService.getCourses();

    // Using a simplified addition since we logic-shared internal db
    const newTask = {
        id: Date.now() + Math.random(),
        title,
        due,
        status: 'pending',
        completions: 0,
        total: courses[0]?.students.length || 30
    };

    // Let's add addTask to dataService for consistency
    await dataService.addTask(newTask);

    await renderTasks();
    closeModal('task-modal');
    showToast('Tarea añadida');
    e.target.reset();
}

// --- MODULE: NOTAS ---
async function renderNotas() {
    const stats = document.getElementById('stats-summary');
    const courses = await dataService.getCourses();
    const tasks = await dataService.getTasks();

    const totalStudents = courses.reduce((acc, c) => acc + (c.students?.length || 0), 0);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;

    stats.innerHTML = `
        <div class="bg-primary/10 p-4 rounded-2xl">
            <p class="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Total Alumnos</p>
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
    ` + (await Promise.all(courses.map(async c => {
        const { avg, count } = await getCourseAverage(c.id);
        const displayAvg = count === 0 ? '-' : avg.toFixed(1);

        return `
        <div class="flex items-center justify-between py-2">
            <div class="flex-1" onclick="openGradebook(${c.id})" style="cursor: pointer;">
                <p class="text-sm font-bold hover:text-primary transition-colors">${c.nombre} <span class="material-symbols-outlined text-[12px] text-slate-400">edit</span></p>
                <p class="text-[10px] text-slate-400">${c.students?.length || 0} alumnos • ${c.año || ''} • ${count} notas</p>
            </div>
            <div class="text-lg font-black ${avg >= 6 ? 'text-primary' : (count === 0 ? 'text-slate-400' : 'text-rose-500')}">${displayAvg}</div>
        </div>
    `;
    }))).join('<div class="h-px bg-slate-100 dark:bg-slate-700 w-full my-2"></div>');
}

// --- MODULE: GRADEBOOK ---
async function getCourseAverage(courseId) {
    const course = await dataService.getCourseById(courseId);
    const grades = await dataService.getGrades();
    if (!course || !course.students) return { avg: 0, count: 0 };

    let totalSum = 0;
    let totalGrades = 0;

    course.students.forEach(s => {
        const gradeKeys = Object.keys(grades).filter(k => k.startsWith(`${courseId}_`) && k.endsWith(`_${s.id}`));

        gradeKeys.forEach(k => {
            const val = Number(grades[k]);
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

async function openGradebook(courseId) {
    activeManageCourseId = courseId; // Reuse the variable
    const course = await dataService.getCourseById(courseId);
    document.getElementById('gradebook-title').textContent = `Calificaciones: ${course.nombre}`;
    await renderGradebook();
    openModal('gradebook-modal');
}

async function renderGradebook() {
    const course = await dataService.getCourseById(activeManageCourseId);
    const list = document.getElementById('gradebook-list');
    const grades = await dataService.getGrades();

    if (!course.students || course.students.length === 0) {
        list.innerHTML = `<p class="text-center text-slate-400 text-sm py-4">Agrega alumnos en la sección "Cursos" primero.</p>`;
        return;
    }

    list.innerHTML = course.students.map(s => {
        const finalGradeKey = `${course.id}_final_${s.id}`;
        const currentVal = grades[finalGradeKey] || '';

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

async function saveGrade(courseId, studentId, value) {
    const key = `${courseId}_final_${studentId}`;

    if (value === '' || isNaN(value)) {
        await dataService.deleteGrade(key);
    } else {
        await dataService.setGrade(key, Number(value));
    }
    await renderNotas(); // Update background
}

async function exportAttendanceCSV() {
    let csv = "Curso,Estudiante,Estado\n";
    const courses = await dataService.getCourses();
    const attendance = await dataService.getAttendance();

    courses.forEach(c => {
        if (c.students) {
            c.students.forEach((s) => {
                const status = attendance[`today_${c.id}_${s.id}`] || 'Pendiente';
                csv += `"${c.nombre}","${s.name}",${status}\n`;
            });
        }
    });
    downloadCSV(csv, "reporte_asistencia.csv");
}

async function exportGradesCSV() {
    let csv = "Curso,Estudiante,Nota Final\n";
    const courses = await dataService.getCourses();
    const grades = await dataService.getGrades();

    courses.forEach(c => {
        if (c.students) {
            c.students.forEach(s => {
                const finalGradeKey = `${c.id}_final_${s.id}`;
                const val = grades[finalGradeKey] || '-';
                csv += `"${c.nombre}","${s.name}",${val}\n`;
            });
        }
    });
    downloadCSV(csv, "reporte_notas.csv");
}

// --- MODULE: CLASS REGISTRY ---
async function populateCourseSelect(selectId = 'registro-course', defaultValue) {
    const select = document.getElementById(selectId);
    if (!select) return;
    const courses = await dataService.getCourses();

    if (courses.length === 0) {
        select.innerHTML = '<option value="" disabled selected>Primero debes crear un curso</option>';
        select.disabled = true;
    } else {
        select.innerHTML = '<option value="" disabled selected>Seleccionar Curso</option>' +
            courses.map(c => `<option value="${c.id}">${c.nombre} (${c.año})</option>`).join('');
        if (defaultValue) select.value = defaultValue;
        select.disabled = false;
    }
}

async function updateCourseSelector() {
    // keep for backward compatibility, update both selectors
    await populateCourseSelect('registro-course');
    await populateCourseSelect('quick-course');
}

async function openNewClassModal() {
    await populateCourseSelect();
    openModal('registro-modal');
}

async function handleNewClassRecord(e) {
    e.preventDefault();
    const cursoId = Number(document.getElementById('registro-course').value);
    const fecha = document.getElementById('registro-date').value;
    const tema = document.getElementById('registro-topic').value;
    const notes = document.getElementById('registro-notes').value;
    const homework = document.getElementById('registro-homework').value;

    if (!cursoId || !fecha || !tema) return;

    const newRecord = {
        id: Date.now(),
        cursoId,
        fecha,
        tema,
        notes,
        homework
    };

    await dataService.addClass(newRecord);
    await renderClassRecords();
    closeModal('registro-modal');
    showToast('Clase registrada correctamente');
    e.target.reset();
}

async function deleteClassRecord(id) {
    if (!confirm('¿Eliminar este registro de clase?')) return;
    await dataService.deleteClass(id);
    await renderClassRecords();
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

// --- NUEVA SECCIÓN: GESTIÓN DE CURSOS ---
async function renderGestionCursos() {
    const list = document.getElementById('gestion-courses-list');
    const courses = await dataService.getCourses();
    list.innerHTML = courses.map(c => `
        <article class="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm relative group">
            <div class="h-28 relative" style="background: linear-gradient(135deg, ${c.color} 0%, #6394ff 100%);">
                <div class="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">${c.schedule} • ${c.año}</div>
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
                <h3 class="text-xl font-bold mb-1">${c.nombre}</h3>
                <p class="text-xs text-slate-500">${c.students.length} Estudiantes inscritos</p>
            </div>
        </article>
    `).join('');
}

// Quick class helpers
async function openQuickClassModal() {
    const settings = await dataService.getSettings();
    const last = settings.lastQuickCourse;
    await populateCourseSelect('quick-course', last);
    openModal('quick-class-modal');
}

async function handleQuickClass(e) {
    e.preventDefault();
    const cursoId = Number(document.getElementById('quick-course').value);
    const tema = document.getElementById('quick-topic').value;
    if (!cursoId || !tema) return;
    const today = new Date().toISOString().split('T')[0];
    const newRecord = {
        id: Date.now(),
        cursoId,
        fecha: today,
        tema,
        notes: '',
        homework: ''
    };
    await dataService.addClass(newRecord);
    // remember course
    await dataService.updateSettings({ lastQuickCourse: cursoId });
    await renderClassRecords();
    closeModal('quick-class-modal');
    showToast('Clase rápida registrada');
}

async function handleAddCourseFromGestion(e) {
    e.preventDefault();
    const nombre = document.getElementById('course-name').value;
    const año = document.getElementById('course-year').value;
    const day = document.getElementById('course-day').value;
    const schedule = document.getElementById('course-schedule').value;
    const newCourse = {
        id: Date.now(),
        nombre,
        año,
        day,
        schedule,
        progress: 0,
        color: '#2b6cee',
        students: []
    };
    await dataService.addCourse(newCourse);
    await renderGestionCursos();
    closeModal('course-modal');
    showToast('Curso añadido desde Gestión');
    e.target.reset();
}

async function handleDeleteCourseFromGestion(courseId) {
    if (!confirm('¿Eliminar este curso y todos sus datos asociados?')) return;
    await dataService.deleteCourse(courseId);
    await renderGestionCursos();
    showToast('Curso eliminado desde Gestión');
}

// Init
window.addEventListener('load', async () => {
    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('Service Worker registrado', reg))
            .catch(err => console.warn('Error al registrar Service Worker', err));
    }

    const currentDB = await dataService.getFullDB();
    const newLoadCount = (currentDB.loadCount || 0) + 1;
    await dataService.updateSettings({ loadCount: newLoadCount });

    const settings = await dataService.getSettings();
    if (settings.darkMode) document.documentElement.classList.add('dark');

    const userName = await dataService.getUserName();
    if (!userName) {
        document.getElementById('welcome-modal').classList.remove('hidden');
    } else {
        await updateGreeting();
    }

    // observe firebase auth state
    if (typeof authService !== 'undefined' && authService.observeAuthState) {
        authService.observeAuthState(async (user) => {
            if (user) {
                await dataService.updateSettings({ userUid: user.uid });
                await updateGreeting();
            } else {
                await updateGreeting();
            }
        });
    }

    await navigate('cursos');
    console.log(`Sesión #${newLoadCount} iniciada.`);
});
