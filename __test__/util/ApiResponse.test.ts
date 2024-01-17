// src/ApiResponse.test.ts
import { ApiResponse } from "../../src/util/ApiResponse";

describe("ApiResponse", () => {
    test("should create an instance of ApiResponse with the provided values", () => {
        const statusCode = 200;
        const data = { key: "value" };
        const message = "Custom success message";

        const apiResponse = new ApiResponse(statusCode, data, message);

        expect(apiResponse.statusCode).toBe(statusCode);
        expect(apiResponse.data).toEqual(data);
        expect(apiResponse.message).toBe(message);
        expect(apiResponse.success).toBe(true);
    });

    test("should create an instance of ApiResponse with default success message if not provided", () => {
        const statusCode = 404;
        const data = null;

        const apiResponse = new ApiResponse(statusCode, data);

        expect(apiResponse.statusCode).toBe(statusCode);
        expect(apiResponse.data).toBe(data);
        expect(apiResponse.message).toBe("Success");
        expect(apiResponse.success).toBe(false);
    });
});
