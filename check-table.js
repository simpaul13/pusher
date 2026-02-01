const mysql = require('mysql2/promise');

(async () => {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'pusher_clone',
        port: 3306
    });

    try {
        const [columns] = await connection.execute('DESCRIBE apps');
        console.log('Apps table structure:');
        console.table(columns);

        const [apps] = await connection.execute('SELECT * FROM apps LIMIT 1');
        console.log('\nSample app data:');
        console.log(apps[0]);
    } finally {
        await connection.end();
    }
})();
