import express, { type Request, type Response } from "express";
import compression from "compression";
import helmet from "helmet";
import hpp from "hpp";
import cookieParser from "cookie-parser";

import { getMorganMiddleware } from "./middlewares/MorganMiddleware";
import { corsMiddleware } from "./middlewares/CorsMiddleware";
import { APIV1Router } from "./api/v1";
import { correlationId } from "./middlewares/CorrelationIdMiddleware";
import { ApiError } from "./util/ApiError";
import type { CustomRequest } from "./util/CustomRequest";
import { Logger } from "./util/Logger";
import { StatusCodes } from "http-status-codes";

const service = "API-SERVER";
const logger = new Logger("API-SERVICE", "app.ts");
export const app = express();

app.use(correlationId);
app.disable("x-powered-by");
app.use(compression());
app.use(helmet());
app.use(getMorganMiddleware(service));
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.json({ limit: "16kb" }));
app.use(hpp());
app.options("*", corsMiddleware);
app.use(corsMiddleware);
app.use(cookieParser());

app.use("/api/v1", APIV1Router);

app.use(
    (error: ApiError | Error, req: CustomRequest | Request, res: Response) => {
        if (error instanceof ApiError) {
            logger.error(
                `Error occured for correlationId: ${res.getHeader(
                    "X-CorrelationId"
                )} name: ${error.name} message: ${error.message} cause: ${
                    error.cause
                } data: ${error.data} errors: ${JSON.stringify(
                    error.errors
                )} stack: ${JSON.stringify(error.stack)} statusCode: ${
                    error.statusCode
                } success: ${error.success}`
            );
            return res.status(error.statusCode).json({
                error: error.errors,
                message: error.message,
            });
        } else if (error instanceof Error) {
            logger.error(
                `Error occured for correlationId: ${res.getHeader(
                    "X-CorrelationId"
                )} name: ${error.name} message: ${error.message} cause: ${
                    error.cause
                } stack: ${JSON.stringify(error.stack)} `
            );
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Something went wrong",
            });
        }
    }
);
