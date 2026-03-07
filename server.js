const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const { connectDB } = require("./config/db");
const socialLinksRouter = require("./routes/socialLinks");
const assetsRouter = require("./routes/assets");

const app = express();
const port = process.env.PORT || 5000;
const baseDir = __dirname;
let dbConnected = false;

const publicDir = fs.existsSync(path.join(baseDir, "public"))
  ? path.join(baseDir, "public")
  : path.join(baseDir, "fullstack-social-hub", "public");

const uploadsDir = fs.existsSync(path.join(baseDir, "uploads"))
  ? path.join(baseDir, "uploads")
  : path.join(baseDir, "fullstack-social-hub", "uploads");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(uploadsDir));
app.use(express.static(publicDir));

app.use("/api/social-links", socialLinksRouter);
app.use("/api/assets", assetsRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(publicDir, "admin.html"));
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    message: "Servidor funcionando",
    dbConnected
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Error interno del servidor" });
});

connectDB()
  .then(() => {
    dbConnected = true;
    app.listen(port, () => {
      console.log(`Servidor iniciado en http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("No se pudo conectar a Turso:", err.message);
    console.warn("Iniciando en modo demo sin base de datos.");
    app.listen(port, () => {
      console.log(`Servidor iniciado en http://localhost:${port}`);
    });
  });
