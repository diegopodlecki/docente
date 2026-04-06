const db = require("../db");

const selectAll = db.prepare(`
  SELECT id, nombre, apellido, email, curso, observaciones, created_at, updated_at
  FROM students
  ORDER BY apellido ASC, nombre ASC, id DESC
`);

const selectById = db.prepare(`
  SELECT id, nombre, apellido, email, curso, observaciones, created_at, updated_at
  FROM students
  WHERE id = ?
`);

const insertStudent = db.prepare(`
  INSERT INTO students (nombre, apellido, email, curso, observaciones)
  VALUES (@nombre, @apellido, @email, @curso, @observaciones)
`);

const updateStudent = db.prepare(`
  UPDATE students
  SET nombre = @nombre,
      apellido = @apellido,
      email = @email,
      curso = @curso,
      observaciones = @observaciones
  WHERE id = @id
`);

const deleteStudent = db.prepare(`
  DELETE FROM students
  WHERE id = ?
`);

function normalizeStudentPayload(payload = {}) {
  return {
    nombre: String(payload.nombre || "").trim(),
    apellido: String(payload.apellido || "").trim(),
    email: String(payload.email || "").trim(),
    curso: String(payload.curso || "").trim(),
    observaciones: String(payload.observaciones || "").trim()
  };
}

function validateStudentPayload(payload) {
  const errors = [];

  if (!payload.nombre) {
    errors.push("El nombre es obligatorio.");
  }

  if (!payload.apellido) {
    errors.push("El apellido es obligatorio.");
  }

  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.push("El email no tiene un formato valido.");
  }

  return errors;
}

function listStudents() {
  return selectAll.all();
}

function getStudentById(id) {
  return selectById.get(id);
}

function createStudent(payload) {
  const normalized = normalizeStudentPayload(payload);
  const errors = validateStudentPayload(normalized);

  if (errors.length > 0) {
    return { errors };
  }

  const result = insertStudent.run(normalized);
  return { student: getStudentById(result.lastInsertRowid) };
}

function editStudent(id, payload) {
  const normalized = normalizeStudentPayload(payload);
  const errors = validateStudentPayload(normalized);

  if (errors.length > 0) {
    return { errors };
  }

  const result = updateStudent.run({ id, ...normalized });

  if (result.changes === 0) {
    return { notFound: true };
  }

  return { student: getStudentById(id) };
}

function removeStudent(id) {
  const result = deleteStudent.run(id);
  return result.changes > 0;
}

module.exports = {
  listStudents,
  getStudentById,
  createStudent,
  editStudent,
  removeStudent
};
