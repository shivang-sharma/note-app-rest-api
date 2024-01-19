import { SearchService } from "../../../../../src/api/v1/search/service/SearchService";
import { ApiError } from "../../../../../src/util/ApiError";
import { mockNotes, mockAccess } from "../../../../mockData.json";
jest.mock("../../../../../src/db/queries", () => {
    const orignalModule = jest.requireActual("../../../../../src/db/queries");
    return {
        __esModule: true,
        ...orignalModule,
        FindAccessByUserId: jest.fn().mockImplementation((userId: string) => {
            if (userId.startsWith("exception")) {
                throw new Error("Failed");
            }
            const access = mockAccess.filter(
                (access) => access.user === userId
            );
            return access;
        }),
        SearchNotes: jest
            .fn()
            .mockImplementation(
                (
                    ownerId: string,
                    hasAccessToNoteIds: string[],
                    searchString: string
                ) => {
                    const result = mockNotes.filter((mockNote) => {
                        return (
                            (mockNote.owner === ownerId ||
                                hasAccessToNoteIds.includes(mockNote._id)) &&
                            (mockNote.note.includes(searchString) ||
                                mockNote.title.includes(searchString))
                        );
                    });
                    return result;
                }
            ),
    };
});

describe("SearchService", () => {
    let searchService: SearchService;
    describe("searchService", () => {
        it("should-return-owned-note", async () => {
            searchService = new SearchService();
            const result = await searchService.searchService(
                "o101",
                "typescript"
            );
            expect(result.length).toEqual(1);
            expect(result[0]?._id).toEqual("s2");
            expect(result[0]?.title).toEqual("Using Typescript");
        });
        it("should-return-shared-note", async () => {
            searchService = new SearchService();
            const result = await searchService.searchService("o101", "cache");
            expect(result.length).toEqual(1);
            expect(result[0]?._id).toEqual("s5");
            expect(result[0]?.title).toEqual("redis");
            expect(result[0]?.owner).toEqual("o102");
        });
        it("should-return-both-owned-and-shared-note", async () => {
            searchService = new SearchService();
            const result = await searchService.searchService("o101", "mock");
            expect(result.length).toEqual(2);
            expect(result[0]?._id).toEqual("s1");
            expect(result[0]?.title).toEqual("sample mock title");
            expect(result[0]?.owner).toEqual("o101");
            expect(result[1]?._id).toEqual("s3");
            expect(result[1]?.title).toEqual("Mocking with Jest");
            expect(result[1]?.owner).toEqual("o102");
        });
        it("should-return-empty-owned-and-shared-note", async () => {
            searchService = new SearchService();
            const result = await searchService.searchService("o101", "rabbit");
            expect(result.length).toEqual(0);
        });
        it("should-throw-internal-server-error", async () => {
            searchService = new SearchService();
            expect(
                searchService.searchService("exception", "rabbit")
            ).rejects.toThrow(ApiError);
        });
    });
});
