import mongoose from 'mongoose';
import {MongoMemoryServer} from 'mongodb-memory-server';
import supertestSession from 'supertest-session';
import type { SuperTest, Test } from 'supertest';
import server from '../express-app';

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

describe('Test /post/* endpoints', () => {
    let testSession: SuperTest<Test>;

    beforeEach(() => {
        testSession = supertestSession(server);
    });


    it('should create a post without authentication and fail with code 401', async () => {
        const postData = {
            content: 'Mein Test Post',
            tags: ['tag1', 'tag2'],
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
    });

    let testPostId: string = '';
    it('should create a post with authentication and succeed with code 200', async () => {
        const postData = {
            content: 'Mein Test Post',
            tags: ['tag1', 'tag2'],
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
        testPostId = response.body._id;
    });

    it('should delete the post previously created and succeed with code 200', async () => {
        await testSession
            .get('/login/mock?admin=false')
            .expect(302);
        await testSession.delete(`/post/delete/${testPostId}`)
            .send().expect(200);
    });

    it('should delete a post not created by the mocked user and fail with code 401', async () => {
        await testSession
            .get('/login/mock?admin=false')
            .expect(302);
        console.log('mocked admin=false');
        await testSession.delete('/post/delete/000000000')
            .send().expect(403);
    });

    it('should delete a post not created by the mocked user as an admin and succeed with code 200', async () => {
        await testSession
            .get('/login/mock?admin=true')
            .expect(302);
        await testSession.delete('/post/delete/000000000')
            .send().expect(200);
    });
});


