export interface User {
    _id: string;
    provider: string;
    email: string;
    name: string;
    isAdmin: boolean;
    displayName: string;
    avatarKey: string;
    isBlocked: boolean;
    postVotes: string[];
    [key: string]: any;
}
export type UserDocument = User & Document;
