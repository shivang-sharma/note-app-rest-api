import type { Response } from "express";
import type { CustomRequest } from "../../../../util/CustomRequest";
import { Logger } from "../../../../util/Logger";
import type { NotesService } from "../service/NotesService";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../../../../util/ApiResponse";
import { ApiError } from "../../../../util/ApiError";
import { ZCreateNoteInputSchema } from "../zschema/ZCreateNoteInputSchema";
import { ZObjectIdSchema } from "../zschema/ZObjectIdSchema";

export class NotesController {
    #logger = new Logger("API-SERVICE", "NotesController.ts");
    #service: NotesService;
    constructor(service: NotesService) {
        this.#service = service;
    }
    getAllNotes = async (req: CustomRequest, res: Response) => {
        const correlationId = res.getHeader("X-CorrelationId");
        this.#logger.info(
            `GetAllNotes request recieved for correlationId: ${correlationId}`
        );
        const user = req.user;
        if (user) {
            this.#logger.info(
                `Making call to getAllNotesService for correlationId: ${correlationId}`
            );
            const result = await this.#service.getAllNotesService(user._id);
            this.#logger.info(
                `Call to getAllNotesService successfull for correlationId: ${correlationId}`
            );
            
            return res
                .status(StatusCodes.OK)
                .json(new ApiResponse(StatusCodes.OK, result));
        }
    };
    getNote = async (req: CustomRequest, res: Response) => {
        const correlationId = res.getHeader("X-CorrelationId");
        const user = req.user;
        let noteId = req.params.noteId;
        const validationResult = ZObjectIdSchema.safeParse(noteId);
        this.#logger.info(
            `GetNote request recieved for user: ${user?._id} noteId: ${noteId} correlationId: ${correlationId}`
        );
        if (!validationResult.success) {
            this.#logger.warn(
                `Invalid noteId: ${noteId} for user: ${user?._id} correlationId: ${correlationId}`
            );
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "Invalid noteId",
                validationResult.error.errors
            );
        }
        if (user && validationResult.success) {
            noteId = validationResult.data;
            this.#logger.info(
                `Making call to GetNoteService for user: ${user?._id} noteId: ${noteId} correlationId: ${correlationId}`
            );
            const result = await this.#service.getNoteService(user._id, noteId);
            this.#logger.info(
                `Call to GetNoteService ended for user: ${user?._id} noteId: ${noteId} correlationId: ${correlationId}`
            );
            if (result.note === null) {
                this.#logger.warn(
                    `Note not found for user: ${user?._id} noteId: ${noteId} correlationId: ${correlationId}`
                );
                throw new ApiError(StatusCodes.NOT_FOUND, "Note not found");
            }
            return res
                .status(StatusCodes.OK)
                .json(new ApiResponse(StatusCodes.OK, result));
        }
    };
    postNote = async (req: CustomRequest, res: Response) => {
        const correlationId = res.getHeader("X-CorrelationId");
        const user = req.user;
        this.#logger.info(
            `CreateNote request recieved for user: ${user?._id} correlationId: ${correlationId}`
        );
        if (user) {
            const createNoteInput = {
                title: req.body.title,
                note: req.body.note,
            };
            const validationResult =
                ZCreateNoteInputSchema.safeParse(createNoteInput);
            if (!validationResult.success) {
                this.#logger.warn(
                    `Validation failed for create note request payload error ${JSON.stringify(
                        validationResult.error.errors
                    )} corrleationId: ${correlationId}`
                );
                throw new ApiError(
                    StatusCodes.BAD_REQUEST,
                    "Invalid input data",
                    validationResult.error.errors
                );
            }
            const { title, note } = validationResult.data;
            this.#logger.info(
                `Validation successfull for create note request payload for correlationId: ${correlationId}`
            );
            this.#logger.info(
                `Attempting to call createNoteService for correlationId: ${correlationId}`
            );
            const result = await this.#service.createNoteService(
                user._id,
                title,
                note
            );
            this.#logger.info(
                `Call to createNoteService ended for correlationId: ${correlationId}`
            );
            if (result.exist) {
                this.#logger.error(
                    `Note with title already exists for correlationId: ${correlationId}`
                );
                throw new ApiError(
                    StatusCodes.CONFLICT,
                    "Note with title already exists"
                );
            }
            if (result.failed) {
                this.#logger.error(
                    `Something went wrong while creating the note for correlationId: ${correlationId}`
                );
                throw new ApiError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Something went wrong while creating the note"
                );
            }
            this.#logger.info(
                `Note created Successfully note: ${result.note} for correlationId: ${correlationId}`
            );
            return res
                .status(StatusCodes.CREATED)
                .json(
                    new ApiResponse(
                        StatusCodes.OK,
                        result.note,
                        "Note created Successfully"
                    )
                );
        }
    };
    putNote = async (req: CustomRequest, res: Response) => {
        const correlationId = res.getHeader("X-CorrelationId");
        const user = req.user;
        let noteId = req.params.noteId;
        const noteIdValidationResult = ZObjectIdSchema.safeParse(noteId);
        if (!noteIdValidationResult.success) {
            this.#logger.warn(
                `Invalid noteId: ${noteId} for user: ${user?._id} correlationId: ${correlationId}`
            );
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "Invalid noteId",
                noteIdValidationResult.error.errors
            );
        }
        if (user && noteIdValidationResult.success) {
            noteId = noteIdValidationResult.data;
            const createNoteInput = {
                title: req.body.title,
                note: req.body.note,
            };

            const validationResult =
                ZCreateNoteInputSchema.safeParse(createNoteInput);
            if (!validationResult.success) {
                this.#logger.warn(
                    `Validation failed for update note request payload error ${JSON.stringify(
                        validationResult.error.errors
                    )} corrleationId: ${correlationId}`
                );
                throw new ApiError(
                    StatusCodes.BAD_REQUEST,
                    "Invalid input data",
                    validationResult.error.errors
                );
            }
            const { title, note } = validationResult.data;
            const result = await this.#service.updateNoteService(
                noteId,
                title,
                note,
                user._id
            );
            if (result.exists) {
                this.#logger.error(
                    ` A different Note with title already exists for correlationId: ${correlationId}`
                );
                throw new ApiError(
                    StatusCodes.CONFLICT,
                    "Note with title already exists"
                );
            }
            if (result.doesNotExists) {
                this.#logger.error(
                    `The notes does not exists for noteId: ${noteId}, user: ${user._id} and correlationId: ${correlationId}`
                );
                throw new ApiError(
                    StatusCodes.CONFLICT,
                    "Note does not exists"
                );
            }

            return res
                .status(StatusCodes.OK)
                .json(
                    new ApiResponse(
                        StatusCodes.OK,
                        result.updatedNote,
                        "Note updated successfully"
                    )
                );
        }
    };
    deleteNote = async (req: CustomRequest, res: Response) => {
        const correlationId = res.getHeader("X-CorrelationId");
        const user = req.user;
        let noteId = req.params.noteId;
        const validationResult = ZObjectIdSchema.safeParse(noteId);
        if (!validationResult.success) {
            this.#logger.warn(
                `Invalid noteId: ${noteId} for user: ${user?._id} correlationId: ${correlationId}`
            );
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "Invalid noteId",
                validationResult.error.errors
            );
        }
        if (user && validationResult.success) {
            noteId = validationResult.data;
            const result = await this.#service.deleteNoteService(
                user._id,
                noteId
            );
            if (result.failed) {
                this.#logger.error(
                    `Note does not exists for correlationId: ${correlationId}`
                );
                throw new ApiError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Note does not exists"
                );
            }
            return res
                .status(StatusCodes.OK)
                .json(
                    new ApiResponse(
                        StatusCodes.OK,
                        result.deletedNote,
                        "Deleted Successfully"
                    )
                );
        }
    };
    shareNote = async (req: CustomRequest, res: Response) => {
        const correlationId = res.getHeader("X-CorrelationId");
        const user = req.user;
        let noteId = req.params.noteId;
        const toBeSharedWithEmail = req.body.email;
        const toBeSharedWithUsername = req.body.username;
        this.#logger.info(
            `Recieved request to share note for user: ${user?._id} and noteId:${noteId} for correlationId: ${correlationId}`
        );
        const validationResult = ZObjectIdSchema.safeParse(noteId);
        if (!validationResult.success) {
            this.#logger.warn(
                `Invalid noteId: ${noteId} for user: ${user?._id} correlationId: ${correlationId}`
            );
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "Invalid noteId",
                validationResult.error.errors
            );
        }
        if (
            user &&
            validationResult.success &&
            (toBeSharedWithEmail || toBeSharedWithUsername)
        ) {
            noteId = validationResult.data;
            this.#logger.info(
                `Making call to ShareNoteService for user: ${user?._id} and noteId:${noteId} for correlationId: ${correlationId}`
            );
            const result = await this.#service.shareNoteService(
                user._id,
                noteId,
                toBeSharedWithEmail,
                toBeSharedWithUsername
            );
            this.#logger.info(
                `Call to ShareNoteService ended for user: ${user?._id} and noteId:${noteId} for correlationId: ${correlationId}`
            );
            if (result.notAuthorized) {
                this.#logger.info(
                    `User is not authorized to grant access for user: ${user?._id} and noteId:${noteId} for correlationId: ${correlationId}`
                );
                throw new ApiError(
                    StatusCodes.UNAUTHORIZED,
                    "You are not authorized to grant access"
                );
            }
            if (result.noteDoesNotExists) {
                this.#logger.info(
                    `Note does not exists for user: ${user?._id} and noteId:${noteId} for correlationId: ${correlationId}`
                );
                throw new ApiError(
                    StatusCodes.NOT_FOUND,
                    "Note does not exists"
                );
            }
            if (result.toBeSharedWithUserNotExists) {
                this.#logger.info(
                    `User does not exists with email for user: ${user?._id} and noteId:${noteId} for correlationId: ${correlationId}`
                );
                throw new ApiError(
                    StatusCodes.NOT_FOUND,
                    `User does not exists with email: ${toBeSharedWithEmail} or username: ${toBeSharedWithUsername}`
                );
            }
            if (result.failed) {
                this.#logger.info(
                    `Something went wrong for user: ${user?._id} and noteId:${noteId} for correlationId: ${correlationId}`
                );
                throw new ApiError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Something went wrong"
                );
            }
            this.#logger.info(
                `Access granted successfully for user: ${toBeSharedWithEmail}, ${toBeSharedWithUsername} and noteId:${noteId} for correlationId: ${correlationId}`
            );
            return res
                .status(StatusCodes.OK)
                .json(new ApiResponse(StatusCodes.OK, null, "Access granted"));
        } else {
            if (!(toBeSharedWithEmail && toBeSharedWithUsername)) {
                this.#logger.warn(
                    `Email or username not provided to share the note email: ${toBeSharedWithEmail}, username: ${toBeSharedWithUsername} correlationId: ${correlationId}`
                );
                throw new ApiError(
                    StatusCodes.BAD_REQUEST,
                    "Invalid request email or username required to share"
                );
            } else {
                this.#logger.warn(
                    `Something went wrong while sharing the note for correlationId: ${correlationId}`
                );
                throw new ApiError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Something went wrong while sharing the note"
                );
            }
        }
    };
}
