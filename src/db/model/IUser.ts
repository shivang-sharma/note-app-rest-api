import type { Document } from "mongoose";

export interface IUser extends Document {
    username: string;
    fullName: string;
    email: string;
    password: string;
    refreshToken: string;
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}
