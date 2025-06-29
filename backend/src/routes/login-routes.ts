import {Router} from 'express';
import dotenv from 'dotenv';
import {getRandomDisplayName, getUser, saveUser} from '../controller/user-controller';
import {GoogleLoginController} from '@/login-providers/google-login';
import {MicrosoftLoginController} from '@/login-providers/microsoft-login';

dotenv.config();

const loginRouter = Router();
const googleLoginController = new GoogleLoginController();
const microsoftLoginController = new MicrosoftLoginController();

loginRouter.get('/', (req, res) => {
    let loginController: GoogleLoginController | MicrosoftLoginController;
    switch (String(req.query.provider).toLowerCase()) {
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
    const loginReturnUrl = (req.query.returnUrl ?? '/') as string;
    console.log(`loginReturnUrl=${loginReturnUrl}`);
    let url = loginController.getAuthURL();
    const state = crypto.randomUUID().toString();
    const nonce = crypto.randomUUID().toString();
    // Replace security parameters for Microsoft
    url = url.replace('{state}', state).replace('{nonce}', nonce);
    req.session.oAuthState = state;
    req.session.oAuthNonce = nonce;
    req.session.loginReturnUrl = loginReturnUrl;
    const sid = req.cookies['connect.sid'].split('.')[0].replace('s%3A', '');
    console.log(`start login process: session=${JSON.stringify(req.session)}`);
    console.log(`sid=${  sid}`);
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
    googleLoginController
        .getUserData(code)
        .then(async (userData) => {
            await completeAuthentication(userData, req, res);
            return userData;
        })
        .catch((error) => {
            console.error('An error occurred while getting user data from google login controller:', error);
        });
});

loginRouter.get('/microsoft-auth-return', (req, res) => {
    const authCode = req.query.code as string;
    const sid = req.cookies['connect.sid'].split('.')[0].replace('s%3A', '');
    console.log(`microsoft auth return sid=${  sid}`);
    console.log(`microsoft auth return: session=${JSON.stringify(req.session)}`);
    if (authCode == undefined) {
        res.send('No authCode');
        return;
    }
    if (authCode.constructor !== String) {
        res.send('authCode is not a string');
        return;
    }

    const state = req.query.state;
    console.log(`state in query: ${state}`);
    if (state == undefined) {
        res.send('No state');
        return;
    }
    if (req.session.oAuthState != state) {
        res.send('Invalid oAuthState');
        return;
    }
    microsoftLoginController.requestIdToken(authCode).then((jwt) => {
        if (!jwt) {
            res.status(500).json({error: 'JWT invalid'});
            return;
        }
        if (jwt.nonce != req.session.oAuthNonce) {
            res.status(500).json({error: 'Invalid oAuthNonce'});
            return;
        }
        microsoftLoginController
            .getUserData(jwt)
            .then(async (userData) => {
                await completeAuthentication(userData, req, res);
                return;
            })
            .catch((error) => {
                throw Error(error);
            });
        return;
    }).catch((error) => {
        res.send(500).json({error: 'An error occurred while requesting id token from Microsoft:'});
        console.error('An error occurred while requesting id token from Microsoft:', error);
    });
});

// Only enable this endpoint in development
if (process.env.PRODUCTION === 'false') {
    console.log('Enabled /login/mock endpoint');
    loginRouter.get('/mock', (req, res) => {
        const isAdmin = req.query.admin as string;
        req.session.userId = '000000000';
        res.status(302).json({message: `Mocked session with admin=${  isAdmin}`});
    });
} else {
    console.log('Not enabled /login/mock endpoint');
}

async function completeAuthentication(userData: any, req: any, res: any) {
    let user = await getUser(userData._id);
    if (!user) {
        // User does not yet exist in the database
        // Set default avatar and random display name
        const avatarId = '307ce493-b254-4b2d-8ba4-d12c080d6651.jpg';
        const randomDisplayName = getRandomDisplayName();
        user = {
            _id: userData._id,
            provider: userData.provider,
            email: userData.email,
            name: userData.name,
            isAdmin: false,
            displayName: randomDisplayName,
            avatarKey: avatarId,
            postVotes: [],
            isBlocked: false,
        };
        if (!await saveUser(user)) {
            res.status(500).json({error: 'Saving user failed!'});
            return;
        }
    }
    req.session.userId = user._id;
    console.log(req.session.loginReturnUrl);
    const returnUrl = (req.session.loginReturnUrl ?? '/') as string;
    console.log(`returnUrl=${returnUrl}`);
    res.redirect(process.env.AUTH_RETURN_URL + returnUrl);
}

export default loginRouter;
