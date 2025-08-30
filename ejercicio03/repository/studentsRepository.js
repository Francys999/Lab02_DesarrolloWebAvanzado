// repository/studentsRepository.js
let students = [
  {
    id: 1,
    name: "Juan Pérez",
    grade: 20,
    age: 23,
    email: "juan.perez@ejemplo.com",
    phone: "+51 987654321",
    enrollmentNumber: "2025001",
    course: "Diseño y Desarrollo de Software C24",
    year: 3,
    subjects: ["Algoritmos", "Bases de Datos", "Redes"],
    gpa: 3.8,
    status: "Activo",
    admissionDate: "2022-03-01"
  },
  {
    id: 2,
    name: "Ana Díaz",
    grade: 16,
    age: 20,
    email: "ana.diaz@ejemplo.com",
    phone: "+51 912345678",
    enrollmentNumber: "2025002",
    course: "Diseño y Desarrollo de Software C24",
    year: 2,
    subjects: ["Algoritmos", "Frontend"],
    gpa: 3.4,
    status: "Inactivo",
    admissionDate: "2023-03-01"
  },
  {
    id: 3,
    name: "Luis Ramírez",
    grade: 14,
    age: 21,
    email: "luis.ramirez@ejemplo.com",
    phone: "+51 976543210",
    enrollmentNumber: "2025003",
    course: "Diseño y Desarrollo de Software C24",
    year: 1,
    subjects: ["Intro a la Programación"],
    gpa: 2.9,
    status: "Suspendido",
    admissionDate: "2024-03-01"
  }
];

function nextId() {
  return students.length ? Math.max(...students.map(s => s.id)) + 1 : 1;
}

function getAll() {
  return students;
}

function getById(id) {
  return students.find(s => s.id === id);
}

function create(student) {
  const s = { ...student, id: nextId() };
  students.push(s);
  return s;
}

function update(id, updateData) {
  const idx = students.findIndex(s => s.id === id);
  if (idx === -1) return null;
  students[idx] = { ...students[idx], ...updateData, id }; // mantenemos id
  return students[idx];
}

function remove(id) {
  const idx = students.findIndex(s => s.id === id);
  if (idx === -1) return null;
  return students.splice(idx, 1)[0];
}

module.exports = { getAll, getById, create, update, remove };
