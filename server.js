const path = require("path");
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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(baseDir, "uploads")));
app.use(express.static(path.join(baseDir, "public")));

app.use("/api/social-links", socialLinksRouter);
app.use("/api/assets", assetsRouter);

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Servidor funcionando" });
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(baseDir, "public", "admin.html"));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Error interno del servidor" });
});

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Servidor iniciado en http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("No se pudo conectar a Turso:", err.message);
    process.exit(1);
  });
