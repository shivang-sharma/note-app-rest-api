// src/asyncHandler.test.ts
import { asyncHandler } from "../../src/util/AsyncHandler";
import { Response, NextFunction } from "express";
import { CustomRequest } from "../../src/util/CustomRequest";

describe("asyncHandler", () => {
    test("should call the requestHandler and resolve the promise", async () => {
        const requestHandler = jest.fn(
            async (req: CustomRequest, res: Response, next: NextFunction) => {
                // Mock implementation for requestHandler
                return res.status(200).json({ message: "Success" });
            }
        );

        const asyncMiddleware = asyncHandler(requestHandler);

        const req = {} as CustomRequest;
        const res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        } as unknown as Response;
        const next = jest.fn();

        await asyncMiddleware(req, res, next);

        expect(requestHandler).toHaveBeenCalledWith(req, res, next);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Success" });
        expect(next).not.toHaveBeenCalled();
    });

    test("should call the requestHandler and reject the promise", async () => {
        const requestHandler = jest.fn(
            async (req: CustomRequest, res: Response, next: NextFunction) => {
                // Mock implementation for requestHandler
                throw new Error("Test Error");
            }
        );

        const asyncMiddleware = asyncHandler(requestHandler);

        const req = {} as CustomRequest;
        const res = {} as Response;
        const next = jest.fn();

        await asyncMiddleware(req, res, next);

        expect(requestHandler).toHaveBeenCalledWith(req, res, next);
        expect(next).toHaveBeenCalledWith(new Error("Test Error"));
    });
});
