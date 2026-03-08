// --- ESTADISTICAS MODULE ---
// Logic for calculating and displaying dashboard statistics

async function renderStatistics() {
    const statsGrid = document.getElementById('dash-stats-grid');
    if (!statsGrid) return;

    const [records, courses] = await Promise.all([
        dataService.getClassRecords(),
        dataService.getCourses()
    ]);

    if (records.length === 0) {
        statsGrid.innerHTML = '<p class="text-xs text-slate-400 col-span-2 text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">Aún no hay suficientes datos para mostrar estadísticas.</p>';
        return;
    }

    // 1. Total de clases
    const totalClasses = records.length;

    // 2. Curso con más clases
    const courseCounts = {};
    records.forEach(r => {
        const course = courses.find(c => c.id === r.courseId);
        const name = course ? course.name : 'Curso eliminado';
        courseCounts[name] = (courseCounts[name] || 0) + 1;
    });
    let topCourse = '';
    let topCourseCount = 0;
    for (const [name, count] of Object.entries(courseCounts)) {
        if (count > topCourseCount) {
            topCourseCount = count;
            topCourse = name;
        }
    }

    // 3. Tema más trabajado
    const topicCounts = {};
    records.forEach(r => {
        // Normalizar tema (minúsculas, sin espacios extra)
        const topic = (r.topic || '').trim().toLowerCase();
        if (topic) topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
    let topTopic = '';
    let topTopicCount = 0;
    for (const [topic, count] of Object.entries(topicCounts)) {
        if (count > topTopicCount) {
            topTopicCount = count;
            topTopic = topic;
        }
    }
    // Capitalize topTopic
    if (topTopic) {
        topTopic = topTopic.charAt(0).toUpperCase() + topTopic.slice(1);
    }

    // 4. Clases este mes
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    let currentMonthClasses = 0;
    records.forEach(r => {
        const [year, month, day] = r.date.split('-');
        if (parseInt(year) === currentYear && parseInt(month) - 1 === currentMonth) {
            currentMonthClasses++;
        }
    });

    statsGrid.innerHTML = `
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-3xl border border-blue-100 dark:border-blue-800/30">
            <p class="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Total Clases</p>
            <p class="text-2xl font-black text-blue-700 dark:text-blue-300">${totalClasses}</p>
        </div>
        <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-3xl border border-purple-100 dark:border-purple-800/30">
            <p class="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">Clases del Mes</p>
            <p class="text-2xl font-black text-purple-700 dark:text-purple-300">${currentMonthClasses}</p>
        </div>
        <div class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-3xl border border-amber-100 dark:border-amber-800/30 col-span-2 flex items-center justify-between">
            <div>
                <p class="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Curso Destacado</p>
                <p class="text-sm font-bold text-amber-700 dark:text-amber-300 truncate max-w-[200px]" title="${topCourse}">${topCourse || '-'}</p>
            </div>
            <div class="bg-amber-100 dark:bg-amber-800/50 px-3 py-1 rounded-full">
                <p class="text-xs font-bold text-amber-700 dark:text-amber-300">${topCourseCount} clases</p>
            </div>
        </div>
        <div class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-3xl border border-indigo-100 dark:border-indigo-800/30 col-span-2 flex items-center justify-between">
            <div>
                <p class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Tema más dado</p>
                <p class="text-sm font-bold text-indigo-700 dark:text-indigo-300 truncate max-w-[200px]" title="${topTopic}">${topTopic || '-'}</p>
            </div>
            <div class="bg-indigo-100 dark:bg-indigo-800/50 px-3 py-1 rounded-full">
                <p class="text-xs font-bold text-indigo-700 dark:text-indigo-300">${topTopicCount} clases</p>
            </div>
        </div>
    `;
}

