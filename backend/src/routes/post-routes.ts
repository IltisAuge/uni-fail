import {Router} from 'express';
import {PostController} from '../controller/post-controller';
import {PostModel, UserModel} from '../schemata/schemata';

const postRouter = Router();
const postController = new PostController();

postRouter.use((req, res, next) => {
    if (req.path !== '/get' && !req.session.user) {
		res.status(401).send();
	}
	next();
});

postRouter.use('/get', (req, res) => {
    const filter = req.query.filter;
    const max = req.query.max as unknown as number;
    switch (filter) {
        case 'newest':
            postController.getNewestPosts(max)
                .then(result => res.status(200).json(result));
            break;
        default:
            res.status(400).send("Unknown filter option '" + filter + "'");
            break;
    }
});

postRouter.post('/create', (req, res) => {
    const content = req.body.content;
	const tags = req.body.tags;
	const user = req.session.user!;
	console.log(content);
	console.log(tags);
	postController.createPost(user._id, content, tags).then(result => {
		res.status(200).json(result);
	}).catch(error => {
		res.status(500).send(error);
	});
});

postRouter.delete('/delete/:id', async (req, res) => {
	const postId = req.params.id;
	const user = req.session.user!;
	const fullUser = await UserModel.findById(user._id);
	if (!fullUser) {
		res.status(404).send("User not found!");
		return;
	}
	const post = await PostModel.findById(postId);
	if (!post) {
		res.status(404).send("Post with id '" + postId + "' not found");
		return;
	}
	if (post.userId !== user._id && !fullUser.isAdmin) {
		res.status(403).send("No permission to delete this post");
	}
	post.deleteOne().then(result => {
		res.status(result ? 200 : 500).send();
	});
});

export default postRouter;
