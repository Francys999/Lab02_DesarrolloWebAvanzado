const http = require("http");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

const PORT = 3000;

// Registrar un helper para comparar notas
handlebars.registerHelper("gt", function (a, b) {
  return a > b;
});

function renderView(res, viewName, data) {
  const filePath = path.join(__dirname, "views", viewName);
  fs.readFile(filePath, "utf8", (err, templateData) => {
    if (err) {
      res.statusCode = 500;
      res.end("Error interno del servidor");
      return;
    }
    const template = handlebars.compile(templateData);
    const html = template(data);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(html);
  });
}

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    renderView(res, "home.hbs", {
      title: "Servidor con Handlebars 🚀",
      welcomeMessage: "Bienvenido al laboratorio de Node.js",
      day: new Date().toLocaleDateString("es-PE"),
      students: ["Ana", "Luis", "Pedro", "María"],
    });
  } else if (req.url === "/about") {
    renderView(res, "about.hbs", {
      course: "Desarrollo Web con Node.js",
      teacher: "Prof. Juan Pérez",
      date: new Date().toLocaleDateString("es-PE"),
    });
  } else if (req.url === "/students") {
    renderView(res, "students.hbs", {
      students: [
        { name: "Ana", grade: 18 },
        { name: "Luis", grade: 12 },
        { name: "Pedro", grade: 16 },
        { name: "María", grade: 14 },
      ],
    });
  } else {
    res.statusCode = 404;
    res.end("<h1>404 - Página no encontrada</h1>");
  }
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
