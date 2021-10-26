import express from 'express';
import { logout, getUserEdit, postUserEdit, getPwChange, postPwChange, getWithdraw, postWithdraw, startGithubLogin, finishGithubLogin, see } from '../controllers/userController';
import { doubleCheck, uploadProfileImgs } from '../middlewares';
const userRouter = express.Router();

userRouter.get('/logout', doubleCheck, logout);
userRouter.route('/edit').all(doubleCheck).get(getUserEdit).post(uploadProfileImgs.single('profileImg'), postUserEdit);
userRouter.route('/pwchange').all(doubleCheck).get(getPwChange).post(postPwChange);
userRouter.route('/withdraw').all(doubleCheck).get(getWithdraw).post(postWithdraw);
userRouter.get('/github/login', startGithubLogin);
userRouter.get('/github/finish', finishGithubLogin);
userRouter.get('/:id', see);

export default userRouter;
