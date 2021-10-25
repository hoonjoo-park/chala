import User from '../models/User';
import bcrypt from 'bcrypt';
import fetch from 'node-fetch';

export const getJoin = (req, res) => {
  res.render('join', { pageTitle: '회원가입' });
};

export const postJoin = async (req, res) => {
  const { userName, userID, password, password2, email } = req.body;
  if (password !== password2) {
    return res.status(400).render('join', { pageTitle: '회원가입', errorMsg: '입력하신 비밀번호가 서로 일치하지 않습니다.' });
  }
  const exists = await User.exists({ $or: [{ userID }, { email }] });
  if (exists) {
    return res.status(400).render('join', { pageTitle: '회원가입', errorMsg: '이미 존재하는 ID 또는 Email입니다.' });
  }
  try {
    await User.create({
      userName,
      userID,
      password,
      email,
    });
    return res.redirect('/login');
  } catch (error) {
    return res.status(400).render('join', { pageTitle: '회원가입', errorMsg: error._message });
  }
};

export const getLogin = (req, res) => {
  res.render('login', { pageTitle: '로그인' });
};

export const postLogin = async (req, res) => {
  const { userID, password } = req.body;
  const user = await User.findOne({ userID });
  if (!user) {
    return res.render('login', { pageTitle: '로그인', errorMsg: '존재하지 않는 아이디입니다.' });
  }
  const passwordCheck = await bcrypt.compare(password, user.password);
  if (!passwordCheck) {
    return res.render('login', { pageTitle: '로그인', errorMsg: '비밀번호가 틀렸습니다. 다시 입력해주세요' });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect('/');
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect('/');
};

export const getUserEdit = (req, res) => {
  res.render('editProfile');
};

export const postUserEdit = async (req, res) => {
  const { userName, userID, password, email, profileImg } = req.body;
  const { file } = req;
  const {
    session: {
      user: { _id },
    },
  } = req;
  const user = await User.findOne({ userID });
  const emailExists = await User.exists({ email });
  const idExists = await User.exists({ userID });
  const pwCheck = await bcrypt.compare(password, user.password);
  if (!pwCheck) {
    return res.status(400).render('editProfile', { errorMsg: '비밀번호가 틀렸습니다. 다시 입력해주세요' });
  }
  if (userID !== req.session.user.userID) {
    if (idExists) {
      return res.status(400).render('editProfile', { errorMsg: '이미 존재하는 ID입니다.' });
    }
  } else if (email !== req.session.user.email) {
    if (emailExists) {
      return res.status(400).render('editProfile', { errorMsg: '이미 존재하는 Email입니다.' });
    }
  }
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      userName,
      userID,
      email,
      profileImg: file ? file.location : profileImg,
    },
    { new: true }
  );
  req.session.user = updatedUser;
  console.log(req.session.user);
  return res.redirect('/user/edit');
};

export const getPwChange = (req, res) => {
  return res.render('pwChange');
};
export const postPwChange = async (req, res) => {
  const { password, newPassword, newPassword2 } = req.body;
  const {
    session: {
      user: { _id },
    },
  } = req;
  const user = await User.findById(_id);
  const pwCheck = await bcrypt.compare(password, user.password);
  if (!pwCheck) {
    return res.status(400).render('pwChange', { errorMsg: '비밀번호가 틀렸습니다. 다시 입력해주세요' });
  }
  if (newPassword !== newPassword2) {
    return res.status(400).render('pwChange', { errorMsg: '입력하신 비밀번호가 서로 일치하지 않습니다.' });
  }
  user.password = newPassword;
  await user.save();
  return res.redirect('/user/logout');
};

export const getWithdraw = (req, res) => {
  return res.render('withdraw');
};
export const postWithdraw = async (req, res) => {
  const { userID, password } = req.body;
  const {
    session: {
      user: { _id },
    },
  } = req;
  const user = await User.findOne({ userID });
  const pwCheck = await bcrypt.compare(password, user.password);
  if (!pwCheck) {
    return res.status(400).render('withdraw', { errorMsg: '비밀번호가 틀렸습니다. 다시 입력해주세요' });
  }
  await User.deleteOne({ userID });
  return res.redirect('/user/logout');
};

export const startGithubLogin = (req, res) => {
  const baseURL = 'https://github.com/login/oauth/authorize';
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: 'user:email read:user',
  };
  const params = new URLSearchParams(config).toString();
  return res.redirect(`${baseURL}?${params}`);
};
export const finishGithubLogin = async (req, res) => {
  const baseURL = 'https://github.com/login/oauth/access_token';
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const data = await fetch(`${baseURL}?${params}`, { method: 'POST', headers: { Accept: 'application/json' } });
  const json = await data.json();
  if ('access_token' in json) {
    const { access_token } = json;
    const userRequest = await (await fetch('https://api.github.com/user', { headers: { Authorization: `token ${access_token}` } })).json();
    const emailData = await (await fetch('https://api.github.com/user/emails', { headers: { Authorization: `token ${access_token}` } })).json();
    const emailObj = emailData.find((email) => email.primary === true && email.verified === true);
    if (!emailObj) {
      return res.redirect('/login');
    }
    const existingUser = await User.findOne({ email: emailObj.email });
    if (existingUser) {
      req.session.loggedIn = true;
      req.session.user = existingUser;
      return res.redirect('/');
    } else {
      return res.render('join', { errorMsg: '소셜 계정과 일치하는 회원 정보가 없습니다. 새로 가입해주세요.', socialJoin: emailObj.email });
    }
  } else {
    return res.redirect('/login');
  }
};
