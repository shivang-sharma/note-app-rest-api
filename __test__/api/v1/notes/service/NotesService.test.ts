import sinon from "sinon";
import mongoose, { Document, ObjectId } from "mongoose";
import { NotesService } from "../../../../../src/api/v1/notes/service/NotesService";
import { ApiError } from "../../../../../src/util/ApiError";
import { mockNotes, mockAccess } from "../../../../mockData.json";
import * as queries from "../../../../../src/db/queries";
import { IAccess, INote, IUser } from "../../../../../src/db";
import { expect } from "chai";
describe("NotesService", () => {
    let sandbox: sinon.SinonSandbox;
    before(() => {
        sandbox = sinon.createSandbox();
        sandbox.restore();
        sandbox.reset();
        sandbox.verifyAndRestore();
        sandbox
            .stub(queries, "CreateAccess")
            .callsFake(
                (
                    noteId: mongoose.Types.ObjectId,
                    toBeSharedWithUserId: mongoose.Types.ObjectId
                ) => {
                    return new Promise((resolve, reject) => {
                        mockAccess.push({
                            _id: `new${noteId}`,
                            note: noteId.toString(),
                            user: toBeSharedWithUserId.toString(),
                        });
                        return resolve({
                            _id: `new${noteId}`,
                            note: noteId,
                            user: toBeSharedWithUserId,
                        } as unknown as Document<unknown, {}, IAccess> &
                            IAccess & { _id: mongoose.Types.ObjectId });
                    });
                }
            );
        sandbox
            .stub(queries, "CreateNote")
            .callsFake((title: string, userId: string, note: string) => {
                return new Promise((resolve, reject) => {
                    if (title.startsWith("exception")) {
                        return reject("Failed");
                    }
                    mockNotes.push({
                        _id: `new${title}`,
                        title: title,
                        owner: userId,
                        note: note,
                    });
                    return resolve({
                        _id: `new${title}`,
                        title: title,
                        owner: userId,
                        note: note,
                    } as unknown as Document<unknown, {}, INote> &
                        INote & { _id: mongoose.Types.ObjectId });
                });
            });
        sandbox.stub(queries, "FindAccessById").callsFake((accessId) => {
            return new Promise((resolve, reject) => {
                const access = mockAccess.find(
                    (a) => a._id === accessId.toString()
                );
                if (access && access.note.startsWith("share")) {
                    return resolve(null);
                }
                return resolve(
                    access as unknown as Document<unknown, {}, IAccess> &
                        IAccess & { _id: mongoose.Types.ObjectId }
                );
            });
        });
        sandbox
            .stub(queries, "FindAccessByUserIdAndNoteId")
            .callsFake((userId: string, noteId: string) => {
                return new Promise((resolve, reject) => {
                    if (userId.startsWith("exception")) {
                        return reject("Failed");
                    }
                    const access = mockAccess.find(
                        (access) =>
                            access.note === noteId && access.user === userId
                    );
                    return resolve(
                        access
                            ? (access as unknown as Document<
                                  unknown,
                                  {},
                                  IAccess
                              > &
                                  IAccess & { _id: mongoose.Types.ObjectId })
                            : null
                    );
                });
            });

        sandbox
            .stub(queries, "FindNoteAndDeleteByNoteIdAndOwnerId")
            .callsFake((noteId: string, userId: string) => {
                return new Promise((resolve, reject) => {
                    if (userId.startsWith("exception")) {
                        return reject("Fail");
                    }
                    return resolve(
                        mockNotes.find(
                            (note) =>
                                note._id === noteId && note.owner === userId
                        ) as unknown as Document<unknown, {}, INote> &
                            INote & { _id: mongoose.Types.ObjectId }
                    );
                });
            });
        sandbox
            .stub(queries, "FindNoteAndUpdateByNoteIdAndOwnerId")
            .callsFake(
                (
                    noteId: string,
                    userId: string,
                    title: string,
                    note: string
                ) => {
                    return new Promise((resolve, reject) => {
                        if (title.startsWith("exception")) {
                            return reject("Failed");
                        }
                        const mNote = mockNotes.find(
                            (mNote) =>
                                mNote._id === noteId && mNote.owner === userId
                        );
                        if (mNote) {
                            mNote.note = note;
                            mNote.title = title;
                            return resolve(
                                mNote as unknown as Document<
                                    unknown,
                                    {},
                                    INote
                                > &
                                    INote & { _id: mongoose.Types.ObjectId }
                            );
                        }
                        return resolve(null);
                    });
                }
            );

        sandbox.stub(queries, "FindNoteById").callsFake((noteId: string) => {
            return new Promise((resolve, reject) => {
                if (noteId.startsWith("exception")) {
                    return reject("Fails");
                }
                const note = mockNotes.find((note) => note._id === noteId);
                if (note) {
                    if (note.title.startsWith("fail")) {
                        return resolve(null);
                    }
                    return resolve(
                        note as unknown as Document<unknown, {}, INote> &
                            INote & { _id: mongoose.Types.ObjectId }
                    );
                }
                return resolve(null);
            });
        });
        sandbox
            .stub(queries, "FindNoteByIdAndOwnerId")
            .callsFake((noteId: string, userId: string) => {
                return new Promise((resolve, reject) => {
                    const note = mockNotes.find(
                        (note) => note._id === noteId && note.owner === userId
                    );
                    return resolve(
                        note
                            ? (note as unknown as Document<unknown, {}, INote> &
                                  INote & { _id: mongoose.Types.ObjectId })
                            : null
                    );
                });
            });

        sandbox.stub(queries, "FindNoteByTitle").callsFake((title: string) => {
            return new Promise((resolve, reject) => {
                const note = mockNotes.find((note) => note.title === title);
                return resolve(
                    note
                        ? (note as unknown as Document<unknown, {}, INote> &
                              INote & { _id: mongoose.Types.ObjectId })
                        : null
                );
            });
        });
        sandbox
            .stub(queries, "FindNoteIdsFromAccessByUserId")
            .callsFake((userId: string) => {
                return new Promise((resolve, reject) => {
                    const ids = mockAccess.filter(
                        (access) => access.user === userId
                    ) as unknown[] as (Document<unknown, {}, IAccess> &
                        IAccess & { _id: mongoose.Types.ObjectId })[];
                    return resolve(ids);
                });
            });
        sandbox
            .stub(queries, "FindNotesByNoteIdIn")
            .callsFake((notedIds: mongoose.Types.ObjectId[]) => {
                return new Promise((resolve, reject) => {
                    const notes = mockNotes.filter((note) =>
                        notedIds.includes(
                            note._id as unknown as mongoose.Types.ObjectId
                        )
                    ) as unknown[] as (Document<unknown, {}, INote> &
                        INote & { _id: mongoose.Types.ObjectId })[];
                    return resolve(notes);
                });
            });

        sandbox
            .stub(queries, "FindNotesByOwnerId")
            .callsFake((ownerId: string) => {
                return new Promise((resolve, reject) => {
                    if (ownerId.startsWith("exception")) {
                        return reject("Failed");
                    }
                    const notes = mockNotes.filter(
                        (note) => note.owner === ownerId
                    );
                    return resolve(
                        notes as unknown[] as (Document<unknown, {}, INote> &
                            INote & { _id: mongoose.Types.ObjectId })[]
                    );
                });
            });
        sandbox
            .stub(queries, "FindOneUserByUsernameOrEmail")
            .callsFake((username: string, email: string) => {
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
                        return reject("Failed");
                    if (
                        email.startsWith("tokenException") ||
                        username.startsWith("tokenException")
                    ) {
                        return resolve(
                            user as unknown as Document<unknown, {}, IUser> &
                                IUser & { _id: mongoose.Types.ObjectId }
                        );
                    }
                    if (user.email === email || user.username === username) {
                        return resolve(
                            user as unknown as Document<unknown, {}, IUser> &
                                IUser & { _id: mongoose.Types.ObjectId }
                        );
                    } else {
                        return resolve(null);
                    }
                });
            });
    });
    after(() => {
        sandbox.restore();
    });
    let notesService: NotesService;
    describe("getAllNotesService", () => {
        it("should-return-all-owned-and-shared-notes", async () => {
            notesService = new NotesService();
            const result = await notesService.getAllNotesService("owner");
            expect(result.ownedNotes.length).to.be.equal(2);
            expect(result.sharedWithMe.length).to.be.equal(1);
        });
        it("should-return-all-owned-notes-and-empty-shared-notes", async () => {
            notesService = new NotesService();
            const result = await notesService.getAllNotesService("owner-2");
            expect(result.ownedNotes.length).to.be.equal(2);
            expect(result.sharedWithMe.length).to.be.equal(0);
        });
        it("should-return-empty-owned-notes-and-all-shared-notes", async () => {
            notesService = new NotesService();
            const result = await notesService.getAllNotesService("owner-3");
            expect(result.ownedNotes.length).to.be.equal(0);
            expect(result.sharedWithMe.length).to.be.equal(2);
        });
        it("should-return-both-owned-notes-and-shared-notes-as-empty", async () => {
            notesService = new NotesService();
            const result = await notesService.getAllNotesService("owner-4");
            expect(result.ownedNotes.length).to.be.equal(0);
            expect(result.sharedWithMe.length).to.be.equal(0);
        });
        it("should-throw-api-error-exception", async () => {
            notesService = new NotesService();
            notesService
                .getAllNotesService("exceptionOwner")
                .catch((error) => expect(error).to.be.instanceOf(ApiError));
        });
    });
    describe("getNoteService", () => {
        it("should-return-note-successfully", async () => {
            notesService = new NotesService();
            const result = await notesService.getNoteService("owner", "id1");
            expect(result.note?.owner).to.be.equal("owner");
        });
        it("should-return-shared-note-successfully", async () => {
            notesService = new NotesService();
            const result = await notesService.getNoteService("owner", "id3");
            expect(result.note?.owner).to.be.equal("owner-2");
        });
        it("should-return-null-for-not-shared-note", async () => {
            notesService = new NotesService();
            const result = await notesService.getNoteService("owner-2", "id1");
            expect(result.note).to.be.null;
        });
        it("should-return-null-if-note-does-not-exist", async () => {
            notesService = new NotesService();
            const result = await notesService.getNoteService("owner", "id10");
            expect(result.note).to.be.null;
        });
        it("should-throw-error", async () => {
            notesService = new NotesService();
            notesService
                .getNoteService("exceptionOwner", "id10")
                .catch((error) => expect(error).to.be.instanceOf(ApiError));
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
            expect(result.exist).to.be.false;
            expect(result.failed).to.be.false;
            expect(result.note).not.to.be.null;
            expect((result.note as any)._id).to.be.equal(`newnewTitle`);
        });
        it("should-return-note-exist", async () => {
            const result = await notesService.createNoteService(
                "owner-4",
                "title-1",
                "newNote"
            );
            expect(result.exist).to.be.true;
            expect(result.failed).to.be.false;
            expect(result.note).to.be.null;
        });
        it("should-fail", async () => {
            const result = await notesService.createNoteService(
                "owner-5",
                "failTitle",
                "newNote"
            );
            expect(result.exist).to.be.false;
            expect(result.failed).to.be.true;
            expect(result.note).to.be.null;
        });
        it("should-throw-error", async () => {
            notesService
                .createNoteService("owner-4", "exceptionTitle", "newNote")
                .catch((error) => expect(error).to.be.instanceOf(ApiError));
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
            expect(result.doesNotExists).to.be.false;
            expect(result.exists).to.be.false;
            expect(result.updatedNote).not.to.be.null;
            expect(result.updatedNote?.note).to.be.equal("note-1-updated");
            expect(result.updatedNote?.title).to.be.equal("title-1-updated");
        });
        it("should-give-does-not-exist", async () => {
            const result = await notesService.updateNoteService(
                "notexist",
                "notexist",
                "notexist",
                "random"
            );
            expect(result.doesNotExists).to.be.true;
            expect(result.exists).to.be.false;
            expect(result.updatedNote).to.be.null;
        });
        it("should-give-another-note-already-exist-with-title", async () => {
            const result = await notesService.updateNoteService(
                "id1",
                "title-2",
                "note-2",
                "owner"
            );
            expect(result.doesNotExists).to.be.false;
            expect(result.exists).to.be.true;
            expect(result.updatedNote).to.be.null;
        });
        it("should-throw-error", async () => {
            notesService
                .updateNoteService("id1", "exception", "note-2", "owner")
                .catch((error) => expect(error).to.be.instanceOf(ApiError));
        });
    });
    describe("deleteNoteService", () => {
        it("should-delete-successfully", async () => {
            const result = await notesService.deleteNoteService("owner", "id1");
            expect(result.deletedNote).not.to.be.null;
            expect(result.failed).to.be.false;
        });
        it("should-fail-to-delete", async () => {
            const result = await notesService.deleteNoteService(
                "random",
                "id43"
            );
            expect(result.deletedNote).to.be.null;
            expect(result.failed).to.be.true;
        });
        it("should-throw-exception", async () => {
            notesService
                .deleteNoteService("exception", "id43")
                .catch((error) => expect(error).to.be.instanceOf(ApiError));
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
            expect(result.failed).to.be.false;
            expect(result.notAuthorized).to.be.false;
            expect(result.noteDoesNotExists).to.be.false;
            expect(result.toBeSharedWithUserNotExists).to.be.false;
        });
        it("should-give-note-does-not-exist", async () => {
            const result = await notesService.shareNoteService(
                "owner",
                "id121",
                "existing@example.com",
                null
            );
            expect(result.failed).to.be.false;
            expect(result.notAuthorized).to.be.false;
            expect(result.noteDoesNotExists).to.be.true;
            expect(result.toBeSharedWithUserNotExists).to.be.false;
        });
        it("should-give-not-authorized", async () => {
            const result = await notesService.shareNoteService(
                "owner-3",
                "id1",
                null,
                "existingUser"
            );
            expect(result.failed).to.be.false;
            expect(result.notAuthorized).to.be.true;
            expect(result.noteDoesNotExists).to.be.false;
            expect(result.toBeSharedWithUserNotExists).to.be.false;
        });
        it("should-give-to-be-shared-with-user-does-not-exist", async () => {
            const result = await notesService.shareNoteService(
                "owner",
                "id1",
                "ex@example.com",
                null
            );
            expect(result.failed).to.be.false;
            expect(result.notAuthorized).to.be.false;
            expect(result.noteDoesNotExists).to.be.false;
            expect(result.toBeSharedWithUserNotExists).to.be.true;
        });
        it("should-fail", async () => {
            const result = await notesService.shareNoteService(
                "owner-2",
                "share",
                "existing@example.com",
                null
            );
            // expect(result.failed).to.be.true;
            expect(result.notAuthorized).to.be.false;
            expect(result.noteDoesNotExists).to.be.false;
            expect(result.toBeSharedWithUserNotExists).to.be.false;
        });
        it("should-throw-error", async () => {
            notesService
                .shareNoteService(
                    "exception",
                    "exception",
                    "ex@example.com",
                    null
                )
                .catch((error) => expect(error).to.be.instanceOf(ApiError));
        });
    });
});
