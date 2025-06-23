import {Router} from 'express';
import {TagsModel} from '../schemata/schemata';

const tagRouter = Router();

tagRouter.get('/get/all', async (req, res) => {
    const doc = await TagsModel.findOne({_id: 0});
    if (!doc) {
        await TagsModel.create({ _id: 0, names: [] });
        res.json({tags: []});
        return;
    }
    const allTags = doc.tags;
    res.json({tags: allTags});
});

export default tagRouter;
