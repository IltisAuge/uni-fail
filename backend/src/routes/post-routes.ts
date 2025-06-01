import {Router} from 'express';
import {PostController} from '../controller/post-controller';
import {PostModel, UserModel} from '../schemata/schemata';

const postRouter = Router();
const postController = new PostController();

postRouter.use((req, res, next) => {
	if (!req.session.user) {
		res.status(401).send();
	}
	next();
});

postRouter.post('/create', (req, res) => {
	const content = req.body.content;
	const tags = req.body.tags.split(',');
	const user = req.session.user!;
	console.log(content);
	console.log(tags);
	postController.createPost(user._id, content, tags).then(result => {
		res.status(200).json(result.content);
	}).catch(error => {
		res.status(500).send(error);
	});
});

postRouter.delete('/delete/:id', async (req, res) => {
	const id = req.params.id;
	const user = req.session.user!;
	const fullUser = await UserModel.findById(user._id);
	if (!fullUser) {
		res.status(404).send("User not found!");
		return;
	}
	const post = await PostModel.findById(id);
	if (!post) {
		res.status(404).send("Post with id '" + id + "' not found");
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
