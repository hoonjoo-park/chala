import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  contentTitle: { type: String, required: true },
  contentDesc: { type: String, required: true },
  contentFile: { type: String, required: true },
  thumbnail: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  comments: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Comment' }],
});

const Content = mongoose.model('Content', contentSchema);
export default Content;
