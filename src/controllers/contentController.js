import { isRedirect } from 'node-fetch';
import Content from '../models/Content';
import User from '../models/User';
import Comment from '../models/Comment';

export const home = async (req, res) => {
  if (req.session.user) {
    const {
      session: {
        user: { _id },
      },
    } = req;
    const user = await User.findById(_id).populate({
      path: 'contents',
      populate: {
        path: 'owner',
        model: 'User',
      },
    });
    return res.render('home', { pageTitle: 'Home', contents: user.contents });
  } else {
    return res.render('home', { pageTitle: 'Home' });
  }
};

export const getUpload = (req, res) => {
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'require-corp');
  res.header('Cross-Origin-Opener-Policy', 'same-origin');
  const {
    query: { option },
  } = req;
  if (option === 'local') {
    return res.render('uploadContent', {
      pageTitle: 'Upload',
      localModal: true,
      cameraModal: false,
    });
  } else if (option === 'take') {
    return res.render('uploadContent', {
      pageTitle: 'Upload',
      localModal: false,
      cameraModal: true,
    });
  }
  return res.render('uploadContent', {
    pageTitle: 'Upload',
    localModal: false,
    cameraModal: false,
  });
};

const isHeroku = process.env.NODE_ENV === 'production';

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { contentFile, thumbFile } = req.files;
  const { contentName, description } = req.body;
  const newContent = await Content.create({
    contentTitle: contentName,
    contentDesc: description,
    contentFile: isHeroku ? contentFile[0].location : contentFile[0].path,
    thumbnail: isHeroku ? thumbFile[0].location : thumbFile[0].path,
    owner: _id,
  });
  const user = await User.findById(_id);
  user.contents.push(newContent._id);
  user.save();
  return res.render('uploadContent', {
    pageTitle: 'Upload',
    localModal: false,
    cameraModal: false,
  });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const content = await Content.findById(id)
    .populate('owner')
    .populate('comments');
  if (!content) {
    return res.status(404).rendirect('/');
  }
  return res.render('watch', { pageTitle: content.contentTitle, content });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const content = await Content.findById(id);
  if (!content) {
    return res.status(404).rendirect('/');
  }
  if (String(content.owner) !== String(_id)) {
    req.flash('error', 'Not authorized');
    return res.status(403).redirect('/');
  }
  return res.render('edit', { pageTitle: '컨텐츠 수정', content });
};

export const postEdit = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { id } = req.params;
  const { contentTitle, contentDesc } = req.body;
  const content = await Content.findById(id);
  if (String(content.owner) !== String(_id)) {
    return res.status(403).redirect('/');
  }
  await Content.findByIdAndUpdate(id, {
    title: contentTitle,
    description: contentDesc,
  });
  return res.redirect(`/content/${id}`);
};

export const deleteContent = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const content = await Content.findById(id);
  if (!content) {
    return res.status(404).rendirect('/');
  }
  if (String(content.owner) !== String(_id)) {
    return res.status(403).redirect('/');
  }
  await Content.findByIdAndDelete(id);
  return res.redirect('/');
};

export const getSearch = async (req, res) => {
  const { keyword } = req.query;
  let contents = [];
  if (keyword) {
    contents = await Content.find({
      contentTitle: {
        $regex: new RegExp(`${keyword}`, 'gi'),
      },
    }).populate('owner');
  }
  return res.render('search', { pageTitle: '검색', contents });
};

export const postComment = async (req, res) => {
  const {
    body: { text },
    session: { user },
    params: { id },
  } = req;
  const content = await Content.findById(id);
  if (!content) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    ownerID: user._id,
    ownerName: user.userName,
    content: id,
  });
  content.comments.push(comment._id);
  content.save();
  return res.status(201).json({
    newCommentId: comment._id,
    newCommentOwnerID: comment.ownerID,
    user,
  });
};

export const deleteComment = async (req, res) => {
  const {
    body: { newCommentID, ownerID },
    session: { user },
    params: { id },
  } = req;
  const content = await Content.findById(id);
  if (String(user._id) !== String(ownerID)) {
    return res.sendStatus(404);
  }
  await content.comments.splice(
    content.comments.indexOf(String(newCommentID)),
    1
  );
  await Comment.findByIdAndDelete(newCommentID);
  content.save();
  return res.sendStatus(201);
};
