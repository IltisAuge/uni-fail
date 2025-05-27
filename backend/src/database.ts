import { MongoClient } from 'mongodb';

export class Database {

	connect() {
		const client = new MongoClient("mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT, {
			auth: {
				username: process.env.DB_USER,
				password: process.env.DB_PASSWORD
			}
		});
		client.connect().then(r => console.log("Connected to MongoDB"));
	}
}


