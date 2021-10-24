import mongoose from 'mongoose';

const commentSchema = mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  text: { type: String, required: true },
  content: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Content' },
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
