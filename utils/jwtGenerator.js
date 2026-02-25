const jwt = require("jsonwebtoken");
require("dotenv").config();

function jwtGenerator(user_id) {
  // The Payload: This is the data we are hiding inside the token. 
  // We only store the user's ID, never their password!
  const payload = {
    user_id: user_id
  };

  // The Signature: We sign the token using your secret key from the .env file.
  // We also tell it to expire in 1 hour for security.
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1hr" });
}

module.exports = jwtGenerator;