// src/ApiError.test.ts
import { ApiError } from "../../src/util/ApiError";

describe("ApiError", () => {
    test("should create an instance of ApiError with the provided values", () => {
        const statusCode = 404;
        const message = "Not Found";
        const errors = [{ field: "someField", message: "Error message" }];
        const stack = "Error stack trace";

        const apiError = new ApiError(statusCode, message, errors, stack);

        expect(apiError.statusCode).toBe(statusCode);
        expect(apiError.message).toBe(message);
        expect(apiError.errors).toEqual(errors);
        expect(apiError.stack).toBe(stack);
    });

    test("should create an instance of ApiError with default values if not provided", () => {
        const apiError = new ApiError(500);

        expect(apiError.statusCode).toBe(500);
        expect(apiError.message).toBe("Something went wrong");
        expect(apiError.errors).toEqual([]);
        expect(apiError.stack).toBeDefined(); // Expect stack to be defined as it's auto-generated
    });
});
