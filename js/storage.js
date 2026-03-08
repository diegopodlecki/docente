// --- DATA LAYER ---
const DEFAULT_DATA = {
    userName: null,
    loadCount: 0,
    courses: [
        { id: 1, name: 'Matemáticas 101', day: 'Lunes', schedule: '09:00', progress: 65, color: '#2b6cee', students: [{ id: 101, name: 'Alice J.' }, { id: 102, name: 'Bob S.' }, { id: 103, name: 'Charlie D.' }] },
        { id: 2, name: 'Física Avanzada', day: 'Martes', schedule: '11:30', progress: 42, color: '#4f46e5', students: [{ id: 201, name: 'Ethan H.' }, { id: 202, name: 'Diana P.' }, { id: 203, name: 'John W.' }] }
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

// --- DATA SYNC ---
// Backup logic moved to js/backup.js
// Export logic moved to js/exportar.js
