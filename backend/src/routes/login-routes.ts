import { LoginController } from '../controller/login-controller';
import { Router } from 'express';

const loginRouter = Router();
const loginController = new LoginController();

loginRouter.post('/', (req, res) => {
	res.send(loginController.getAuthUrl());
});

loginRouter.get('/google-auth-return', (req, res) => {
	const code = req.query.code;
	if (code == undefined) {
		res.send('No code');
		return;
	}
	if (!(code.constructor === String)) {
		res.send('Code is not a string');
		return;
	}
	loginController.getToken(code).then(userData => {
		req.session.user = userData;
		res.redirect(process.env.AUTH_RETURN_URL as string);
	});
});

loginRouter.get('/check-login', (req, res) => {
	if (req.session.user) {
		res.json({ user: req.session.user });
	} else {
		res.json({ user: null });
	}
});

export default loginRouter;
