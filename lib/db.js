import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

/**
 * Convert Turso row to plain object
 */
function rowToObject(row) {
  if (!row) return null;
  const obj = {};
  for (const [key, value] of Object.entries(row)) {
    obj[key] = value;
  }
  return obj;
}

/**
 * Initialize the database and create users table if it doesn't exist
 */
export async function initDatabase() {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Get user by phone number
 */
export async function getUserByPhone(phoneNumber) {
  try {
    const result = await client.execute({
      sql: `SELECT id, phone_number, password_hash, created_at, updated_at
            FROM users
            WHERE phone_number = ?
            LIMIT 1;`,
      args: [phoneNumber]
    });
    return rowToObject(result.rows[0]) || null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id) {
  try {
    const result = await client.execute({
      sql: `SELECT id, phone_number, created_at, updated_at
            FROM users
            WHERE id = ?
            LIMIT 1;`,
      args: [id]
    });
    return rowToObject(result.rows[0]) || null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}

/**
 * Create a new user
 */
export async function createUser(phoneNumber, passwordHash) {
  try {
    await client.execute({
      sql: `INSERT INTO users (phone_number, password_hash)
            VALUES (?, ?);`,
      args: [phoneNumber, passwordHash]
    });
    
    // Get the inserted user
    const result = await client.execute({
      sql: `SELECT id, phone_number, created_at
            FROM users
            WHERE phone_number = ?
            LIMIT 1;`,
      args: [phoneNumber]
    });
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update user password
 */
export async function updateUserPassword(phoneNumber, passwordHash) {
  try {
    await client.execute({
      sql: `UPDATE users
            SET password_hash = ?, updated_at = datetime('now')
            WHERE phone_number = ?;`,
      args: [passwordHash, phoneNumber]
    });
    
    // Get the updated user
    const result = await client.execute({
      sql: `SELECT id, phone_number, updated_at
            FROM users
            WHERE phone_number = ?
            LIMIT 1;`,
      args: [phoneNumber]
    });
    
    return rowToObject(result.rows[0]) || null;
  } catch (error) {
    console.error('Error updating user password:', error);
    throw error;
  }
}

