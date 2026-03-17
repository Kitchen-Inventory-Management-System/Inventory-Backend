const router = require("express").Router(); // Express router to define routes for categories
const pool = require("../db"); // Database connection pool
const authorize = require("./middleware/authorize"); // Protects the route (the "bouncer")

// GET: Fetch all categories for the logged-in user
router.get("/", authorize, async (req, res) => {
    try {
        // Note: If categories are global for all users, we just select all.
            // If users create their own categories, you would add `WHERE user_id = $1` like locations.
        
        // This query grabs categories where user_id is NULL (globals) 
        // OR where user_id matches the logged-in user (customs)
        const categories = await pool.query(
        "SELECT * FROM categories WHERE user_id IS NULL OR user_id = $1",
        [req.user]
        );

        res.json(categories.rows); // Send the array of categories back to the frontend
    } catch (err) {

        console.error(err.message);
        res.status(500).json("Server Error fetching categories");
    }
});

// POST: Add a new custom category
router.post("/", authorize, async (req, res) => {
    try {

        const { name } = req.body; // Get the category name from the request body
        const newCategory = await pool.query(
            'INSERT INTO categories (name, "user_id") VALUES ($1, $2) RETURNING *',
            [name, req.user]
        );

        res.json(newCategory.rows[0]); // Send the newly created category back so the frontend can update instantly
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error creating category");
    }
});

module.exports = router;