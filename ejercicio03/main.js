// main.js
const http = require("http");
const { URL } = require("url");
const repo = require("./repository/studentsRepository");

const PORT = 4000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?\d[\d\s-]{7,}$/; // simple y flexible

function readJson(req, res, cb) {
  let body = "";
  req.on("data", chunk => (body += chunk));
  req.on("end", () => {
    if (!body || body.trim() === "") {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: "Body vacío. Envía JSON" }));
    }
    try {
      const data = JSON.parse(body);
      cb(data);
    } catch {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: "JSON inválido" }));
    }
  });
}

function validateCreate(s) {
  const errors = [];
  if (!s || typeof s !== "object") errors.push("payload inválido");
  if (!s?.name || typeof s.name !== "string" || !s.name.trim())
    errors.push("name requerido (string)");
  if (!s?.email || !EMAIL_RE.test(s.email))
    errors.push("email requerido/ inválido");
  if (!s?.course || typeof s.course !== "string" || !s.course.trim())
    errors.push("course requerido (string)");
  if (!s?.phone || !PHONE_RE.test(s.phone))
    errors.push("phone requerido/ inválido");

  return errors;
}

function validateUpdate(s) {
  // Para PUT exigimos también los 4 campos requeridos si vienen a reemplazar completo
  // (si quieres que PUT sea parcial, cambia a mismas reglas de PATCH)
  return validateCreate(s);
}

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const fullUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = fullUrl.pathname;
  if (pathname !== "/" && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
  const method = req.method;

  // GET /students
  if (pathname === "/students" && method === "GET") {
    res.statusCode = 200;
    return res.end(JSON.stringify(repo.getAll()));
  }

  // POST /students (crear con validación)
  if (pathname === "/students" && method === "POST") {
    return readJson(req, res, (data) => {
      const errors = validateCreate(data);
      if (errors.length) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: "Validación", details: errors }));
      }
      const created = repo.create(data);
      res.statusCode = 201;
      return res.end(JSON.stringify(created));
    });
  }

  // Rutas con ID: /students/:id  (GET, PUT, DELETE)
  if (pathname.startsWith("/students/")) {
    const parts = pathname.split("/");
    const id = parseInt(parts[2], 10);
    if (Number.isNaN(id)) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: "ID inválido" }));
    }

    if (method === "GET") {
      const s = repo.getById(id);
      if (!s) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: "Estudiante no encontrado" }));
      }
      res.statusCode = 200;
      return res.end(JSON.stringify(s));
    }

    if (method === "PUT") {
      return readJson(req, res, (data) => {
        const errors = validateUpdate(data);
        if (errors.length) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: "Validación", details: errors }));
        }
        const updated = repo.update(id, data);
        if (!updated) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: "Estudiante no encontrado" }));
        }
        res.statusCode = 200;
        return res.end(JSON.stringify(updated));
      });
    }

    if (method === "DELETE") {
      const deleted = repo.remove(id);
      if (!deleted) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: "Estudiante no encontrado" }));
      }
      res.statusCode = 200;
      return res.end(JSON.stringify(deleted));
    }
  }

  // NUEVOS ENDPOINTS

  // POST /ListByStatus  { "status": "Activo" }
  if (pathname === "/ListByStatus" && method === "POST") {
    return readJson(req, res, (data) => {
      const status = (data.status || "").toString().trim();
      if (!status) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: "Falta 'status'" }));
      }
      const out = repo.getAll().filter(s => (s.status || "").toLowerCase() === status.toLowerCase());
      res.statusCode = 200;
      return res.end(JSON.stringify(out));
    });
  }

  // POST /ListByGrade  soporta:
  // { "eq": 15 }  ó  { "min": 14, "max": 18 }  (cualquiera)
  if (pathname === "/ListByGrade" && method === "POST") {
    return readJson(req, res, (data) => {
      const { eq, min, max } = data || {};
      let out = repo.getAll();

      if (typeof eq === "number") {
        out = out.filter(s => Number(s.grade) === eq);
      } else {
        let lo = typeof min === "number" ? min : Number.NEGATIVE_INFINITY;
        let hi = typeof max === "number" ? max : Number.POSITIVE_INFINITY;
        out = out.filter(s => Number(s.grade) >= lo && Number(s.grade) <= hi);
      }
      res.statusCode = 200;
      return res.end(JSON.stringify(out));
    });
  }

  // 404
  res.statusCode = 404;
  res.end(JSON.stringify({ error: "Ruta no encontrada" }));
});

server.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});
