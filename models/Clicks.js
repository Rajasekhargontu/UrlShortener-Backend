import mongoose from 'mongoose';
const { Schema } = mongoose;

const ClickSchema = new Schema({
  linkId: { type: Schema.Types.ObjectId, ref: 'Link', required: true, index: true },
  code: { type: String, required: true, index: true },
  ts: { type: Date, default: Date.now, index: true },    // timestamp
  ip: { type: String, index: true },                 // hashed IP for privacy
  ua: { type: String },                                  // user-agent
  referrer: { type: String },                            // referring site
  geo: { type: Schema.Types.Mixed }                      // optional: location info
});

export default mongoose.model('Click', ClickSchema);
