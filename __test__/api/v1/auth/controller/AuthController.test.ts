import { AuthService } from "../../../../../src/api/v1/auth/service/AuthService";
import { AuthController } from "../../../../../src/api/v1/auth/controller/AuthController";
import { IUser } from "../../../../../src/db";
import { CustomRequest } from "../../../../../src/util/CustomRequest";
import { Response } from "express";
import { ApiError } from "../../../../../src/util/ApiError";
import { expect } from "chai";
import sinon from "sinon";

// jest.mock("../../../../../src/api/v1/auth/service/AuthService");

describe("AuthController", () => {
    let authController: AuthController;
    let authService: AuthService;
    describe("signup", () => {
        beforeEach(() => {
            authService = new AuthService();
            authController = new AuthController(authService);
            // jest.clearAllMocks();
            sinon.restore();
        });
        it("should-signup-successfully", async () => {
            sinon
                .stub(authService, "signUpService")
                .callsFake(
                    (
                        username: string,
                        fullName: string,
                        email: string,
                        password: string
                    ) => {
                        return new Promise((resolve, reject) => {
                            resolve({
                                exist: false,
                                failed: false,
                                user: {
                                    _id: "uuid",
                                    username: username,
                                    fullName: fullName,
                                    email: email,
                                } as IUser,
                            });
                        });
                    }
                );
            const result = await authController.signUp(
                {
                    body: {
                        username: "username",
                        fullName: "fullName",
                        email: "email@gmail.com",
                        password: "Password@123",
                    },
                } as CustomRequest,
                {
                    getHeader: (header: string) => {
                        if (header === "X-CorrelationId") {
                            return "correlationId";
                        }
                    },
                    status: (code: number) => {
                        return {
                            json: (body: any) => {
                                return {
                                    body: body,
                                    statusCode: code,
                                } as unknown as Response<
                                    any,
                                    Record<string, any>
                                >;
                            },
                        };
                    },
                } as Response
            );
            expect((result as any).body.data._id).to.be.equal("uuid");
            expect((result as any).body.data.email).to.be.equal("email@gmail.com");
            expect((result as any).body.data.fullName).to.be.equal("fullName");
            expect((result as any).body.data.username).to.be.equal("username");
            expect((result as any).body.message).to.be.equal(
                "User registered Successfully"
            );
            expect((result as any).body.statusCode).to.be.equal(200);
            expect((result as any).body.success).to.be.true;
            expect((result as any).statusCode).to.be.equal(201);
        });
        it("should-fail-for-invalid-body", async () => {
            authController
                .signUp(
                    {
                        body: {
                            username: "use",
                            fullName: "f",
                            email: "em",
                            password: "3",
                        },
                    } as CustomRequest,
                    {
                        getHeader: (header: string) => {
                            if (header === "X-CorrelationId") {
                                return "correlationId";
                            }
                        },
                    } as Response
                )
                .catch((error: ApiError) => {
                    expect(error.statusCode).to.be.equal(400);
                    expect(error.message).to.be.equal("Invalid input data");
                });
        });
        it("should-throw-user-exist", () => {
            sinon.stub(authService, "signUpService").callsFake(
                (
                    username: string,
                    fullName: string,
                    email: string,
                    password: string
                ) => {
                    return new Promise((resolve, reject) => {
                        resolve({
                            exist: true,
                            failed: false,
                            user: null,
                        });
                    });
                }
            );
            authController
                .signUp(
                    {
                        body: {
                            username: "username",
                            fullName: "fullName",
                            email: "email@gmail.com",
                            password: "Password@123",
                        },
                    } as CustomRequest,
                    {
                        getHeader: (header: string) => {
                            if (header === "X-CorrelationId") {
                                return "correlationId";
                            }
                        },
                    } as Response
                )
                .catch((error) => {
                    expect(error.statusCode).to.be.equal(409);
                    expect(error.message).to.be.equal(
                        "User with email or username already exists"
                    );
                });
        });
        it("should-throw-internal-server", () => {
            sinon.stub(authService, "signUpService").callsFake(
                (
                    username: string,
                    fullName: string,
                    email: string,
                    password: string
                ) => {
                    return new Promise((resolve, reject) => {
                        resolve({
                            exist: false,
                            failed: true,
                            user: null,
                        });
                    });
                }
            );
            authController
                .signUp(
                    {
                        body: {
                            username: "username",
                            fullName: "fullName",
                            email: "email@gmail.com",
                            password: "Password@123",
                        },
                    } as CustomRequest,
                    {
                        getHeader: (header: string) => {
                            if (header === "X-CorrelationId") {
                                return "correlationId";
                            }
                        },
                    } as Response
                )
                .catch((error) => {
                    expect(error.statusCode).to.be.equal(500);
                    expect(error.message).to.be.equal(
                        "Something went wrong while registering the user"
                    );
                });
        });
    });
    describe("login", () => {
        beforeEach(() => {
            authService = new AuthService();
            authController = new AuthController(authService);
            // jest.clearAllMocks();
            sinon.restore()
        });
        it("should-login-successfully", async () => {
            sinon.stub(authService, "loginService").callsFake(
                (email: string, password: string) => {
                    return new Promise((resolve, reject) => {
                        resolve({
                            doesNotExist: false,
                            failed: false,
                            accessToken: "accessToken",
                            invalidCredentials: false,
                            message: null,
                            refreshToken: "refreshToken",
                            user: {
                                _id: "uuid",
                                username: "username",
                                fullName: "fullName",
                                email: email,
                            } as IUser,
                        });
                    });
                }
            );
            const result = await authController.login(
                {
                    body: {
                        email: "email@gmail.com",
                        password: "Password@123",
                    },
                } as CustomRequest,
                {
                    getHeader: (header: string) => {
                        if (header === "X-CorrelationId") {
                            return "correlationId";
                        }
                    },
                    status: (code: number) => {
                        return {
                            cookie: (
                                name: string,
                                value: string,
                                options: any
                            ) => {
                                return {
                                    cookie: (
                                        name: string,
                                        value: string,
                                        options: any
                                    ) => {
                                        return {
                                            json: (body: any) => {
                                                return {
                                                    body: body,
                                                    statusCode: code,
                                                } as unknown as Response<
                                                    any,
                                                    Record<string, any>
                                                >;
                                            },
                                        };
                                    },
                                };
                            },
                        };
                    },
                } as Response
            );
            expect((result as any).body.data.user._id).to.be.equal("uuid");
            expect((result as any).body.data.user.email).to.be.equal(
                "email@gmail.com"
            );
            expect((result as any).body.data.user.fullName).to.be.equal("fullName");
            expect((result as any).body.data.user.username).to.be.equal("username");
            expect((result as any).body.data.accessToken).to.be.equal(
                "accessToken"
            );
            expect((result as any).body.data.refreshToken).to.be.equal(
                "refreshToken"
            );
            expect((result as any).body.message).to.be.equal(
                "User logged In Successfully"
            );
            expect((result as any).body.statusCode).to.be.equal(200);
            expect((result as any).body.success).to.be.true
            expect((result as any).statusCode).to.be.equal(200);
        });
        it("should-invalid-credentials", async () => {
            sinon.stub(authService, "loginService").callsFake(
                (email: string, password: string) => {
                    return new Promise((resolve, reject) => {
                        resolve({
                            doesNotExist: false,
                            failed: false,
                            accessToken: null,
                            invalidCredentials: true,
                            message: null,
                            refreshToken: null,
                            user: null,
                        });
                    });
                }
            );
            authController
                .login(
                    {
                        body: {
                            email: "email@gmail.com",
                            password: "Password@123",
                        },
                    } as CustomRequest,
                    {
                        getHeader: (header: string) => {
                            if (header === "X-CorrelationId") {
                                return "correlationId";
                            }
                        },
                    } as Response
                )
                .catch((error: ApiError) => {
                    expect(error.statusCode).to.be.equal(401);
                    expect(error.message).to.be.equal("Invalid user credentials");
                });
        });
        it("should-not-found", async () => {
            sinon.stub(authService, "loginService").callsFake(
                (email: string, password: string) => {
                    return new Promise((resolve, reject) => {
                        resolve({
                            doesNotExist: true,
                            failed: false,
                            accessToken: null,
                            invalidCredentials: false,
                            message: null,
                            refreshToken: null,
                            user: null,
                        });
                    });
                }
            );
            authController
                .login(
                    {
                        body: {
                            email: "email@gmail.com",
                            password: "Password@123",
                        },
                    } as CustomRequest,
                    {
                        getHeader: (header: string) => {
                            if (header === "X-CorrelationId") {
                                return "correlationId";
                            }
                        },
                    } as Response
                )
                .catch((error: ApiError) => {
                    expect(error.statusCode).to.be.equal(404);
                    expect(error.message).to.be.equal("User does not exist");
                });
        });
        it("should-fail-internal-server-error", async () => {
            sinon.stub(authService, "loginService").callsFake(
                (email: string, password: string) => {
                    return new Promise((resolve, reject) => {
                        resolve({
                            doesNotExist: false,
                            failed: true,
                            accessToken: null,
                            invalidCredentials: false,
                            message: "Failed with unknown error",
                            refreshToken: null,
                            user: null,
                        });
                    });
                }
            );
            authController
                .login(
                    {
                        body: {
                            email: "email@gmail.com",
                            password: "Password@123",
                        },
                    } as CustomRequest,
                    {
                        getHeader: (header: string) => {
                            if (header === "X-CorrelationId") {
                                return "correlationId";
                            }
                        },
                    } as Response
                )
                .catch((error: ApiError) => {
                    expect(error.statusCode).to.be.equal(500);
                    expect(error.message).to.be.equal("Failed with unknown error");
                });
        });
        it("should-fail-invalid-payload", async () => {
            authController
                .login(
                    {
                        body: {
                            email: "e",
                            password: "p",
                        },
                    } as CustomRequest,
                    {
                        getHeader: (header: string) => {
                            if (header === "X-CorrelationId") {
                                return "correlationId";
                            }
                        },
                    } as Response
                )
                .catch((error: ApiError) => {
                    expect(error.statusCode).to.be.equal(400);
                    expect(error.message).to.be.equal("Invalid input data");
                    expect(error.errors.length).to.have.greaterThan(0);
                });
        });
    });
    describe("logout", () => {
        beforeEach(() => {
            authService = new AuthService();
            authController = new AuthController(authService);
            sinon.restore()
        });
        it("should-logout-successfully", async () => {
            sinon.stub(authService, "logoutService").callsFake(
                (id: string) => {
                    return new Promise((resolve, reject) => {
                        resolve();
                    });
                }
            );
            const result = await authController.logout(
                {
                    user: {
                        email: "e",
                        password: "p",
                    },
                } as CustomRequest,
                {
                    getHeader: (header: string) => {
                        if (header === "X-CorrelationId") {
                            return "correlationId";
                        }
                    },
                    status: (code: number) => {
                        return {
                            clearCookie: (name: string, options: any) => {
                                return {
                                    clearCookie: (
                                        name: string,
                                        options: any
                                    ) => {
                                        return {
                                            json: (body: any) => {
                                                return {
                                                    body: body,
                                                    statusCode: code,
                                                } as unknown as Response<
                                                    any,
                                                    Record<string, any>
                                                >;
                                            },
                                        };
                                    },
                                };
                            },
                        };
                    },
                } as Response
            );
            expect((result as any).body.data).to.be.deep.equal({});
            expect((result as any).body.message).to.be.equal("User logged Out");
            expect((result as any).body.statusCode).to.be.equal(200);
            expect((result as any).body.success).to.be.true;
            expect((result as any).statusCode).to.be.equal(200);
        });
        it("should-throw-unauthorized", async () => {
            authController
                .logout(
                    {} as CustomRequest,
                    {
                        getHeader: (header: string) => {
                            if (header === "X-CorrelationId") {
                                return "correlationId";
                            }
                        },
                    } as Response
                )
                .catch((error: ApiError) => {
                    expect(error.statusCode).to.be.equal(401);
                    expect(error.message).to.be.equal("Unauthorized");
                });
        });
    });
});
