const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    phone: {
        type: String,
        trim: true,
        sparse: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    address: {
        type: String,
        trim: true,
        default: ''
    },
    password: {
        type: String,
        minlength: [4, 'Password must be at least 4 characters']
    },
    googleId: {
        type: String,
        sparse: true
    },
    totalOrders: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    }
}, {
    timestamps: true
});

// Sparse unique indexes (allow multiple nulls)
customerSchema.index({ phone: 1 }, { unique: true, sparse: true });
customerSchema.index({ googleId: 1 }, { unique: true, sparse: true });

// Hash password before saving
customerSchema.pre('save', async function (next) {
    if (!this.password || !this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
customerSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

// Don't return password in JSON
customerSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('Customer', customerSchema);
