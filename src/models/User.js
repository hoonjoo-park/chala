import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  userID: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  profileImg: { type: String },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  contents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Content' }],
});

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});

const User = mongoose.model('User', userSchema);
export default User;
