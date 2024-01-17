import type mongoose from "mongoose";

export interface INote {
    title: string;
    note: string;
    owner: mongoose.Types.ObjectId;
}
