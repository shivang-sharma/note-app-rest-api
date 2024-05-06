// src/ApiResponse.test.ts
import { ApiResponse } from "../../src/util/ApiResponse";
import { expect } from "chai";

describe("ApiResponse", () => {
    it("should create an instance of ApiResponse with the provided values", () => {
        const statusCode = 200;
        const data = { key: "value" };
        const message = "Custom success message";

        const apiResponse = new ApiResponse(statusCode, data, message);

        expect(apiResponse.statusCode).to.be.equal(statusCode);
        expect(apiResponse.data).to.be.equal(data);
        expect(apiResponse.message).to.be.equal(message);
        expect(apiResponse.success).to.be.equal(true);
    });

    it("should create an instance of ApiResponse with default success message if not provided", () => {
        const statusCode = 404;
        const data = null;

        const apiResponse = new ApiResponse(statusCode, data);

        expect(apiResponse.statusCode).to.be.equal(statusCode);
        expect(apiResponse.data).to.be.equal(data);
        expect(apiResponse.message).to.be.equal("Success");
        expect(apiResponse.success).to.be.equal(false);
    });
});
