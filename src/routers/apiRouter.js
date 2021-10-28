import express from 'express';
import { postComment, deleteComment } from '../controllers/contentController';
const apiRouter = express.Router();

apiRouter.post('/content/:id([0-9a-f]{24})/comment', postComment);
apiRouter.post('/content/:id([0-9a-f]{24})/comment/delete', deleteComment);
export default apiRouter;
