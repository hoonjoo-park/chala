import express from 'express';
import { getUpload, postUpload, watch, getEdit, postEdit, deleteContent } from '../controllers/contentController';
import { doubleCheck, uploadContents } from '../middlewares';
const contentRouter = express.Router();

contentRouter.get('/:id([0-9a-f]{24})', watch);

contentRouter.route('/:id([0-9a-f]{24})/edit').all(doubleCheck).get(getEdit).post(postEdit);
contentRouter.route('/:id([0-9a-f]{24})/delete').all(doubleCheck).get(deleteContent);

contentRouter
  .route('/upload')
  .all(doubleCheck)
  .get(getUpload)
  .post(uploadContents.fields([{ name: 'contentFile' }, { name: 'thumbFile' }]), postUpload);
export default contentRouter;
