import { SearchService } from "../../../../../src/api/v1/search/service/SearchService";
import { SearchController } from "../../../../../src/api/v1/search/controller/SearchController";
import { CustomRequest } from "../../../../../src/util/CustomRequest";
import type { Response } from "express";
describe("SearchController", () => {
    let searchService: SearchService;
    let searchController: SearchController;
    describe("search", () => {
        beforeEach(() => {
            searchService = new SearchService();
            searchController = new SearchController(searchService);
            jest.clearAllMocks();
        });
        it("should-return-200-and-notes", async () => {
            jest.spyOn(searchService, "searchService").mockImplementation(
                (userId: string, searchString: string) => {
                    return new Promise((resolve, reject) => {
                        return resolve([]);
                    });
                }
            );
            const result = await searchController.search(
                {
                    user: {
                        _id: "id",
                    },
                    query: {
                        query: "redis",
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
            expect((result as any).body.data.length).toEqual(0);
        });
    });
});
