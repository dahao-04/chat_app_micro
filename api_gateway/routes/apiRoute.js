const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const httpProxy = require('http-proxy');
const router = express.Router();

const proxy = httpProxy.createProxyServer();
const { API_SERVICE_URL, API_KEY } = require('../config/Services');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);
router.use('/', (req, res) => {
    req.headers['x-internal-api-key'] = API_KEY;
    req.url = req.url.replace(/^\/api/, '');
    
    proxy.web(req, res, {
        target: API_SERVICE_URL,
        changeOrigin: true,
    }, (err) => {
        res.status(502).json({code: 502, message: "API service is unvailable"})
    })
})

module.exports = router;
