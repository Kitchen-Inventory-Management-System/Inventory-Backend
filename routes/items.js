const router = require("express").Router();
const pool = require("../db");
const authorize = require("./middleware/authorize"); // Bring in the bouncer!

// GET: Fetch all items for the logged-in user
router.get("/", authorize, async (req, res) => {
    try {
        // join items with locations to also get the location names in one query (if needed)
        // fetch all items that belong to the logged-in user, along with their location names
        const items = await pool.query(
          `SELECT 
              items.*,
              locations.name AS location_name,
              categories.name AS category_name
          FROM items
          JOIN locations ON items.location_id = locations.id
          LEFT JOIN categories ON items.category_id = categories.id
          WHERE items.user_id = $1`,
          [req.user]
        );
        // Send the array of items back to the frontend
        res.json(items.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error fetching items");
    }
});

// POST: Add a new item to a specific location
router.post("/", authorize, async (req, res) => {
  try {
    // 1. Grab data from frontend (Removed exact_loc, as it's not in your DB)
    const { name, exp_date, quantity, location_id, category_id } = req.body;

    // 2. The Non-Food Logic - If exp_date is an empty string, we want to store it as NULL in the database
    const finalExpDate = exp_date === "" ? null : exp_date;

    // 3. Insert into the database (Added user_id to match your schema!)
    const newItem = await pool.query(
      `INSERT INTO items (name, exp_date, quantity, location_id, category_id, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, finalExpDate, quantity, location_id, category_id, req.user]
    );

    res.json(newItem.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error creating item");
  }
});

router.delete("/:id", authorize, async (req, res) => {
  try {
    const { id } = req.params;

    // First, we want to make sure the item belongs to the logged-in user
    const item = await pool.query(
      "SELECT * FROM items WHERE id = $1 AND user_id = $2",
      [id, req.user]
    );
    if (item.rows.length === 0) {
      return res.status(404).json("Item not found or you don't have permission to delete it");
    }

    // If we get here, it means the item exists and belongs to the user, so we can delete it
    await pool.query("DELETE FROM items WHERE id = $1", [id]);
    res.json("Item deleted successfully");
    
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error deleting item");
  }
});

module.exports = router;

