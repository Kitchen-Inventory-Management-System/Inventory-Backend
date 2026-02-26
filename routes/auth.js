const router = require("express").Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtGenerator = require("../utils/jwtGenerator");
require('dotenv').config(); // Make sure it can read .env file
const pool = require('../db');

// Registration Route: POST /auth/register
router.post('/register', async (req, res) => {
  try {
    // 1. Grab ONLY the email and password
    const { email, password } = req.body;

    // 2. Check if the user already exists
    const user = await pool.query("SELECT * FROM \"users\" WHERE email = $1", [email]);
    if (user.rows.length > 0) {
      return res.status(401).json("User already exists!");
    }

    // 3. "Salt" and Hash the password
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // 4. Insert the new user 
    const newUser = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *",
      [email, bcryptPassword]
    );

    const newUserId = newUser.rows[0].id; // Grab the new ID to use for defaults

    // 4.5 Setting default locations for the new user
    await pool.query(
      `INSERT INTO locations (name, "user_id") 
      VALUES 
        ('Fridge', $1),
        ('Freezer', $1),
        ('Pantry', $1),
        ('Spice Rack', $1)`,
      [newUserId]
    );

    // 5. Generating JWT token
    // We use the ID from the brand-new row we just created
    const token = jwtGenerator(newUser.rows[0].id);

    // 6. Send the token back to the frontend
    res.json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error during registration");
  }
});

// Login Route: POST /auth/login
router.post('/login', async (req, res) => {
  try {
    // 1. Grab the email and password from the frontend
    const { email, password } = req.body;

    // 2. Check if the user actually exists in the database
    const user = await pool.query("SELECT * FROM \"users\" WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      // Security best practice: Never tell a hacker WHICH part they got wrong.
      return res.status(401).json("User not found"); 
    }

    // 3. Check if the password matches the scrambled hash in the database
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json("Password or Email is incorrect");
    }

    // 4. If everything is good, create the JWT (the digital wristband)
    const token = jwtGenerator(user.rows[0].id);    // 5. Hand the wristband to the user!
    
    res.json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error during login");
  }
});

// 

module.exports = router;