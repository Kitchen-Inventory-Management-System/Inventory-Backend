const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');

// Registration Route: POST /auth/register
router.post('/register', async (req, res) => {
  try {
    // 1. Grab ONLY the email and password
    const { email, password } = req.body;

    // 2. Check if the user already exists
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length > 0) {
      return res.status(401).json("User already exists!");
    }

    // 3. "Salt" and Hash the password
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // 4. Insert the new user (No username field here!)
    const newUser = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, bcryptPassword]
    );

    res.json({ message: "User registered successfully!", user: newUser.rows[0] });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error during registration");
  }
});

module.exports = router;