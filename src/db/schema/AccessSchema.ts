import mongoose, { Schema } from "mongoose";
import type { IAccess } from "../model/IAccess";

export const accessSchema = new Schema<IAccess>(
    {
        note: {
            type: Schema.Types.ObjectId,
            ref: "Note",
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

export const Access = mongoose.model<IAccess>("Access", accessSchema);
