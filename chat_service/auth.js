const jwt = require('jsonwebtoken');
require('dotenv').config();

const authToken = (token) => {
    try {
        const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
        return jwt.verify(token, SECRET_ACCESS_KEY);
    } catch (error) {
        return null;
    }
}

module.exports = authToken;