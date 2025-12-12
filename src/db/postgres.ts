import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema/index";
import { config } from "../config/index";
import logger from "../config/logger";

export const client = postgres(config.DATABASE_URL, {
    max: 1,
});

export const db = drizzle(client, { schema });

export async function testPostgresConnection() {
    try {
        await client`SELECT 1`;
        logger.info("Postgres connection successful");
    } catch (err) {
        logger.error({ err }, "Postgres connection failed");
        throw err;
    }
}

export async function closePostgresConnection() {
    try {
        await client.end?.();
        logger.info("Postgres connection closed");
    } catch (err) {
        logger.warn({ err }, "Error closing Postgres");
    }
}
