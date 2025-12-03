import mongoose from 'mongoose';
const { Schema } = mongoose;

const LinkSchema = new Schema({
  code: { type: String, required: true, unique: true, index: true },  // short code
  destination: { type: String, required: true },                       // original URL
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', index: true, default: null },
  isCustom: { type: Boolean, default: false },                         // whether user set their own code
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null, index: true },               // optional expiration
  clicks: { type: Number, default: 0 },                                // quick counter for analytics dashboard
  meta: { type: Schema.Types.Mixed }                                   // optional metadata (title, tags, etc.)
});

export default mongoose.model('Link', LinkSchema);
