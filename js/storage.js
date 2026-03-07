// --- DATA LAYER ---
const DEFAULT_DATA = {
    userName: null,
    loadCount: 0,
    courses: [
        { id: 1, name: 'Matemáticas 101', schedule: 'LUN-MIE-VIE 09:00', progress: 65, color: '#2b6cee', students: [{ id: 101, name: 'Alice J.' }, { id: 102, name: 'Bob S.' }, { id: 103, name: 'Charlie D.' }] },
        { id: 2, name: 'Física Avanzada', schedule: 'MAR-JUE 11:30', progress: 42, color: '#4f46e5', students: [{ id: 201, name: 'Ethan H.' }, { id: 202, name: 'Diana P.' }, { id: 203, name: 'John W.' }] }
    ],
    tasks: [
        { id: 1, courseId: 1, title: 'Informe de Laboratorio', due: '24 Oct', status: 'pending', completions: 22, total: 30 }
    ],
    attendance: {}, // { 'date_courseId_studentId': status }
    grades: {}, // { 'courseId_taskId_studentId': gradeValue }
    classRecords: [], // { id, courseId, date, topic, notes, homework }
    settings: { darkMode: false }
};

let db = JSON.parse(localStorage.getItem('docente_app_db')) || DEFAULT_DATA;

function save() {
    localStorage.setItem('docente_app_db', JSON.stringify(db));
}

// --- DATA SYNC & EXCEL ---
function exportDataJSON() {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `docente_pro_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    if (typeof showToast === 'function') showToast('Copia de seguridad descargada');
}

function importDataJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const imported = JSON.parse(event.target.result);
            if (imported.courses && imported.tasks) {
                db = imported;
                save();
                location.reload();
            } else {
                alert('El archivo no parece ser una copia válida de Docente Pro.');
            }
        } catch (err) {
            alert('Error al leer el archivo.');
        }
    };
    reader.readAsText(file);
}

// Make sure it's accessible globally if needed in a module system,
// since we're using simple script tags it will be added to window automatically.
