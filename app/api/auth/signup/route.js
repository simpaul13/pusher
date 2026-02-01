import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
        });

        try {
            // Check if user exists
            const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
            if (existing.length > 0) {
                return NextResponse.json({ message: 'User already exists' }, { status: 409 });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            await connection.execute(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [name, email, hashedPassword]
            );

            return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
        } finally {
            await connection.end();
        }
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
