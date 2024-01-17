import dotenv from "dotenv";
import { createServer } from "http";
import { app } from "./app";
import { Logger } from "./util/Logger";
import { connectDB } from "./db";

dotenv.config();

const logger = new Logger("API-SERVER", "index.ts");
const connectionUrl = process.env.MONGODB_URI || "";
connectDB(connectionUrl)
    .then(() => {
        const port = process.env.PORT || 5000;
        const server = createServer(app);

        server.listen(port, () => {
            logger.info(`REST Server listening on port  ${port}`);
        });
    })
    .catch((err) => {
        logger.error(`MONGO db connection failed !!! ${err}`);
    });
