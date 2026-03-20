const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'homemade_delights_secret_2024');

            if (decoded.isAdmin) {
                req.isAdmin = true;
                req.adminId = decoded.id;
                return next();
            }

            req.customer = await Customer.findById(decoded.id).select('-password');
            if (!req.customer) {
                res.status(401);
                throw new Error('Not authorized - customer not found');
            }

            next();
        } catch (error) {
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.isAdmin || (req.customer && req.customer.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Admin access only' });
    }
};

// Optional auth - extracts user if token present, but does NOT reject unauthenticated requests
const optionalProtect = async (req, res, next) => {
    let token;
    req.customer = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'homemade_delights_secret_2024');

            if (!decoded.isAdmin) {
                req.customer = await Customer.findById(decoded.id).select('-password');
            }
        } catch (error) {
            // Token invalid/expired - continue as guest
            req.customer = null;
        }
    }

    next();
};

module.exports = { protect, adminOnly, optionalProtect };
