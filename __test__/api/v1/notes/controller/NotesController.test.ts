import { NotesService } from "../../../../../src/api/v1/notes/service/NotesService";
import { NotesController } from "../../../../../src/api/v1/notes/controller/NotesController";
import { Response, response } from "express";
import { CustomRequest } from "../../../../../src/util/CustomRequest";
import mongoose from "mongoose";
import { ApiError } from "../../../../../src/util/ApiError";
import sinon from "sinon";
import { expect } from "chai";
// jest.mock("../../../../../src/api/v1/notes/service/NotesService");

describe("NotesController", () => {
    let notesController: NotesController;
    let notesService: NotesService;
    describe("getAllNotes", () => {
        beforeEach(() => {
            notesService = new NotesService();
            notesController = new NotesController(notesService);
            sinon.restore();
        });
        it("should-success-with-ownedNotesArray-and-sharedWithMeArray", async () => {
            sinon.stub(notesService, "getAllNotesService").resolves({
                sharedWithMe: [],
                ownedNotes: [],
            });
            const result = await notesController.getAllNotes(
                {
                    user: {
                        _id: "id",
                    },
                } as CustomRequest,
                {
                    getHeader: (header: string) => {
                        if (header === "X-CorrelationId") {
                            return "correlationId";
                        }
                    },
                    status: (code: number) => {
                        return {
                            json: (body: any) => {
                                return {
                                    body: body,
                                    statusCode: code,
                                } as unknown as Response<
                                    any,
                                    Record<string, any>
                                >;
                            },
                        };
                    },
                } as Response
            );
            expect(result).not.to.be.undefined;
            expect(result?.statusCode).to.be.equal(200);
            expect((result as any).body.data.ownedNotes).not.to.be.null;
            expect((result as any).body.data.ownedNotes).to.be.length(0);
            expect((result as any).body.data.sharedWithMe).not.to.be.null;
            expect((result as any).body.data.sharedWithMe).to.be.length(0);
        });
    });
    describe("getNote", () => {
        beforeEach(() => {
            notesService = new NotesService();
            notesController = new NotesController(notesService);
            sinon.restore();
        });
        it("should-successfully-return-note", async () => {
            sinon
                .stub(notesService, "getNoteService")
                .callsFake((userId: string, noteId: string) => {
                    return new Promise((resolve, reject) => {
                        return resolve({
                            note: {
                                title: "mockTitle",
                                note: "mockNote",
                                owner: new mongoose.Types.ObjectId(
                                    "65a67af796a5057549e8b274"
                                ),
                            },
                        });
                    });
                });
            const id = "65a67af796a5057549e8b274";
            const result = await notesController.getNote(
                {
                    user: {
                        _id: "65a67af796a5057549e8b274",
                    },
                    params: {
                        noteId: "65a67af796a5057549e8b274",
                    },
                } as unknown as CustomRequest,
                {
                    getHeader: (header: string) => {
                        if (header === "X-CorrelationId") {
                            return "correlationId";
                        }
                    },
                    status: (code: number) => {
                        return {
                            json: (body: any) => {
                                return {
                                    body: body,
                                    statusCode: code,
                                } as unknown as Response<
                                    any,
                                    Record<string, any>
                                >;
                            },
                        };
                    },
                } as Response
            );
            expect((result as any).body.data.note.owner.toString()).to.be.equal(
                "65a67af796a5057549e8b274"
            );
            expect((result as any).statusCode).to.be.equal(200);
        });

        it("should-fail-at-noteId-validation", async () => {
            notesController
                .getNote(
                    {
                        user: {
                            _id: "65a67af796a5057549e8b274",
                        },
                        params: {
                            noteId: "random",
                        },
                    } as unknown as CustomRequest,
                    {
                        getHeader: (header: string) => {
                            if (header === "X-CorrelationId") {
                                return "correlationId";
                            }
                        },
                    } as Response
                )
                .catch((error) => expect(error).to.be.instanceOf(ApiError));
        });
        it("should-fail-with-note-not-found", async () => {
            sinon
                .stub(notesService, "getNoteService")
                .callsFake((userId: string, noteId: string) => {
                    return new Promise((resolve, reject) => {
                        return resolve({
                            note: null,
                        });
                    });
                });
            notesController
                .getNote(
                    {
                        user: {
                            _id: "65a67af796a5057549e8b274",
                        },
                        params: {
                            noteId: "65a67af796a5057549e8b274",
                        },
                    } as unknown as CustomRequest,
                    {
                        getHeader: (header: string) => {
                            if (header === "X-CorrelationId") {
                                return "correlationId";
                            }
                        },
                    } as Response
                )
                .catch((error) => expect(error).to.be.instanceOf(ApiError));
        });
    });
    describe("postNote", () => {
        beforeEach(() => {
            notesService = new NotesService();
            notesController = new NotesController(notesService);
            sinon.restore()
        });
        it("should-create-note-successfully", async () => {
            sinon.stub(
                notesService,
                "createNoteService"
            ).callsFake(
                (userId: string, title: string, note: string) => {
                    return new Promise((resolve, reject) => {
                        return resolve({
                            exist: false,
                            failed: false,
                            note: {
                                title: "newTitle",
                                note: "newNote",
                                owner: new mongoose.Types.ObjectId(userId),
                            },
                        });
                    });
                }
            );
            const result = await notesController.postNote(
                {
                    user: {
                        _id: "65a67af796a5057549e8b274",
                    },
                    body: {
                        title: "newTitle",
                        note: "newNote",
                    },
                } as CustomRequest,
                {
                    getHeader: (header: string) => {
                        if (header === "X-CorrelationId") {
                            return "correlationId";
                        }
                    },
                    status: (code: number) => {
                        return {
                            json: (body: any) => {
                                return {
                                    body: body,
                                    statusCode: code,
                                } as unknown as Response<
                                    any,
                                    Record<string, any>
                                >;
                            },
                        };
                    },
                } as Response
            );
            expect((result as any).body.data.title).to.be.equal("newTitle");
            expect((result as any).statusCode).to.be.equal(201);
        });
        it("should-throw-error-when-note-exist-with-title", async () => {
            sinon.stub(
                notesService,
                "createNoteService"
            ).callsFake(
                (userId: string, title: string, note: string) => {
                    return new Promise((resolve, reject) => {
                        return resolve({
                            exist: true,
                            failed: false,
                            note: null,
                        });
                    });
                }
            );
            notesController
                .postNote(
                    {
                        user: {
                            _id: "65a67af796a5057549e8b274",
                        },
                        body: {
                            title: "newTitle",
                            note: "newNote",
                        },
                    } as CustomRequest,
                    {
                        getHeader: (header: string) => {
                            if (header === "X-CorrelationId") {
                                return "correlationId";
                            }
                        },
                    } as Response
                )
                .catch((error) => {
                    expect(error.statusCode).to.be.equal(409);
                });
        });
        it("should-throw-error-when-note-create-failed", async () => {
            sinon.stub(
                notesService,
                "createNoteService"
            ).callsFake(
                (userId: string, title: string, note: string) => {
                    return new Promise((resolve, reject) => {
                        return resolve({
                            exist: false,
                            failed: true,
                            note: null,
                        });
                    });
                }
            );
            notesController
                .postNote(
                    {
                        user: {
                            _id: "65a67af796a5057549e8b274",
                        },
                        body: {
                            title: "newTitle",
                            note: "newNote",
                        },
                    } as CustomRequest,
                    {
                        getHeader: (header: string) => {
                            if (header === "X-CorrelationId") {
                                return "correlationId";
                            }
                        },
                    } as Response
                )
                .catch((error) => {
                    expect(error.statusCode).to.be.equal(500);
                });
        });
    });
    describe("putNote", () => {
        beforeEach(() => {
            notesService = new NotesService();
            notesController = new NotesController(notesService);
            sinon.restore();
        });
        it("should-update-successfully", async () => {
            sinon.stub(
                notesService,
                "updateNoteService"
            ).callsFake(
                (userId: string, title: string, note: string) => {
                    return new Promise((resolve, reject) => {
                        return resolve({
                            exists: false,
                            doesNotExists: false,
                            updatedNote: {
                                title: title,
                                note: note,
                                owner: new mongoose.Types.ObjectId(userId),
                            },
                        });
                    });
                }
            );
            const result = await notesController.putNote(
                {
                    user: {
                        _id: "65a67af796a5057549e8b274",
                    },
                    params: {
                        noteId: "65a67af796a5057549e8b274",
                    },
                    body: {
                        title: "updatedTitle",
                        note: "updatedNote",
                    },
                } as unknown as CustomRequest,
                {
                    getHeader: (header: string) => {
                        if (header === "X-CorrelationId") {
                            return "correlationId";
                        }
                    },
                    status: (code: number) => {
                        return {
                            json: (body: any) => {
                                return {
                                    body: body,
                                    statusCode: code,
                                } as unknown as Response<
                                    any,
                                    Record<string, any>
                                >;
                            },
                        };
                    },
                } as Response
            );
            expect((result as any).body.data.title).to.be.equal("updatedTitle");
            expect((result as any).statusCode).to.be.equal(200);
        });
        it("should-throw-error-bad-body-validation-error", async () => {
            notesController
                .putNote(
                    {
                        user: {
                            _id: "65a67af796a5057549e8b274",
                        },
                        params: {
                            noteId: "65a67af796a5057549e8b274",
                        },
                        body: {
                            title: "u",
                            note: "",
                        },
                    } as unknown as CustomRequest,
                    {
                        getHeader: (header: string) => {
                            if (header === "X-CorrelationId") {
                                return "correlationId";
                            }
                        },
                    } as Response
                )
                .catch((error) => {
                    expect(error.statusCode).to.be.equal(400);
                });
        });
        it("should-throw-error-noteId-validation-error", async () => {
            notesController
                .putNote(
                    {
                        user: {
                            _id: "65a67af796a5057549e8b274",
                        },
                        params: {
                            noteId: "65a",
                        },
                        body: {
                            title: "u",
                            note: "",
                        },
                    } as unknown as CustomRequest,
                    {
                        getHeader: (header: string) => {
                            if (header === "X-CorrelationId") {
                                return "correlationId";
                            }
                        },
                    } as Response
                )
                .catch((error) => {
                    expect(error.statusCode).to.be.equal(400);
                });
        });
        it("should-throw-error-note-exists", async () => {
            sinon.stub(
                notesService,
                "updateNoteService"
            ).callsFake(
                (userId: string, title: string, note: string) => {
                    return new Promise((resolve, reject) => {
                        return resolve({
                            exists: true,
                            doesNotExists: false,
                            updatedNote: null,
                        });
                    });
                }
            );
            notesController
                .putNote(
                    {
                        user: {
                            _id: "65a67af796a5057549e8b274",
                        },
                        params: {
                            noteId: "65a67af796a5057549e8b274",
                        },
                        body: {
                            title: "updatedTitle",
                            note: "updatedNote",
                        },
                    } as unknown as CustomRequest,
                    {
                        getHeader: (header: string) => {
                            if (header === "X-CorrelationId") {
                                return "correlationId";
                            }
                        },
                    } as Response
                )
                .catch((error) => {
                    expect(error.statusCode).to.be.equal(409);
                });
        });
        it("should-throw-error-does-not-exists", async () => {
            sinon.stub(
                notesService,
                "updateNoteService"
            ).callsFake(
                (userId: string, title: string, note: string) => {
                    return new Promise((resolve, reject) => {
                        return resolve({
                            exists: false,
                            doesNotExists: true,
                            updatedNote: null,
                        });
                    });
                }
            );
            notesController
                .putNote(
                    {
                        user: {
                            _id: "65a67af796a5057549e8b274",
                        },
                        params: {
                            noteId: "65a67af796a5057549e8b274",
                        },
                        body: {
                            title: "updatedTitle",
                            note: "updatedNote",
                        },
                    } as unknown as CustomRequest,
                    {
                        getHeader: (header: string) => {
                            if (header === "X-CorrelationId") {
                                return "correlationId";
                            }
                        },
                    } as Response
                )
                .catch((error) => {
                    expect(error.statusCode).to.be.equal(404);
                });
        });
    });
    describe("deleteNote", () => {
        beforeEach(() => {
            notesService = new NotesService();
            notesController = new NotesController(notesService);
            sinon.restore()
        });
        it("should-delete-successfully", async () => {
            sinon.stub(
                notesService,
                "deleteNoteService"
            ).callsFake((userId: string, noteId: string) => {
                return new Promise((resolve, reject) => {
                    return resolve({
                        failed: false,
                        deletedNote: {
                            title: "deletedTitle",
                            note: "deletedNote",
                            owner: new mongoose.Types.ObjectId(userId),
                        },
                    });
                });
            });
            const result = await notesController.deleteNote(
                {
                    user: {
                        _id: "65a67af796a5057549e8b274",
                    },
                    params: {
                        noteId: "65a67af796a5057549e8b274",
                    },
                } as unknown as CustomRequest,
                {
                    getHeader: (header: string) => {
                        if (header === "X-CorrelationId") {
                            return "correlationId";
                        }
                    },
                    status: (code: number) => {
                        return {
                            json: (body: any) => {
                                return {
                                    body: body,
                                    statusCode: code,
                                } as unknown as Response<
                                    any,
                                    Record<string, any>
                                >;
                            },
                        };
                    },
                } as Response
            );
            expect((result as any).body.statusCode).to.be.equal(200);
            expect((result as any).body.data.title).to.be.equal("deletedTitle");
        });
        it("should-throw-failed", async () => {
            sinon.stub(
                notesService,
                "deleteNoteService"
            ).callsFake((userId: string, noteId: string) => {
                return new Promise((resolve, reject) => {
                    return resolve({
                        failed: true,
                        deletedNote: null,
                    });
                });
            });
                notesController.deleteNote(
                    {
                        user: {
                            _id: "65a67af796a5057549e8b274",
                        },
                        params: {
                            noteId: "65a67af796a5057549e8b274",
                        },
                    } as unknown as CustomRequest,
                    {
                        getHeader: (header: string) => {
                            if (header === "X-CorrelationId") {
                                return "correlationId";
                            }
                        },
                        status: (code: number) => {
                            return {
                                json: (body: any) => {
                                    return {
                                        body: body,
                                        statusCode: code,
                                    } as unknown as Response<
                                        any,
                                        Record<string, any>
                                    >;
                                },
                            };
                        },
                    } as Response
                ).catch(error=>expect(error).to.be.instanceOf(ApiError))
        });
    });
    describe("shareNote", () => {
        beforeEach(() => {
            notesService = new NotesService();
            notesController = new NotesController(notesService);
            sinon.restore()
        });
        it("should-share-successfully", async () => {
            sinon.stub(notesService, "shareNoteService").callsFake(
                (
                    userId: string,
                    noteId: string,
                    email: string | null,
                    username: string | null
                ) => {
                    return new Promise((resolve, reject) => {
                        resolve({
                            notAuthorized: false,
                            noteDoesNotExists: false,
                            toBeSharedWithUserNotExists: false,
                            failed: false,
                        });
                    });
                }
            );
            const result = await notesController.shareNote(
                {
                    user: {
                        _id: "65a67af796a5057549e8b274",
                    },
                    params: {
                        noteId: "65a67af796a5057549e8b274",
                    },
                    body: {
                        email: "email@gmail.com",
                    },
                } as unknown as CustomRequest,
                {
                    getHeader: (header: string) => {
                        if (header === "X-CorrelationId") {
                            return "correlationId";
                        }
                    },
                    status: (code: number) => {
                        return {
                            json: (body: any) => {
                                return {
                                    body: body,
                                    statusCode: code,
                                } as unknown as Response<
                                    any,
                                    Record<string, any>
                                >;
                            },
                        };
                    },
                } as Response
            );
            expect((result as any).body.data).to.be.null;
            expect((result as any).body.message).to.be.equal("Access granted");
            expect((result as any).body.statusCode).to.be.equal(200);
        });
        it("should-throw-not-authorized", () => {
            sinon.stub(notesService, "shareNoteService").callsFake(
                (
                    userId: string,
                    noteId: string,
                    email: string | null,
                    username: string | null
                ) => {
                    return new Promise((resolve, reject) => {
                        resolve({
                            notAuthorized: true,
                            noteDoesNotExists: false,
                            toBeSharedWithUserNotExists: false,
                            failed: false,
                        });
                    });
                }
            );
            notesController
                .shareNote(
                    {
                        user: {
                            _id: "65a67af796a5057549e8b274",
                        },
                        params: {
                            noteId: "65a67af796a5057549e8b274",
                        },
                        body: {
                            email: "email@gmail.com",
                        },
                    } as unknown as CustomRequest,
                    {
                        getHeader: (header: string) => {
                            if (header === "X-CorrelationId") {
                                return "correlationId";
                            }
                        },
                    } as Response
                )
                .catch((error) => {
                    expect(error.statusCode).to.be.equal(401);
                });
        });
        it("should-throw-note-does-note-exist", () => {
            sinon.stub(notesService, "shareNoteService").callsFake(
                (
                    userId: string,
                    noteId: string,
                    email: string | null,
                    username: string | null
                ) => {
                    return new Promise((resolve, reject) => {
                        resolve({
                            notAuthorized: false,
                            noteDoesNotExists: true,
                            toBeSharedWithUserNotExists: false,
                            failed: false,
                        });
                    });
                }
            );
            notesController
                .shareNote(
                    {
                        user: {
                            _id: "65a67af796a5057549e8b274",
                        },
                        params: {
                            noteId: "65a67af796a5057549e8b274",
                        },
                        body: {
                            email: "email@gmail.com",
                        },
                    } as unknown as CustomRequest,
                    {
                        getHeader: (header: string) => {
                            if (header === "X-CorrelationId") {
                                return "correlationId";
                            }
                        },
                    } as Response
                )
                .catch((error) => {
                    expect(error.statusCode).to.be.equal(404);
                });
        });
        it("should-throw-to-be-shared-with-user-does-not-exist", () => {
            sinon.stub(notesService, "shareNoteService").callsFake(
                (
                    userId: string,
                    noteId: string,
                    email: string | null,
                    username: string | null
                ) => {
                    return new Promise((resolve, reject) => {
                        resolve({
                            notAuthorized: false,
                            noteDoesNotExists: false,
                            toBeSharedWithUserNotExists: true,
                            failed: false,
                        });
                    });
                }
            );
            notesController
                .shareNote(
                    {
                        user: {
                            _id: "65a67af796a5057549e8b274",
                        },
                        params: {
                            noteId: "65a67af796a5057549e8b274",
                        },
                        body: {
                            email: "email@gmail.com",
                        },
                    } as unknown as CustomRequest,
                    {
                        getHeader: (header: string) => {
                            if (header === "X-CorrelationId") {
                                return "correlationId";
                            }
                        },
                    } as Response
                )
                .catch((error) => {
                    expect(error.statusCode).to.be.equal(404);
                });
        });
        it("should-throw-failed", () => {
            sinon.stub(notesService, "shareNoteService").callsFake(
                (
                    userId: string,
                    noteId: string,
                    email: string | null,
                    username: string | null
                ) => {
                    return new Promise((resolve, reject) => {
                        resolve({
                            notAuthorized: false,
                            noteDoesNotExists: false,
                            toBeSharedWithUserNotExists: false,
                            failed: true,
                        });
                    });
                }
            );
            notesController
                .shareNote(
                    {
                        user: {
                            _id: "65a67af796a5057549e8b274",
                        },
                        params: {
                            noteId: "65a67af796a5057549e8b274",
                        },
                        body: {
                            email: "email@gmail.com",
                        },
                    } as unknown as CustomRequest,
                    {
                        getHeader: (header: string) => {
                            if (header === "X-CorrelationId") {
                                return "correlationId";
                            }
                        },
                    } as Response
                )
                .catch((error) => {
                    expect(error.statusCode).to.be.equal(500);
                });
        });
        it("should-throw-noteId-not-valid", () => {
            sinon.stub(notesService, "shareNoteService").callsFake(
                (
                    userId: string,
                    noteId: string,
                    email: string | null,
                    username: string | null
                ) => {
                    return new Promise((resolve, reject) => {
                        resolve({
                            notAuthorized: true,
                            noteDoesNotExists: false,
                            toBeSharedWithUserNotExists: false,
                            failed: false,
                        });
                    });
                }
            );
            notesController
                .shareNote(
                    {
                        user: {
                            _id: "65a67af796a5057549e8b274",
                        },
                        params: {
                            noteId: "6",
                        },
                        body: {
                            email: "email@gmail.com",
                        },
                    } as unknown as CustomRequest,
                    {
                        getHeader: (header: string) => {
                            if (header === "X-CorrelationId") {
                                return "correlationId";
                            }
                        },
                    } as Response
                )
                .catch((error) => {
                    expect(error.statusCode).to.be.equal(400);
                });
        });
    });
});
