export interface IPost {
    _id: string;
    title: string;
    content: string;
    userId: string;
    creationTime: string;
    tags: string[];
    upvotes: number;
}
export type IPostDocument = IPost & Document;
