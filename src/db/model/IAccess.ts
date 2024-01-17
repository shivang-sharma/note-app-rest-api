import type mongoose from "mongoose";

export interface IAccess {
    user: mongoose.Types.ObjectId;
    note: mongoose.Types.ObjectId;
}
