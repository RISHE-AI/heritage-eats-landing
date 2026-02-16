const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'homemade_delights_secret_2024', {
        expiresIn: '30d'
    });
};

// @desc    Register a new customer
// @route   POST /api/customers/signup
const signup = async (req, res, next) => {
    try {
        const { name, phone, email, password } = req.body;

        if (!name || !phone || !password) {
            res.status(400);
            throw new Error('Please provide name, phone, and password');
        }

        // Check if phone already exists
        const existing = await Customer.findOne({ phone });
        if (existing) {
            res.status(400);
            throw new Error('Phone number already registered');
        }

        const customer = await Customer.create({
            name,
            phone,
            email: email || '',
            password
        });

        res.status(201).json({
            success: true,
            data: customer,
            token: generateToken(customer._id)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login customer
// @route   POST /api/customers/login
const login = async (req, res, next) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            res.status(400);
            throw new Error('Please provide phone and password');
        }

        const customer = await Customer.findOne({ phone }).select('+password');

        if (!customer) {
            res.status(401);
            throw new Error('Account not found. Please sign up first.');
        }

        const isMatch = await customer.matchPassword(password);
        if (!isMatch) {
            res.status(401);
            throw new Error('Invalid password');
        }

        res.status(200).json({
            success: true,
            data: customer,
            token: generateToken(customer._id)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged-in customer profile
// @route   GET /api/customers/profile
const getProfile = async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.customer._id);
        if (!customer) {
            res.status(404);
            throw new Error('Customer not found');
        }

        res.status(200).json({
            success: true,
            data: customer
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update customer profile
// @route   PUT /api/customers/profile
const updateProfile = async (req, res, next) => {
    try {
        const { name, email, address, phone } = req.body;
        const customer = await Customer.findById(req.customer._id);

        if (!customer) {
            res.status(404);
            throw new Error('Customer not found');
        }

        if (name) customer.name = name;
        if (email !== undefined) customer.email = email;
        if (address !== undefined) customer.address = address;
        if (phone) customer.phone = phone;

        await customer.save();

        res.status(200).json({
            success: true,
            data: customer
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all customers (admin)
// @route   GET /api/customers
const getCustomers = async (req, res, next) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: customers.length,
            data: customers
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a customer (legacy/admin)
// @route   POST /api/customers
const createCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.create(req.body);
        res.status(201).json({
            success: true,
            data: customer
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    signup,
    login,
    getProfile,
    updateProfile,
    getCustomers,
    createCustomer
};
