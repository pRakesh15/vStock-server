import logger from "../config/logger";
import {
    testPostgresConnection,
    closePostgresConnection,
} from "../db/postgres";
// import { testRedisConnection, closeRedisConnection } from "../db/redis";

function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function connectToDependencies() {
    logger.info("Connecting to dependencies...");

    let attempt = 0;
    const maxAttempts = 5;

    while (attempt < maxAttempts) {
        try {
            attempt++;
            logger.info(`Connecting to Postgres (attempt ${attempt}/${maxAttempts})`);
            await testPostgresConnection();

            // logger.info("Connecting to Redis...");
            // await testRedisConnection();

            logger.info("All dependencies connected");
            return;
        } catch (err) {
            logger.warn({ err }, "Error closing Postgres");
            if (attempt >= maxAttempts) {
                throw new Error("Could not connect to dependencies");
            }
            await wait(500 * attempt);
        }
    }
}

export async function disconnectDependencies() {
    logger.info("Shutting down dependencies...");

    await closePostgresConnection();

    // await closeRedisConnection();

    logger.info("All dependencies disconnected");
}
