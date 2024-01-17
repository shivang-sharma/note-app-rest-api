import { Logger } from "../../../../util/Logger";
import {
    CreateAccess,
    CreateNote,
    FindAccessById,
    FindAccessByUserIdAndNoteId,
    FindNoteAndDeleteByNoteIdAndOwnerId,
    FindNoteAndUpdateByNoteIdAndOwnerId,
    FindNoteById,
    FindNoteByIdAndOwnerId,
    FindNoteByTitle,
    FindNoteIdsFromAccessByUserId,
    FindNotesByNoteIdIn,
    FindNotesByOwnerId,
    FindOneUserByUsernameOrEmail,
} from "../../../../db";
import type { INote } from "../../../../db/model/INote";
import { ApiError } from "../../../../util/ApiError";
import { StatusCodes } from "http-status-codes";

export class NotesService {
    #logger = new Logger("API-SERVICE", "NotesService.ts");
    constructor() {}

    async getAllNotesService(userId: string) {
        try {
            const result: AllNotesServiceResult = {
                ownedNotes: [],
                sharedWithMe: [],
            };

            const ownedNotes = await FindNotesByOwnerId(userId);
            const sharedWithMe = await FindNoteIdsFromAccessByUserId(userId);
            const sharedWithMeNoteId = sharedWithMe.map(
                (access) => access.note
            );
            const sharedWithMeNote =
                await FindNotesByNoteIdIn(sharedWithMeNoteId);
            result.ownedNotes = ownedNotes;
            result.sharedWithMe = sharedWithMeNote;
            return result;
        } catch (error) {
            throw new ApiError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Something went wrong",
                [],
                `Name: ${(error as Error).name}
                 Message: ${(error as Error).message} 
                 Cause: ${(error as Error).cause}
                 Stack: ${(error as Error).stack}`
            );
        }
    }
    async getNoteService(userId: string, noteId: string) {
        try {
            const result: NoteServiceResult = {
                note: null,
            };
            const sharedWithMe = await FindAccessByUserIdAndNoteId(
                userId,
                noteId
            );
            if (sharedWithMe != null) {
                const note = await FindNoteById(noteId);
                if (note != null) {
                    result.note = note;
                }
            } else {
                const note = await FindNoteByIdAndOwnerId(noteId, userId);
                if (note != null) {
                    result.note = note;
                }
            }
            return result;
        } catch (error) {
            throw new ApiError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Something went wrong",
                [],
                `Name: ${(error as Error).name}
                 Message: ${(error as Error).message} 
                 Cause: ${(error as Error).cause}
                 Stack: ${(error as Error).stack}`
            );
        }
    }
    async createNoteService(userId: string, title: string, note: string) {
        try {
            const result: CreateNoteServiceResult = {
                exist: false,
                failed: false,
                note: null,
            };
            const existedNote = await FindNoteByTitle(title);
            if (existedNote != null) {
                result.exist = true;
                return result;
            }
            const obj = await CreateNote(title, userId, note);
            const createdNote = await FindNoteById(obj._id.toString());
            if (!createdNote) {
                result.failed = true;
                return result;
            }
            result.note = createdNote;
            return result;
        } catch (error) {
            throw new ApiError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Something went wrong",
                [],
                `Name: ${(error as Error).name}
                 Message: ${(error as Error).message} 
                 Cause: ${(error as Error).cause}
                 Stack: ${(error as Error).stack}`
            );
        }
    }
    async updateNoteService(
        noteId: string,
        title: string,
        note: string,
        userId: string
    ) {
        try {
            const result: UpdateNoteServiceResult = {
                exists: false,
                updatedNote: null,
                doesNotExists: false,
            };

            const existedNote = await FindNoteByTitle(title);
            if (existedNote)
                if (existedNote._id.toString() !== noteId) {
                    result.exists = true;
                    return result;
                }

            const updatedNote = await FindNoteAndUpdateByNoteIdAndOwnerId(
                noteId,
                userId,
                title,
                note
            );
            if (!updatedNote) {
                result.doesNotExists = true;
                return result;
            }
            result.updatedNote = updatedNote;
            return result;
        } catch (error) {
            throw new ApiError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Something went wrong",
                [],
                `Name: ${(error as Error).name}
                 Message: ${(error as Error).message} 
                 Cause: ${(error as Error).cause}
                 Stack: ${(error as Error).stack}`
            );
        }
    }
    async deleteNoteService(userId: string, noteId: string) {
        const result: DeleteNoteServiceResult = {
            failed: false,
            deletedNote: null,
        };
        try {
            const note = await FindNoteAndDeleteByNoteIdAndOwnerId(
                noteId,
                userId
            );
            if (note) {
                result.deletedNote = note;
                return result;
            }
            result.failed = true;
            return result;
        } catch (error) {
            throw new ApiError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Something went wrong",
                [],
                `Name: ${(error as Error).name}
                 Message: ${(error as Error).message} 
                 Cause: ${(error as Error).cause}
                 Stack: ${(error as Error).stack}`
            );
        }
    }
    async shareNoteService(
        userId: string,
        noteId: string,
        email: string | null,
        username: string | null
    ) {
        try {
            const result: ShareNoteServiceResult = {
                notAuthorized: false,
                noteDoesNotExists: false,
                toBeSharedWithUserNotExists: false,
                failed: false,
            };
            const note = await FindNoteById(noteId);
            if (!note) {
                this.#logger.debug(`Note does not exists noteId: ${noteId}`);
                result.noteDoesNotExists = true;
                return result;
            } else if (note.owner.toString() != userId) {
                this.#logger.debug(
                    `NOTE OWNER: ${typeof note.owner} and USER ID: ${userId}`
                );
                result.notAuthorized = true;
                return result;
            }
            const toBeSharedWithUser = await FindOneUserByUsernameOrEmail(
                username ? username : "",
                email ? email : ""
            );
            if (toBeSharedWithUser === null) {
                this.#logger.debug(
                    `User does not exists for email:${email} or username: ${username}`
                );
                result.toBeSharedWithUserNotExists = true;
                return result;
            }
            const access = await CreateAccess(note._id, toBeSharedWithUser._id);
            const grantedAccess = await FindAccessById(access._id);
            if (!grantedAccess) {
                result.failed = true;
                return result;
            }
            return result;
        } catch (error) {
            throw new ApiError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Something went wrong",
                [],
                `Name: ${(error as Error).name}
                 Message: ${(error as Error).message} 
                 Cause: ${(error as Error).cause}
                 Stack: ${(error as Error).stack}`
            );
        }
    }
}

type AllNotesServiceResult = {
    ownedNotes: INote[];
    sharedWithMe: INote[];
};

type NoteServiceResult = {
    note: INote | null;
};

type CreateNoteServiceResult = {
    exist: boolean;
    failed: boolean;
    note: INote | null;
};
type UpdateNoteServiceResult = {
    exists: boolean;
    updatedNote: INote | null;
    doesNotExists: boolean;
};
type DeleteNoteServiceResult = {
    failed: boolean;
    deletedNote: INote | null;
};
type ShareNoteServiceResult = {
    notAuthorized: boolean;
    noteDoesNotExists: boolean;
    toBeSharedWithUserNotExists: boolean;
    failed: boolean;
};
