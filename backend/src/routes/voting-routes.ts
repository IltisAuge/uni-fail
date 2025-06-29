import {Router} from 'express';
import {addVotedPost, getUser, removeVotedPost} from '@/controller/user-controller';
import {addVote, removeVote} from '@/controller/post-controller';

const votingRouter = Router();

votingRouter.use((req, res, next) => {
    if (!req.session.userId) {
        res.status(401).send();
        return;
    }
    next();
});

votingRouter.post('/add', async (req, res) => {
    const postId = req.body.postId as string;
    if (!postId) {
        res.status(400).json({error: 'No postId'});
        return;
    }
    const userId = req.session.userId!;
    const user = await getUser(userId);
    if (!user) {
        res.status(404).json({error: 'User not found'});
        return;
    }
    if (user.votedPosts && user.votedPosts.includes(postId)) {
        res.status(400).json({error: 'Already voted for this post'});
        return;
    }
    addVote(postId).then(async (post) => {
        console.log('addVote.then post=',post);
        if (post) {
            const user = await addVotedPost(userId, postId);
            res.status(200).json({post, user: (user?.toJSON())});
            return;
        }
        throw Error('Post document is undefined');
    }).catch((error) => {
        console.error('An error occurred while adding vote to post:', error);
        res.status(500).send('An error occurred while adding vote to post');
    });
});

votingRouter.post('/remove', async (req, res) => {
    const postId = req.body.postId as string;
    if (!postId) {
        res.status(400).json({error: 'No postId'});
        return;
    }
    const userId = req.session.userId!;
    const user = await getUser(userId);
    if (!user) {
        res.status(404).json({error: 'User not found'});
        return;
    }
    if (user.votedPosts && !user.votedPosts.includes(postId)) {
        res.status(400).json({error: 'Not voted for this post'});
        return;
    }
    removeVote(postId).then(async (post) => {
        if (post) {
            const user = await removeVotedPost(userId, postId);
            res.status(200).json({post, user: (user?.toJSON())});
            return;
        }
        throw Error('Post document is undefined');
    }).catch((error) => {
        console.error('An error occurred while removing vote to post:', error);
        res.status(500).send('An error occurred while removing vote to post');
    });
});

export default votingRouter;
