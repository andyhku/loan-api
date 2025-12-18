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
 * Initialize the database and create tables if they don't exist
 */
export async function initDatabase() {
  try {
    // Create users table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_account TEXT UNIQUE NOT NULL,
        user_name TEXT,
        user_mobile_number TEXT UNIQUE NOT NULL,
        user_age TEXT,
        user_sex TEXT,
        password_hash TEXT NOT NULL,
        user_cookie TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);
    
    // Create verification codes table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT NOT NULL,
        code TEXT NOT NULL,
        scene TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        used INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
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
      sql: `SELECT * FROM users WHERE user_mobile_number = ? LIMIT 1;`,
      args: [phoneNumber]
    });
    return rowToObject(result.rows[0]) || null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

/**
 * Get user by account
 */
export async function getUserByAccount(userAccount) {
  try {
    const result = await client.execute({
      sql: `SELECT * FROM users WHERE user_account = ? LIMIT 1;`,
      args: [userAccount]
    });
    return rowToObject(result.rows[0]) || null;
  } catch (error) {
    console.error('Error getting user by account:', error);
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id) {
  try {
    const result = await client.execute({
      sql: `SELECT id, user_account, user_name, user_mobile_number, user_age, user_sex, created_at, updated_at
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
export async function createUser(userData) {
  try {
    const { user_account, user_name, user_mobile_number, user_age, user_sex, password_hash } = userData;
    await client.execute({
      sql: `INSERT INTO users (user_account, user_name, user_mobile_number, user_age, user_sex, password_hash)
            VALUES (?, ?, ?, ?, ?, ?);`,
      args: [user_account, user_name, user_mobile_number, user_age, user_sex, password_hash]
    });
    
    // Get the inserted user
    const result = await client.execute({
      sql: `SELECT * FROM users WHERE user_account = ? LIMIT 1;`,
      args: [user_account]
    });
    
    return rowToObject(result.rows[0]) || null;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update user cookie (token)
 */
export async function updateUserCookie(userAccount, userCookie) {
  try {
    await client.execute({
      sql: `UPDATE users SET user_cookie = ?, updated_at = datetime('now') WHERE user_account = ?;`,
      args: [userCookie, userAccount]
    });
  } catch (error) {
    console.error('Error updating user cookie:', error);
    throw error;
  }
}

/**
 * Update user password by account
 */
export async function updateUserPasswordByAccount(userAccount, passwordHash) {
  try {
    await client.execute({
      sql: `UPDATE users
            SET password_hash = ?, updated_at = datetime('now')
            WHERE user_account = ?;`,
      args: [passwordHash, userAccount]
    });
    
    return true;
  } catch (error) {
    console.error('Error updating user password:', error);
    throw error;
  }
}

/**
 * Save verification code
 */
export async function saveVerificationCode(phone, code, scene) {
  try {
    // Delete old codes for this phone and scene
    await client.execute({
      sql: `DELETE FROM verification_codes WHERE phone = ? AND scene = ?;`,
      args: [phone, scene]
    });
    
    // Calculate expiration (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    
    // Insert new code
    await client.execute({
      sql: `INSERT INTO verification_codes (phone, code, scene, expires_at)
            VALUES (?, ?, ?, ?);`,
      args: [phone, code, scene, expiresAt]
    });
  } catch (error) {
    console.error('Error saving verification code:', error);
    throw error;
  }
}

/**
 * Verify verification code
 */
export async function verifyCode(phone, code, scene) {
  try {
    const result = await client.execute({
      sql: `SELECT * FROM verification_codes
            WHERE phone = ? AND code = ? AND scene = ? AND used = 0
            AND expires_at > datetime('now')
            LIMIT 1;`,
      args: [phone, code, scene]
    });
    
    if (result.rows.length > 0) {
      // Mark code as used
      await client.execute({
        sql: `UPDATE verification_codes SET used = 1 WHERE id = ?;`,
        args: [result.rows[0].id]
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error verifying code:', error);
    throw error;
  }
}

