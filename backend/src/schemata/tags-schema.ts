import {model, Schema} from 'mongoose';

const TagsSchema = new Schema({
    _id: Number,
    tags: {
        type: [String],
        default: [],
    },
});

export const TagsModel = model('Tags', TagsSchema);
