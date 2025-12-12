// drizzle.config.js
require("dotenv").config();

module.exports = {
  schema: "./dist/db/schema/index.js",

  out: "./drizzle/migrations",
  dialect: "postgresql",

  dbCredentials: {
    url: process.env.DATABASE_URL,
  },

};
