import express from 'express';
import session from 'express-session';
import cors from 'cors';
import loginRoutes from './routes/login-routes';
import postRoutes from './routes/post-routes';
import userRoutes from './routes/user-routes';
import adminRoutes from './routes/admin-routes';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'node:path';
import {downloadAllFiles} from './s3';
import {getUser, loadAvailableDisplayNames} from './controller/user-controller';

dotenv.config();

declare module 'express-session' {
	interface SessionData {
        userId: string,
		oAuthState: string;
		oAuthNonce: string;
	}
}

const server = express();
server.set('trust proxy', 1);
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
		domain: process.env.PRODUCTION == 'true' ? '.' + process.env.DOMAIN : undefined
	}
}));
server.use(cors({
	origin: process.env.HOST,
	credentials: true
}));
server.use('/login', loginRoutes);
server.use('/post', postRoutes);
server.use('/user', userRoutes);
server.use('/admin', adminRoutes);
server.get('/me', async (req, res) => {
    if (!req.session.userId) {
        res.status(401).send("Unauthorized");
        return;
    }
    const user = await getUser(req.session.userId);
    if (user) {
        res.json({user: user});
        return;
    }
    res.status(404).json({error:'User not found. Id=' + req.session.userId});
})
server.get('/avatars', (req, res) => {
    fs.readdir('./avatars', (err, files) => {
        res.json(files);
    });
});
server.get('/avatars/:id', (req, res) => {
    const objectId = req.params.id;
    const avatarFilePath = path.resolve('./avatars') + '/' + objectId;
    res.status(200).sendFile(avatarFilePath);
});
server.post('/logout', (req, res) => {
    req.session.userId = undefined;
    res.status(200).send("Logout successful");
});
server.get('/', (req, res) => {
	res.header('Content-Type', 'text/plain');
	res.send('Welcome to the API of uni-fail!');
});
downloadAllFiles().then(r => {
    console.log("Downloaded all files");
});
loadAvailableDisplayNames().then(r => {
    console.log("Loaded available display names");
    console.log(r);
})

export default server;
