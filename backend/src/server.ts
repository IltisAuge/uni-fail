import {connect} from 'mongoose';
import server from './express-app';
import dotenv from 'dotenv';

dotenv.config();

if (process.env.USE_DB === 'true') {
    console.log("Connecting to MongoDB...")
    connect('mongodb://' + process.env.DB_HOST + ':' + process.env.DB_PORT, {
        auth: {
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        }
    }).then(result => {
        if (result) {
            console.log('Successfully connected to MongoDB');
        }
    }).catch(err => {
        console.error(err);
    });
} else {
    console.log("Skip connecting to MongoDB because of 'USE_DB' flag in .env file...")
}


// Start express app
server.listen(5010, () => {
	console.log("Starting in " + (process.env.PRODUCTION === 'true' ? 'PRODUCTION':'DEVELOPMENT') + " mode");
	console.log('Server listening on port 5010');
});
