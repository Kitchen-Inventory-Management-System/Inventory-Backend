const express = require("express");
const router = express.Router();
const pool = require("../../db");
const authorize = require("../middleware/authorize"); // Bring in the bouncer!

// Notice we insert the "authorize" middleware right in the middle of the route
router.get("/", authorize, async (req, res) => {
  try {
    // Because the bouncer added "req.user", we can use it to look up the exact user in the database
    const user = await pool.query("SELECT email FROM users WHERE id = $1", [req.user]);
    
    // Send back a personalized welcome message!
    res.json(`Welcome to your VIP dashboard, ${user.rows[0].email}!`);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;