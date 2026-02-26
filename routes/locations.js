const router = require("express").Router();
const pool = require("../db");
const authorize = require("./middleware/authorize"); // Protects the route (the "bouncer")

// GET: Fetch all locations for the logged-in user
router.get("/", authorize, async (req, res) => {
  try {

    // req.user is securely provided by the authorize middleware
    // Note: Double-check if your database column is "user id" or "user_id"
    const locations = await pool.query(
      'SELECT * FROM locations WHERE "user_id" = $1', 
      [req.user]
    );
    
    // Send the array of locations back to the frontend
    res.json(locations.rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error fetching locations");
  }
});

// POST: Add a new custom location
router.post("/", authorize, async (req, res) => {
  try {
    const { name } = req.body;

    const newLocation = await pool.query(
      'INSERT INTO locations (name, "user_id") VALUES ($1, $2) RETURNING *',
      [name, req.user]
    );

    // Send the newly created location back so the frontend can update instantly
    res.json(newLocation.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error creating location");
  }
});

module.exports = router;