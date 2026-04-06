# Docente CRUD

Base local para gestionar alumnos con una arquitectura simple y mantenible.

## Stack actual

- Backend: Node.js + Express
- Base de datos: SQLite con `better-sqlite3`
- Frontend: HTML, CSS y JavaScript modular servido por el mismo backend

## Estructura oficial

```txt
repo/
├── server/
│   ├── db.js
│   ├── index.js
│   ├── routes/
│   │   └── students.js
│   └── services/
│       └── studentService.js
├── web/
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── api.js
│       └── app.js
└── data/
    └── docente.sqlite
```

## Como levantar el proyecto

```bash
npm install
npm run dev
```

Luego abrir:

```txt
http://localhost:3000
```

## Endpoints disponibles

- `GET /api/health`
- `GET /api/students`
- `GET /api/students/:id`
- `POST /api/students`
- `PUT /api/students/:id`
- `DELETE /api/students/:id`

## Modelo de datos

Tabla `students`:

- `id`
- `nombre`
- `apellido`
- `email`
- `curso`
- `observaciones`
- `created_at`
- `updated_at`

## Nota sobre el material legacy

El repositorio conserva archivos previos relacionados con Firebase, Google Classroom y prototipos antiguos. La base activa y recomendada para desarrollo local ahora es la estructura `server/ + web/`.
