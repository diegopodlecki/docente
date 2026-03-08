// --- EXPORTAR MODULE ---
// Logic for exporting class records to CSV/Excel

async function exportToCSV() {
    const records = await dataService.getClassRecords();
    const courses = await dataService.getCourses();

    if (records.length === 0) {
        if (typeof showToast === 'function') showToast('No hay registros para exportar');
        return;
    }

    // Prepare CSV data with UTF-8 BOM for Excel compatibility
    let csvContent = '\uFEFF';
    csvContent += 'Fecha,Curso,Tema,Notas,Tarea\n';

    // Sort descending for the export too
    const sortedRecords = [...records].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);

    sortedRecords.forEach(r => {
        const course = courses.find(c => c.id === r.cursoId);
        const courseName = course ? course.nombre.replace(/,/g, '') : 'Curso eliminado'; // Strip commas to avoid CSV issues
        const fecha = r.fecha;
        const tema = (r.tema || '').replace(/,/g, ' '); // Avoid commas in text fields
        const notes = (r.notes || '').replace(/,/g, ' ').replace(/\n/g, ' ');
        const homework = (r.homework || '').replace(/,/g, ' ').replace(/\n/g, ' ');

        csvContent += `${fecha},${courseName},${tema},${notes},${homework}\n`;
    });

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `registro_clases_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (typeof showToast === 'function') showToast('Exportación Exitosa');
}

