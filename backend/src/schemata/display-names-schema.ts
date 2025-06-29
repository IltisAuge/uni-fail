import {model, Schema} from 'mongoose';

const DisplayNamesSchema = new Schema({
    _id: Number,
    names: {
        type: [String],
        default: [],
    },
});

export const DisplayNamesModel = model('DisplayNames', DisplayNamesSchema);
