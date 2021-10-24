import multer from 'multer';

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = 'Chala';
  res.locals.loggedInUser = req.session.user || {};
  next();
};

export const doubleCheck = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else res.redirect('/login');
};

export const publicOnly = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else res.redirect('/');
};

export const uploadProfileImgs = multer({ dest: 'uploads/profile' });
export const uploadContents = multer({
  dest: 'uploads/contents',
  limits: {
    fileSize: 10000000,
  },
});
