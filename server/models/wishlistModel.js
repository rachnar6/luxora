import mongoose from 'mongoose';

// Define all sub-schemas first
const commentSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  text: { type: String, required: true },
}, { timestamps: true });

const ratingSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vote: { type: String, required: true, enum: ['like', 'dislike'] }
});

const wishlistItemSchema = mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  notes: { type: String, default: '' },
  ratings: [ratingSchema],
  comments: [commentSchema],
});

const chatMessageSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    text: { type: String, required: true },
}, { timestamps: true });


// Now, define the main schema that uses the sub-schemas
const wishlistSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
    default: "My Wishlist",
  },
  items: [wishlistItemSchema],
  shareToken: { type: String, unique: true, sparse: true },
  isPublic: { type: Boolean, default: false },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  chat: [chatMessageSchema],

  // ✅ NEW FIELDS ADDED HERE
  lastAccessed: { type: Date, default: Date.now },
  validUntil: { type: Date },

}, { timestamps: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;
