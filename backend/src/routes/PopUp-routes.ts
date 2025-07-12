import { Router, Request, Response } from 'express';

const router = Router();

router.get('/welcome', (req: Request, res: Response) => {
    const dismissed = req.cookies['welcomePopupDismissed'];
    res.json({ showWelcome: dismissed !== 'true' });
});

router.post('/dismiss-welcome', (req: Request, res: Response) => {
    res.cookie('welcomePopupDismissed', 'true', {
        httpOnly: false,
        secure: process.env.PRODUCTION === 'true',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    res.json({ status: 'OK' });});

export default router;
