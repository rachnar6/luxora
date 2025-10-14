// server/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // Ensure this import is present

const addressSchema = mongoose.Schema({
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
});

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'seller', 'admin'],
        default: 'user',
    },
    isSeller: {
        type: Boolean,
        default: false,
    },
    sellerApplicationStatus: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected'],
        default: 'none',
    },
    shippingAddresses: [addressSchema],
    
    // Fields for password reset
    passwordResetToken: String,
    passwordResetExpires: Date,

}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// ## THIS IS THE FUNCTION THAT MUST BE PRESENT ##
userSchema.methods.createPasswordResetToken = function() {
    // Create the unhashed token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token and save it to the database
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set token to expire in 10 minutes
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    // Return the unhashed token to be sent via email
    return resetToken;
};


const User = mongoose.model('User', userSchema);
export default User;