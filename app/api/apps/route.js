import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import mysql from 'mysql2/promise';
import { authOptions } from "../auth/[...nextauth]/route";
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export async function GET(req) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
    });

    try {
        const [rows] = await connection.execute(
            'SELECT * FROM apps WHERE user_id = ? ORDER BY created_at DESC',
            [session.user.id]
        );
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Fetch apps error:', error);
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    } finally {
        await connection.end();
    }
}

export async function POST(req) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name) {
        return NextResponse.json({ message: 'App name is required' }, { status: 400 });
    }

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
    });

    try {
        const appId = uuidv4(); // standard app_id
        const key = crypto.randomBytes(10).toString('hex'); // 20 chars
        const secret = crypto.randomBytes(20).toString('hex'); // 40 chars

        // Explicitly inserting the fields Soketi expects or our schema supports.
        // Ensure `enable_client_messages` is true/false as needed.
        await connection.execute(
            'INSERT INTO apps (id, `key`, secret, name, user_id, enable_client_messages, enabled) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [appId, key, secret, name, session.user.id, true, true]
        );

        return NextResponse.json({ message: 'App created', app: { id: appId, key, secret, name } }, { status: 201 });
    } catch (error) {
        console.error('Create app error:', error);
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    } finally {
        await connection.end();
    }
}
