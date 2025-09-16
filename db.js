// db.js (versi MySQL dengan mysql2/promise)
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'todoapp',
  connectionLimit: 10,
  namedPlaceholders: true
});

// helper ambil satu row
async function getOne(query, params = {}) {
  const [rows] = await pool.execute(query, params);
  return rows[0] || null;
}
// helper ambil banyak row
async function getAll(query, params = {}) {
  const [rows] = await pool.execute(query, params);
  return rows;
}
// helper exec (insert/update/delete)
async function exec(query, params = {}) {
  const [res] = await pool.execute(query, params);
  return res;
}

async function listTodos() {
  return getAll(`SELECT id, title, done, created_at, updated_at
                 FROM todos ORDER BY id DESC`);
}

async function getTodo(id) {
  return getOne(`SELECT id, title, done, created_at, updated_at
                 FROM todos WHERE id = :id`, { id });
}

async function insertTodo(title) {
  const res = await exec(`INSERT INTO todos (title) VALUES (:title)`, { title });
  return res.insertId;
}

async function deleteTodo(id) {
  await exec(`DELETE FROM todos WHERE id = :id`, { id });
}

async function updateTitle(id, title) {
  await exec(`UPDATE todos SET title = :title WHERE id = :id`, { id, title });
}

async function setDone(id, done) {
  await exec(`UPDATE todos SET done = :done WHERE id = :id`, { id, done: done ? 1 : 0 });
}

module.exports = { listTodos, getTodo, insertTodo, deleteTodo, updateTitle, setDone };
