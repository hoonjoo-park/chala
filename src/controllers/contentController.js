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
  res.header('Cross-Origin-Embedder-Policy', 'require-corp');
  res.header('Cross-Origin-Opener-Policy', 'same-origin');
  const {
    query: { option },
  } = req;
  if (option === 'local') {
    return res.render('uploadContent', { pageTitle: 'Upload', localModal: true, cameraModal: false });
  } else if (option === 'take') {
    return res.render('uploadContent', { pageTitle: 'Upload', localModal: false, cameraModal: true });
  }
  return res.render('uploadContent', { pageTitle: 'Upload', localModal: false, cameraModal: false });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { contentFile, thumbFile } = req.files;
  const { contentName, description } = req.body;
  const newContent = await Content.create({
    contentTitle: contentName,
    contentDesc: description,
    contentFile: contentFile[0].path,
    thumbnail: thumbFile[0].path,
    owner: _id,
  });
  const user = await User.findById(_id);
  user.contents.push(newContent._id);
  user.save();
  return res.render('uploadContent', { pageTitle: 'Upload', localModal: false, cameraModal: false });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const content = await Content.findById(id).populate('owner').populate('comments');
  if (!content) {
    return res.status(404).rendirect('/');
  }
  return res.render('watch', { content });
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
  return res.render('edit', { pageTitle: `Edit: ${content.title}`, content });
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
  return res.render('search', { contents });
};
