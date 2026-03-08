// --- PLANIFICADOR MODULE ---
// Logic for automatically generating a sequence of classes and saving them

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-planificador');
    if (form) {
        form.addEventListener('submit', handleGeneratePlan);
    }
});

async function populatePlannerCourseSelect() {
    const select = document.getElementById('plan-course');
    if (!select) return;

    const courses = await dataService.getCourses();
    if (courses.length === 0) {
        select.innerHTML = '<option value="" disabled selected>Primero debes crear un curso</option>';
        select.disabled = true;
    } else {
        select.innerHTML = courses.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
        select.disabled = false;
    }
}

async function handleGeneratePlan(e) {
    e.preventDefault();
    const topic = document.getElementById('plan-topic').value.trim();
    const count = parseInt(document.getElementById('plan-count').value);

    if (!topic || isNaN(count)) return;

    // Simulate "thinking" animation with a toast
    if (typeof showToast === 'function') showToast('Generando planificación...', 1000);

    const plan = generatePlanHeuristics(topic, count);
    renderPlan(plan);
}

function generatePlanHeuristics(topic, count) {
    const plan = [];
    const keywords = {
        'redes': ['Introducción a Redes', 'Modelos OSI y TCP/IP', 'Protocolos e IPs', 'Seguridad en Redes', 'Configuración de Switches', 'Redes Inalámbricas'],
        'excel': ['Interfaz y Celdas', 'Fórmulas Básicas', 'Funciones Lógicas', 'Gráficos y Datos', 'Tablas Dinámicas', 'Macros e Introducción a VBA'],
        'programación': ['Lógica y Algoritmos', 'Variables y Datos', 'Estructuras de Control', 'Funciones y Alcance', 'Arreglos y Objetos', 'Depuración y Proyecto'],
        'historia': ['Conceptos Básicos', 'Contexto Histórico', 'Conflictos Principales', 'Consecuencias Sociales', 'Legado Actual', 'Análisis Crítico'],
        'clase': ['Introducción', 'Desarrollo de Conceptos', 'Práctica Guiada', 'Resolución de Problemas', 'Evaluación Formativa', 'Repaso y Cierre']
    };

    let baseTitles = keywords['clase'];
    for (const key in keywords) {
        if (topic.toLowerCase().includes(key)) {
            baseTitles = keywords[key];
            break;
        }
    }

    for (let i = 1; i <= count; i++) {
        const title = baseTitles[(i - 1) % baseTitles.length];
        plan.push({
            session: i,
            title: `${title}: ${topic}`,
            description: `Lección ${i} enfocada en profundizar sobre ${topic.toLowerCase()}.`
        });
    }
    return plan;
}

function renderPlan(plan) {
    const results = document.getElementById('plan-results');
    const list = document.getElementById('plan-list');

    list.innerHTML = plan.map(p => `
        <div class="bg-white dark:bg-slate-800 p-5 rounded-[24px] border-2 border-slate-100 dark:border-slate-800/50 relative animation-fade-in group hover:border-primary/30 transition-all">
            <div class="flex items-center gap-4 mb-3">
                <div class="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                    ${p.session}
                </div>
                <input type="text" value="${p.title}" class="flex-1 bg-transparent border-none p-0 text-sm font-black focus:ring-0 text-slate-800 dark:text-white planner-item-title">
            </div>
            <textarea class="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-xl p-3 text-xs text-slate-500 font-bold focus:ring-1 focus:ring-primary h-20 planner-item-description">${p.description}</textarea>
        </div>
    `).join('');

    results.classList.remove('hidden');
    results.scrollIntoView({ behavior: 'smooth' });
}

async function savePlannerToRecords() {
    const courseId = Number(document.getElementById('plan-course').value);
    const titles = document.querySelectorAll('.planner-item-title');
    const descriptions = document.querySelectorAll('.planner-item-description');

    if (!courseId) {
        if (typeof showToast === 'function') showToast('Selecciona un curso primero');
        return;
    }

    if (!confirm(`¿Guardar estas ${titles.length} clases como registros?`)) return;

    // We'll use today's date and increment by 1 day for each if we wanted, 
    // but the requirement just says "save as records". Let's use current date for simplicity.
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < titles.length; i++) {
        const record = {
            id: Date.now() + Math.random(),
            cursoId,
            fecha: today,
            tema: titles[i].value,
            notes: descriptions[i].value,
            homework: ''
        };
        await dataService.addClass(record);
    }

    if (typeof showToast === 'function') showToast(`${titles.length} clases guardadas!`);

    // Refresh views if needed
    if (typeof renderClassRecords === 'function') renderClassRecords();

    // Clear results
    document.getElementById('plan-results').classList.add('hidden');
    document.getElementById('form-planificador').reset();

    // Navigate to class records to show them the result
    if (typeof navigate === 'function') navigate('registro');
}
