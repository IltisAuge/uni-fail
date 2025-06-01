import {Db, MongoClient} from 'mongodb';

export class Database {

	client: MongoClient;
	databaseName: string;
	database: Db | undefined;

	constructor(databaseName: string) {
		this.databaseName = databaseName;
		this.client = new MongoClient("mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT, {
			auth: {
				username: process.env.DB_USER,
				password: process.env.DB_PASSWORD
			}
		});
	}

	connect() {
		this.client.connect().then(resp => {
			console.log("Connected to MongoDB");
			this.database = resp.db(this.databaseName);
		});
	}

	getCollection(collectionName: string) {
		if (this.database == undefined) {
			throw new Error("MongoDB database doesn't exist");
		}
		return this.database.collection(collectionName);
	}
}


