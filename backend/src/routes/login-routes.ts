import {Router} from 'express';
import {GoogleLoginController} from '../login-providers/google-login';
import {MicrosoftLoginController} from '../login-providers/microsoft-login';
import {UserController} from '../controller/user-controller';
import dotenv from 'dotenv';

dotenv.config();

const loginRouter = Router();
const googleLoginController = new GoogleLoginController();
const microsoftLoginController = new MicrosoftLoginController();
const userController = new UserController();

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
	googleLoginController.getUserData(code).then(userData => completeAuthentication(userData, req, res));
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
	microsoftLoginController.getUserData(jwt).then(userData => completeAuthentication(userData, req, res));
});

loginRouter.get('/check-login', (req, res) => {
	res.json({user: req.session.user});
});
//console.log("process.env.PRODUCTION=" + process.env.PRODUCTION as unknown as boolean);
if (!(process.env.PRODUCTION as unknown as boolean)) {
    loginRouter.get('/mock', (req, res) => {
        const isAdmin = req.query.admin as unknown as boolean;
        req.session.user = {
            _id: '000000000',
            provider: 'mock-provider',
            name: 'Mock User',
            email: 'mock@user.de',
            isAdmin: isAdmin
        }
        res.status(302).send("Mocked session with admin=" + isAdmin);
    });
}

async function completeAuthentication(userData: any, req: any, res: any) {
    let userDocument = undefined;
    // If DB usage is disabled during development, login should work
    if (process.env.USE_DB === 'true') {
        userDocument = await userController.saveUser(userData);
    } else {
        userDocument = userData;
    }
    if (userDocument) {
        req.session.user = userDocument;
        res.redirect(process.env.AUTH_RETURN_URL as string);
        return;
    }
    res.status(500).send('Authentication failed!');
}

export default loginRouter;
