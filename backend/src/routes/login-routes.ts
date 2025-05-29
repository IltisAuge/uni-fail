import {Router} from 'express';
import {GoogleLoginController} from '../controller/login-providers/google-login';
import {MicrosoftLoginController} from '../controller/login-providers/microsoft-login';

const loginRouter = Router();
const googleLoginController = new GoogleLoginController();
const microsoftLoginController = new MicrosoftLoginController();

loginRouter.get('/', (req, res) => {
	let loginController: GoogleLoginController | MicrosoftLoginController;
	switch (req.query.provider) {
		case 'google':
			loginController = googleLoginController;
			break;
		case 'microsoft':
			loginController = microsoftLoginController;
			break;
		default:
			res.status(400).send('Invalid login provider');
			return;
	}
	let url = loginController.getAuthURL();
	const state = crypto.randomUUID().toString();
	const nonce = crypto.randomUUID().toString();
	// Replace security parameters for Microsoft
	url = url.replace('{state}', state).replace('{nonce}', nonce);
	req.session.oAuthState = state;
	req.session.oAuthNonce = nonce;
	res.redirect(url);
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
	googleLoginController.getUserData(code).then((userData: {
		id: string;
		email: string;
		name: string;
	} | undefined) => {
		req.session.user = userData;
		res.redirect(process.env.AUTH_RETURN_URL as string);
	});
});

loginRouter.post('/microsoft-auth-return', (req, res) => {
	const id_token = req.body.id_token as string;
	if (id_token == undefined) {
		res.send('No id_token');
		return;
	}
	if (id_token.constructor !== String) {
		res.send('id_token is not a string');
		return;
	}
	const state = req.body.state;
	if (state == undefined) {
		res.send('No state');
		return;
	}
	if (req.session.oAuthState != state) {
		res.send('Invalid oAuthState');
		return;
	}
	const jwt = microsoftLoginController.decodeJWT(id_token);
	if (jwt.nonce != req.session.oAuthNonce) {
		res.send('Invalid oAuthNonce');
		return;
	}
	microsoftLoginController.getUserData(jwt).then((userData: {
		id: string;
		email: string;
		name: string;
	} | undefined) => {
		console.log(userData);
		req.session.user = userData;
		res.redirect(process.env.AUTH_RETURN_URL as string);
	});
});

loginRouter.get('/check-login', (req, res) => {
	res.json({user: req.session.user});
});

export default loginRouter;
