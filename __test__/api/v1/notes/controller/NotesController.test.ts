import { NotesService } from "../../../../../src/api/v1/notes/service/NotesService";
import { NotesController } from "../../../../../src/api/v1/notes/controller/NotesController";
import { Response, response } from "express";
import { CustomRequest } from "../../../../../src/util/CustomRequest";
import mongoose from "mongoose";
import { ApiError } from "../../../../../src/util/ApiError";
jest.mock("../../../../../src/api/v1/notes/service/NotesService");

describe("NotesController", () => {
    let notesController: NotesController;
    let notesService: NotesService;
    describe("getAllNotes", () => {
        beforeEach(() => {
            notesService = new NotesService();
            notesController = new NotesController(notesService);
            jest.clearAllMocks();
        });
        it("should-success-with-ownedNotesArray-and-sharedWithMeArray", async () => {
            jest.spyOn(
                notesService,
                "getAllNotesService"
            ).mockResolvedValueOnce({
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
            expect(result).toBeDefined();
            expect(result?.statusCode).toEqual(200);
            expect((result as any).body.data.ownedNotes).not.toBeNull();
            expect((result as any).body.data.ownedNotes).toHaveLength(0);
            expect((result as any).body.data.sharedWithMe).not.toBeNull();
            expect((result as any).body.data.sharedWithMe).toHaveLength(0);
        });
    });
    describe("getNote", () => {
        beforeEach(() => {
            notesService = new NotesService();
            notesController = new NotesController(notesService);
            jest.clearAllMocks();
        });
        it("should-successfully-return-note", async () => {
            jest.spyOn(notesService, "getNoteService").mockImplementationOnce(
                (userId: string, noteId: string) => {
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
                }
            );
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
            expect((result as any).body.data.note.owner.toString()).toEqual(
                "65a67af796a5057549e8b274"
            );
            expect((result as any).statusCode).toEqual(200);
        });

        it("should-fail-at-noteId-validation", async () => {
            await expect(
                notesController.getNote(
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
            ).rejects.toThrow(ApiError);
        });
        it("should-fail-with-note-not-found", async () => {
            jest.spyOn(notesService, "getNoteService").mockImplementationOnce(
                (userId: string, noteId: string) => {
                    return new Promise((resolve, reject) => {
                        return resolve({
                            note: null,
                        });
                    });
                }
            );
            await expect(
                notesController.getNote(
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
            ).rejects.toThrow(ApiError);
        });
    });
    describe("postNote", () => {
        beforeEach(() => {
            notesService = new NotesService();
            notesController = new NotesController(notesService);
            jest.clearAllMocks();
        });
        it("should-create-note-successfully", async () => {
            jest.spyOn(
                notesService,
                "createNoteService"
            ).mockImplementationOnce(
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
            expect((result as any).body.data.title).toEqual("newTitle");
            expect((result as any).statusCode).toEqual(201);
        });
        it("should-throw-error-when-note-exist-with-title", async () => {
            jest.spyOn(
                notesService,
                "createNoteService"
            ).mockImplementationOnce(
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
                    expect(error.statusCode).toEqual(409);
                });
        });
        it("should-throw-error-when-note-create-failed", async () => {
            jest.spyOn(
                notesService,
                "createNoteService"
            ).mockImplementationOnce(
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
                    expect(error.statusCode).toEqual(500);
                });
        });
    });
    describe("putNote", () => {
        beforeEach(() => {
            notesService = new NotesService();
            notesController = new NotesController(notesService);
            jest.clearAllMocks();
        });
        it("should-update-successfully", async () => {
            jest.spyOn(
                notesService,
                "updateNoteService"
            ).mockImplementationOnce(
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
            expect((result as any).body.data.title).toEqual("updatedTitle");
            expect((result as any).statusCode).toEqual(200);
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
                    expect(error.statusCode).toEqual(400);
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
                    expect(error.statusCode).toEqual(400);
                });
        });
        it("should-throw-error-note-exists", async () => {
            jest.spyOn(
                notesService,
                "updateNoteService"
            ).mockImplementationOnce(
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
                    expect(error.statusCode).toEqual(409);
                });
        });
        it("should-throw-error-does-not-exists", async () => {
            jest.spyOn(
                notesService,
                "updateNoteService"
            ).mockImplementationOnce(
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
                    expect(error.statusCode).toEqual(404);
                });
        });
    });
    describe("deleteNote", () => {
        beforeEach(() => {
            notesService = new NotesService();
            notesController = new NotesController(notesService);
            jest.clearAllMocks();
        });
        it("should-delete-successfully", async () => {
            jest.spyOn(
                notesService,
                "deleteNoteService"
            ).mockImplementationOnce((userId: string, noteId: string) => {
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
            expect((result as any).body.statusCode).toEqual(200);
            expect((result as any).body.data.title).toEqual("deletedTitle");
        });
        it("should-throw-failed", async () => {
            jest.spyOn(
                notesService,
                "deleteNoteService"
            ).mockImplementationOnce((userId: string, noteId: string) => {
                return new Promise((resolve, reject) => {
                    return resolve({
                        failed: true,
                        deletedNote: null,
                    });
                });
            });
            await expect(
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
                )
            ).rejects.toThrow(ApiError);
        });
    });
    describe("shareNote", () => {
        beforeEach(() => {
            notesService = new NotesService();
            notesController = new NotesController(notesService);
            jest.clearAllMocks();
        });
        it("should-share-successfully", async () => {
            jest.spyOn(notesService, "shareNoteService").mockImplementationOnce(
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
            expect((result as any).body.data).toBeNull();
            expect((result as any).body.message).toEqual("Access granted");
            expect((result as any).body.statusCode).toEqual(200);
        });
        it("should-throw-not-authorized", () => {
            jest.spyOn(notesService, "shareNoteService").mockImplementationOnce(
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
                    expect(error.statusCode).toEqual(401);
                });
        });
        it("should-throw-note-does-note-exist", () => {
            jest.spyOn(notesService, "shareNoteService").mockImplementationOnce(
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
                    expect(error.statusCode).toEqual(404);
                });
        });
        it("should-throw-to-be-shared-with-user-does-not-exist", () => {
            jest.spyOn(notesService, "shareNoteService").mockImplementationOnce(
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
                    expect(error.statusCode).toEqual(404);
                });
        });
        it("should-throw-failed", () => {
            jest.spyOn(notesService, "shareNoteService").mockImplementationOnce(
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
                    expect(error.statusCode).toEqual(500);
                });
        });
        it("should-throw-noteId-not-valid", () => {
            jest.spyOn(notesService, "shareNoteService").mockImplementationOnce(
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
            notesController.shareNote(
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
            ).catch((error)=> {
                expect(error.statusCode).toEqual(400)
            });
        });
    });
});
