import request from "supertest";
import { app } from "../../src/app";
import { connectDB } from "../../src/db";
import mongoose from "mongoose";
describe("AuthIntegrationTest", () => {
    describe("/api/v1/auth/signup", async () => {
        beforeEach(async () => {
            const uri = process.env.MONGODB_URI || "";
            await connectDB(uri);
        });
        afterEach(async () => {
           await mongoose.connection.close()
        });
        const result = await request(app).post("/api/v1/auth/signup");
    });
});
