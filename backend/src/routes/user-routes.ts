import {Router} from 'express';
import dotenv from 'dotenv';
import {UserModel} from '../schemata/schemata';
import {isDisplayNameAvailable} from '../controller/user-controller';

dotenv.config();

const userRouter = Router();

userRouter.post('/set-display-name', async (req, res) => {
    if (!req.session.user) {
        res.status(401).send();
        return;
    }
    const userId = req.session.user._id;
    const user = await UserModel.findById(userId);
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
    user.displayName = displayName as string;
    user.save().then(result => {
        if (result) {
            if (req.session.user) {
                req.session.user.displayName = displayName;
            }
            res.status(200).json({displayName: displayName});
            return;
        }
        res.status(500).send();
    });
});

userRouter.post('/set-avatar', async (req, res) => {
    if (!req.session.user) {
        return;
    }
    const userId = req.session.user._id;
    const user = await UserModel.findById(userId);
    if (!user) {
        res.status(404).json({error: 'User not found!'});
        return;
    }
    const avatarId = req.body.avatarId;
    if (!avatarId) {
        res.status(400).json({error: 'No avatarId given in body!'});
        return;
    }
    user.avatarKey = avatarId;
    user.save().then(result => {
        if (result) {
            console.log(result);
            if (req.session.user) {
                req.session.user.avatarKey = avatarId;
            }
            res.status(200).json(result);
            return;
        }
        res.status(500).send();
    });
});

export default userRouter;
