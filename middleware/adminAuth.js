function adminAuth(req, res, next) {
  const expectedPassword = process.env.ADMIN_PANEL_PASSWORD;

  if (!expectedPassword) {
    return res.status(500).json({
      message: "Falta ADMIN_PANEL_PASSWORD en el servidor"
    });
  }

  const providedPassword = req.get("x-admin-password");

  if (!providedPassword || providedPassword !== expectedPassword) {
    return res.status(401).json({ message: "No autorizado" });
  }

  return next();
}

module.exports = adminAuth;
