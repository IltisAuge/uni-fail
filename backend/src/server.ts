import {connect} from 'mongoose';
import server from './express-app';
import {downloadAllAvatars} from '@/s3';
import {loadDisplayNames} from '@/controllers/user-controller';

console.info(`Connecting to MongoDB '${process.env.DB_HOST}:${process.env.DB_PORT}'...`);
connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {
    auth: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },
    authSource: process.env.DB_AUTH_SOURCE,
}).then((result) => {
    if (result) {
        console.info('Successfully connected to MongoDB');
    }
    return result;
}).catch((error) => {
    console.error('An error occurred while trying to connect to MongoDB:', error);
});

// Start express app
const serverProcess = server.listen(5010, () => {
    console.info(`Starting in ${process.env.PRODUCTION === 'true' ? 'PRODUCTION':'DEVELOPMENT'} mode`);
    console.info('Server listening on port 5010');
});

process.on('SIGINT', () => {
    console.info('Shutting down express server...');
    serverProcess.close(() => {
        process.exit(0);
    });
});

downloadAllAvatars().then(() => {
    console.info('Downloaded all avatar files');
    return;
}).catch((error) => {
    console.error('An error occurred while downloading avatars:', error);
});
loadDisplayNames().then((displayNames) => {
    console.info('Loaded all available display names');
    return displayNames;
}).catch((error) => {
    console.error('An error occurred while loading available display names:', error);
});

export const viteNodeApp = server;
