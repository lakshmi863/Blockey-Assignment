// File: C:\Users\Lenovo\Desktop\Assignment\Backend\src\Database.js
import sqlite3 from 'sqlite3';

const DB_FILE_PATH = './data/database.db';

class Database {
    constructor(dbFilePath) {
        this.db = new sqlite3.Database(dbFilePath, (err) => {
            if (err) {
                console.error("❌ Error connecting to database:", err.message);
                throw err;
            }
            console.log('✅ Connected to the SQLite database.');
        });
    }

    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    }

    async get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    async all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    close() {
        this.db.close((err) => {
            if (err) console.error("❌ Error closing the database connection:", err.message);
            else console.log("Database connection closed.");
        });
    }
}

export const db = new Database(DB_FILE_PATH);