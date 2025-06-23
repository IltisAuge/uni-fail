import {Router} from 'express';
import {createPost, deletePost, getNewestPosts, getPost} from '../controller/post-controller';
import {getUser} from '../controller/user-controller';

const postRouter = Router();

postRouter.use((req, res, next) => {
    if (req.path !== '/get' && !req.session.userId) {
		res.status(401).send();
	}
	next();
});

postRouter.use('/get', (req, res) => {
    const filter = req.query.filter;
    const max = req.query.max as unknown as number;
    switch (filter) {
        case 'newest':
            getNewestPosts(max)
                .then(result => res.status(200).json(result));
            break;
        default:
            res.status(400).send("Unknown filter option '" + filter + "'");
            break;
    }
});

postRouter.post('/create', async (req, res) => {
    console.log(req.body);
    const title = req.body.title;
    const content = req.body.content;
	const tags = req.body.tags;
	const userId = req.session.userId!;
    const user = await getUser(userId);
    if (!user) {
        res.status(404).send("User not found!");
        return;
    }
	console.log(content);
	console.log(tags);
	createPost(userId, title, content, tags).then(result => {
		res.status(200).json(result);
	}).catch(error => {
		res.status(500).send(error);
	});
});

postRouter.delete('/delete/:id', async (req, res) => {
	const postId = req.params.id;
    const userId = req.session.userId!;
    const user = await getUser(userId);
	if (!user) {
		res.status(404).send("User not found!");
		return;
	}
	const post = await getPost(postId);
	if (!post) {
		res.status(404).send("Post with id '" + postId + "' not found");
		return;
	}
	if (post.userId !== userId && !user.isAdmin) {
		res.status(403).send("No permission to delete this post");
	}
    deletePost(postId).then(result => {
		res.status(result.acknowledged ? 200 : 500).send();
	});
});

export default postRouter;
