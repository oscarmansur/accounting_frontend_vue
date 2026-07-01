require('dotenv').config({ path: '../api/.env' });
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function updateAdminRole() {
    try {
        await client.connect();
        const res = await client.query(
            "UPDATE users SET role = 'admin' WHERE email = 'admin@example.com' RETURNING *"
        );
        console.log('Updated user:', res.rows[0]);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

updateAdminRole();