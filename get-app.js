const db = require('./lib/db.js');

(async () => {
    try {
        const [rows] = await db.execute('SELECT * FROM apps LIMIT 1');
        if (rows && rows[0]) {
            console.log('ID:', rows[0].id);
            console.log('KEY:', rows[0].key);
            console.log('SECRET:', rows[0].secret);
        } else {
            console.log('No apps found');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await db.end();
    }
})();
