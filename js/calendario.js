// --- CALENDARIO MODULE ---
// Logic for displaying and interacting with the monthly class calendar

let currentCalendarDate = new Date();

async function changeMonth(delta) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
    await renderCalendar();
}

async function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const title = document.getElementById('calendar-month-year');
    if (!grid || !title) return;

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    title.textContent = `${monthNames[month]} ${year}`;

    // Calculate days
    const firstDay = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    grid.innerHTML = '';

    // Empty cells for first week
    for (let i = 0; i < firstDay; i++) {
        grid.innerHTML += `<div class="p-2"></div>`;
    }

    // Days of the month
    const records = await dataService.getClassRecords();

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Find classes for this day
        const dayClasses = records.filter(r => r.date === dateStr);
        const hasClass = dayClasses.length > 0;

        let indicator = '';
        if (hasClass) {
            indicator = `<div class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-sm shadow-primary/50"></div>`;
        }

        const isToday = new Date().toISOString().split('T')[0] === dateStr;
        const todayClass = isToday ? 'bg-primary text-white font-black shadow-lg shadow-primary/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700';

        grid.innerHTML += `
            <div onclick="showCalendarDayDetails('${dateStr}')" class="relative p-2 rounded-2xl text-xs flex items-center justify-center cursor-pointer transition-all active:scale-90 ${todayClass} aspect-square">
                ${day}
                ${indicator}
            </div>
        `;
    }
}

async function showCalendarDayDetails(dateStr) {
    const detailsContainer = document.getElementById('calendar-day-details');
    if (!detailsContainer) return;

    const records = await dataService.getClassRecords();
    const courses = await dataService.getCourses();
    const dayClasses = records.filter(r => r.date === dateStr);

    const dateObj = new Date(dateStr + 'T12:00:00'); // Force local noon to avoid timezone shift
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateFormatted = dateObj.toLocaleDateString('es-ES', options);

    if (dayClasses.length === 0) {
        detailsContainer.innerHTML = `
            <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[24px] text-center border border-slate-100 dark:border-slate-800/50 transition-all animation-fade-in">
                <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">event_busy</span>
                <p class="font-bold text-slate-500 capitalize">${dateFormatted}</p>
                <p class="text-sm text-slate-400 mt-1">No hay clases registradas.</p>
            </div>
        `;
        return;
    }

    let html = `
        <div class="mb-4 transition-all animation-fade-in">
            <h3 class="text-sm font-bold uppercase tracking-widest text-slate-400">Detalles del Día</h3>
            <p class="font-bold text-slate-700 dark:text-slate-300 capitalize">${dateFormatted}</p>
        </div>
        <div class="space-y-4">
    `;

    dayClasses.forEach(r => {
        const course = courses.find(c => c.id === r.courseId);
        html += `
            <div class="bg-white dark:bg-slate-800 p-5 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800/50 relative group transition-all animation-fade-in">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <div class="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                            <span class="material-symbols-outlined text-lg">history_edu</span>
                        </div>
                        <div>
                            <h4 class="font-black text-sm leading-tight">${course ? course.name : 'Curso eliminado'}</h4>
                            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">${r.topic}</p>
                        </div>
                    </div>
                </div>
                ${r.notes ? `<div class="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-2xl mb-2 border border-blue-100 dark:border-blue-900/20"><p class="text-xs text-blue-800 dark:text-blue-300" title="${r.notes}"><strong class="font-black block mb-1">Notas:</strong> ${r.notes}</p></div>` : ''}
                ${r.homework ? `<div class="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-2xl border border-amber-100 dark:border-amber-900/20"><p class="text-xs text-amber-800 dark:text-amber-300" title="${r.homework}"><strong class="font-black block mb-1">Tarea:</strong> ${r.homework}</p></div>` : ''}
            </div>
        `;
    });

    html += `</div>`;
    detailsContainer.innerHTML = html;
}

