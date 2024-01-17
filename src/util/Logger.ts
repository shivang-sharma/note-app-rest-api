export class Logger {
    #serviceName: string;
    #fileName: string;
    constructor(serviceName: string, fileName = "") {
        this.#serviceName = serviceName;
        this.#fileName = fileName;
    }
    info(message: string) {
        const level = " INFO";
        this.#log(this.#serviceName, this.#fileName, level, message);
    }
    error(message: string) {
        const level = "ERROR";
        this.#log(this.#serviceName, this.#fileName, level, message);
    }
    warn(message: string) {
        const level = " WARN";
        this.#log(this.#serviceName, this.#fileName, level, message);
    }
    debug(message: string) {
        const level = "DEBUG";
        this.#log(this.#serviceName, this.#fileName, level, message);
    }
    fatal(message: string) {
        const level = "FATAL";
        this.#log(this.#serviceName, this.#fileName, level, message);
    }
    http(message: string) {
        const level = " HTTP";
        this.#log(this.#serviceName, this.#fileName, level, message);
    }

    /**
     * Milliseconds from epoch
     * @param {Number} timestamp
     */
    private formattedTimestamp(timestamp: string | number | Date) {
        const d = new Date(timestamp);
        const formatedTimestamp = `${
            d.toISOString().split("T")[0]
        } ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}:${d.getMilliseconds()}`;
        return formatedTimestamp;
    }
    /**
     *
     * @param {String} serviceName
     * @param {String} fileName
     * @param {String} level
     * @param {String} message
     */
    #log(
        serviceName: string,
        fileName: string,
        level: string,
        message: string
    ) {
        let formattedLog;
        if (fileName.length > 0) {
            formattedLog = `${serviceName} [${this.formattedTimestamp(
                Date.now()
            )}] ${level}: #${fileName} ${JSON.stringify(message)}`;
        } else {
            formattedLog = `${serviceName} [${this.formattedTimestamp(
                Date.now()
            )}] ${level}: ${message.trim()}`;
        }
        console.log(formattedLog);
    }
}
