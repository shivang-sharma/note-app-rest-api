import type { Response } from "express";
import type { CustomRequest } from "../../../../util/CustomRequest";
import { Logger } from "../../../../util/Logger";
import type { SearchService } from "../service/SearchService";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../../../../util/ApiResponse";

export class SearchController {
    #logger = new Logger("API-SERVICE", "SearchController.ts");
    #service: SearchService;
    constructor(service: SearchService) {
        this.#service = service;
    }
    search = async (req: CustomRequest, res: Response) => {
        const correlationId = res.getHeader("X-CorrelationId");
        const user = req.user;
        const query = req.query.query?.toString();
        this.#logger.info(
            `Recieved search request for query: ${query}, and user: ${user?._id} and correlationId: ${correlationId}`
        );
        if (user && query) {
            this.#logger.info(
                `Making call to SearchService for query: ${query}, and user: ${user?._id} and correlationId: ${correlationId}`
            );
            const result = await this.#service.searchService(
                user._id.toString(),
                query
            );
            this.#logger.info(
                `Call to SearchService ended for query: ${query}, and user: ${user?._id} and correlationId: ${correlationId}`
            );
            return res
                .status(StatusCodes.OK)
                .json(new ApiResponse(StatusCodes.OK, result));
        }
    };
}
