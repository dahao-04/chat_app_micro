const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const { AUTHEN_SERVICE_URL } = require('../config/Services');
const verifyAccessToken = async (req, res, next) => {
    const token = req.header("auth-token");
    const result = await axios.post(
        `${AUTHEN_SERVICE_URL}/auth/introspect`,
        {accessToken: token}
    )
    if(!result.data.data.valid) 
        return res.status(500).json({
            code: 500,
            message: "Unauthenticated"
        })
    next();
}

module.exports = verifyAccessToken