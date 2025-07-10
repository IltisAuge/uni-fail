import mongoose from 'mongoose';
import {MongoMemoryServer} from 'mongodb-memory-server';
import supertestSession from 'supertest-session';
import {afterAll, beforeAll, beforeEach, describe, expect, it} from 'vitest';
import server from '../express-app';

let mongoServer: MongoMemoryServer;
let csrfTokenA: string = '';
let sessionA: any;
let csrfTokenB: string = '';
let sessionB: any;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    sessionA = supertestSession(server);
    sessionB = supertestSession(server);
});

async function loginUser(session: any, username: string, isAdmin = false, isBlocked = false) {
    await session.get(`/login/mock?username=${username}&isAdmin=${isAdmin}&isBlocked=${isBlocked}`).expect(200);
    return getCSRFToken(session);
}

async function getCSRFToken(session: any): Promise<string> {
    const resp = await session.get('/csrf-token');
    return resp.body.token;
}

async function httpPost(session: any, endpoint: string, csrfToken: string, data = {}) {
    return session
        .post(endpoint)
        .set('Content-Type', 'application/json')
        .set('X-CSRF-TOKEN', csrfToken)
        .send(data);
}

async function httpDelete(session: any, endpoint: string, csrfToken: string) {
    return session
        .delete(endpoint)
        .set('Content-Type', 'application/json')
        .set('X-CSRF-TOKEN', csrfToken)
        .send();
}

function getTestPostData() {
    return {
        title: 'Titel des Posts',
        content: 'Mein Test Post',
        tags: ['tag1', 'tag2'],
    };
}

async function createTestPost(session: any, csrfToken: string): Promise<string> {
    const postData = getTestPostData();
    const response = await httpPost(session, '/post/create', csrfToken, postData);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('post');
    expect(response.body.post).toHaveProperty('_id');
    expect(response.body.post).toHaveProperty('userId');
    expect(response.body.post).toHaveProperty('content');
    expect(response.body.post).toHaveProperty('tags');
    expect(response.body.post.content).toEqual(postData.content);
    expect(response.body.post.tags).toEqual(postData.tags);
    return response.body.post._id;
}

describe('Test post actions without CSRF-Token / authentication', () => {

    beforeEach(async () => {
        sessionA = supertestSession(server);
        sessionB = supertestSession(server);
    });

    it('should try to create a post without CSRF-Token and fail with code 403', async () => {
        const postData = {
            content: 'Mein Test Post',
            tags: ['tag1', 'tag2'],
        };
        const response = await httpPost(sessionA, '/post/create', '', postData);
        expect(response.status).toBe(403);
    });

    it('should try to delete a post without CSRF-Token and fail with code 403', async () => {
        // Create test post with userA
        csrfTokenA = await loginUser(sessionA, 'userA');
        const postId = await createTestPost(sessionA, csrfTokenA);
        // Try to delete post with userA but without CSRF-Token
        const response = await httpDelete(sessionA, `/post/delete/${postId}`, '');
        expect(response.status).toBe(403);
    });

    it('should try to create a post without authentication and fail with code 401', async () => {
        // sessionA is unauthenticated because beforeEach() creates a new session
        csrfTokenA = await getCSRFToken(sessionA);
        const postData = getTestPostData();
        const response = await httpPost(sessionA, '/post/create', csrfTokenA, postData);
        expect(response.status).toBe(401);
    });
});

describe('Test post creation and deletion WITHOUT admin permissions', () => {

    it('should create a post with authentication and succeed with code 200', async () => {
        csrfTokenA = await loginUser(sessionA, 'userA');
        await createTestPost(sessionA, csrfTokenA);
    });

    it('should fail to delete post not owned by userB', async () => {
        // Create test post with userA
        csrfTokenA = await loginUser(sessionA, 'userA');
        const postId = await createTestPost(sessionA, csrfTokenA);
        // Login userB and try to delete post created by userA
        csrfTokenB = await loginUser(sessionB, 'userB');
        const response = await httpDelete(sessionB, `/post/delete/${postId}`, csrfTokenB);
        expect(response.status).toBe(403);
    });

    it('should fail to create post when user is blocked', async () => {
        csrfTokenA = await loginUser(sessionA, 'userA', false, true);
        const postData = getTestPostData();
        const response = await httpPost(sessionA, '/post/create', csrfTokenA, postData);
        expect(response.status).toBe(403);
    });

    it('should delete the post created by userA and succeed with code 200', async () => {
        // Create test post with userA
        csrfTokenA = await loginUser(sessionA, 'userA');
        const postId = await createTestPost(sessionA, csrfTokenA);
        // Try to delete post with userA
        const response = await httpDelete(sessionA, `/post/delete/${postId}`, csrfTokenA);
        expect(response.status).toBe(200);
    });
});

describe('Test creation and deletion of posts with admin permissions', () => {

    it('userB should delete a post not created by userB as an admin and succeed with code 200', async () => {
        csrfTokenA = await loginUser(sessionA, 'userA');
        const postId = await createTestPost(sessionA, csrfTokenA);
        csrfTokenB = await loginUser(sessionB, 'userB', true);
        const response = await httpDelete(sessionB, `/post/delete/${postId}`, csrfTokenB);
        expect(response.status).toBe(200);
    });
});


