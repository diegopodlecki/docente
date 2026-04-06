const express = require("express");
const {
  listStudents,
  getStudentById,
  createStudent,
  editStudent,
  removeStudent
} = require("../services/studentService");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ data: listStudents() });
});

router.get("/:id", (req, res) => {
  const student = getStudentById(Number(req.params.id));

  if (!student) {
    return res.status(404).json({ error: "Alumno no encontrado." });
  }

  return res.json({ data: student });
});

router.post("/", (req, res) => {
  const result = createStudent(req.body);

  if (result.errors) {
    return res.status(400).json({ error: result.errors.join(" ") });
  }

  return res.status(201).json({ data: result.student });
});

router.put("/:id", (req, res) => {
  const result = editStudent(Number(req.params.id), req.body);

  if (result.errors) {
    return res.status(400).json({ error: result.errors.join(" ") });
  }

  if (result.notFound) {
    return res.status(404).json({ error: "Alumno no encontrado." });
  }

  return res.json({ data: result.student });
});

router.delete("/:id", (req, res) => {
  const deleted = removeStudent(Number(req.params.id));

  if (!deleted) {
    return res.status(404).json({ error: "Alumno no encontrado." });
  }

  return res.status(204).send();
});

module.exports = router;
