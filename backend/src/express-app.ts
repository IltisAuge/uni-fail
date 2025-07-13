import fs from 'fs';
import path from 'node:path';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import csrf from 'csurf';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import loginRouter from './routes/login-routes';
import postRouter from './routes/post-routes';
import userRouter from './routes/user-routes';
import adminRouter from './routes/admin-routes';
import rankingRouter from './routes/ranking-routes';
import tagRouter from './routes/tag-routes';
import {getUser} from '@/controllers/user-controller';
import votingRouter from '@/routes/voting-routes';

dotenv.config();

declare module 'express-session' {
	interface SessionData {
        userId: string,
		oAuthState: string;
		oAuthNonce: string;
        loginReturnUrl: string;
	}
}

const server = express();
server.set('trust proxy', 1);
server.use(cookieParser());
server.use(express.json());
server.use(express.urlencoded({extended: true}));
server.use(session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
        secure: process.env.PRODUCTION == 'true',
        httpOnly: true,
        sameSite: process.env.PRODUCTION == 'true' ? 'none' : undefined,
        domain: process.env.PRODUCTION == 'true' ? `.${process.env.DOMAIN}` : undefined,
    },
}));
server.use(cors({
    origin: process.env.HOST,
    credentials: true,
}));
server.use(csrf({ cookie: { httpOnly: false} }));
server.use('/login', loginRouter);
server.use('/post', postRouter);
server.use('/user', userRouter);
server.use('/admin', adminRouter);
server.use('/ranking', rankingRouter);
server.use('/tag', tagRouter);
server.use('/vote', votingRouter);
server.get('/csrf-token', (req, res) => {
    const csrfToken = req.csrfToken();
    res.cookie('XSRF-TOKEN', csrfToken, {
        httpOnly: false,
        secure: process.env.PRODUCTION === 'true',
        sameSite: process.env.PRODUCTION === 'true' ? 'none' : 'lax',
        domain: process.env.PRODUCTION === 'true' ? `.${process.env.DOMAIN}` : undefined,
    });
    res.json({token: csrfToken});
});
server.get('/me', async (req, res) => {
    if (!req.session.userId) {
        res.json({user: undefined});
        return;
    }
    const user = await getUser(req.session.userId);
    if (user) {
        res.json({user});
        return;
    }
    res.status(404).json({error:`User not found. Id=${req.session.userId}`});
});
server.get('/avatars', (req, res) => {
    if (!fs.existsSync('./avatars')) {
        res.status(500).send('Avatar directory does not exist');
        return;
    }
    fs.readdir('./avatars', (err, files) => {
        res.json(files);
    });
});
server.get('/avatar/:id', (req, res) => {
    const objectId = req.params.id;
    const base = path.basename(objectId);
    const avatarFilePath = path.resolve('./avatars', base);
    if (!fs.existsSync(avatarFilePath)) {
        res.status(404).json({ error: 'Avatar not found' });
        return;
    }
    res.sendFile(avatarFilePath);
});
server.post('/logout', (req, res) => {
    req.session.userId = undefined;
    res.status(200).json({msg: 'Logout successful'});
});
server.get('/', (req, res) => {
    res.header('Content-Type', 'text/plain');
    res.send('Welcome to the API of uni-fail!');
});

export default server;
