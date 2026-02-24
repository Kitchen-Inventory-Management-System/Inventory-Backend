const jwt = require("jsonwebtoken");
require("dotenv").config();

// next() is a special Express function that says "You pass the check, move on to the actual route!"
module.exports = async (req, res, next) => {
  try {
    // 1. Grab the token from the request header (we will name the header "token")
    const jwtToken = req.header("token");

    // 2. If they didn't bring a wristband at all, kick them out
    if (!jwtToken) {
      return res.status(403).json("Not Authorized");
    }

    // 3. Verify the wristband is real and hasn't expired, using your exact secret key
    const payload = jwt.verify(jwtToken, process.env.JWT_SECRET);

    // 4. Extract the user's ID from the token and attach it to the request.
    // This is magic: now every route can say "req.user" to know exactly who is logged in!
    req.user = payload.user_id;
    
    // 5. Let them in
    next();
    
  } catch (err) {
    console.error(err.message);
    return res.status(403).json("Not Authorized");
  }
};