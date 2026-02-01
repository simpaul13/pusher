const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('pusher_clone', 'root', '', {
    host: '127.0.0.1',
    dialect: 'mysql',
    logging: console.log
});

async function test() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Check if apps table exists
        const [results] = await sequelize.query("SELECT * FROM apps LIMIT 1");
        console.log('Apps table query successful:', results);

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

test();
