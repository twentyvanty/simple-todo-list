const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const TODOS_FILE = path.join(__dirname, 'todos.json');

app.use(express.json());
app.use(express.static('public'));

// ---------- File Helpers ----------

function initTodosFile() {
  if (!fs.existsSync(TODOS_FILE)) {
    fs.writeFileSync(TODOS_FILE, JSON.stringify([]));
  }
}

function readTodos() {
  initTodosFile();
  const data = fs.readFileSync(TODOS_FILE, 'utf8');
  return JSON.parse(data);
}

function writeTodos(todos) {
  fs.writeFileSync(TODOS_FILE, JSON.stringify(todos, null, 2));
}

// ---------- Routes ----------

// GET all todos
app.get('/api/todos', (req, res) => {
  const todos = readTodos();
  res.status(200).json(todos);
});

// POST new todo
app.post('/api/todos', (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Todo text is required' });
  }

  const todos = readTodos();

  const newTodo = {
    id: Date.now() + Math.floor(Math.random() * 1000), // ป้องกัน id ซ้ำ
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };

  todos.push(newTodo);
  writeTodos(todos);

  res.status(201).json(newTodo);
});

// PUT toggle completion
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todos = readTodos();

  const todoIndex = todos.findIndex(t => t.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }


  todos[todoIndex].completed = !todos[todoIndex].completed;

  writeTodos(todos);

  res.status(200).json(todos[todoIndex]);
});

// DELETE todo
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todos = readTodos();

  const filteredTodos = todos.filter(t => t.id !== id);

  if (filteredTodos.length === todos.length) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  writeTodos(filteredTodos);

  res.status(200).json({ message: 'Todo deleted successfully' });
});

// PATCH update todo text
app.patch('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Todo text is required' });
  }

  const todos = readTodos();
  const todoIndex = todos.findIndex(t => t.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  todos[todoIndex].text = text.trim();
  writeTodos(todos);

  res.status(200).json(todos[todoIndex]);
});


// ---------- Start Server ----------

initTodosFile();

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
