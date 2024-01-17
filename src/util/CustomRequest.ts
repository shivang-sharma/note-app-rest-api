import type { IUser } from "../db/model/IUser";
import type { Request } from "express";
export interface CustomRequest extends Request {
    user?: IUser;
}
