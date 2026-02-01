
const Pusher = require('pusher-js');

const pusher = new Pusher('app-key', {
    wsHost: '127.0.0.1',
    wsPort: 6001,
    forceTLS: false,
    disableStats: true,
    enabledTransports: ['ws', 'wss']
});

pusher.connection.bind('connected', () => {
    console.log('✅ Connected to Soketi successfully!');
    process.exit(0);
});

pusher.connection.bind('error', (err) => {
    console.error('❌ Connection error:', err);
    process.exit(1);
});

// Timeout after 5 seconds
setTimeout(() => {
    console.error('❌ Connection timeout');
    process.exit(1);
}, 5000);
