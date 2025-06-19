import {Router} from 'express';
import dotenv from 'dotenv';
import {getUser, isDisplayNameAvailable, setAvatarKey, setDisplayName} from '../controller/user-controller';
import path from 'node:path';

dotenv.config();

const userRouter = Router();

userRouter.post('/set-display-name', async (req, res) => {
    if (!req.session.userId) {
        res.status(401).send();
        return;
    }
    const userId = req.session.userId;
    const user = await getUser(userId);
    if (!user) {
        res.status(404).json({error: 'User not found!'});
        return;
    }
    const displayName = req.body.displayName;
    if (!displayName) {
        res.status(400).json({error: 'No displayName given in body!'});
        return;
    }
    if (!await isDisplayNameAvailable(displayName)) {
        res.status(400).json({error: 'Not available'});
        return;
    }
    console.log("Set user displayname from " + user.displayName + " to " + displayName);
    setDisplayName(userId, displayName).then(result => {
        if (result) {
            res.status(200).json({user: result});
            return;
        }
        res.status(500).send();
    });
});

userRouter.get('/:id/avatar', async (req, res) => {
    const userId = req.params.id;
    const user = await getUser(userId);
    if (!user) {
        res.status(404).json({error: 'User not found with id ' + userId});
        return;
    }
    const avatarFilePath = path.resolve('./avatars') + '/' + user?.avatarKey;
    res.status(200).sendFile(avatarFilePath);
});

userRouter.post('/set-avatar', async (req, res) => {
    if (!req.session.userId) {
        return;
    }
    const userId = req.session.userId;
    const user = await getUser(userId);
    if (!user) {
        res.status(404).json({error: 'User not found!'});
        return;
    }
    const avatarId = req.body.avatarId;
    if (!avatarId) {
        res.status(400).json({error: 'No avatarId given in body!'});
        return;
    }
    setAvatarKey(userId, avatarId).then(result => {
        if (result) {
            res.status(200).json({user: result});
            return;
        }
        res.status(500).send();
    });
});

export default userRouter;
