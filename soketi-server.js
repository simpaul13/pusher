const { Server } = require('@soketi/soketi');
const mysql = require('mysql2/promise');

// MySQL connection config
const dbConfig = {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'pusher_clone'
};

async function getAppsFromDatabase() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute('SELECT * FROM apps WHERE enabled = 1');
        return rows.map(row => ({
            id: row.id,
            key: row.key,
            secret: row.secret,
            maxConnections: row.max_connections || -1,
            enableClientMessages: Boolean(row.enable_client_messages),
            enabled: Boolean(row.enabled),
            maxBackendEventsPerSecond: row.max_backend_events_per_sec || -1,
            maxClientEventsPerSecond: row.max_client_events_per_sec || -1,
            maxReadRequestsPerSecond: row.max_read_requests_per_sec || -1,
            webhooks: row.webhooks ? JSON.parse(row.webhooks) : []
        }));
    } finally {
        await connection.end();
    }
}

async function startSoketi() {
    console.log('📡 Loading apps from MySQL...');
    const apps = await getAppsFromDatabase();
    console.log(`✅ Loaded ${apps.length} app(s) from database`);

    const server = new Server({
        debug: true,
        port: 6001,
        appManager: {
            driver: 'array',
            array: {
                apps: apps
            }
        }
    });

    await server.start();
    console.log('🚀 Soketi server started on port 6001');
    console.log('💾 Using MySQL database for app authentication');
}

startSoketi().catch(err => {
    console.error('❌ Failed to start Soketi:', err);
    process.exit(1);
});
