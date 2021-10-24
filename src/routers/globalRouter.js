import express from 'express';
import { home, getSearch } from '../controllers/contentController';
import { getLogin, getJoin, postJoin, postLogin } from '../controllers/userController';
import { publicOnly } from '../middlewares';
const globalRouter = express.Router();

globalRouter.get('/', home);
globalRouter.route('/login').all(publicOnly).get(getLogin).post(postLogin);
globalRouter.route('/join').all(publicOnly).get(getJoin).post(postJoin);
globalRouter.get('/search', getSearch);

export default globalRouter;
