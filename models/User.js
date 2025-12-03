import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', UserSchema);
