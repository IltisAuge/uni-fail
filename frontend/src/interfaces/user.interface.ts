export interface User {
    _id: string;
    name: string;
    displayName: string;
    email: string;
    provider: string;
    avatarKey: string;
    isAdmin: boolean;
    isBlocked: boolean;
    votedPosts: string[];
}
