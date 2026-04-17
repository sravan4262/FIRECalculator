import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL must be set");
}

export const sql = postgres(connectionString);

// Ensure the dev user exists when DEV_USER_ID is set
export async function seedDevUser(): Promise<void> {
  const devUserId = process.env.DEV_USER_ID;
  if (!devUserId) return;
  await sql`
    insert into users (id, email)
    values (${devUserId}::uuid, 'dev@local')
    on conflict (id) do nothing
  `;
}
