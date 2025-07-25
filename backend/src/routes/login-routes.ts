import {Router} from 'express';
import dotenv from 'dotenv';
import {getRandomDisplayName, getUser, saveUser} from '@/controllers/user-controller';
import {GoogleLoginController} from '@/login-providers/google-login';
import {MicrosoftLoginController} from '@/login-providers/microsoft-login';
import {UserData} from '@/interfaces/userdata.interface';

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
    let url = loginController.getAuthURL();
    const state = crypto.randomUUID().toString();
    const nonce = crypto.randomUUID().toString();
    // Replace security parameters for Microsoft
    url = url.replace('{state}', state).replace('{nonce}', nonce);
    req.session.oAuthState = state;
    req.session.oAuthNonce = nonce;
    req.session.loginReturnUrl = loginReturnUrl;
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
            console.error('An error occurred while getting user data from google login controllers:', error);
        });
});

loginRouter.get('/microsoft-auth-return', (req, res) => {
    const authCode = req.query.code as string;
    if (authCode == undefined) {
        res.send('No authCode');
        return;
    }
    if (authCode.constructor !== String) {
        res.send('authCode is not a string');
        return;
    }

    const state = req.query.state;
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
    console.info('Enabled /login/mock endpoint');
    loginRouter.get('/mock', async (req, res) => {
        const username = req.query.username as string;
        const isAdmin = req.query.isAdmin as string;
        const isBlocked = req.query.isBlocked as string;
        const userData = {
            _id: crypto.randomUUID().toString(),
            provider: 'Mock Provider',
            email: `${username}@mail.com`,
            name: username,
            isAdmin: isAdmin === 'true',
            displayName: `${username} Displayname`,
            avatarKey: 'default.png',
            votedPosts: [],
            isBlocked: isBlocked === 'true',
        };
        const user = await saveUser(userData);
        req.session.userId = userData._id;
        res.status(200).json({user});
    });
} else {
    console.info('/login/mock endpoint not enabled');
}

async function completeAuthentication(userData: UserData, req: any, res: any) {
    let user = await getUser(userData._id);
    if (!user) {
        // User does not yet exist in the database
        // Set default avatar and random display name
        const avatarId = 'default.png';
        const randomDisplayName = getRandomDisplayName();
        user = {
            _id: userData._id,
            provider: userData.provider,
            email: userData.email,
            name: userData.name,
            isAdmin: false,
            displayName: randomDisplayName,
            avatarKey: avatarId,
            votedPosts: [],
            isBlocked: false,
        };
        if (!await saveUser(user)) {
            res.status(500).json({error: 'Saving user failed!'});
            return;
        }
    }
    req.session.userId = user._id;
    const returnUrl = (req.session.loginReturnUrl ?? '/') as string;
    res.redirect(process.env.AUTH_RETURN_URL + returnUrl);
}

export default loginRouter;
