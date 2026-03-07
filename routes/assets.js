const path = require("path");
<<<<<<< HEAD
const fs = require("fs");
=======
>>>>>>> ba407b455010e21d62781ca2e701cf7ad61a8cf1
const express = require("express");
const multer = require("multer");
const { db } = require("../config/db");

const router = express.Router();
const uploadsDir = path.join(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-").toLowerCase();
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({ storage });

function mapAsset(row) {
  return {
    _id: String(row.id),
    type: row.type,
    title: row.title,
    description: row.description || "",
    filePath: row.file_path || "",
    imagePath: row.image_path || "",
    externalUrl: row.external_url || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function parseId(id) {
  const parsed = Number.parseInt(id, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

<<<<<<< HEAD
async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function stripTimestampPrefix(fileName) {
  return fileName.replace(/^\d+-/, "");
}

=======
>>>>>>> ba407b455010e21d62781ca2e701cf7ad61a8cf1
router.get("/", async (req, res, next) => {
  try {
    const { type } = req.query;

    if (type && ["addon", "texture"].includes(type)) {
      const result = await db.execute({
        sql: `SELECT id, type, title, description, file_path, image_path, external_url, created_at, updated_at
              FROM assets
              WHERE type = ?
              ORDER BY datetime(created_at) DESC, id DESC`,
        args: [type]
      });
      return res.json(result.rows.map(mapAsset));
    }

    const result = await db.execute(
      `SELECT id, type, title, description, file_path, image_path, external_url, created_at, updated_at
       FROM assets
       ORDER BY datetime(created_at) DESC, id DESC`
    );

    return res.json(result.rows.map(mapAsset));
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "image", maxCount: 1 }
  ]),
  async (req, res, next) => {
  try {
    const { type, title, description } = req.body;

    if (!type || !title || !["addon", "texture"].includes(type)) {
      return res.status(400).json({ message: "type y title son obligatorios" });
    }

    const file = req.files?.file?.[0];
    const image = req.files?.image?.[0];

    const filePath = file ? `/uploads/${file.filename}` : "";
    const imagePath = image ? `/uploads/${image.filename}` : "";

    if (!filePath) {
      return res.status(400).json({
        message: "Debes subir un archivo desde la web"
      });
    }

    const insert = await db.execute({
      sql: `INSERT INTO assets (type, title, description, file_path, image_path, external_url, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`,
      args: [
        type,
        title.trim(),
        (description || "").trim(),
        filePath,
        imagePath,
        ""
      ]
    });

    const id = Number(insert.lastInsertRowid);
    const row = await db.execute({
      sql: `SELECT id, type, title, description, file_path, image_path, external_url, created_at, updated_at FROM assets WHERE id = ?`,
      args: [id]
    });

    return res.status(201).json(mapAsset(row.rows[0]));
  } catch (error) {
    return next(error);
  }
}
);

<<<<<<< HEAD
router.get("/:id/download", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "ID invalido" });
    }

    const result = await db.execute({
      sql: `SELECT id, title, file_path, external_url FROM assets WHERE id = ?`,
      args: [id]
    });
    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ message: "Asset no encontrado" });
    }

    const filePath = row.file_path || "";
    if (filePath && filePath.startsWith("/uploads/")) {
      const fileName = path.basename(filePath);
      const absolutePath = path.join(uploadsDir, fileName);

      if (await fileExists(absolutePath)) {
        return res.download(absolutePath);
      }

      const baseName = stripTimestampPrefix(fileName);
      const files = await fs.promises.readdir(uploadsDir);
      const fallbackMatch = files.find((name) => stripTimestampPrefix(name) === baseName);

      if (fallbackMatch) {
        const fixedPath = `/uploads/${fallbackMatch}`;
        await db.execute({
          sql: `UPDATE assets SET file_path = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`,
          args: [fixedPath, id]
        });
        return res.download(path.join(uploadsDir, fallbackMatch));
      }

      return res.status(404).json({ message: "El archivo no existe en el servidor" });
    }

    if (row.external_url) {
      return res.redirect(row.external_url);
    }

    return res.status(404).json({ message: "El recurso no tiene archivo para descargar" });
  } catch (error) {
    return next(error);
  }
});

=======
>>>>>>> ba407b455010e21d62781ca2e701cf7ad61a8cf1
router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "ID invalido" });
    }

    const remove = await db.execute({
      sql: `DELETE FROM assets WHERE id = ?`,
      args: [id]
    });

    if (remove.rowsAffected === 0) {
      return res.status(404).json({ message: "Asset no encontrado" });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

<<<<<<< HEAD
module.exports = router;
=======
module.exports = router;
>>>>>>> ba407b455010e21d62781ca2e701cf7ad61a8cf1
