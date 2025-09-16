// index.js (versi async utk MySQL)
const express = require("express");
const path = require("path");
const db = require("./db");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// List semua todo
app.get("/api/todos", async (req, res, next) => {
  try {
    const rows = await db.listTodos();
    res.json(rows);
  } catch (e) { next(e); }
});

// Tambah todo
app.post("/api/todos", async (req, res, next) => {
  try {
    const title = (req.body?.title || "").trim();
    if (!title) return res.status(400).json({ error: "title wajib diisi" });
    if (title.length > 200) return res.status(422).json({ error: "maks 200 karakter" });

    const id = await db.insertTodo(title);       // <— dapatkan insertId
    const row = await db.getTodo(id);            // <— ambil kembali row
    res.status(201).json(row);
  } catch (e) { next(e); }
});

// Edit judul
app.patch("/api/todos/:id/title", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const title = (req.body?.title || "").trim();
    if (!title) return res.status(400).json({ error: "title wajib diisi" });

    const found = await db.getTodo(id);
    if (!found) return res.status(404).json({ error: "tidak ditemukan" });

    await db.updateTitle(id, title);
    const row = await db.getTodo(id);
    res.json(row);
  } catch (e) { next(e); }
});

// Toggle status done
app.patch("/api/todos/:id/done", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { done } = req.body || {};
    if (typeof done !== "boolean") return res.status(400).json({ error: "done harus boolean" });

    const found = await db.getTodo(id);
    if (!found) return res.status(404).json({ error: "tidak ditemukan" });

    await db.setDone(id, done);
    const row = await db.getTodo(id);
    res.json(row);
  } catch (e) { next(e); }
});

// Hapus todo
app.delete("/api/todos/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const found = await db.getTodo(id);
    if (!found) return res.status(404).json({ error: "tidak ditemukan" });

    await db.deleteTodo(id);
    res.status(204).end();
  } catch (e) { next(e); }
});

// error handler biar stacktrace gak barbar ke user
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "internal error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`jalan di http://localhost:${PORT}`));
