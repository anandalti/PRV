
const { pool } = require('../db/pgsqldb');

class UserAuthentication {
    constructor(data) {
        this.Id = data.Id;
        this.Name = data.Name;
        this.Email = data.Email;
        this.PasswordHash = data.PasswordHash;
        this.AppType = data.AppType;
        this.CreatedAt = data.CreatedAt;
        this.UpdatedAt = data.UpdatedAt;
    }

    /**
     * Find a user by email address.
     * Returns the raw row object (not a class instance) to expose PasswordHash for bcrypt comparison.
     */
    static async findByEmail(email) {
        const res = await pool.query(
            'SELECT * FROM "UserDetails" WHERE "Email" = $1 LIMIT 1',
            [email]
        );
        return res.rows[0] || null;
    }

    /**
     * Find a user by primary key.
     */
    static async findById(id) {
        const res = await pool.query(
            'SELECT "Id", "Name", "Email", "AppType", "CreatedAt" FROM "UserDetails" WHERE "Id" = $1 LIMIT 1',
            [id]
        );
        return res.rows[0] || null;
    }

    /**
     * Insert a new user. Returns the created row (without PasswordHash).
     */
    static async createUser({ Name, Email, PasswordHash, AppType = 'sizing' }) {
        const res = await pool.query(
            `INSERT INTO "UserDetails" ("Name", "Email", "PasswordHash", "AppType", "CreatedAt", "UpdatedAt")
             VALUES ($1, $2, $3, $4, NOW(), NOW())
             RETURNING "Id", "Name", "Email", "AppType", "CreatedAt"`,
            [Name, Email, PasswordHash, AppType]
        );
        return res.rows[0];
    }

    static async updatePassword(userId, newPasswordHash) {
        const res = await pool.query(
            `UPDATE "UserDetails"
             SET "PasswordHash" = $1, "UpdatedAt" = NOW()
             WHERE "Id" = $2
             RETURNING "Id", "Name", "Email", "AppType", "CreatedAt"`,
            [newPasswordHash, userId]
        );
        return res.rows[0];
    }
}

module.exports = UserAuthentication;
