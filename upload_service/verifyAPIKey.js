const dotenv = require('dotenv');

dotenv.config();

const API_KEY = process.env.API_KEY;

const verifyApiKey = async (req, res, next) => {
    const incomingKey = req.headers['x-internal-api-key'];
    if(!incomingKey) return res.status(401).json({code: 401, message: "Missing API key"});

    if(incomingKey!=API_KEY) return res.status(403).json({code: 403, message: "Invalid API key"});

    next();
}

module.exports = verifyApiKey;