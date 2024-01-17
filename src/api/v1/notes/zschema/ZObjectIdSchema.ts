import mongoose from "mongoose";
import { z } from "zod";

export const ZObjectIdSchema = z.string().refine((value) => {
    try {
        // Try to create a MongoDB ObjectId from the given value
        new mongoose.Types.ObjectId(value);
        return true; // If successful, the value is a valid ObjectId
    } catch (error) {
        return false; // If an error occurs, the value is not a valid ObjectId
    }
});
