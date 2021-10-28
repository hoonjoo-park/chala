import 'regenerator-runtime';
import 'dotenv/config';
import './db';
import path from 'path';
import express from 'express';
import morgan from 'morgan';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import globalRouter from './routers/globalRouter';
import userRouter from './routers/userRouter';
import contentRouter from './routers/contentRouter';
import apiRouter from './routers/apiRouter';
import { localsMiddleware } from './middlewares';

const app = express();
app.set('view engine', 'pug');
app.set('views', process.cwd() + '/src/views');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/convert', express.static('node_modules/@ffmpeg/core/dist'));
const PORT = process.env.PORT || 7000;
const logger = morgan('dev');
app.use(logger);

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 129600000,
    },
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);
app.use(localsMiddleware);
app.use('/uploads', express.static('uploads'));
app.use('/static', express.static('assets'));
app.use('/', globalRouter);
app.use('/user', userRouter);
app.use('/content', contentRouter);
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`💡 Listening on http://localhost:${PORT} 💡`);
});
