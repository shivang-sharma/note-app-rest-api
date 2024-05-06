// src/Logger.test.ts
import { Logger } from "../../src/util/Logger";
import sinon from "sinon";
import { expect } from "chai";
describe("Logger", () => {
    let mockConsoleLog: sinon.SinonStub<
        [message?: any, ...optionalParams: any[]],
        void
    >;
    // Mock console.log
    beforeEach(() => {
        mockConsoleLog = sinon.stub(console, "log").resolves();
    });
    afterEach(() => {
        // Clear mock calls after each test
        sinon.restore();
    });

    it("should log info message", () => {
        const logger = new Logger("serviceName");

        // Use Object.getPrototypeOf to access the prototype of the class
        const prototype = Object.getPrototypeOf(logger);
        // Spy on the formattedTimestamp method
        const mockFormattedTimestamp = sinon
            .stub(prototype as any, "formattedTimestamp")
            // Mock the implementation of the formattedTimestamp method
            .callsFake(() => "2024-01-07 14:21:8:840");

        // Call a method that invokes the private method
        logger.info("Info message");

        // Check if the formattedTimestamp method was called
        expect(mockFormattedTimestamp.calledOnce).to.be.true;

        // Check the log statement
        expect(mockConsoleLog.calledOnce).to.be.true;
        expect(mockConsoleLog.firstCall.args[0]).to.be.equal(
            "serviceName [2024-01-07 14:21:8:840]  INFO: Info message"
        );
    });

    it("should log debug message", () => {
        const logger = new Logger("serviceName");

        // Use Object.getPrototypeOf to access the prototype of the class
        const prototype = Object.getPrototypeOf(logger);
        // Spy on the formattedTimestamp method
        const mockFormattedTimestamp = sinon
            .stub(prototype as any, "formattedTimestamp")
            // Mock the implementation of the formattedTimestamp method
            .callsFake(() => "2024-01-07 14:21:8:840");

        // Call a method that invokes the private method
        logger.debug("Debug message");

        // Check if the formattedTimestamp method was called
        expect(mockFormattedTimestamp.calledOnce).to.be.true;

        // Check the log statement
        expect(mockConsoleLog.calledOnce).to.be.true;
        expect(mockConsoleLog.firstCall.args[0]).to.be.equal(
            "serviceName [2024-01-07 14:21:8:840] DEBUG: Debug message"
        );
    });

    it("should log warn message", () => {
        const logger = new Logger("serviceName");

        // Use Object.getPrototypeOf to access the prototype of the class
        const prototype = Object.getPrototypeOf(logger);
        // Spy on the formattedTimestamp method
        const mockFormattedTimestamp = sinon
            .stub(prototype as any, "formattedTimestamp")
            // Mock the implementation of the formattedTimestamp method
            .callsFake(() => "2024-01-07 14:21:8:840");

        // Call a method that invokes the private method
        logger.warn("Warn message");

        // Check if the formattedTimestamp method was called
        expect(mockFormattedTimestamp.calledOnce).to.be.true;

        // Check the log statement
        expect(mockConsoleLog.calledOnce).to.be.true;
        expect(mockConsoleLog.firstCall.args[0]).to.be.equal(
            "serviceName [2024-01-07 14:21:8:840]  WARN: Warn message"
        );
    });

    it("should log error message", () => {
        const logger = new Logger("serviceName");

        // Use Object.getPrototypeOf to access the prototype of the class
        const prototype = Object.getPrototypeOf(logger);
        // Spy on the formattedTimestamp method
        const mockFormattedTimestamp = sinon
            .stub(prototype as any, "formattedTimestamp")
            // Mock the implementation of the formattedTimestamp method
            .callsFake(() => "2024-01-07 14:21:8:840");

        // Call a method that invokes the private method
        logger.error("Error message");

        // Check if the formattedTimestamp method was called
        expect(mockFormattedTimestamp.calledOnce).to.be.true;

        // Check the log statement
        expect(mockConsoleLog.calledOnce).to.be.true;
        expect(mockConsoleLog.firstCall.args[0]).to.be.equal(
            "serviceName [2024-01-07 14:21:8:840] ERROR: Error message"
        );
    });

    it("should log http message", () => {
        const logger = new Logger("serviceName");

        // Use Object.getPrototypeOf to access the prototype of the class
        const prototype = Object.getPrototypeOf(logger);
        // Spy on the formattedTimestamp method
        const mockFormattedTimestamp = sinon
            .stub(prototype as any, "formattedTimestamp")
            // Mock the implementation of the formattedTimestamp method
            .callsFake(() => "2024-01-07 14:21:8:840");

        // Call a method that invokes the private method
        logger.http("Http message");

        // Check if the formattedTimestamp method was called
        expect(mockFormattedTimestamp.calledOnce).to.be.true;

        // Check the log statement
        expect(mockConsoleLog.calledOnce).to.be.true;
        expect(mockConsoleLog.firstCall.args[0]).to.be.equal(
            "serviceName [2024-01-07 14:21:8:840]  HTTP: Http message"
        );
    });

    it("should log fatal message", () => {
        const logger = new Logger("serviceName");

        // Use Object.getPrototypeOf to access the prototype of the class
        const prototype = Object.getPrototypeOf(logger);
        // Spy on the formattedTimestamp method
        const mockFormattedTimestamp = sinon
            .stub(prototype as any, "formattedTimestamp")
            // Mock the implementation of the formattedTimestamp method
            .callsFake(() => "2024-01-07 14:21:8:840");

        // Call a method that invokes the private method
        logger.fatal("Fatal message");

        // Check if the formattedTimestamp method was called
        expect(mockFormattedTimestamp.calledOnce).to.be.true;

        // Check the log statement
        expect(mockConsoleLog.called).to.be.true;
        expect(mockConsoleLog.firstCall.args[0]).to.be.equal(
            "serviceName [2024-01-07 14:21:8:840] FATAL: Fatal message"
        );
    });
});
