// --- BACKUP MODULE ---
// Logic for exporting and importing the entire local database (db)

async function exportBackup() {
    const db = await dataService.getFullDB();
    const dataStr = JSON.stringify(db, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_agenda_docente_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    if (typeof showToast === 'function') showToast('Backup exportado correctamente');
}

function importBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!confirm('¿Estás seguro de que quieres importar este backup? Esto sobrescribirá todos tus datos actuales.')) {
        event.target.value = ''; // Reset input
        return;
    }

    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData && importedData.courses) {
                await dataService.importFullDB(importedData);
                alert('Datos restaurados correctamente. La página se recargará.');
                window.location.reload();
            } else {
                alert("El archivo no tiene el formato correcto de Agenda Docente.");
            }
        } catch (error) {
            console.error("Error parsing JSON:", error);
            alert("Error al leer el archivo JSON.");
        }
    };
    reader.readAsText(file);
}
