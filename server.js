const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "todos.json");

// middleware
app.use(express.json());           // parse application/json
app.use(cors());                   // allow cross-origin (safe to keep on)
app.use(express.static(__dirname)) // serve index.html and assets from this folder

// helpers
function readTodos() {
  try {
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");
    const txt = fs.readFileSync(DATA_FILE, "utf8") || "[]";
    return JSON.parse(txt);
  } catch (err) {
    console.error("⚠️  Bad JSON in todos.json. Resetting to []", err.message);
    fs.writeFileSync(DATA_FILE, "[]");
    return [];
  }
}
function saveTodos(todos) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
}

// API
app.get("/api/todos", (req, res) => {
  const todos = readTodos();
  console.log("GET /api/todos ->", todos.length, "items");
  res.json(todos);
});

app.post("/api/todos", (req, res) => {
  const { task } = req.body || {};
  if (!task || !task.trim()) return res.status(400).json({ error: "Task is required" });

  const todos = readTodos();
  const newTodo = { id: Date.now(), task: String(task).trim() };
  todos.push(newTodo);
  saveTodos(todos);

  console.log("POST /api/todos -> added:", newTodo);
  res.json(newTodo);
});

app.delete("/api/todos/:id", (req, res) => {
  const id = req.params.id;
  let todos = readTodos();
  const before = todos.length;
  todos = todos.filter(t => String(t.id) !== String(id));
  saveTodos(todos);

  console.log(`DELETE /api/todos/${id} -> removed ${before - todos.length} item(s)`);
  res.json({ success: true });
});

// root page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// start
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
