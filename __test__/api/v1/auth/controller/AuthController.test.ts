import { AuthService } from "../../../../../src/api/v1/auth/service/AuthService";
import { AuthController } from "../../../../../src/api/v1/auth/controller/AuthController";
import { IUser } from "../../../../../src/db";
import { CustomRequest } from "../../../../../src/util/CustomRequest";
import { Response } from "express";
import { ApiError } from "../../../../../src/util/ApiError";

jest.mock("../../../../../src/api/v1/auth/service/AuthService");

describe("AuthController", () => {
    let authController: AuthController;
    let authService: AuthService;
    describe("signup", () => {
        beforeEach(() => {
            authService = new AuthService();
            authController = new AuthController(authService);
            jest.clearAllMocks();
        });
        it("should-signup-successfully", async () => {
            jest.spyOn(authService, "signUpService").mockImplementationOnce(
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
            expect((result as any).body.data._id).toEqual("uuid");
            expect((result as any).body.data.email).toEqual("email@gmail.com");
            expect((result as any).body.data.fullName).toEqual("fullName");
            expect((result as any).body.data.username).toEqual("username");
            expect((result as any).body.message).toEqual(
                "User registered Successfully"
            );
            expect((result as any).body.statusCode).toEqual(200);
            expect((result as any).body.success).toBeTruthy();
            expect((result as any).statusCode).toEqual(201);
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
                    expect(error.statusCode).toEqual(400);
                    expect(error.message).toEqual("Invalid input data");
                });
        });
        it("should-throw-user-exist", () => {
            jest.spyOn(authService, "signUpService").mockImplementationOnce(
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
                    expect(error.statusCode).toEqual(409);
                    expect(error.message).toEqual(
                        "User with email or username already exists"
                    );
                });
        });
        it("should-throw-internal-server", () => {
            jest.spyOn(authService, "signUpService").mockImplementationOnce(
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
                    expect(error.statusCode).toEqual(500);
                    expect(error.message).toEqual(
                        "Something went wrong while registering the user"
                    );
                });
        });
    });
    describe("login", () => {
        beforeEach(() => {
            authService = new AuthService();
            authController = new AuthController(authService);
            jest.clearAllMocks();
        });
        it("should-login-successfully", async () => {
            jest.spyOn(authService, "loginService").mockImplementationOnce(
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
            expect((result as any).body.data.user._id).toEqual("uuid");
            expect((result as any).body.data.user.email).toEqual(
                "email@gmail.com"
            );
            expect((result as any).body.data.user.fullName).toEqual("fullName");
            expect((result as any).body.data.user.username).toEqual("username");
            expect((result as any).body.data.accessToken).toEqual(
                "accessToken"
            );
            expect((result as any).body.data.refreshToken).toEqual(
                "refreshToken"
            );
            expect((result as any).body.message).toEqual(
                "User logged In Successfully"
            );
            expect((result as any).body.statusCode).toEqual(200);
            expect((result as any).body.success).toBeTruthy();
            expect((result as any).statusCode).toEqual(200);
        });
        it("should-invalid-credentials", async () => {
            jest.spyOn(authService, "loginService").mockImplementationOnce(
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
                    expect(error.statusCode).toEqual(401);
                    expect(error.message).toEqual("Invalid user credentials");
                });
        });
        it("should-not-found", async () => {
            jest.spyOn(authService, "loginService").mockImplementationOnce(
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
                    expect(error.statusCode).toEqual(404);
                    expect(error.message).toEqual("User does not exist");
                });
        });
        it("should-fail-internal-server-error", async () => {
            jest.spyOn(authService, "loginService").mockImplementationOnce(
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
                    expect(error.statusCode).toEqual(500);
                    expect(error.message).toEqual("Failed with unknown error");
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
                    expect(error.statusCode).toEqual(400);
                    expect(error.message).toEqual("Invalid input data");
                    expect(error.errors.length).toBeGreaterThan(0);
                });
        });
    });
    describe("logout", () => {
        beforeEach(() => {
            authService = new AuthService();
            authController = new AuthController(authService);
            jest.clearAllMocks();
        });
        it("should-logout-successfully", async () => {
            jest.spyOn(authService, "logoutService").mockImplementationOnce(
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
            expect((result as any).body.data).toEqual({});
            expect((result as any).body.message).toEqual("User logged Out");
            expect((result as any).body.statusCode).toEqual(200);
            expect((result as any).body.success).toBeTruthy();
            expect((result as any).statusCode).toEqual(200);
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
                    expect(error.statusCode).toEqual(401);
                    expect(error.message).toEqual("Unauthorized");
                });
        });
    });
});
