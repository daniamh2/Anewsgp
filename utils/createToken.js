const jwt = require('jsonwebtoken');

const createToken = (payload) =>
  jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: 4000,
  });

module.exports = createToken;
  