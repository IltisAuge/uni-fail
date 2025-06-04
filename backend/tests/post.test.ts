import mongoose from 'mongoose';
import {MongoMemoryServer} from 'mongodb-memory-server';
import server from '../src/express-app';
import supertestSession from 'supertest-session';
import type { SuperTest, Test } from 'supertest';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	const uri = mongoServer.getUri();
	await mongoose.connect(uri);
});

afterAll(async () => {
	await mongoose.disconnect();
	await mongoServer.stop();
});

describe('POST /post/create', () => {
    let testSession: SuperTest<Test>;

    beforeEach(() => {
        testSession = supertestSession(server);
    });


    it('should create a post without authentication and fail with code 401', async () => {
        const postData = {
            content: 'Mein Test Post',
            tags: ['tag1', 'tag2']
        };
        const response = await testSession
            .post('/post/create')
            .set('Content-Type', 'application/json')
            .send(postData);
        expect(response.status).toBe(401);
    });

    it('should create a mocked session with user attribute', async () => {
        await testSession
            .get('/login/mock?admin=false')
            .expect(302);
    })

	it('should create a post with authentication and succeed with code 200', async () => {
		const postData = {
			content: 'Mein Test Post',
			tags: ['tag1', 'tag2']
		};
        await testSession
            .get('/login/mock?admin=false')
            .expect(302);
		const response = await testSession
			.post('/post/create')
			.set('Content-Type', 'application/json')
            .send(postData);
        expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('userId');
        expect(response.body).toHaveProperty('content');
        expect(response.body).toHaveProperty('tags');
        expect(response.body.content).toEqual(postData.content);
        expect(response.body.tags).toEqual(postData.tags);
	});
});

describe('DELETE /post/delete/:id', () => {
	/*it('should delete a post if user is owner or admin', async () => {
		// Schritt 1: Post erstellen
		const created = await request(server)
			.post('/post/create')
			.send({ content: 'zum löschen', tags: ['x'] });

		const postId = created.body._id;

		// Schritt 2: Post löschen
		const response = await request(server)
			.delete(`/post/delete/${postId}`);

		expect(response.status).toBe(200);
	});*/
});


