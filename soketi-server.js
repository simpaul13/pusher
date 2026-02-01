require('dotenv').config();
const { Server } = require('@soketi/soketi');
const mysql = require('mysql2/promise');

console.log('🏁 Starting Soketi Server script...');

// MySQL connection config
const dbConfig = {
    host: process.env.SOKETI_APP_MANAGER_MYSQL_HOST || '127.0.0.1',
    port: process.env.SOKETI_APP_MANAGER_MYSQL_PORT || 3306,
    user: process.env.SOKETI_APP_MANAGER_MYSQL_USER || 'root',
    password: process.env.SOKETI_APP_MANAGER_MYSQL_PASSWORD || '',
    database: process.env.SOKETI_APP_MANAGER_MYSQL_DATABASE || 'pusher_clone'
};

console.log('📋 Database Configuration:', {
    ...dbConfig,
    password: dbConfig.password ? '****' : '(empty)'
});

async function getAppsFromDatabase() {
    console.log('🔌 Connecting to database...');
    const connection = await mysql.createConnection(dbConfig);
    try {
        console.log('🔍 Querying apps table...');
        const [rows] = await connection.execute('SELECT * FROM apps WHERE enabled = 1');
        console.log(`📊 Found ${rows.length} enabled apps`);
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
        console.log('🔌 Database connection closed');
    }
}

async function startSoketi() {
    try {
        console.log('📡 Loading apps from MySQL...');
        const apps = await getAppsFromDatabase();
        console.log(`✅ Loaded ${apps.length} app(s) from database:`, apps.map(a => a.id));

        if (apps.length === 0) {
            console.warn('⚠️  Warning: No enabled apps found in database!');
        }

        console.log('🚀 Starting Soketi server instance...');
        const server = new Server({
            debug: process.env.SOKETI_DEBUG === 'true',
            port: process.env.SOKETI_PORT || 6001,
            appManager: {
                driver: 'array',
                array: {
                    apps: apps
                },
                cache: {
                    enabled: false
                }
            }
        });

        await server.start();
        console.log(`✅ Soketi server started successfully on port ${process.env.SOKETI_PORT || 6001}`);
        console.log('💾 Connected to MySQL database:', dbConfig.database);

        // Refresh apps every 30 seconds
        setInterval(async () => {
            try {
                // console.log('🔄 Refreshing apps from database...');
                const newApps = await getAppsFromDatabase();
                // note: updating the live server with new apps might require a different approach 
                // depending on soketi's internal API, but for now we just log availability.
                // The logical step here for 'array' driver is usually a restart or using dynamic driver.
                // But let's check connection persistence first.
                console.log(`🔄 Check complete: ${newApps.length} active apps in DB`);
            } catch (err) {
                console.error('❌ Failed to refresh apps:', err.message);
            }
        }, 30000);

    } catch (err) {
        console.error('❌ FATAL ERROR details:', err);
        throw err;
    }
}

startSoketi().catch(err => {
    console.error('❌ Failed to start Soketi (Main Catch):', err);
    process.exit(1);
});
