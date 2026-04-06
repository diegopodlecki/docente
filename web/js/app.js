import { createStudent, deleteStudent, getStudents, updateStudent } from "./api.js";

const state = {
  students: [],
  filter: "",
  editingId: null
};

const elements = {
  form: document.getElementById("student-form"),
  formTitle: document.getElementById("form-title"),
  submitButton: document.getElementById("submit-button"),
  cancelButton: document.getElementById("cancel-button"),
  refreshButton: document.getElementById("refresh-button"),
  feedback: document.getElementById("feedback"),
  searchInput: document.getElementById("search-input"),
  tableBody: document.getElementById("students-table-body"),
  metricTotal: document.getElementById("metric-total"),
  metricCourses: document.getElementById("metric-courses"),
  metricSync: document.getElementById("metric-sync"),
  fields: {
    id: document.getElementById("student-id"),
    nombre: document.getElementById("nombre"),
    apellido: document.getElementById("apellido"),
    email: document.getElementById("email"),
    curso: document.getElementById("curso"),
    observaciones: document.getElementById("observaciones")
  }
};

function formatNow() {
  return new Date().toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

function getFormPayload() {
  return {
    nombre: elements.fields.nombre.value.trim(),
    apellido: elements.fields.apellido.value.trim(),
    email: elements.fields.email.value.trim(),
    curso: elements.fields.curso.value.trim(),
    observaciones: elements.fields.observaciones.value.trim()
  };
}

function resetForm() {
  state.editingId = null;
  elements.form.reset();
  elements.fields.id.value = "";
  elements.formTitle.textContent = "Nuevo alumno";
  elements.submitButton.textContent = "Guardar alumno";
}

function showFeedback(message, type = "success") {
  elements.feedback.textContent = message;
  elements.feedback.className = `feedback ${type}`;
}

function hideFeedback() {
  elements.feedback.textContent = "";
  elements.feedback.className = "feedback hidden";
}

function renderMetrics() {
  const cursos = new Set(
    state.students
      .map((student) => student.curso)
      .filter(Boolean)
  );

  elements.metricTotal.textContent = String(state.students.length);
  elements.metricCourses.textContent = String(cursos.size);
  elements.metricSync.textContent = formatNow();
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value || "";
  return div.innerHTML;
}

function getFilteredStudents() {
  const query = state.filter.trim().toLowerCase();

  if (!query) {
    return state.students;
  }

  return state.students.filter((student) => {
    const haystack = [
      student.nombre,
      student.apellido,
      student.email,
      student.curso,
      student.observaciones
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

function renderTable() {
  const rows = getFilteredStudents();

  if (rows.length === 0) {
    elements.tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">No hay alumnos que coincidan con la busqueda.</td>
      </tr>
    `;
    return;
  }

  elements.tableBody.innerHTML = rows
    .map((student) => `
      <tr>
        <td>
          <strong>${escapeHtml(`${student.apellido}, ${student.nombre}`)}</strong>
          <span class="row-secondary">ID ${student.id}</span>
        </td>
        <td>
          ${student.curso ? `<span class="tag">${escapeHtml(student.curso)}</span>` : '<span class="row-secondary">Sin curso</span>'}
        </td>
        <td>
          <strong>${escapeHtml(student.email || "Sin email")}</strong>
          <span class="row-secondary">Actualizado ${escapeHtml(student.updated_at)}</span>
        </td>
        <td>
          <span class="row-secondary">${escapeHtml(student.observaciones || "Sin observaciones")}</span>
        </td>
        <td>
          <div class="actions">
            <button class="action-button" data-action="edit" data-id="${student.id}" type="button">Editar</button>
            <button class="action-button danger" data-action="delete" data-id="${student.id}" type="button">Eliminar</button>
          </div>
        </td>
      </tr>
    `)
    .join("");
}

async function loadStudents() {
  const students = await getStudents();
  state.students = students;
  renderMetrics();
  renderTable();
}

function startEditing(studentId) {
  const student = state.students.find((item) => item.id === studentId);

  if (!student) {
    return;
  }

  state.editingId = studentId;
  elements.fields.id.value = student.id;
  elements.fields.nombre.value = student.nombre;
  elements.fields.apellido.value = student.apellido;
  elements.fields.email.value = student.email;
  elements.fields.curso.value = student.curso;
  elements.fields.observaciones.value = student.observaciones;
  elements.formTitle.textContent = "Editar alumno";
  elements.submitButton.textContent = "Guardar cambios";
  hideFeedback();
}

async function handleSubmit(event) {
  event.preventDefault();
  hideFeedback();

  try {
    const payload = getFormPayload();

    if (state.editingId) {
      await updateStudent(state.editingId, payload);
      showFeedback("Alumno actualizado correctamente.");
    } else {
      await createStudent(payload);
      showFeedback("Alumno creado correctamente.");
    }

    resetForm();
    await loadStudents();
  } catch (error) {
    showFeedback(error.message, "error");
  }
}

async function handleTableClick(event) {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  const action = target.dataset.action;
  const id = Number(target.dataset.id);

  if (!action || !id) {
    return;
  }

  if (action === "edit") {
    startEditing(id);
    return;
  }

  if (action === "delete") {
    const confirmed = window.confirm("Esta accion eliminara el alumno. Deseas continuar?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteStudent(id);
      showFeedback("Alumno eliminado correctamente.");

      if (state.editingId === id) {
        resetForm();
      }

      await loadStudents();
    } catch (error) {
      showFeedback(error.message, "error");
    }
  }
}

function bindEvents() {
  elements.form.addEventListener("submit", handleSubmit);
  elements.cancelButton.addEventListener("click", () => {
    resetForm();
    hideFeedback();
  });
  elements.refreshButton.addEventListener("click", async () => {
    hideFeedback();
    await loadStudents();
  });
  elements.searchInput.addEventListener("input", (event) => {
    state.filter = event.target.value;
    renderTable();
  });
  elements.tableBody.addEventListener("click", handleTableClick);
}

async function bootstrap() {
  bindEvents();

  try {
    await loadStudents();
    resetForm();
  } catch (error) {
    showFeedback(`No se pudo cargar la aplicacion: ${error.message}`, "error");
  }
}

bootstrap();
