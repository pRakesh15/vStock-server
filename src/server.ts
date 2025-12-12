import http from "http";
import { config } from "./config/index";
import app from "./app";
import logger from "./config/logger";
import { connectToDependencies, disconnectDependencies } from "./infra/dependencies";

const port = Number(process.env.PORT || config.PORT || 3000);

let server: http.Server | null = null;

async function start() {
    try {
        await connectToDependencies();

        server = http.createServer(app);

        server.listen(port, () => {
            logger.info(`Server listening on port ${port}`);
        });

        process.on("SIGTERM", shutdown);
        process.on("SIGINT", shutdown);

        process.on("unhandledRejection", (reason: any) => {
            logger.error({ err: reason }, "Unhandled Rejection - shutting down");
            shutdown();
        });

        process.on("uncaughtException", (err: Error) => {
            logger.error({ err }, "Uncaught Exception - shutting down");
            shutdown(1);
        });
    } catch (err) {
        logger.error({ err }, "Failed to start server");
        process.exit(1);
    }
}

async function shutdown(exitCode = 0) {
    if (!server) process.exit(exitCode);

    try {
        logger.info("Graceful shutdown started");

        server.close(async (err) => {
            if (err) {
                logger.error({ err }, "Error when closing server");
                process.exit(1);
            }

            try {
                await disconnectDependencies();
                logger.info("All dependencies disconnected, exiting now");
                process.exit(exitCode);
            } catch (depErr) {
                logger.error({ depErr }, "Error while disconnecting dependencies");
                process.exit(1);
            }
        });

        setTimeout(() => {
            logger.warn("Forcing process exit after grace period");
            process.exit(1);
        }, Number(config.SHUTDOWN_TIMEOUT_MS) || 30_000);
    } catch (err) {
        logger.error({ err }, "Error during shutdown");
        process.exit(1);
    }
}

start();
