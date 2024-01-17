import { z } from "zod";

export const ZCreateNoteInputSchema = z.object({
    title: z.string({
        required_error: "Title is required",
        invalid_type_error: "Title must be a valid string",
    }),
    note: z.string({
        required_error: "Note is required",
        invalid_type_error: "Note must be a valid string",
    }),
});
