import sinon from "sinon";
import { expect } from "chai";
import mongoose, { Document, mongo } from "mongoose";
import { SearchService } from "../../../../../src/api/v1/search/service/SearchService";
import { ApiError } from "../../../../../src/util/ApiError";
import { mockNotes, mockAccess } from "../../../../mockData.json";
import * as queries from "../../../../../src/db/queries";
import { IAccess, INote } from "../../../../../src/db";

describe("SearchService", () => {
    before(() => {
        sinon
            .stub(queries, "FindAccessByUserId")
            .callsFake((userId: string) => {
                return new Promise((resolve, reject) => {
                    if (userId.startsWith("exception")) {
                        return reject("Failed");
                    }
                    const access = mockAccess.filter(
                        (access) => access.user === userId
                    );
                    return resolve(
                        access as unknown[] as (Document<unknown, {}, IAccess> &
                            IAccess & { _id: mongoose.Types.ObjectId })[]
                    );
                });
            });
        sinon
            .stub(queries, "SearchNotes")
            .callsFake(
                (
                    ownerId: string,
                    hasAccessToNoteIds: mongoose.Types.ObjectId[],
                    searchString: string
                ) => {
                    return new Promise((resolve, reject) => {
                        const result = mockNotes.filter((mockNote) => {
                            return (
                                (mockNote.owner === ownerId ||
                                    hasAccessToNoteIds.includes(
                                        mockNote._id as unknown as mongoose.Types.ObjectId
                                    )) &&
                                (mockNote.note.includes(searchString) ||
                                    mockNote.title.includes(searchString))
                            );
                        });
                        return resolve(
                            result as unknown as (Document<unknown, {}, INote> &
                                INote & { _id: mongoose.Types.ObjectId })[]
                        );
                    });
                }
            );
    });
    after(() => {
        sinon.restore();
    });
    let searchService: SearchService;
    describe("searchService", () => {
        it("should-return-owned-note", async () => {
            searchService = new SearchService();
            const result = await searchService.searchService(
                "o101",
                "typescript"
            );
            expect(result.length).to.be.equal(1);
            expect(result[0]?._id).to.be.equal("s2");
            expect(result[0]?.title).to.be.equal("Using Typescript");
        });
        it("should-return-shared-note", async () => {
            searchService = new SearchService();
            const result = await searchService.searchService("o101", "cache");
            expect(result.length).to.be.equal(1);
            expect(result[0]?._id).to.be.equal("s5");
            expect(result[0]?.title).to.be.equal("redis");
            expect(result[0]?.owner).to.be.equal("o102");
        });
        it("should-return-both-owned-and-shared-note", async () => {
            searchService = new SearchService();
            const result = await searchService.searchService("o101", "mock");
            expect(result.length).to.be.equal(2);
            expect(result[0]?._id).to.be.equal("s1");
            expect(result[0]?.title).to.be.equal("sample mock title");
            expect(result[0]?.owner).to.be.equal("o101");
            expect(result[1]?._id).to.be.equal("s3");
            expect(result[1]?.title).to.be.equal("Mocking with Jest");
            expect(result[1]?.owner).to.be.equal("o102");
        });
        it("should-return-empty-owned-and-shared-note", async () => {
            searchService = new SearchService();
            const result = await searchService.searchService("o101", "rabbit");
            expect(result.length).to.be.equal(0);
        });
        it("should-throw-internal-server-error", async () => {
            searchService = new SearchService();
            searchService
                .searchService("exception", "rabbit")
                .catch((error) => expect(error).to.be.instanceOf(ApiError));
        });
    });
});
