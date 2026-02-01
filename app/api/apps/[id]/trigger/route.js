import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import mysql from 'mysql2/promise';
import { authOptions } from "../../../auth/[...nextauth]/route";
import Pusher from 'pusher';

export async function POST(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { message } = await req.json();

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
    });

    try {
        const [rows] = await connection.execute(
            'SELECT * FROM apps WHERE id = ? AND user_id = ?',
            [id, session.user.id]
        );

        if (rows.length === 0) {
            return NextResponse.json({ message: 'Not found' }, { status: 404 });
        }

        const app = rows[0];

        // Trigger event using Server-Side Pusher library (connecting to our Soketi)
        const pusher = new Pusher({
            appId: app.id,
            key: app.key,
            secret: app.secret,
            host: '127.0.0.1',
            port: 6001,
            useTLS: false,
        });

        await pusher.trigger('my-channel', 'bg-test', {
            message: message || 'Hello World',
            timestamp: new Date().toISOString()
        });

        return NextResponse.json({ message: 'Triggered' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    } finally {
        await connection.end();
    }
}
