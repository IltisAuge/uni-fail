import {Router} from "express";
import {getRandomDisplayName, getUser, setAdmin, setBlocked, setDisplayName} from "../controller/user-controller";

const adminRouter = Router();

adminRouter.get('/user/:id', async (req, res) => {
    const userId = req.params.id;
    if (!userId) {
        res.status(400).json({error:'No userId given!'});
        return;
    }
    const user = await getUser(req.params.id);
    if (!user) {
        res.status(404).json({error:'No user found with id ' + req.params.id});
        return;
    }
    res.json({user: user});
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
    setDisplayName(userId, getRandomDisplayName()).then(doc => {
        console.log("Saved. Set displayname to " + user.displayName);
        console.log(doc);
        res.status(200).json({user: doc});
    }).catch((e) => {
        console.error(e);
        res.status(500).send();
    })
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
    setBlocked(userId, req.body.status).then(doc => {
        res.status(200).json({user: doc});
    }).catch((e) => {
        res.status(500).send();
    });
})

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
    setAdmin(userId, req.body.status).then(doc => {
        res.status(200).json({user: doc});
    }).catch((e) => {
        console.log(e);
        res.status(500).send();
    })
})

export default adminRouter;
