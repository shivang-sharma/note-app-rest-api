import mongoose, { Schema } from "mongoose";
import type { INote } from "../model/INote";

export const noteSchema = new Schema<INote>(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            text: true,
        },
        note: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

export const Note = mongoose.model<INote>("Note", noteSchema);
