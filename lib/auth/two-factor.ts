import pool from '../db/config';

const CODE_EXPIRY_MS = 10 * 60 * 1000;

/**
 * Generates a random 6-digit code
 * @returns A string containing a 6-digit code
 */
export function generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Stores a 2FA code for a user in the database
 * @param userId The user's ID
 * @param code The generated 2FA code
 * @returns Promise resolving to true if successful
 */
export async function storeCode(userId: number, code: string): Promise<boolean> {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS auth_codes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

        const expiresAt = new Date(Date.now() + CODE_EXPIRY_MS);

        await pool.query(
            'DELETE FROM auth_codes WHERE user_id = $1 AND used = FALSE',
            [userId]
        );

        await pool.query(
            'INSERT INTO auth_codes (user_id, code, expires_at) VALUES ($1, $2, $3)',
            [userId, code, expiresAt]
        );

        return true;
    } catch (error) {
        console.error('Error storing 2FA code:', error);
        return false;
    }
}

/**
 * Verifies a 2FA code provided by the user
 * @param userId The user's ID
 * @param code The code provided by the user
 * @returns Promise resolving to true if the code is valid
 */
export async function verifyCode(userId: number, code: string): Promise<boolean> {
    try {
        const result = await pool.query(
            'SELECT * FROM auth_codes WHERE user_id = $1 AND code = $2 AND used = FALSE AND expires_at > NOW()',
            [userId, code]
        );

        if (result.rows.length === 0) {
            return false;
        }

        await pool.query(
            'UPDATE auth_codes SET used = TRUE WHERE id = $1',
            [result.rows[0].id]
        );

        return true;
    } catch (error) {
        console.error('Error verifying 2FA code:', error);
        return false;
    }
} 