import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../util/ApiError";
import { User } from "../db";
import type { CustomRequest } from "../util/CustomRequest";
import { StatusCodes } from "http-status-codes";

export const authenticate = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        console.log(token);
        if (!token) {
            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                "Unauthorized request"
            );
        }

        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET || "secrete"
        );

        const user = await User.findById(
            (decodedToken as jwt.JwtPayload)?._id
        ).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                "Invalid Access Token"
            );
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            (error as Error).message || "Invalid access token"
        );
    }
};
