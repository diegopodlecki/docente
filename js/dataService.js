// --- DATA SERVICE MODULE ---
// Abstraction layer for data persistence, preparing for future Firebase integration.

const DEFAULT_DATA = {
    userName: null,
    loadCount: 0,
    courses: [
        { id: 1, nombre: 'Matemáticas 101', año: '2026', day: 'Lunes', schedule: '09:00', progress: 65, color: '#2b6cee', students: [{ id: 101, name: 'Alice J.' }, { id: 102, name: 'Bob S.' }, { id: 103, name: 'Charlie D.' }] },
        { id: 2, nombre: 'Física Avanzada', año: '2026', day: 'Martes', schedule: '11:30', progress: 42, color: '#4f46e5', students: [{ id: 201, name: 'Ethan H.' }, { id: 202, name: 'Diana P.' }, { id: 203, name: 'John W.' }] }
    ],
    tasks: [
        { id: 1, courseId: 1, title: 'Informe de Laboratorio', due: '24 Oct', status: 'pending', completions: 22, total: 30 }
    ],
    attendance: {}, // { 'date_courseId_studentId': status }
    grades: {}, // { 'courseId_taskId_studentId': gradeValue }
    classRecords: [], // { id, cursoId, fecha, tema, notes, homework }
    settings: { darkMode: false, lastQuickCourse: null }
};

class DataService {
        // --- TASKS ---
        async addTask(task) {
            this.db.tasks.push(task);
            return this._save();
        }

        async updateTask(updatedTask) {
            const idx = this.db.tasks.findIndex(t => t.id === updatedTask.id);
            if (idx !== -1) {
                this.db.tasks[idx] = { ...this.db.tasks[idx], ...updatedTask };
                return this._save();
            }
            return false;
        }

        async deleteTask(taskId) {
            this.db.tasks = this.db.tasks.filter(t => t.id !== taskId);
            return this._save();
        }

        // --- GRADES ---
        async deleteGrade(key) {
            if (this.db.grades && key in this.db.grades) {
                delete this.db.grades[key];
                return this._save();
            }
            return false;
        }
    constructor() {
    }

    _migrate() {
        let changed = false;

        // 1. Migrate courses: name -> nombre, add año
        if (this.db.courses) {
            this.db.courses.forEach(c => {
                if (c.name && !c.nombre) {
                    c.nombre = c.name;
                    delete c.name;
                    changed = true;
                }
                if (!c.año) {
                    c.año = new Date().getFullYear().toString();
                    changed = true;
                }
            });
        }

        // 2. Migrate classRecords: date -> fecha, topic -> tema, courseId -> cursoId, add id if missing
        if (this.db.classRecords) {
            this.db.classRecords.forEach(r => {
                if (r.date && !r.fecha) {
                    r.fecha = r.date;
                    delete r.date;
                    changed = true;
                }
                if (r.topic && !r.tema) {
                    r.tema = r.topic;
                    delete r.topic;
                    changed = true;
                }
                if (r.courseId && !r.cursoId) {
                    r.cursoId = r.courseId;
                    delete r.courseId;
                    changed = true;
                }

                // Compatibility check: If no cursoId, create "Archivo histórico"
                if (!r.cursoId) {
                    let historyCourse = this.db.courses.find(c => c.nombre === 'Archivo Histórico');
                    if (!historyCourse) {
                        historyCourse = {
                            id: Date.now() + Math.random(),
                            nombre: 'Archivo Histórico',
                            año: 'Antiguo',
                            color: '#64748b',
                            students: []
                        };
                        this.db.courses.push(historyCourse);
                    }
                    r.cursoId = historyCourse.id;
                    changed = true;
                }
                // Asignar id único si no existe
                if (!r.id) {
                    if (window.crypto && window.crypto.randomUUID) {
                        r.id = window.crypto.randomUUID();
                    } else {
                        r.id = 'id_' + Date.now() + '_' + Math.floor(Math.random()*1000000);
                    }
                    changed = true;
                }
            });
        }

        if (changed) {
            console.log("Data migrated to new structure.");
            this._save();
        }
    }
    // --- Class Records CRUD ---
    // helper constants
    const CLASSES_KEY = 'agenda_docente_clases';
    const COURSES_KEY = 'agenda_docente_cursos';
    const SETTINGS_KEY = 'agenda_docente_settings';

    function ensureClassIds(classes) {
        let changed = false;
        for (const c of classes) {
            if (!c.id) {
                if (window.crypto && window.crypto.randomUUID) {
                    c.id = window.crypto.randomUUID();
                } else {
                    c.id = 'id_' + Date.now() + '_' + Math.floor(Math.random()*1000000);
                }
                changed = true;
            }
        }
        return changed;
    }

    function ensureCourseIds(courses) {
        let changed = false;
        for (const c of courses) {
            if (!c.id) {
                if (window.crypto && window.crypto.randomUUID) {
                    c.id = window.crypto.randomUUID();
                } else {
                    c.id = 'id_' + Date.now() + '_' + Math.floor(Math.random()*1000000);
                }
                changed = true;
            }
        }
        return changed;
    }

    // Settings helpers
    function getSettings() {
        const data = localStorage.getItem(SETTINGS_KEY);
        try {
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    }

    function updateSettings(updates) {
        const settings = getSettings();
        Object.assign(settings, updates);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        return settings;
    }

    function setUserName(name) {
        updateSettings({ userName: name });
    }

    function getUserName() {
        return getSettings().userName || null;
    }

    // Classes with optional Firestore sync
    async function getClasses() {
        const settings = getSettings();
        if (settings.userUid && window.firebaseDb) {
            // fetch from Firestore
            const snap = await window.firebaseDb
                .collection('users').doc(settings.userUid)
                .collection('classes').get();
            let classes = snap.docs.map(d => d.data());
            if (ensureClassIds(classes)) {
                saveClasses(classes); // keep local copy
            }
            return classes;
        }
        // fallback to localStorage
        const data = localStorage.getItem(CLASSES_KEY);
        let classes;
        try {
            classes = data ? JSON.parse(data) : [];
        } catch (e) {
            classes = [];
        }
        if (ensureClassIds(classes)) saveClasses(classes);
        return classes;
    }

    async function saveClasses(classes) {
        localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
    }

    async function addClass(newClass) {
        if (!newClass.id) {
            if (window.crypto && window.crypto.randomUUID) {
                newClass.id = window.crypto.randomUUID();
            } else {
                newClass.id = 'id_' + Date.now() + '_' + Math.floor(Math.random()*1000000);
            }
        }
        const classes = await getClasses();
        classes.push(newClass);
        await saveClasses(classes);
        const settings = getSettings();
        if (settings.userUid && window.firebaseDb) {
            await window.firebaseDb
                .collection('users').doc(settings.userUid)
                .collection('classes').doc(newClass.id.toString())
                .set(newClass);
        }
    }

    async function deleteClass(classId) {
        let classes = await getClasses();
        classes = classes.filter(c => c.id !== classId);
        await saveClasses(classes);
        const settings = getSettings();
        if (settings.userUid && window.firebaseDb) {
            await window.firebaseDb
                .collection('users').doc(settings.userUid)
                .collection('classes').doc(classId.toString())
                .delete();
        }
    }

    async function updateClass(updatedClass) {
        let classes = await getClasses();
        classes = classes.map(c => c.id === updatedClass.id ? { ...c, ...updatedClass } : c);
        await saveClasses(classes);
        const settings = getSettings();
        if (settings.userUid && window.firebaseDb) {
            await window.firebaseDb
                .collection('users').doc(settings.userUid)
                .collection('classes').doc(updatedClass.id.toString())
                .set(updatedClass, { merge: true });
        }
    }

    // --- Cursos (local only) ---
    function getCourses() {
        const data = localStorage.getItem(COURSES_KEY);
        let courses;
        try {
            courses = data ? JSON.parse(data) : [];
        } catch (e) {
            courses = [];
        }
        if (ensureCourseIds(courses)) {
            saveCourses(courses);
        }
        return courses;
    }

    function saveCourses(courses) {
        localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    }

    function addCourse(course) {
        const courses = getCourses();
        if (!course.id) {
            if (window.crypto && window.crypto.randomUUID) {
                course.id = window.crypto.randomUUID();
            } else {
                course.id = 'id_' + Date.now() + '_' + Math.floor(Math.random()*1000000);
            }
        }
        courses.push(course);
        saveCourses(courses);
    }

    // Export global functions
    window.dataService = {
        // Settings
        getSettings,
        updateSettings,
        setUserName,
        getUserName,
        // Clases
        getClasses,
        addClass,
        deleteClass,
        updateClass,
        saveClasses,
        // Cursos
        getCourses,
        saveCourses,
        addCourse
    };
}
