const path = require("path");
const express = require("express");

require("./db");

const studentsRouter = require("./routes/students");

const app = express();
const PORT = process.env.PORT || 3000;
const webDir = path.join(__dirname, "..", "web");

app.use(express.json());
app.use(express.static(webDir));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/students", studentsRouter);

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(webDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Docente CRUD disponible en http://localhost:${PORT}`);
});
