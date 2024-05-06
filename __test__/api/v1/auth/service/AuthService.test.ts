import {
    AuthService,
    SignUpServiceResult,
    LoginServiceResult,
} from "../../../../../src/api/v1/auth/service/AuthService";
import { ApiError } from "../../../../../src/util/ApiError";
import { IUser } from "../../../../../src/db";
import * as queries from "../../../../../src/db/queries";
import sinon from "sinon";
import { expect } from "chai";
import { ObjectId, Document } from "mongoose";
import Sinon from "sinon";

describe("AuthService", () => {
    let authService: AuthService;
    let sandbox: Sinon.SinonSandbox;
    let expireRefreshTokenByIdStub: sinon.SinonStub<
        [id: string],
        Promise<void>
    >;
    before(() => {
        sandbox = sinon.createSandbox();
        sandbox.reset();
        sandbox.restore();
        sandbox
            .stub(queries, "FindOneUserByUsernameOrEmail")
            .callsFake((username, email) => {
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
                        return resolve(
                            user as unknown as Document<unknown, {}, IUser> &
                                IUser & { _id: ObjectId }
                        );
                    }
                    if (user.email === email || user.username === username) {
                        return resolve(
                            user as unknown as Document<unknown, {}, IUser> &
                                IUser & { _id: ObjectId }
                        );
                    } else {
                        return resolve(null);
                    }
                });
            });

        sandbox
            .stub(queries, "CreateNewUser")
            .callsFake((fullName, username, email, password) => {
                return new Promise((resolve, reject) => {
                    if (username.startsWith("fail")) {
                        return resolve({
                            _id: "notexist",
                        } as unknown as Document<unknown, {}, IUser> &
                            IUser & { _id: ObjectId });
                    } else if (username.startsWith("exception")) {
                        return reject(new Error("Failed"));
                    }
                    const mockUser = {
                        _id: "createdMockUserId",
                        username: username,
                        fullName: email,
                        email: password,
                    };
                    return resolve(
                        mockUser as unknown as Document<unknown, {}, IUser> &
                            IUser & { _id: ObjectId }
                    );
                });
            });

        sandbox.stub(queries, "FindOneUserById").callsFake((id) => {
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
                return resolve(
                    mockUser as unknown as Document<unknown, {}, IUser> &
                        IUser & { _id: ObjectId }
                );
            });
        });

        expireRefreshTokenByIdStub = sandbox
            .stub(queries, "ExpireRefreshTokenById")
            .callsFake((id) => {
                return new Promise((resolve, reject) => {
                    if (id === "failureId") return reject(Error("Failed"));
                    resolve();
                });
            });
    });
    after(() => {
        sandbox.restore();
    });
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

            expect(result.exist).to.be.false;
            expect(result.failed).to.be.false;
            expect(result.user).to.be.deep.equal({
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
            expect(result.exist).to.be.true;
            expect(result.failed).to.be.false;
            expect(result.user).to.be.null;
        });

        it("should handle user creation failure", async () => {
            const result: SignUpServiceResult = await authService.signUpService(
                "failTestUser",
                "Fail User",
                "failTest@example.com",
                "password"
            );
            expect(result.exist).to.be.false;
            expect(result.failed).to.be.true;
            expect(result.user).to.be.null;
        });

        it("should handle unexpected errors", async () => {
            authService
                .signUpService(
                    "exceptionTestUser",
                    "Test User",
                    "test@example.com",
                    "password"
                )
                .catch((error) => {
                    expect(error).to.be.instanceOf(ApiError);
                });
        });
    });

    describe("loginService", () => {
        it("should-login-successfully", async () => {
            const result: LoginServiceResult = await authService.loginService(
                "existing@example.com",
                "password"
            );
            expect(result.doesNotExist).to.be.false;
            expect(result.failed).to.be.false;
            expect(result.invalidCredentials).to.be.false;
            expect(result.accessToken).to.be.equal("accessToken");
            expect(result.refreshToken).to.be.equal("refreshToken");
            expect(result.message).to.be.null;
            expect(result.user).to.be.deep.equal({
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
            expect(result.doesNotExist).to.be.false;
            expect(result.failed).to.be.false;
            expect(result.invalidCredentials).to.be.true;
            expect(result.accessToken).to.be.null;
            expect(result.refreshToken).to.be.null;
            expect(result.message).to.be.null;
            expect(result.user).to.be.null;
        });
        it("should-give-does-not-exist", async () => {
            const result: LoginServiceResult = await authService.loginService(
                "random@example.com",
                "wrongPassword"
            );
            expect(result.doesNotExist).to.be.true;
            expect(result.failed).to.be.false;
            expect(result.invalidCredentials).to.be.false;
            expect(result.accessToken).to.be.null;
            expect(result.refreshToken).to.be.null;
            expect(result.message).to.be.null;
            expect(result.user).to.be.null;
        });
        it("should-fail", async () => {
            const result: LoginServiceResult = await authService.loginService(
                "tokenException@example.com",
                "password"
            );
            expect(result.doesNotExist).to.be.false;
            expect(result.failed).to.be.true;
            expect(result.invalidCredentials).to.be.false;
            expect(result.accessToken).to.be.null;
            expect(result.refreshToken).to.be.null;
            expect(result.message).to.be.equal(
                "Something went wrong while generating referesh and access token"
            );
            expect(result.user).to.be.null;
        });
        it("should-throw-exception", async () => {
            authService
                .loginService("exception@example.com", "password")
                .catch((error) => expect(error).to.be.instanceOf(ApiError));
        });
    });

    describe("logoutService", () => {
        it("should expire refresh token successfully", async () => {
            await authService.logoutService("userId");
            expect(expireRefreshTokenByIdStub.called).to.be.true;
            expect(expireRefreshTokenByIdStub.firstCall.args[0]).to.be.equal(
                "userId"
            );
        });

        it("should handle logout failure", async () => {
            authService
                .logoutService("failureId")
                .catch((error) => expect(error).to.be.instanceOf(ApiError));
            expect(expireRefreshTokenByIdStub.called).to.be.true;
            expect(expireRefreshTokenByIdStub.lastCall.args[0]).to.be.equal(
                "failureId"
            );
        });
    });
});
