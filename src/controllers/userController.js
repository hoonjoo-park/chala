import User from '../models/User';
import bcrypt from 'bcrypt';
import fetch from 'node-fetch';

export const getJoin = (req, res) => {
  res.render('join', { pageTitle: '회원가입' });
};

export const postJoin = async (req, res) => {
  const { userName, userID, password, password2, email } = req.body;
  if (password !== password2) {
    req.flash('error', '비밀번호가 서로 일치하지 않습니다');
    return res.status(400).render('join', {
      pageTitle: '회원가입',
    });
  }
  const exists = await User.exists({ $or: [{ userID }, { email }] });
  if (exists) {
    req.flash('error', '이미 존재하는 ID 또는 Email입니다');
    return res.status(400).render('join', {
      pageTitle: '회원가입',
    });
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
    req.flash('error', '잘못된 접근입니다');
    return res.status(400).render('join', { pageTitle: '회원가입' });
  }
};

export const getLogin = (req, res) => {
  res.render('login', { pageTitle: '로그인' });
};

export const postLogin = async (req, res) => {
  const { userID, password } = req.body;
  const user = await User.findOne({ userID });
  if (!user) {
    req.flash('error', '존재하지 않는 아이디입니다');
    return res.render('login', {
      pageTitle: '로그인',
    });
  }
  const passwordCheck = await bcrypt.compare(password, user.password);
  if (!passwordCheck) {
    req.flash('error', '비밀번호가 틀렸습니다');
    return res.render('login', {
      pageTitle: '로그인',
    });
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
  res.render('editProfile', { pageTitle: '프로필 수정' });
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
    req.flash('error', '비밀번호가 틀렸습니다');
    return res.status(400).render('editProfile', { pageTitle: '프로필 수정' });
  }
  if (userID !== req.session.user.userID) {
    if (idExists) {
      req.flash('error', '이미 존재하는 ID 또는 Email입니다');
      return res
        .status(400)
        .render('editProfile', { pageTitle: '프로필 수정' });
    }
  } else if (email !== req.session.user.email) {
    if (emailExists) {
      req.flash('error', '이미 존재하는 ID 또는 Email입니다');
      return res
        .status(400)
        .render('editProfile', { pageTitle: '프로필 수정' });
    }
  }
  const isHeroku = process.env.NODE_ENV === 'production';
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      userName,
      userID,
      email,
      profileImg: file ? (isHeroku ? file.location : file.path) : profileImg,
    },
    { new: true }
  );
  req.session.user = updatedUser;
  return res.redirect('/user/edit');
};

export const getPwChange = (req, res) => {
  return res.render('pwChange', { pageTitle: '비밀번호 변경' });
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
    req.flash('error', '비밀번호가 틀렸습니다');
    return res.status(400).render('pwChange', {
      errorMsg: '비밀번호가 틀렸습니다. 다시 입력해주세요',
    });
  }
  if (newPassword !== newPassword2) {
    req.flash('error', '비밀번호가 서로 일치하지 않습니다');
    return res.status(400).render('pwChange', {
      errorMsg: '입력하신 비밀번호가 서로 일치하지 않습니다.',
    });
  }
  user.password = newPassword;
  await user.save();
  return res.redirect('/user/logout');
};

export const getWithdraw = (req, res) => {
  return res.render('withdraw', { pageTitle: '회원탈퇴' });
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
    req.flash('error', '비밀번호가 틀렸습니다');
    return res.status(400).render('withdraw', {
      errorMsg: '비밀번호가 틀렸습니다. 다시 입력해주세요',
    });
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
  const data = await fetch(`${baseURL}?${params}`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
  });
  const json = await data.json();
  if ('access_token' in json) {
    const { access_token } = json;
    const userRequest = await (
      await fetch('https://api.github.com/user', {
        headers: { Authorization: `token ${access_token}` },
      })
    ).json();
    const emailData = await (
      await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `token ${access_token}` },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect('/login');
    }
    const existingUser = await User.findOne({ email: emailObj.email });
    if (existingUser) {
      req.session.loggedIn = true;
      req.session.user = existingUser;
      return res.redirect('/');
    } else {
      req.flash(
        'error',
        '소셜 계정과 일치하는 회원 정보가 없습니다. 새로 가입해주세요'
      );
      return res.render('join', {
        pageTitle: '회원가입',
        socialJoin: emailObj.email,
      });
    }
  } else {
    return res.redirect('/login');
  }
};

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: 'contents',
    populate: {
      path: 'owner',
      model: 'User',
    },
  });
  console.log(user);
  return res.render('profile', {
    pageTitle: user.userName,
    user,
  });
};
