import mongoose from 'mongoose';

const commentSchema = mongoose.Schema({
  ownerID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  ownerName: { type: String, required: true },
  text: { type: String, required: true },
  content: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Content',
  },
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
