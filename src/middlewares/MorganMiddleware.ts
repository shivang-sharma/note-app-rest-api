import morgan from "morgan";
import { Logger } from "../util/Logger";

export function getMorganMiddleware(service: string) {
    const logger = new Logger(service);

    const stream = {
        // Use the http severity
        write: (message: string) => logger.http(message),
    };
    const morganMiddleware = morgan(
        ':remote-addr - :remote-user ":method :url HTTP/:http-version" :res[X-CorrelationId] :status :response-time[2] :res[content-length] ":referrer" ":user-agent"',
        { stream }
    );
    return morganMiddleware;
}
