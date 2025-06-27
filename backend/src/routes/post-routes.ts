import {Router, Request, Response} from 'express';
import {createPost, deletePost, getNewestPosts, getPost} from '../controller/post-controller';
import {getUser} from '../controller/user-controller';

const postRouter = Router();

postRouter.use((req, res, next) => {
    const isPublic = req.method === 'GET' &&
        (req.path === '/get' || /^\/[^\/]+$/.test(req.path));

    if (!isPublic && !req.session.userId) {
        res.status(401).send("Unauthorized:Authentification required.");
    }

    next();
});


postRouter.get('/get', (req, res) => {
    const filter = req.query.filter;
    const max = req.query.max as unknown as number;
    switch (filter) {
        case 'newest':
            getNewestPosts(max)
                .then(result => res.status(200).json(result));
            break;
        default:
            res.status(400).json("Unknown filter option '" + filter + "'");
            break;
    }
});

/*get*/
postRouter.get('/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await getPost(postId);
        if (!post) {
            res.status(404).json({message: "No post with id " + postId});
        }
        res.status(200).json(post);
    } catch (err) {
        console.error('Error getting post with ID', err);
        res.status(500).send({message: 'Servererror getting post'});
    }
});

postRouter.post('/create', async (req, res) => {
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
