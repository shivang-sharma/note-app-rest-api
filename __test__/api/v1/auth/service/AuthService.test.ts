import {
    AuthService,
    SignUpServiceResult,
    LoginServiceResult,
} from "../../../../../src/api/v1/auth/service/AuthService";
import { ApiError } from "../../../../../src/util/ApiError";
import { ExpireRefreshTokenById } from "../../../../../src/db";

jest.mock("../../../../../src/db/queries", () => {
    const originalModule = jest.requireActual("../../../../../src/db/queries");
    return {
        __esModule: true,
        ...originalModule,
        FindOneUserByUsernameOrEmail: jest.fn(
            (username: string, email: string) => {
                const user = {
                    _id: "mockUserId",
                    username: "existingUser",
                    fullName: "Existing User",
                    email: "existing@example.com",
                    password: "password",
                    isPasswordCorrect: (password: string) => {
                        return password === "password";
                    },
                    generateAccessToken: () => "accessToken",
                    generateRefreshToken: () => "refreshToken",
                    save: () => {
                        if (
                            email.startsWith("tokenException") ||
                            username.startsWith("tokenException")
                        ) {
                            throw new Error("Failed to generate token");
                        }
                    },
                };
                return new Promise((resolve, reject) => {
                    if (
                        username.startsWith("exception") ||
                        email.startsWith("exception")
                    )
                        throw new Error("Failed");
                    if (
                        email.startsWith("tokenException") ||
                        username.startsWith("tokenException")
                    ) {
                        return resolve(user);
                    }
                    if (user.email === email || user.username === username) {
                        return resolve(user);
                    } else {
                        return resolve(null);
                    }
                });
            }
        ),
        CreateNewUser: jest.fn(
            (
                fullName: string,
                username: string,
                email: string,
                password: string
            ) => {
                return new Promise((resolve, reject) => {
                    if (username.startsWith("fail")) {
                        return resolve({ _id: "notexist" });
                    } else if (username.startsWith("exception")) {
                        return reject(new Error("Failed"));
                    }
                    const mockUser = {
                        _id: "createdMockUserId",
                        username: username,
                        fullName: email,
                        email: password,
                    };
                    return resolve(mockUser);
                });
            }
        ),
        FindOneUserById: jest.fn((id: string) => {
            return new Promise((resolve, reject) => {
                const mockUser = {
                    _id: "createdMockUserId",
                    username: "testUser",
                    fullName: "Test User",
                    email: "test@example.com",
                };
                if (id === "notexist") {
                    return resolve(null);
                }
                return resolve(mockUser);
            });
        }),
        ExpireRefreshTokenById: jest.fn((id: string) => {
            if (id === "failureId") throw new Error("Failed");
        }),
    };
});

describe("AuthService", () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
    });

    describe("signUpService", () => {
        it("should sign up a new user successfully", async () => {
            const result: SignUpServiceResult = await authService.signUpService(
                "testUser",
                "Test User",
                "test@example.com",
                "password"
            );

            expect(result.exist).toBeFalsy();
            expect(result.failed).toBeFalsy();
            expect(result.user).toEqual({
                _id: "createdMockUserId",
                username: "testUser",
                fullName: "Test User",
                email: "test@example.com",
            });
        });

        it("should handle existing user during signup", async () => {
            const result: SignUpServiceResult = await authService.signUpService(
                "existingUser",
                "Existing User",
                "existing@example.com",
                "password"
            );
            expect(result.exist).toBeTruthy();
            expect(result.failed).toBeFalsy();
            expect(result.user).toBeNull();
        });

        it("should handle user creation failure", async () => {
            const result: SignUpServiceResult = await authService.signUpService(
                "failTestUser",
                "Fail User",
                "failTest@example.com",
                "password"
            );
            expect(result.exist).toBeFalsy();
            expect(result.failed).toBeTruthy();
            expect(result.user).toBeNull();
        });

        it("should handle unexpected errors", async () => {
            await expect(
                authService.signUpService(
                    "exceptionTestUser",
                    "Test User",
                    "test@example.com",
                    "password"
                )
            ).rejects.toThrow(ApiError);
        });
    });

    describe("loginService", () => {
        it("should-login-successfully", async () => {
            const result: LoginServiceResult = await authService.loginService(
                "existing@example.com",
                "password"
            );
            expect(result.doesNotExist).toBeFalsy();
            expect(result.failed).toBeFalsy();
            expect(result.invalidCredentials).toBeFalsy();
            expect(result.accessToken).toEqual("accessToken");
            expect(result.refreshToken).toEqual("refreshToken");
            expect(result.message).toBeNull();
            expect(result.user).toEqual({
                _id: "createdMockUserId",
                username: "testUser",
                fullName: "Test User",
                email: "test@example.com",
            });
        });
        it("should-give-invalid-credentials", async () => {
            const result: LoginServiceResult = await authService.loginService(
                "existing@example.com",
                "wrongPassword"
            );
            expect(result.doesNotExist).toBeFalsy();
            expect(result.failed).toBeFalsy();
            expect(result.invalidCredentials).toBeTruthy();
            expect(result.accessToken).toBeNull();
            expect(result.refreshToken).toBeNull();
            expect(result.message).toBeNull();
            expect(result.user).toBeNull();
        });
        it("should-give-does-not-exist", async () => {
            const result: LoginServiceResult = await authService.loginService(
                "random@example.com",
                "wrongPassword"
            );
            expect(result.doesNotExist).toBeTruthy();
            expect(result.failed).toBeFalsy();
            expect(result.invalidCredentials).toBeFalsy();
            expect(result.accessToken).toBeNull();
            expect(result.refreshToken).toBeNull();
            expect(result.message).toBeNull();
            expect(result.user).toBeNull();
        });
        it("should-fail", async () => {
            const result: LoginServiceResult = await authService.loginService(
                "tokenException@example.com",
                "password"
            );
            expect(result.doesNotExist).toBeFalsy();
            expect(result.failed).toBeTruthy();
            expect(result.invalidCredentials).toBeFalsy();
            expect(result.accessToken).toBeNull();
            expect(result.refreshToken).toBeNull();
            expect(result.message).toEqual(
                "Something went wrong while generating referesh and access token"
            );
            expect(result.user).toBeNull();
        });
        it("should-throw-exception", async () => {
            await expect(
                authService.loginService("exception@example.com", "password")
            ).rejects.toThrow(ApiError);
        });
    });

    describe("logoutService", () => {
        it("should expire refresh token successfully", async () => {
            await authService.logoutService("userId");
            expect(ExpireRefreshTokenById).toHaveBeenCalledWith("userId");
        });

        it("should handle logout failure", async () => {
            await expect(
                authService.logoutService("failureId")
            ).rejects.toThrow(ApiError);

            expect(ExpireRefreshTokenById).toHaveBeenCalledWith("failureId");
        });
    });
});
