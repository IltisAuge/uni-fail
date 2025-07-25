import {Router} from 'express';
import {getRandomDisplayName, getUser, setAdmin, setBlocked, setDisplayName} from '@/controllers/user-controller';

const adminRouter = Router();

adminRouter.use(async (req, res, next) => {
    let user;
    // Send HTTP 401 if user is not logged in or if the user does not exist
    if (!req.session.userId || !(user = await getUser(req.session.userId))) {
        res.sendStatus(401);
        return;
    }
    if (!user.isAdmin) {
        res.sendStatus(403);
        return;
    }
    next();
});

adminRouter.get('/user/:id', async (req, res) => {
    const userId = req.params.id;
    if (!userId) {
        res.status(400).json({error:'No userId given!'});
        return;
    }
    const user = await getUser(req.params.id);
    if (!user) {
        res.status(404).json({error:`No user found with id ${req.params.id}`});
        return;
    }
    res.json({user});
});

adminRouter.post('/reset-display-name', async (req, res) => {
    const userId = req.body.userId;
    if (!userId) {
        res.status(400).json({error:'No userId given!'});
        return;
    }
    const user = await getUser(userId);
    if (!user) {
        res.status(404).json({error:'User not found!'});
        return;
    }
    setDisplayName(userId, getRandomDisplayName()).then((user) => {
        res.status(200).json({user});
        return user;
    }).catch((error) => {
        console.error('An error occurred while resetting display name:', error);
        res.status(500).json({error:'An error occurred while resetting display name'});
    });
});

adminRouter.post('/block-user', async (req, res) => {
    const userId = req.body.userId;
    if (!userId) {
        res.status(400).json({error:'No userId given!'});
        return;
    }
    const user = await getUser(userId);
    if (!user) {
        res.status(404).json({error:'User not found!'});
        return;
    }
    setBlocked(userId, req.body.status).then((user) => {
        res.status(200).json({user});
        return user;
    }).catch((error) => {
        console.error('An error occurred while setting user blocked status:', error);
        res.status(500).json({error:'An error occurred while setting user blocked status'});
    });
});

adminRouter.post('/set-admin', async (req, res) => {
    const userId = req.body.userId;
    if (!userId) {
        res.status(400).json({error:'No userId given!'});
        return;
    }
    const user = await getUser(userId);
    if (!user) {
        res.status(404).json({error:'User not found!'});
        return;
    }
    setAdmin(userId, req.body.status).then((user) => {
        res.status(200).json({user});
        return user;
    }).catch((error) => {
        console.error('An error occurred while setting user admin:', error);
        res.status(500).json({error:'An error occurred while setting user admin'});
    });
});

export default adminRouter;
