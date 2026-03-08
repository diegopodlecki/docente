// --- DATA SERVICE MODULE ---
// Abstraction layer for data persistence, preparing for future Firebase integration.

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

class DataService {
    constructor() {
        this.db = JSON.parse(localStorage.getItem('docente_app_db')) || DEFAULT_DATA;
    }

    async _save() {
        localStorage.setItem('docente_app_db', JSON.stringify(this.db));
        return true;
    }

    // --- User Info ---
    async getUserName() {
        return this.db.userName;
    }

    async setUserName(name) {
        this.db.userName = name;
        return this._save();
    }

    // --- Courses ---
    async getCourses() {
        return [...this.db.courses];
    }

    async getCourseById(id) {
        return this.db.courses.find(c => c.id === id);
    }

    async addCourse(course) {
        this.db.courses.push(course);
        return this._save();
    }

    async updateCourse(id, updates) {
        const course = this.db.courses.find(c => c.id === id);
        if (course) {
            Object.assign(course, updates);
            return this._save();
        }
        return false;
    }

    async addStudentToCourse(courseId, student) {
        const course = this.db.courses.find(c => c.id === courseId);
        if (course) {
            if (!course.students) course.students = [];
            course.students.push(student);
            return this._save();
        }
        return false;
    }

    async removeStudentFromCourse(courseId, studentId) {
        const course = this.db.courses.find(c => c.id === courseId);
        if (course) {
            course.students = course.students.filter(s => s.id !== studentId);
            return this._save();
        }
        return false;
    }

    async deleteCourse(id) {
        this.db.courses = this.db.courses.filter(c => c.id !== id);
        this.db.tasks = this.db.tasks.filter(t => t.courseId !== id);
        // Cleanup attendance and grades related to this course
        Object.keys(this.db.attendance).forEach(key => {
            if (key.includes(`_${id}_`)) delete this.db.attendance[key];
        });
        Object.keys(this.db.grades || {}).forEach(key => {
            if (key.startsWith(`${id}_`)) delete this.db.grades[key];
        });
        return this._save();
    }

    // --- Class Records ---
    async getClassRecords() {
        return [...this.db.classRecords];
    }

    async addClassRecord(record) {
        this.db.classRecords.push(record);
        return this._save();
    }

    async deleteClassRecord(id) {
        this.db.classRecords = this.db.classRecords.filter(r => r.id !== id);
        return this._save();
    }

    // --- Tasks ---
    async getTasks() {
        return [...this.db.tasks];
    }

    // --- Attendance ---
    async getAttendance() {
        return { ...this.db.attendance };
    }

    async setAttendance(key, status) {
        this.db.attendance[key] = status;
        return this._save();
    }

    async deleteAttendanceByStudent(studentId) {
        Object.keys(this.db.attendance).forEach(key => {
            if (key.includes(`_${studentId}`)) delete this.db.attendance[key];
        });
        return this._save();
    }

    // --- Grades ---
    async getGrades() {
        return { ...(this.db.grades || {}) };
    }

    async setGrade(key, value) {
        if (!this.db.grades) this.db.grades = {};
        this.db.grades[key] = value;
        return this._save();
    }

    // --- Settings ---
    async getSettings() {
        return { ...this.db.settings };
    }

    async updateSettings(updates) {
        this.db.settings = { ...this.db.settings, ...updates };
        return this._save();
    }

    // --- Full DB (for backup) ---
    async getFullDB() {
        return { ...this.db };
    }

    async importFullDB(data) {
        this.db = data;
        return this._save();
    }
}

// Export a singleton instance
window.dataService = new DataService();
// Maintain backward compatibility for scripts that still use the global 'db' temporarily
// but mark them for refactoring
window.db = window.dataService.db;
