import {DisplayNamesModel, UserModel} from '../schemata/schemata';

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
        { $addToSet: { names: displayName } }
    );
}

export async function removeAvailableDisplayName(displayName: string): Promise<void> {
    await DisplayNamesModel.updateOne(
        { _id: 0 },
        { $pull: { names: displayName } }
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
    const existsUser = !!await UserModel.findOne({displayName: displayName});
    console.log("includes=" + includes);
    console.log("existsUser=" + existsUser);
    return !includes && !existsUser;
}

export async function saveUser(userData: { _id: string, provider: string, name: string, email: string, displayName: string, avatarKey: string }): Promise<any> {
    const res = await UserModel.findOneAndUpdate(
        {_id: userData._id},
        {$set: userData},
        {
            upsert: true,
            new: true,  // return new/updated document
            setDefaultsOnInsert: true
        }
    );
    console.log(res);
    return res;
}

export async function setDisplayName( _id: string, displayName: string): Promise<any> {
    const res = await UserModel.findOneAndUpdate(
        {_id: _id},
        {$set: {displayName: displayName}},
        {
            upsert: true,
            new: true,  // return new/updated document
            setDefaultsOnInsert: true
        }
    );
    console.log(res);
    return res;
}

export async function setAvatarKey( _id: string, avatarKey: string): Promise<any> {
    const res = await UserModel.findOneAndUpdate(
        {_id: _id},
        {$set: {avatarKey: avatarKey}},
        {
            upsert: true,
            new: true,  // return new/updated document
            setDefaultsOnInsert: true
        }
    );
    console.log(res);
    return res;
}

export async function setAdmin(_id: string, status: boolean) {
    return UserModel.findOneAndUpdate(
        {_id: _id},
        {$set: {isAdmin: status}},
        {
            new: true,  // return new/updated document
            setDefaultsOnInsert: true
        }
    )
}
