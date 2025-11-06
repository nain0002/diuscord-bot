/**
 * Admin Panel Database Configuration
 * Shared database connection for admin panel
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

let pool;

const database = {
    connect: async () => {
        try {
            pool = mysql.createPool({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'ragemp_server',
                port: process.env.DB_PORT || 3306,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });

            // Test connection
            const connection = await pool.getConnection();
            console.log('[Admin Panel DB] Connected to MySQL database successfully!');
            connection.release();

            // Ensure admin table exists
            await database.createAdminTable();
            
            return true;
        } catch (error) {
            console.error('[Admin Panel DB] Error connecting to database:', error);
            return false;
        }
    },

    createAdminTable: async () => {
        try {
            // Create admins table if it doesn't exist
            await pool.query(`
                CREATE TABLE IF NOT EXISTS admins (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    email VARCHAR(100),
                    admin_level INT DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    INDEX idx_username (username)
                )
            `);

            // Check if default admin exists
            const [admins] = await pool.query('SELECT id FROM admins WHERE username = ?', ['admin']);
            
            if (admins.length === 0) {
                // Create default admin user
                const bcrypt = require('bcrypt');
                const hashedPassword = await bcrypt.hash('admin123', 10);
                
                await pool.query(
                    'INSERT INTO admins (username, password, email, admin_level) VALUES (?, ?, ?, ?)',
                    ['admin', hashedPassword, 'admin@localhost', 4]
                );
                
                console.log('[Admin Panel DB] Default admin user created');
                console.log('[Admin Panel DB] Username: admin');
                console.log('[Admin Panel DB] Password: admin123');
                console.log('[Admin Panel DB] ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!');
            }

            // Also check users table for backward compatibility
            await pool.query(`
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS admin_level INT DEFAULT 0
            `).catch(() => {
                // Column might already exist, ignore error
            });

            console.log('[Admin Panel DB] Admin tables verified successfully!');
        } catch (error) {
            console.error('[Admin Panel DB] Error creating admin table:', error);
        }
    },

    query: async (sql, params = []) => {
        try {
            if (!pool) {
                throw new Error('Database connection not initialized. Call connect() first.');
            }
            const [results] = await pool.query(sql, params);
            return results;
        } catch (error) {
            console.error('[Admin Panel DB] Query error:', error);
            throw error;
        }
    },

    getConnection: async () => {
        if (!pool) {
            throw new Error('Database connection not initialized. Call connect() first.');
        }
        return await pool.getConnection();
    },

    isConnected: () => {
        return pool !== null && pool !== undefined;
    },

    // Admin-specific queries
    getAdminByUsername: async (username) => {
        try {
            const admins = await database.query(
                'SELECT * FROM admins WHERE username = ? AND is_active = TRUE',
                [username]
            );
            return admins[0] || null;
        } catch (error) {
            console.error('[Admin Panel DB] Error getting admin:', error);
            return null;
        }
    },

    updateAdminLogin: async (adminId) => {
        try {
            await database.query(
                'UPDATE admins SET last_login = NOW() WHERE id = ?',
                [adminId]
            );
        } catch (error) {
            console.error('[Admin Panel DB] Error updating login time:', error);
        }
    },

    createAdmin: async (username, password, email = null, adminLevel = 1) => {
        try {
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const result = await database.query(
                'INSERT INTO admins (username, password, email, admin_level) VALUES (?, ?, ?, ?)',
                [username, hashedPassword, email, adminLevel]
            );
            
            return result.insertId;
        } catch (error) {
            console.error('[Admin Panel DB] Error creating admin:', error);
            throw error;
        }
    },

    getAllAdmins: async () => {
        try {
            return await database.query('SELECT id, username, email, admin_level, created_at, last_login, is_active FROM admins');
        } catch (error) {
            console.error('[Admin Panel DB] Error getting admins:', error);
            return [];
        }
    },

    updateAdminPassword: async (adminId, newPassword) => {
        try {
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            await database.query(
                'UPDATE admins SET password = ? WHERE id = ?',
                [hashedPassword, adminId]
            );
            
            return true;
        } catch (error) {
            console.error('[Admin Panel DB] Error updating password:', error);
            return false;
        }
    },

    deactivateAdmin: async (adminId) => {
        try {
            await database.query(
                'UPDATE admins SET is_active = FALSE WHERE id = ?',
                [adminId]
            );
            return true;
        } catch (error) {
            console.error('[Admin Panel DB] Error deactivating admin:', error);
            return false;
        }
    }
};

module.exports = database;
