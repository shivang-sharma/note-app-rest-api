// src/asyncHandler.test.ts
import { asyncHandler } from "../../src/util/AsyncHandler";
import { Response, NextFunction } from "express";
import { CustomRequest } from "../../src/util/CustomRequest";
import { expect } from "chai";
import sinon from "sinon";
describe("asyncHandler", () => {
    it("should call the requestHandler and resolve the promise", async () => {
        const requestHandler = sinon
            .stub()
            .callsFake(
                async (
                    req: CustomRequest,
                    res: Response,
                    next: NextFunction
                ) => {
                    // Mock implementation for requestHandler
                    return res.status(200).json({ message: "Success" });
                }
            );

        const asyncMiddleware = asyncHandler(requestHandler);

        const req = {} as CustomRequest;
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy(),
        };
        const next = sinon.spy();

        await asyncMiddleware(req, res as unknown as Response, next);

        expect(requestHandler.calledOnce).to.be.true;
        expect(requestHandler.firstCall.args).to.be.deep.equal([
            req,
            res,
            next,
        ]);
        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWithExactly(res.status, 200);
        sinon.assert.calledOnce(res.json);
        sinon.assert.calledWithExactly(res.json, { message: "Success" });
        expect(next.called).to.be.false;
    });

    it("should call the requestHandler and reject the promise", async () => {
        const requestHandler = sinon
            .stub()
            .callsFake(
                async (
                    req: CustomRequest,
                    res: Response,
                    next: NextFunction
                ) => {
                    // Mock implementation for requestHandler
                    throw new Error("Test Error");
                }
            );

        const asyncMiddleware = asyncHandler(requestHandler);

        const req = {} as CustomRequest;
        const res = {} as Response;
        const next = sinon.spy();

        await asyncMiddleware(req, res, next);

        expect(requestHandler.calledOnce).to.be.true;
        expect(requestHandler.firstCall.args).to.be.deep.equal([
            req,
            res,
            next,
        ]);
        expect(next.calledOnce).to.true;
        expect(next.firstCall.args[0]).to.be.deep.equal(new Error("Test Error"));
    });
});
