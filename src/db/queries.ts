import mongoose from "mongoose";
import { Access, Note } from ".";
import { User } from "./schema/UserSchema";

export async function FindOneUserByUsernameOrEmail(
    username: string,
    email: string
) {
    const user = await User.findOne({
        $or: [{ username }, { email }],
    });
    return user;
}

export async function CreateNewUser(
    fullName: string,
    username: string,
    email: string,
    password: string
) {
    const user = await User.create({
        email: email,
        fullName: fullName,
        username: username.toLowerCase(),
        password: password,
    });
    return user;
}

export async function FindOneUserById(id: string) {
    const user = await User.findById(id).select("-password -refreshToken");
    return user;
}

export async function ExpireRefreshTokenById(id: string) {
    await User.findByIdAndUpdate(
        {
            _id: id,
        },
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );
}

export async function FindNotesByOwnerId(ownerId: string) {
    const notes = await Note.find({ owner: ownerId });
    return notes;
}
export async function FindNoteIdsFromAccessByUserId(userId: string) {
    const noteIds = await Access.find({
        user: new mongoose.Types.ObjectId(userId),
    }).select("-user -_id");
    return noteIds;
}

export async function FindNotesByNoteIdIn(
    noteIdArray: mongoose.Types.ObjectId[]
) {
    const notes = await Note.find({
        _id: { $in: noteIdArray },
    });
    return notes;
}

export async function FindAccessByUserIdAndNoteId(
    userId: string,
    noteId: string
) {
    const access = await Access.findOne({
        $and: [
            {
                user: new mongoose.Types.ObjectId(userId),
            },
            {
                note: new mongoose.Types.ObjectId(noteId),
            },
        ],
    });
    return access;
}
export async function FindAccessById(accessId: mongoose.Types.ObjectId) {
    const access = await Access.findById(accessId);
    return access;
}
export async function FindNoteById(noteId: string) {
    const note = await Note.findOne({
        _id: new mongoose.Types.ObjectId(noteId),
    });
    return note;
}
export async function FindNoteByIdAndOwnerId(noteId: string, ownerId: string) {
    const note = await Note.findOne({
        $and: [
            {
                owner: new mongoose.Types.ObjectId(ownerId),
            },
            {
                _id: new mongoose.Types.ObjectId(noteId),
            },
        ],
    });
    return note;
}
export async function FindNoteByTitle(title: string) {
    const note = await Note.findOne({
        title: title,
    });
    return note;
}

export async function CreateNote(title: string, ownerId: string, note: string) {
    const noteObject = await Note.create({
        note: note,
        owner: new mongoose.Types.ObjectId(ownerId),
        title: title,
    });
    return noteObject;
}
export async function FindNoteAndUpdateByNoteIdAndOwnerId(
    noteId: string,
    ownerId: string,
    title: string,
    note: string
) {
    const obj = await Note.findOneAndUpdate(
        {
            $and: [
                {
                    _id: new mongoose.Types.ObjectId(noteId),
                },
                {
                    owner: new mongoose.Types.ObjectId(ownerId),
                },
            ],
        },
        {
            title: title,
            note: note,
        }
    ).select("-owner");
    return obj;
}

export async function FindNoteAndDeleteByNoteIdAndOwnerId(
    noteId: string,
    ownerId: string
) {
    const note = await Note.findOneAndDelete({
        $and: [
            {
                owner: new mongoose.Types.ObjectId(ownerId),
            },
            {
                _id: new mongoose.Types.ObjectId(noteId),
            },
        ],
    }).select("-owner");
    return note;
}

export async function CreateAccess(
    noteId: mongoose.Types.ObjectId,
    toBeSharedWithUserId: mongoose.Types.ObjectId
) {
    const access = await Access.create({
        note: noteId,
        user: toBeSharedWithUserId,
    });
    return access;
}

export async function FindAccessByUserId(userId: string) {
    const access = await Access.find({
        user: new mongoose.Types.ObjectId(userId),
    });
    return access;
}

export async function SearchNotes(
    ownerId: string,
    hasAccessToNoteIds: mongoose.Types.ObjectId[],
    searchString: string
) {
    const searchResult = await Note.find(
        {
            $and: [
                {
                    $or: [
                        { owner: new mongoose.Types.ObjectId(ownerId) },
                        { _id: { $in: hasAccessToNoteIds } },
                    ],
                },
                {
                    $text: {
                        $search: searchString,
                    },
                },
            ],
        },
        {
            score: {
                $meta: "textScore",
            },
        }
    ).sort({
        score: {
            $meta: "textScore",
        },
    });
    return searchResult;
}
