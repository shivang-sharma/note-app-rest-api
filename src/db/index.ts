import mongoose from "mongoose";

export const connectDB = async (uri: string) => {
    try {
        const connectionInstance = await mongoose.connect(uri);
        console.log(
            `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1);
    }
};

export * from "./queries";
export * from "./schema/AccessSchema";
export * from "./schema/NoteSchema";
export * from "./schema/UserSchema";
export * from "./model/IAccess";
export * from "./model/INote";
export * from "./model/IUser";
