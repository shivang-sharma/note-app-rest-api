// src/Logger.test.ts
import { Logger } from "../../src/util/Logger";

describe("Logger", () => {
    // Mock console.log
    const mockConsoleLog = jest.spyOn(console, "log").mockImplementation();

    beforeEach(() => {
        // Clear mock calls before each test
        mockConsoleLog.mockClear();
    });

    test("should log info message", () => {
        const logger = new Logger("serviceName");

        // Use Object.getPrototypeOf to access the prototype of the class
        const prototype = Object.getPrototypeOf(logger);
        // Spy on the formattedTimestamp method
        const mockFormattedTimestamp = jest.spyOn<any, any>(
            prototype as any,
            "formattedTimestamp"
        );

        // Mock the implementation of the formattedTimestamp method
        mockFormattedTimestamp.mockReturnValue("2024-01-07 14:21:8:840");

        // Call a method that invokes the private method
        logger.info("Info message");

        // Check if the formattedTimestamp method was called
        expect(mockFormattedTimestamp).toHaveBeenCalled();

        // Check the log statement
        expect(mockConsoleLog).toHaveBeenCalledWith(
            "serviceName [2024-01-07 14:21:8:840]  INFO: Info message"
        );
    });

    test("should log debug message", () => {
        const logger = new Logger("serviceName");

        // Use Object.getPrototypeOf to access the prototype of the class
        const prototype = Object.getPrototypeOf(logger);
        // Spy on the formattedTimestamp method
        const mockFormattedTimestamp = jest.spyOn<any, any>(
            prototype as any,
            "formattedTimestamp"
        );

        // Mock the implementation of the formattedTimestamp method
        mockFormattedTimestamp.mockReturnValue("2024-01-07 14:21:8:840");

        // Call a method that invokes the private method
        logger.debug("Debug message");

        // Check if the formattedTimestamp method was called
        expect(mockFormattedTimestamp).toHaveBeenCalled();

        // Check the log statement
        expect(mockConsoleLog).toHaveBeenCalledWith(
            "serviceName [2024-01-07 14:21:8:840] DEBUG: Debug message"
        );
    });

    test("should log warn message", () => {
        const logger = new Logger("serviceName");

        // Use Object.getPrototypeOf to access the prototype of the class
        const prototype = Object.getPrototypeOf(logger);
        // Spy on the formattedTimestamp method
        const mockFormattedTimestamp = jest.spyOn<any, any>(
            prototype as any,
            "formattedTimestamp"
        );

        // Mock the implementation of the formattedTimestamp method
        mockFormattedTimestamp.mockReturnValue("2024-01-07 14:21:8:840");

        // Call a method that invokes the private method
        logger.warn("Warn message");

        // Check if the formattedTimestamp method was called
        expect(mockFormattedTimestamp).toHaveBeenCalled();

        // Check the log statement
        expect(mockConsoleLog).toHaveBeenCalledWith(
            "serviceName [2024-01-07 14:21:8:840]  WARN: Warn message"
        );
    });

    test("should log error message", () => {
        const logger = new Logger("serviceName");

        // Use Object.getPrototypeOf to access the prototype of the class
        const prototype = Object.getPrototypeOf(logger);
        // Spy on the formattedTimestamp method
        const mockFormattedTimestamp = jest.spyOn<any, any>(
            prototype as any,
            "formattedTimestamp"
        );

        // Mock the implementation of the formattedTimestamp method
        mockFormattedTimestamp.mockReturnValue("2024-01-07 14:21:8:840");

        // Call a method that invokes the private method
        logger.error("Error message");

        // Check if the formattedTimestamp method was called
        expect(mockFormattedTimestamp).toHaveBeenCalled();

        // Check the log statement
        expect(mockConsoleLog).toHaveBeenCalledWith(
            "serviceName [2024-01-07 14:21:8:840] ERROR: Error message"
        );
    });

    test("should log http message", () => {
        const logger = new Logger("serviceName");

        // Use Object.getPrototypeOf to access the prototype of the class
        const prototype = Object.getPrototypeOf(logger);
        // Spy on the formattedTimestamp method
        const mockFormattedTimestamp = jest.spyOn<any, any>(
            prototype as any,
            "formattedTimestamp"
        );

        // Mock the implementation of the formattedTimestamp method
        mockFormattedTimestamp.mockReturnValue("2024-01-07 14:21:8:840");

        // Call a method that invokes the private method
        logger.http("Http message");

        // Check if the formattedTimestamp method was called
        expect(mockFormattedTimestamp).toHaveBeenCalled();

        // Check the log statement
        expect(mockConsoleLog).toHaveBeenCalledWith(
            "serviceName [2024-01-07 14:21:8:840]  HTTP: Http message"
        );
    });

    test("should log fatal message", () => {
        const logger = new Logger("serviceName");

        // Use Object.getPrototypeOf to access the prototype of the class
        const prototype = Object.getPrototypeOf(logger);
        // Spy on the formattedTimestamp method
        const mockFormattedTimestamp = jest.spyOn<any, any>(
            prototype as any,
            "formattedTimestamp"
        );

        // Mock the implementation of the formattedTimestamp method
        mockFormattedTimestamp.mockReturnValue("2024-01-07 14:21:8:840");

        // Call a method that invokes the private method
        logger.fatal("Fatal message");

        // Check if the formattedTimestamp method was called
        expect(mockFormattedTimestamp).toHaveBeenCalled();

        // Check the log statement
        expect(mockConsoleLog).toHaveBeenCalledWith(
            "serviceName [2024-01-07 14:21:8:840] FATAL: Fatal message"
        );
    });
});
