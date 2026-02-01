const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function setup() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
    });

    try {
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'pusher_clone'}\`;`);
        console.log('Database created or already exists.');

        await connection.changeUser({ database: process.env.DB_NAME || 'pusher_clone' });

        // Users Table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('Users table checked/created.');

        // Apps Table (Soketi compatible - though Soketi usually uses a slightly different structure by default, we will adapt to what Soketi's SQL driver expects, or use a custom authenticator. 
        // Standard Soketi SQL schema usually expects: apps table with id, key, secret, max_connections, enable_client_messages, enabled, max_backend_events_per_sec, max_client_events_per_sec, max_read_requests_per_sec
        await connection.query(`
      CREATE TABLE IF NOT EXISTS apps (
        id VARCHAR(255) PRIMARY KEY,
        \`key\` VARCHAR(255) NOT NULL UNIQUE,
        secret VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        user_id INT NOT NULL,
        max_connections INT DEFAULT -1,
        enable_client_messages BOOLEAN DEFAULT false,
        enabled BOOLEAN DEFAULT true,
        max_backend_events_per_sec INT DEFAULT -1,
        max_client_events_per_sec INT DEFAULT -1,
        max_read_requests_per_sec INT DEFAULT -1,
        webhooks TEXT, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
        console.log('Apps table checked/created.');

    } catch (err) {
        console.error('Error setting up database:', err);
    } finally {
        await connection.end();
    }
}

setup();
