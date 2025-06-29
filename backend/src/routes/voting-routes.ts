import {Router} from 'express';
import {addVotedPost, getUser} from '@/controller/user-controller';
import {addVote} from '@/controller/post-controller';

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
    if (user.postVotes && user.postVotes.includes(postId)) {
        res.status(400).json({error: 'Already voted for this post'});
        return;
    }
    addVote(postId).then((post) => {
        if (post) {
            addVotedPost(userId, postId);
            res.status(200).json({post});
            return;
        }
        throw Error('Post document is undefined');
    }).catch((error) => {
        console.error('An error occurred while adding vote to post:', error);
        res.status(500).send('An error occurred while adding vote to post');
    });
});

export default votingRouter;
