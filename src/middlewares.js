import multer from 'multer';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';

const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const multerUploader = multerS3({
  s3,
  bucket: 'chalaa',
  acl: 'public-read',
});

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

export const uploadProfileImgs = multer({
  dest: 'uploads/profile',
  limits: {
    fileSize: 3000000,
  },
  storage: multerUploader,
});
export const uploadContents = multer({
  dest: 'uploads/contents',
  limits: {
    fileSize: 10000000,
  },
  storage: multerUploader,
});
