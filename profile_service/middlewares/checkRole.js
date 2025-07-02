require('dotenv').config();
const jwt = require('jsonwebtoken');
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;

const checkRole = (allowRoles) => {
    return (req, res, next) => {
        try {
            const accessToken = jwt.verify(req.headers['auth-token'], SECRET_ACCESS_KEY);
            if(!allowRoles.includes(accessToken.role)) {
                return res.status(403).json({code: 403, message: "Forbidden"});
            }
            req.user = {
                id: accessToken.userId,
                email: accessToken.userEmail,
                role: accessToken.role
            }
            
            next();
        } catch (error) {
            return res.status(401).json({code: 401, message: "Invalid or expired token."})
        }
    }
}

module.exports = checkRole;