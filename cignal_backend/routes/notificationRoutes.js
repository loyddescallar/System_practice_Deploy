const express = require("express");
const router = express.Router();

const pool = require("../config/db");
const { authRequired } = require("../middleware/auth");

router.get("/", authRequired, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM notifications
       WHERE user_id = $1
          OR account_number = $2
       ORDER BY created_at DESC`,
      [
        req.user.id,
        req.user.accountNumber || null,
      ]
    );

    return res.json({
      notifications: result.rows,
    });
  } catch (err) {
    console.error("GET NOTIFICATIONS ERROR:", err);

    return res.status(500).json({
      error: "Server error",
    });
  }
});

router.patch("/read-all", authRequired, async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE user_id = $1
          OR account_number = $2`,
      [
        req.user.id,
        req.user.accountNumber || null,
      ]
    );

    return res.json({
      message: "Notifications marked as read",
    });
  } catch (err) {
    console.error("READ NOTIFICATIONS ERROR:", err);

    return res.status(500).json({
      error: "Server error",
    });
  }
});

module.exports = router;