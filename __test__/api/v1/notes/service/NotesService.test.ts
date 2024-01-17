import { NotesService } from "../../../../../src/api/v1/notes/service/NotesService";
import { ApiError } from "../../../../../src/util/ApiError";
import { mockNotes, mockAccess } from "../../../../mockData.json";
jest.mock("../../../../../src/db/queries", () => {
    const originalModule = jest.requireActual("../../../../../src/db/queries");
    return {
        __esModule: true,
        ...originalModule,
        CreateAccess: jest
            .fn()
            .mockImplementation(
                (noteId: string, toBeSharedWithUserId: string) => {
                    mockAccess.push({
                        _id: `new${noteId}`,
                        note: noteId,
                        user: toBeSharedWithUserId,
                    });
                    return {
                        _id: `new${noteId}`,
                        note: noteId,
                        user: toBeSharedWithUserId,
                    };
                }
            ),
        CreateNote: jest
            .fn()
            .mockImplementation(
                (title: string, userId: string, note: string) => {
                    if (title.startsWith("exception")) {
                        throw new Error("Failed");
                    }
                    mockNotes.push({
                        _id: `new${title}`,
                        title: title,
                        owner: userId,
                        note: note,
                    });
                    return {
                        _id: `new${title}`,
                        title: title,
                        owner: userId,
                        note: note,
                    };
                }
            ),
        FindAccessById: jest.fn().mockImplementation((accessId) => {
            const access = mockAccess.find((a) => a._id === accessId);
            if (access && access.note.startsWith("share")) {
                return null;
            }
            return access;
        }),
        FindAccessByUserIdAndNoteId: jest
            .fn()
            .mockImplementation((userId: string, noteId: string) => {
                if (userId.startsWith("exception")) {
                    throw new Error("Failed");
                }
                const access = mockAccess.find(
                    (access) => access.note === noteId && access.user === userId
                );
                return access ? access : null;
            }),
        FindNoteAndDeleteByNoteIdAndOwnerId: jest
            .fn()
            .mockImplementation((noteId: string, userId: string) => {
                if (userId.startsWith("exception")) {
                    throw new Error("Fail");
                }
                return mockNotes.find(
                    (note) => note._id === noteId && note.owner === userId
                );
            }),
        FindNoteAndUpdateByNoteIdAndOwnerId: jest
            .fn()
            .mockImplementation(
                (
                    noteId: string,
                    userId: string,
                    title: string,
                    note: string
                ) => {
                    if (title.startsWith("exception")) {
                        throw new Error("Failed");
                    }
                    const mNote = mockNotes.find(
                        (mNote) =>
                            mNote._id === noteId && mNote.owner === userId
                    );
                    if (mNote) {
                        mNote.note = note;
                        mNote.title = title;
                        return mNote;
                    }
                    return null;
                }
            ),
        FindNoteById: jest.fn().mockImplementation((noteId: string) => {
            if (noteId.startsWith("exception")) {
                throw new Error("Fails");
            }
            const note = mockNotes.find((note) => note._id === noteId);
            if (note) {
                if (note.title.startsWith("fail")) {
                    return null;
                }
                return note;
            }
            return null;
        }),
        FindNoteByIdAndOwnerId: jest
            .fn()
            .mockImplementation((noteId: string, userId: string) => {
                const note = mockNotes.find(
                    (note) => note._id === noteId && note.owner === userId
                );
                return note ? note : null;
            }),
        FindNoteByTitle: jest.fn().mockImplementation((title: string) => {
            const note = mockNotes.find((note) => note.title === title);
            return note ? note : null;
        }),
        FindNoteIdsFromAccessByUserId: jest
            .fn()
            .mockImplementation((userId: string) => {
                return mockAccess.filter((access) => access.user === userId);
            }),
        FindNotesByNoteIdIn: jest
            .fn()
            .mockImplementation((notedIds: string[]) => {
                return mockNotes.filter((note) => notedIds.includes(note._id));
            }),
        FindNotesByOwnerId: jest.fn().mockImplementation((ownerId: string) => {
            if (ownerId.startsWith("exception")) {
                throw new Error("Failed");
            }
            return mockNotes.filter((note) => note.owner === ownerId);
        }),
        FindOneUserByUsernameOrEmail: jest
            .fn()
            .mockImplementation((username: string, email: string) => {
                const user = {
                    _id: "owner-3",
                    username: "existingUser",
                    fullName: "Existing User",
                    email: "existing@example.com",
                    password: "password",
                };
                return new Promise((resolve, reject) => {
                    if (
                        username.startsWith("exception") ||
                        email.startsWith("exception")
                    )
                        throw new Error("Failed");
                    if (
                        email.startsWith("tokenException") ||
                        username.startsWith("tokenException")
                    ) {
                        return resolve(user);
                    }
                    if (user.email === email || user.username === username) {
                        return resolve(user);
                    } else {
                        return resolve(null);
                    }
                });
            }),
    };
});

describe("NotesService", () => {
    let notesService: NotesService;
    describe("getAllNotesService", () => {
        it("should-return-all-owned-and-shared-notes", async () => {
            notesService = new NotesService();
            const result = await notesService.getAllNotesService("owner");
            expect(result.ownedNotes.length).toEqual(2);
            expect(result.sharedWithMe.length).toEqual(1);
        });
        it("should-return-all-owned-notes-and-empty-shared-notes", async () => {
            notesService = new NotesService();
            const result = await notesService.getAllNotesService("owner-2");
            expect(result.ownedNotes.length).toEqual(2);
            expect(result.sharedWithMe.length).toEqual(0);
        });
        it("should-return-empty-owned-notes-and-all-shared-notes", async () => {
            notesService = new NotesService();
            const result = await notesService.getAllNotesService("owner-3");
            expect(result.ownedNotes.length).toEqual(0);
            expect(result.sharedWithMe.length).toEqual(2);
        });
        it("should-return-both-owned-notes-and-shared-notes-as-empty", async () => {
            notesService = new NotesService();
            const result = await notesService.getAllNotesService("owner-4");
            expect(result.ownedNotes.length).toEqual(0);
            expect(result.sharedWithMe.length).toEqual(0);
        });
        it("should-throw-api-error-exception", async () => {
            notesService = new NotesService();
            await expect(
                notesService.getAllNotesService("exceptionOwner")
            ).rejects.toThrow(ApiError);
        });
    });
    describe("getNoteService", () => {
        it("should-return-note-successfully", async () => {
            notesService = new NotesService();
            const result = await notesService.getNoteService("owner", "id1");
            expect(result.note?.owner).toEqual("owner");
        });
        it("should-return-shared-note-successfully", async () => {
            notesService = new NotesService();
            const result = await notesService.getNoteService("owner", "id3");
            expect(result.note?.owner).toEqual("owner-2");
        });
        it("should-return-null-for-not-shared-note", async () => {
            notesService = new NotesService();
            const result = await notesService.getNoteService("owner-2", "id1");
            expect(result.note).toBeNull();
        });
        it("should-return-null-if-note-does-not-exist", async () => {
            notesService = new NotesService();
            const result = await notesService.getNoteService("owner", "id10");
            expect(result.note).toBeNull();
        });
        it("should-throw-error", async () => {
            notesService = new NotesService();
            await expect(
                notesService.getNoteService("exceptionOwner", "id10")
            ).rejects.toThrow(ApiError);
        });
    });
    describe("createNoteService", () => {
        notesService = new NotesService();
        it("should-create-note-successfully", async () => {
            const result = await notesService.createNoteService(
                "owner-4",
                "newTitle",
                "newNote"
            );
            expect(result.exist).toBeFalsy();
            expect(result.failed).toBeFalsy();
            expect(result.note).not.toBeNull();
            expect((result.note as any)._id).toEqual(`newnewTitle`);
        });
        it("should-return-note-exist", async () => {
            const result = await notesService.createNoteService(
                "owner-4",
                "title-1",
                "newNote"
            );
            expect(result.exist).toBeTruthy();
            expect(result.failed).toBeFalsy();
            expect(result.note).toBeNull();
        });
        it("should-fail", async () => {
            const result = await notesService.createNoteService(
                "owner-5",
                "failTitle",
                "newNote"
            );
            expect(result.exist).toBeFalsy();
            expect(result.failed).toBeTruthy();
            expect(result.note).toBeNull();
        });
        it("should-throw-error", async () => {
            await expect(
                notesService.createNoteService(
                    "owner-4",
                    "exceptionTitle",
                    "newNote"
                )
            ).rejects.toThrow(ApiError);
        });
    });
    describe("updateNoteService", () => {
        notesService = new NotesService();
        it("should-update-successfully", async () => {
            const result = await notesService.updateNoteService(
                "id1",
                "title-1-updated",
                "note-1-updated",
                "owner"
            );
            expect(result.doesNotExists).toBeFalsy();
            expect(result.exists).toBeFalsy();
            expect(result.updatedNote).not.toBeNull();
            expect(result.updatedNote?.note).toEqual("note-1-updated");
            expect(result.updatedNote?.title).toEqual("title-1-updated");
        });
        it("should-give-does-not-exist", async () => {
            const result = await notesService.updateNoteService(
                "notexist",
                "notexist",
                "notexist",
                "random"
            );
            expect(result.doesNotExists).toBeTruthy();
            expect(result.exists).toBeFalsy();
            expect(result.updatedNote).toBeNull();
        });
        it("should-give-another-note-already-exist-with-title", async () => {
            const result = await notesService.updateNoteService(
                "id1",
                "title-2",
                "note-2",
                "owner"
            );
            expect(result.doesNotExists).toBeFalsy();
            expect(result.exists).toBeTruthy();
            expect(result.updatedNote).toBeNull();
        });
        it("should-throw-error", async () => {
            await expect(
                notesService.updateNoteService(
                    "id1",
                    "exception",
                    "note-2",
                    "owner"
                )
            ).rejects.toThrow(ApiError);
        });
    });
    describe("deleteNoteService", () => {
        it("should-delete-successfully", async () => {
            const result = await notesService.deleteNoteService("owner", "id1");
            expect(result.deletedNote).not.toBeNull();
            expect(result.failed).toBeFalsy();
        });
        it("should-fail-to-delete", async () => {
            const result = await notesService.deleteNoteService(
                "random",
                "id43"
            );
            expect(result.deletedNote).toBeNull();
            expect(result.failed).toBeTruthy();
        });
        it("should-throw-exception", async () => {
            await expect(
                notesService.deleteNoteService("exception", "id43")
            ).rejects.toThrow(ApiError);
        });
    });
    describe("shareNoteService", () => {
        notesService = new NotesService();
        it("should-share-successfully", async () => {
            const result = await notesService.shareNoteService(
                "owner",
                "id1",
                "existing@example.com",
                null
            );
            expect(result.failed).toBeFalsy();
            expect(result.notAuthorized).toBeFalsy();
            expect(result.noteDoesNotExists).toBeFalsy();
            expect(result.toBeSharedWithUserNotExists).toBeFalsy();
        });
        it("should-give-note-does-not-exist", async () => {
            const result = await notesService.shareNoteService(
                "owner",
                "id121",
                "existing@example.com",
                null
            );
            expect(result.failed).toBeFalsy();
            expect(result.notAuthorized).toBeFalsy();
            expect(result.noteDoesNotExists).toBeTruthy();
            expect(result.toBeSharedWithUserNotExists).toBeFalsy();
        });
        it("should-give-not-authorized", async () => {
            const result = await notesService.shareNoteService(
                "owner-3",
                "id1",
                null,
                "existingUser"
            );
            expect(result.failed).toBeFalsy();
            expect(result.notAuthorized).toBeTruthy();
            expect(result.noteDoesNotExists).toBeFalsy();
            expect(result.toBeSharedWithUserNotExists).toBeFalsy();
        });
        it("should-give-to-be-shared-with-user-does-not-exist", async () => {
            const result = await notesService.shareNoteService(
                "owner",
                "id1",
                "ex@example.com",
                null
            );
            expect(result.failed).toBeFalsy();
            expect(result.notAuthorized).toBeFalsy();
            expect(result.noteDoesNotExists).toBeFalsy();
            expect(result.toBeSharedWithUserNotExists).toBeTruthy();
        });
        it("should-fail", async () => {
            const result = await notesService.shareNoteService(
                "owner-2",
                "share",
                "existing@example.com",
                null
            );
            // expect(result.failed).toBeTruthy();
            expect(result.notAuthorized).toBeFalsy();
            expect(result.noteDoesNotExists).toBeFalsy();
            expect(result.toBeSharedWithUserNotExists).toBeFalsy();
        });
        it("should-throw-error", async () => {
            await expect(
                notesService.shareNoteService(
                    "exception",
                    "exception",
                    "ex@example.com",
                    null
                )
            ).rejects.toThrow(ApiError);
        });
    });
});
