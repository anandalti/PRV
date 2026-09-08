const crypto = require('crypto');
const { pool } = require('../../db/pgsqldb');

const parseFullNameFromOU = (ouName) => {
    if (!ouName) return null;

    const match = ouName.match(/^CN=((?:\\.|[^,])*)/);
    if (!match || !match[1]) return null;

    const cnPart = match[1];
    const [lastName, firstName] = cnPart
        .split(/\\,/)
        .map((s) => s.replace(/\\/g, '').trim());

    if (!firstName) return lastName;

    return `${firstName} ${lastName}`;
};

const getLaunchToken = async (details) => {
    try {
        const { activeDirectoryDetails: ad } = details;

        const email = ad.email;
        const fullName = parseFullNameFromOU(ad.ouName);
        const loginName = fullName;
        const roleName = ad.role;
        const officeName = ad.office;
        const otp = crypto.randomUUID();

        const sql = `
            WITH deleted_expired_otp AS (
                DELETE FROM it."OTP"
                WHERE "ExpiresAt" <= NOW()
            ),

            existing_user AS (
                SELECT "UserId"
                FROM it."Users"
                WHERE "Email" = $1
            ),

            inserted_user AS (
                INSERT INTO it."Users" ("Email", "FullName", "LoginName")
                SELECT $1, $2, $3
                WHERE NOT EXISTS (
                    SELECT 1 FROM existing_user
                )
                RETURNING "UserId"
            ),

            user_row AS (
                SELECT "UserId" FROM existing_user
                UNION ALL
                SELECT "UserId" FROM inserted_user
                LIMIT 1
            ),

            existing_office AS (
                SELECT "SalesOfficeID"
                FROM it."SalesOffice"
                WHERE "OfficeName" = $4
            ),

            inserted_office AS (
                INSERT INTO it."SalesOffice" ("OfficeName")
                SELECT $4
                WHERE NOT EXISTS (
                    SELECT 1 FROM existing_office
                )
                RETURNING "SalesOfficeID"
            ),

            office_row AS (
                SELECT "SalesOfficeID" FROM existing_office
                UNION ALL
                SELECT "SalesOfficeID" FROM inserted_office
                LIMIT 1
            ),

            existing_role AS (
                SELECT "RoleID"
                FROM it."Roles"
                WHERE "RoleName" = $5
            ),

            inserted_role AS (
                INSERT INTO it."Roles" ("RoleName")
                SELECT $5
                WHERE NOT EXISTS (
                    SELECT 1 FROM existing_role
                )
                RETURNING "RoleID"
            ),

            role_row AS (
                SELECT "RoleID" FROM existing_role
                UNION ALL
                SELECT "RoleID" FROM inserted_role
                LIMIT 1
            ),

            inserted_mapping AS (
                INSERT INTO it."UserSalesOfficeRole"
                    ("UserID", "SalesOfficeID", "RoleID")
                SELECT
                    u."UserId",
                    o."SalesOfficeID",
                    r."RoleID"
                FROM user_row u
                CROSS JOIN office_row o
                CROSS JOIN role_row r
                ON CONFLICT DO NOTHING
            ),

            inserted_otp AS (
                INSERT INTO it."OTP"
                    ("GeneratedOTP", "UserID", "Email", "ExpiresAt")
                SELECT
                    $6::uuid,
                    u."UserId",
                    $1,
                    NOW() + INTERVAL '1 minute'
                FROM user_row u
                RETURNING "GeneratedOTP"
            )

            SELECT "GeneratedOTP"
            FROM inserted_otp;
        `;

        await pool.query(sql, [
            email,
            fullName,
            loginName,
            officeName,
            roleName,
            otp
        ]);

        return { message: "OTP generated successfully", token: otp };
    } catch (error) {
        console.error("Error generating OTP:", error);
        throw error;
    }
};

module.exports = { getLaunchToken };