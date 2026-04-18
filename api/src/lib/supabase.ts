import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL must be set");
}

export const sql = postgres(connectionString, {
  connection: { search_path: "fire" },
});
