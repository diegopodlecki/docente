// --- SMART REGISTRY MODULE ---
// Client-side heuristics to parse free text into structured class records

async function generateSmartRecord() {
    const textInput = document.getElementById('smart-text');
    const feedback = document.getElementById('smart-feedback');
    if (!textInput || !feedback) return;

    const text = textInput.value.trim();
    if (!text) {
        if (typeof showToast === 'function') showToast('Por favor, escribe una descripción primero.');
        return;
    }

    const lowerText = text.toLowerCase();

    // 1. Parse Date
    let recordDate = new Date();
    if (lowerText.includes('ayer')) {
        recordDate.setDate(recordDate.getDate() - 1);
    } else if (lowerText.includes('anteayer')) {
        recordDate.setDate(recordDate.getDate() - 2);
    }
    const dateStr = recordDate.toISOString().split('T')[0];

    // 2. Parse Course
    let detectedCourseId = '';
    const courses = await dataService.getCourses();
    if (courses && courses.length > 0) {
        // Sort courses by length descending to match longer specific names first
        const sortedCourses = [...courses].sort((a, b) => b.nombre.length - a.nombre.length);
        for (const course of sortedCourses) {
            if (lowerText.includes(course.nombre.toLowerCase())) {
                detectedCourseId = course.id;
                break;
            }
        }
    }

    // 3. Parse Topic, Notes, Homework
    let topic = '';
    let notes = text;
    let homework = '';

    // Advanced Extraction logic using Regex
    // Look for Homework: "tarea: ...", "deberes: ...", "para casa: ..."
    const hwMatch = text.match(/(?:tarea|deberes|para casa)\s*[:=]?\s*(.*?)(\n|$)/i);
    if (hwMatch && hwMatch[1]) {
        homework = hwMatch[1].trim();
        notes = notes.replace(hwMatch[0], '').trim(); // Remove homework from notes
    }

    // Look for Topic: "tema: ...", "vimos: ...", "enseñé: ..."
    const topicMatch = notes.match(/(?:tema|vimos|enseñé|hablamos de)\s*[:=]?\s*(.*?)(?:\.|\n|$)/i);
    if (topicMatch && topicMatch[1]) {
        topic = topicMatch[1].trim();
        // optionally remove it from notes or leave it. Leaving it is usually safer for context.
    } else {
        // Fallback: first 5 words of the text
        topic = notes.split(/\s+/).slice(0, 5).join(' ') + '...';
    }

    // limit topic length just in case
    if (topic.length > 50) topic = topic.substring(0, 50) + '...';

    // 4. Fill the Form
    const dateField = document.getElementById('registro-date');
    const courseField = document.getElementById('registro-course');
    const topicField = document.getElementById('registro-topic');
    const notesField = document.getElementById('registro-notes');
    const hwField = document.getElementById('registro-homework');

    if (dateField) dateField.value = dateStr;
    if (courseField && detectedCourseId) courseField.value = detectedCourseId;
    if (topicField) topicField.value = topic;
    if (notesField) notesField.value = notes;
    if (hwField) hwField.value = homework;

    // 5. Visual Feedback
    feedback.classList.remove('hidden');

    // Highlight updated fields
    const fields = [dateField, courseField, topicField, notesField, hwField];
    fields.forEach(f => {
        if (!f) return;
        // Temporarily add a highlight class
        f.classList.add('ring-2', 'ring-indigo-400', 'bg-indigo-50', 'dark:bg-indigo-900/10');
        setTimeout(() => {
            f.classList.remove('ring-2', 'ring-indigo-400', 'bg-indigo-50', 'dark:bg-indigo-900/10');
        }, 1500);
    });

    if (typeof showToast === 'function') showToast('Registro generado. Por favor revisa y guarda.');
}
