// Database Connection Manager
const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
    constructor() {
        this.pool = null;
    }

    async connect() {
        try {
            this.pool = mysql.createPool({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'ragemp_roleplay',
                port: process.env.DB_PORT || 3306,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });

            // Test connection
            const connection = await this.pool.getConnection();
            console.log('[Database] Successfully connected to MySQL database');
            connection.release();
            return true;
        } catch (error) {
            console.error('[Database] Connection error:', error.message);
            return false;
        }
    }

    async query(sql, params = []) {
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('[Database] Query error:', error.message);
            throw error;
        }
    }

    async getConnection() {
        return await this.pool.getConnection();
    }
}

module.exports = new Database();
