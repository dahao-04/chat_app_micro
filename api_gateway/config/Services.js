const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    AUTHEN_SERVICE_URL: process.env.AUTHEN_SERVICE_URL,
    UPLOAD_SERVICE_URL: process.env.UPLOAD_SERVICE_URL,
    PROFILE_SERVICE_URL: process.env.PROFILE_SERVICE_URL,
    API_SERVICE_URL: process.env.API_SERVICE_URL,
    API_KEY: process.env.API_KEY
}