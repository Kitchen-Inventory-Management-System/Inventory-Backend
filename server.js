const express = require('express');
const cors = require('cors');
const pool = require('./db'); // This imports your Supabase connection!
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ROUTES
app.use('/auth', require('./routes/auth')); // Import auth routes
app.use('/dashboard', require('./routes/middleware/dashboard'));
app.use('/locations', require('./routes/locations'));
app.use('/items', require('./routes/items'));

// --- TEST ROUTE ---
// When a browser asks for /test, this block of code runs.
app.get('/test', async (req, res) => {
  try {

    // This asks Supabase database for the current time
    const dbTest = await pool.query('SELECT NOW()');
    
    // This sends the answer back to your web browser
    res.json({
      message: "Hello from the Kitchen Inventory Server!",
      databaseTime: dbTest.rows[0].now
    });
  } catch (err) {
    console.error("Database connection error:", err.message);
    res.status(500).send("Database connection failed");
  }
});
// -----------------------

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});