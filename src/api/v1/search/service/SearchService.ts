import mongoose from "mongoose";
import { Access, Note } from "../../../../db";
import { Logger } from "../../../../util/Logger";
import { ApiError } from "../../../../util/ApiError";
import { StatusCodes } from "http-status-codes";

export class SearchService {
    #logger = new Logger("API-SERVICE", "SearchService.ts");
    constructor() {}
    async searchService(userId: string, query: string) {
        try {
            const sharedNotes = await Access.find({
                user: new mongoose.Types.ObjectId(userId),
            }).select("-user -_id");
            const sharedNotesId = sharedNotes.map(
                (sharedNote) => sharedNote.note
            );
            this.#logger.debug(
                `Shared notes id list: ${JSON.stringify(
                    sharedNotesId
                )} for user : ${userId}`
            );
            const searchResult = await Note.find(
                {
                    $and: [
                        {
                            $or: [
                                { owner: new mongoose.Types.ObjectId(userId) },
                                { _id: { $in: sharedNotesId } },
                            ],
                        },
                        {
                            $text: {
                                $search: query,
                            },
                        },
                    ],
                },
                {
                    score: {
                        $meta: "textScore",
                    },
                }
            )
                .sort({
                    score: {
                        $meta: "textScore",
                    },
                })
                .select("-owner");
            const s2 = await Note.find({
                $or: [
                    { owner: new mongoose.Types.ObjectId(userId) },
                    { _id: { $in: sharedNotesId } },
                ],
            }).select("-owner");
            console.log(s2);
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
