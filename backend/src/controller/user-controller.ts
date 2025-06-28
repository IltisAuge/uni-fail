import NodeCache from 'node-cache';
import {DisplayNamesModel, UserModel} from '../schemata/schemata';
import {IUser} from '../user.interface';

const userCache = new NodeCache();
let availableDisplayNames: string[] = [];

export async function loadAvailableDisplayNames(): Promise<string[]> {
    const doc = await DisplayNamesModel.findOne({_id: 0});
    if (!doc) {
        await DisplayNamesModel.create({ _id: 0, names: [] });
        return [];
    }
    availableDisplayNames = doc.names;
    return availableDisplayNames;
}

export async function addAvailableDisplayName(displayName: string): Promise<void> {
    await DisplayNamesModel.updateOne(
        { _id: 0 },
        { $addToSet: { names: displayName } },
    );
}

export async function removeAvailableDisplayName(displayName: string): Promise<void> {
    await DisplayNamesModel.updateOne(
        { _id: 0 },
        { $pull: { names: displayName } },
    );
}

export function getRandomDisplayName(): string {
    if (availableDisplayNames.length === 0) {
        throw new Error('No display names are available!');
    }
    const randomIndex = Math.floor(Math.random() * availableDisplayNames.length);
    return availableDisplayNames[randomIndex];
}

export async function isDisplayNameAvailable(displayName: string): Promise<boolean> {
    const includes = availableDisplayNames.includes(displayName);
    const existsUser = !!await UserModel.findOne({displayName});
    console.log(`includes=${  includes}`);
    console.log(`existsUser=${  existsUser}`);
    return !includes && !existsUser;
}

export async function saveUser(userData: IUser) {
    userCache.set(userData._id, userData);
    const data = { ...userData };
    const res = await UserModel.findOneAndUpdate(
        {_id: data._id},
        {$set: data},
        {
            upsert: true,
            new: true,  // return new/updated document
            setDefaultsOnInsert: true,
        },
    );
    console.log(res);
    return res;
}

export async function getUser(userId: string): Promise<IUser | undefined> {
    const cachedUser = userCache.get(userId) as IUser | undefined;
    if (cachedUser) {
        return cachedUser;
    }
    const user = await UserModel.findOne({ _id: userId }).exec();
    if (user) {
        userCache.set(userId, user);
        return user;
    }
    return undefined;
}

async function updateUserField(userId: string, field: string, value: any) {
    const cachedUser = userCache.get(userId) as IUser | undefined;
    if (cachedUser) {
        cachedUser[field] = value;
        userCache.set(userId, cachedUser);
        console.log('new cached user: ', cachedUser);
    }
    return UserModel.findOneAndUpdate(
        {_id: userId},
        {$set: {[field]: value}},
        {
            upsert: true,
            new: true,  // return new/updated document
            setDefaultsOnInsert: true,
        },
    );
}

export async function setDisplayName( _id: string, displayName: string) {
    return await updateUserField(_id, 'displayName', displayName);
}

export async function setAvatarKey( _id: string, avatarKey: string) {
    return await updateUserField(_id, 'avatarKey', avatarKey);
}

export async function setAdmin(_id: string, status: boolean) {
    return await updateUserField(_id, 'isAdmin', status);
}

export async function setBlocked(_id: string, status: boolean) {
    return await updateUserField(_id, 'isBlocked', status);
}
