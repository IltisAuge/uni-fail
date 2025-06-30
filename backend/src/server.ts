import {connect} from 'mongoose';
import server from './express-app';

console.log(`Connecting to MongoDB '${process.env.DB_HOST}:${process.env.DB_PORT}'...`);
connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {
    auth: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },
    authSource: process.env.DB_AUTH_SOURCE,
}).then((result) => {
    if (result) {
        console.log('Successfully connected to MongoDB');
    }
    return result;
}).catch((error) => {
    console.error('An error occurred while trying to connect to MongoDB:', error);
});

// Start express app
server.listen(5010, () => {
    console.log(`Starting in ${process.env.PRODUCTION === 'true' ? 'PRODUCTION':'DEVELOPMENT'} mode`);
    console.log('Server listening on port 5010');
});

export const viteNodeApp = server;
