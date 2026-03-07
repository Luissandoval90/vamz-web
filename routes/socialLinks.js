const express = require("express");
const { db } = require("../config/db");

const router = express.Router();

function mapSocialLink(row) {
  return {
    _id: String(row.id),
    platform: row.platform,
    url: row.url,
    icon: row.icon || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function parseId(id) {
  const parsed = Number.parseInt(id, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

router.get("/", async (req, res, next) => {
  try {
    const result = await db.execute(
      `SELECT id, platform, url, icon, created_at, updated_at
       FROM social_links
       ORDER BY datetime(created_at) DESC, id DESC`
    );

    res.json(result.rows.map(mapSocialLink));
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { platform, url, icon } = req.body;

    if (!platform || !url) {
      return res.status(400).json({ message: "platform y url son obligatorios" });
    }

    const insert = await db.execute({
      sql: `INSERT INTO social_links (platform, url, icon, created_at, updated_at)
            VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`,
      args: [platform.trim(), url.trim(), (icon || "").trim()]
    });

    const id = Number(insert.lastInsertRowid);
    const row = await db.execute({
      sql: `SELECT id, platform, url, icon, created_at, updated_at FROM social_links WHERE id = ?`,
      args: [id]
    });

    return res.status(201).json(mapSocialLink(row.rows[0]));
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const { platform, url, icon } = req.body;

    if (!id) {
      return res.status(400).json({ message: "ID invalido" });
    }

    if (!platform || !url) {
      return res.status(400).json({ message: "platform y url son obligatorios" });
    }

    const update = await db.execute({
      sql: `UPDATE social_links
            SET platform = ?, url = ?, icon = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
            WHERE id = ?`,
      args: [platform.trim(), url.trim(), (icon || "").trim(), id]
    });

    if (update.rowsAffected === 0) {
      return res.status(404).json({ message: "Red social no encontrada" });
    }

    const row = await db.execute({
      sql: `SELECT id, platform, url, icon, created_at, updated_at FROM social_links WHERE id = ?`,
      args: [id]
    });

    return res.json(mapSocialLink(row.rows[0]));
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "ID invalido" });
    }

    const remove = await db.execute({
      sql: `DELETE FROM social_links WHERE id = ?`,
      args: [id]
    });

    if (remove.rowsAffected === 0) {
      return res.status(404).json({ message: "Red social no encontrada" });
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
