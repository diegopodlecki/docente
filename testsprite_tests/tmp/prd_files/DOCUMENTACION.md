# 📘 Docente App - Pro — Documentación

## Descripción General

**Docente App - Pro** es una aplicación web progresiva (PWA) diseñada para docentes. Permite gestionar cursos, controlar asistencia de estudiantes, administrar tareas y visualizar rendimiento académico — todo desde una interfaz móvil moderna.

> **Stack tecnológico:** HTML5 + JavaScript vanilla + TailwindCSS (CDN) + localStorage

---

## Arquitectura

La aplicación es un **archivo único** (`index.html`) que contiene todo el HTML, CSS y JavaScript. No requiere backend ni compilación.

```
docente/
├── index.html        ← App completa (HTML + CSS + JS)
├── manifest.json     ← Configuración PWA
├── assets/           ← Recursos estáticos (íconos)
└── dashboards/       ← Versiones históricas de vistas
```

### Patrón de diseño

| Capa            | Descripción                                                    |
|-----------------|----------------------------------------------------------------|
| **Data Layer**  | Objeto `db` en memoria, sincronizado con `localStorage`        |
| **Navegación**  | Función `navigate()` que alterna secciones con clase `.active` |
| **Módulos**     | Cada vista tiene sus funciones `render*()` y `handle*()`       |
| **UI Utils**    | Modales, toasts, y dark mode como funciones reutilizables       |

---

## Módulos Funcionales

### 1. 🔐 Login / Bienvenida

- Al abrir la app por primera vez, se muestra un modal de bienvenida solicitando el nombre del docente.
- El nombre se guarda en `db.userName` y personaliza el saludo del header (`¡Hola, [nombre]! 👋`).
- Si ya existe un nombre guardado, el modal no se muestra.

**Funciones:** `handleLogin()`, `updateGreeting()`

---

### 2. 📚 Cursos (`view-cursos`)

Muestra una lista de cursos en tarjetas con gradiente, cada una mostrando:
- Nombre del curso y horario
- Cantidad de estudiantes inscritos
- Barra de progreso del programa

**Acciones disponibles:**
- **Añadir curso:** Botón `+` abre un modal con formulario (nombre + horario)
- Los nuevos cursos se agregan con 2 estudiantes por defecto y progreso en 0%

**Funciones:** `renderCourses()`, `handleNewCourse()`

---

### 3. ✅ Asistencia (`view-asistencia`)

Permite registrar la asistencia de cada estudiante por curso, con filtros por curso en la parte superior.

- Cada estudiante muestra dos botones: ✓ (presente) y ✗ (ausente)
- El estado se guarda con la clave `today_[courseId]_[studentIdx]`
- Incluye botón de **exportar CSV** con el reporte de asistencia
- Botón "Finalizar Registro" muestra un toast de confirmación

**Funciones:** `renderAttendance()`, `renderAttendanceList()`, `markAttendance()`, `exportAttendanceCSV()`

---

### 4. 📝 Tareas (`view-tareas`)

Gestión de tareas pendientes con estado visual diferenciado:
- **Pendiente:** Borde azul, muestra fecha de vencimiento
- **Completada:** Borde verde, título tachado

**Acciones disponibles:**
- **Crear tarea:** Modal con título y fecha límite
- **Cambiar estado:** Botón para marcar como completada o reabrir
- Las tareas muestran un contador de entregas (`completions/total`)

**Funciones:** `renderTasks()`, `handleNewTask()`, `toggleTaskStatus()`

---

### 5. 📊 Notas / Rendimiento (`view-notas`)

Dashboard de estadísticas con:
- Tarjeta de **total de estudiantes** inscritos (suma de todos los cursos)
- Tarjeta de **tareas completadas** vs. total
- Lista de **promedio por curso** (actualmente muestra un valor fijo de 8.5)
- Botón para **exportar notas a CSV**

**Funciones:** `renderNotas()`, `exportGradesCSV()`

---

## Persistencia de Datos

Toda la información se almacena en `localStorage` bajo la clave `docente_app_db`.

### Estructura del objeto `db`

```javascript
{
  userName: "string | null",   // Nombre del docente
  loadCount: 0,                // Contador de sesiones
  courses: [{                  // Lista de cursos
    id: number,
    name: string,
    schedule: string,
    progress: number,          // Porcentaje 0-100
    color: string,             // Color hex del gradiente
    students: string[]         // Nombres de estudiantes
  }],
  tasks: [{                    // Lista de tareas
    id: number,
    title: string,
    due: string,               // Fecha en formato texto
    status: "pending" | "completed",
    completions: number,
    total: number
  }],
  attendance: {                // Registro de asistencia
    "today_[courseId]_[idx]": "presente" | "ausente"
  },
  settings: {
    darkMode: boolean
  }
}
```

### Funciones de sincronización

| Función             | Descripción                                    |
|---------------------|------------------------------------------------|
| `save()`            | Guarda `db` en `localStorage`                  |
| `exportDataJSON()`  | Descarga backup completo como archivo `.json`  |
| `importDataJSON()`  | Restaura datos desde un archivo `.json`        |

---

## Navegación

La app usa un **sistema SPA (Single Page Application)** basado en secciones HTML:

1. Cuatro secciones (`view-cursos`, `view-asistencia`, `view-tareas`, `view-notas`) con clase `view-section`
2. La función `navigate(viewId)` activa/desactiva secciones y actualiza la barra de navegación inferior
3. Animación de entrada `fadeIn` con CSS al cambiar de vista
4. El título del header se actualiza dinámicamente según la vista activa

---

## Características UI

| Feature         | Implementación                                              |
|-----------------|-------------------------------------------------------------|
| **Dark Mode**   | Toggle con clase `dark` en `<html>`, persistido en `db`     |
| **Modales**     | Animación slide-up con `translate-y-full`, backdrop blur     |
| **Toasts**      | Notificación emergente con auto-dismiss a los 3 segundos    |
| **PWA**         | `manifest.json` con íconos, colores y configuración offline |
| **Responsive**  | Diseño mobile-first con `max-w-md mx-auto`                  |

---

## PWA (Progressive Web App)

El archivo `manifest.json` configura la app para instalación en dispositivos:

- **Nombre:** Docente App - Pro
- **Display:** standalone (sin barra del navegador)
- **Orientación:** portrait
- **Color primario:** `#2b6cee`
- **Íconos:** 192x192 y 512x512 en `assets/`

---

## Cómo ejecutar localmente

```bash
# Desde la carpeta del proyecto
npx -y http-server . -p 5173 --cors
```

Luego abrir en el navegador: **http://localhost:5173**
