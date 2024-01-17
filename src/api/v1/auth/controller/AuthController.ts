import type { Request, Response } from "express";
import { Logger } from "../../../../util/Logger";
import type { AuthService } from "../service/AuthService";
import { ZSignUpInputSchema } from "../zschema/ZSignUpInputSchema";
import { ApiError } from "../../../../util/ApiError";
import { ApiResponse } from "../../../../util/ApiResponse";
import { StatusCodes } from "http-status-codes";
import { ZLoginInputSchema } from "../zschema/ZLoginInputSchema";
import type { CustomRequest } from "../../../../util/CustomRequest";

export class AuthController {
    #logger = new Logger("API-SERVICE", "AuthController.ts");
    #service: AuthService;
    constructor(service: AuthService) {
        this.#service = service;
    }

    signUp = async (req: CustomRequest, res: Response) => {
        const correlationId = res.getHeader("X-CorrelationId");
        this.#logger.info(
            `SignUp request recieved for correlationId: ${correlationId}`
        );
        const userInput = {
            username: req.body.username,
            fullName: req.body.fullName,
            email: req.body.email,
            password: req.body.password,
        };
        this.#logger.info(
            `Validating the signup request payload using zod schema payload: ${userInput} correlationId: ${correlationId}`
        );
        const validationResult = ZSignUpInputSchema.safeParse(userInput);
        if (!validationResult.success) {
            this.#logger.warn(
                `Validation failed for signup request payload error ${JSON.stringify(
                    validationResult.error.errors
                )} corrleationId: ${correlationId}`
            );
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "Invalid input data",
                validationResult.error.errors
            );
        }
        const { email, fullName, password, username } = validationResult.data;
        this.#logger.info(
            `Validation successfull for signup request payload for correlationId: ${correlationId}`
        );
        this.#logger.info(
            `Attempting to call signUpService for correlationId: ${correlationId}`
        );
        const result = await this.#service.signUpService(
            username,
            fullName,
            email,
            password
        );
        this.#logger.info(
            `Call to signup service ended for correlationId: ${correlationId}`
        );
        if (result.exist) {
            this.#logger.error(
                `User with email of username already exists for correlationId: ${correlationId}`
            );
            throw new ApiError(
                StatusCodes.CONFLICT,
                "User with email or username already exists"
            );
        }
        if (result.failed) {
            this.#logger.error(
                `Something went wrong while registering the user for correlationId: ${correlationId}`
            );
            throw new ApiError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Something went wrong while registering the user"
            );
        }
        this.#logger.info(
            `User registered Successfully user: ${result.user} for correlationId: ${correlationId}`
        );
        return res
            .status(StatusCodes.CREATED)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    result.user,
                    "User registered Successfully"
                )
            );
    };
    login = async (req: Request, res: Response) => {
        const correlationId = res.getHeader("X-CorrelationId");
        this.#logger.info(
            `Login request recieved for correlationId: ${correlationId}`
        );
        const loginInput = {
            email: req.body.email,
            password: req.body.password,
        };
        this.#logger.info(
            `Validating the login request payload using zod schema for correlationId: ${correlationId}`
        );
        const validationResult = ZLoginInputSchema.safeParse(loginInput);
        if (!validationResult.success) {
            this.#logger.warn(
                `Validation failed for login request payload error ${JSON.stringify(
                    validationResult.error.errors
                )} corrleationId: ${correlationId}`
            );
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "Invalid input data",
                validationResult.error.errors
            );
        }
        const { email, password } = validationResult.data;
        this.#logger.info(
            `Validation successfull for login request payload for correlationId: ${correlationId}`
        );
        this.#logger.info(
            `Attempting to call loginService for correlationId: ${correlationId}`
        );
        const result = await this.#service.loginService(email, password);
        if (result.doesNotExist) {
            throw new ApiError(StatusCodes.NOT_FOUND, "User does not exist");
        }
        if (result.invalidCredentials) {
            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                "Invalid user credentials"
            );
        }
        if (result.failed && result.message) {
            throw new ApiError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                result.message
            );
        }
        const options = {
            httpOnly: true,
            secure: true,
        };
        return res
            .status(200)
            .cookie("accessToken", result.accessToken, options)
            .cookie("refreshToken", result.refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: result.user,
                        accessToken: result.accessToken,
                        refreshToken: result.refreshToken,
                    },
                    "User logged In Successfully"
                )
            );
    };
    logout = async (req: CustomRequest, res: Response) => {
        if (req.user) {
            await this.#service.logoutService(req.user._id);
            const options = {
                httpOnly: true,
                secure: true,
            };
            return res
                .status(200)
                .clearCookie("accessToken", options)
                .clearCookie("refreshToken", options)
                .json(new ApiResponse(200, {}, "User logged Out"));
        }
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
    };
}
