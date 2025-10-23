// server/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // Ensure this import is present

const addressSchema = mongoose.Schema({
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String },
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
    googleId: { // Make sure you have a field for the Google ID
        type: String,
    },
    password: {
        type: String,
        required: [
            function() { return !this.googleId; },
            'Password is required'
        ]
    },
    profilePicture: {
        type: String,
        default: '/images/default-avatar.png',
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

    seller: {
    brandName: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
    },
    contactEmail: {
      type: String,
    },
    socialMedia: {
      instagram: { type: String },
      facebook: { type: String },
      twitter: { type: String },
      // Add any other platforms you want
    },
    logo: {
      type: String,
      default: '/images/default-store-logo.png'
    }
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

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    // Return the unhashed token to be sent via email
    return resetToken;
};

userSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    console.log(`Deleting wishlists for user: ${this._id}`);
    try {
        // Find and delete all wishlists where the 'user' field matches this user's ID
        await Wishlist.deleteMany({ user: this._id });
        console.log(`Successfully deleted wishlists for user: ${this._id}`);
        next(); // Continue with deleting the user
    } catch (error) {
        console.error(`Error deleting wishlists for user ${this._id}:`, error);
        next(error); // Pass the error along to stop the user deletion if wishlist deletion fails
    }
});

const User = mongoose.model('User', userSchema);
export default User;