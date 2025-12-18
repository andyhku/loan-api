import { sql } from '@vercel/postgres';

/**
 * Initialize the database and create users table if it doesn't exist
 */
export async function initDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone_number VARCHAR(20) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
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
    const result = await sql`
      SELECT id, phone_number, password_hash, created_at, updated_at
      FROM users
      WHERE phone_number = ${phoneNumber}
      LIMIT 1;
    `;
    return result.rows[0] || null;
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
    const result = await sql`
      SELECT id, phone_number, created_at, updated_at
      FROM users
      WHERE id = ${id}
      LIMIT 1;
    `;
    return result.rows[0] || null;
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
    const result = await sql`
      INSERT INTO users (phone_number, password_hash)
      VALUES (${phoneNumber}, ${passwordHash})
      RETURNING id, phone_number, created_at;
    `;
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
    const result = await sql`
      UPDATE users
      SET password_hash = ${passwordHash}, updated_at = CURRENT_TIMESTAMP
      WHERE phone_number = ${phoneNumber}
      RETURNING id, phone_number, updated_at;
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating user password:', error);
    throw error;
  }
}

