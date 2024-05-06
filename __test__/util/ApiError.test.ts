// src/ApiError.test.ts
import { ApiError } from "../../src/util/ApiError";
import { expect } from "chai";

describe("ApiError", () => {
    it("should create an instance of ApiError with the provided values", () => {
        const statusCode = 404;
        const message = "Not Found";
        const errors = [{ field: "someField", message: "Error message" }];
        const stack = "Error stack trace";

        const apiError = new ApiError(statusCode, message, errors, stack);

        expect(apiError.statusCode).to.be.equal(statusCode);
        expect(apiError.message).to.be.equal(message);
        expect(apiError.errors).to.be.equal(errors);
        expect(apiError.stack).to.be.equal(stack);
    });

    it("should create an instance of ApiError with default values if not provided", () => {
        const apiError = new ApiError(500);

        expect(apiError.statusCode).to.be.equal(500);
        expect(apiError.message).to.be.equal("Something went wrong");
        expect(apiError.errors).to.be.deep.equal([]);
        expect(apiError.stack).not.to.be.undefined; // Expect stack to be defined as it's auto-generated
    });
});
