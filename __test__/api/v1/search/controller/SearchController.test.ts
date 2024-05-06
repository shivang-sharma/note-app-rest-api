import { SearchService } from "../../../../../src/api/v1/search/service/SearchService";
import { SearchController } from "../../../../../src/api/v1/search/controller/SearchController";
import { CustomRequest } from "../../../../../src/util/CustomRequest";
import type { Response } from "express";
import sinon from "sinon";
import { expect } from "chai";
describe("SearchController", () => {
    let searchService: SearchService;
    let searchController: SearchController;
    describe("search", () => {
        beforeEach(() => {
            searchService = new SearchService();
            searchController = new SearchController(searchService);
            sinon.restore();
        });
        it("should-return-200-and-notes", async () => {
            sinon
                .stub(searchService, "searchService")
                .callsFake((userId: string, searchString: string) => {
                    return new Promise((resolve, reject) => {
                        return resolve([]);
                    });
                });
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
            expect((result as any).body.statusCode).to.be.equal(200);
            expect((result as any).body.data.length).to.be.equal(0);
        });
    });
});
