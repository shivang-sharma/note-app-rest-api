import { z } from "zod";

export const ZSignUpInputSchema = z.object({
    username: z
        .string({
            description: "Username",
            invalid_type_error: "Username should be a valid string",
            required_error: "Username is required",
        })
        .min(8, "Username should be of minimum 8 character"),
    fullName: z
        .string({
            description: "Fullname",
            invalid_type_error: "Fullname should be a valid string.",
            required_error: "Fullname is required",
        })
        .min(1, "FullName cannot be empty"),
    email: z
        .string({
            description: "Email Id",
            invalid_type_error: "Email should be a valid email",
            required_error: "Email is required",
        })
        .email({
            message: "Email should be a valid email",
        }),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(50, "Password must be at most 50 characters long")
        .refine((password) => /^(?=.*\d)(?=.*[a-zA-Z])/.test(password), {
            message: "Password must contain at least one letter and one number",
        }),
});
