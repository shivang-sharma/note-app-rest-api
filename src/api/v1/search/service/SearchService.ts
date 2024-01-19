import {  FindAccessByUserId, SearchNotes } from "../../../../db";
import { Logger } from "../../../../util/Logger";
import { ApiError } from "../../../../util/ApiError";
import { StatusCodes } from "http-status-codes";

export class SearchService {
    #logger = new Logger("API-SERVICE", "SearchService.ts");
    constructor() {}
    async searchService(userId: string, query: string) {
        try {
            const sharedNotes = await FindAccessByUserId(userId);
            const sharedNotesId = sharedNotes.map(
                (sharedNote) => sharedNote.note
            );
            this.#logger.debug(
                `Shared notes id list: ${JSON.stringify(
                    sharedNotesId
                )} for user : ${userId}`
            );
            const searchResult = await SearchNotes(
                userId,
                sharedNotesId,
                query
            );
            return searchResult;
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
