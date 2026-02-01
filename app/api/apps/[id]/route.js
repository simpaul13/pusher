import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import mysql from 'mysql2/promise';
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
    });

    try {
        console.log(`[DEBUG] Fetching App: ID=${id}, UserID=${session.user.id}`);

        const [rows] = await connection.execute(
            'SELECT * FROM apps WHERE id = ? AND user_id = ?',
            [id, session.user.id]
        );

        console.log(`[DEBUG] Found rows: ${rows.length}`);

        if (rows.length === 0) {
            return NextResponse.json({ message: 'Not found' }, { status: 404 });
        }

        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    } finally {
        await connection.end();
    }
}
