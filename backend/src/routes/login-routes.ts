import {Router} from 'express';
import {GoogleLoginController} from '../controller/login-providers/google-login';
import {MicrosoftLoginController} from '../controller/login-providers/microsoft-login';
import {generateRandomString} from 'ts-randomstring/lib';

const loginRouter = Router();
const googleLoginController = new GoogleLoginController();
const microsoftLoginController = new MicrosoftLoginController();

loginRouter.post('/', (req, res) => {
	console.log(req.body);
	let loginController: GoogleLoginController | MicrosoftLoginController;
	switch (req.body.provider) {
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
	const state = generateRandomString({length: 32}) as string;
	const nonce = generateRandomString({length: 32}) as string;
	// Replace security parameters for Microsoft
	url = url.replace('{state}', state).replace('{nonce}', nonce);
	req.session.oAuthState = state;
	req.session.oAuthNonce = nonce;
	res.send(url);
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
	console.log(req.body);
	const state = req.body.state;
	console.log("state=" + state);
	console.log("oAuthState=" + req.session.oAuthState);
	console.log("oAuthNonce=" + req.session.oAuthNonce);
	if (state == undefined) {
		res.send('No state');
		return;
	}
	if (req.session.oAuthState != state) {
		res.send('Invalid oAuthState');
		return;
	}
	const jwt = microsoftLoginController.decodeJWT(id_token);
	console.log("nonce=" + jwt.nonce);
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
	if (req.session.user) {
		res.json({user: req.session.user});
	} else {
		res.json({user: null});
	}
});

export default loginRouter;
