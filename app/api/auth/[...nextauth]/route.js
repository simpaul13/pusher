import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
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
                        "SELECT * FROM users WHERE email = ?",
                        [credentials.email]
                    );

                    if (rows.length === 0) {
                        return null;
                    }

                    const user = rows[0];
                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordValid) {
                        return null;
                    }

                    return {
                        id: user.id.toString(),
                        name: user.name,
                        email: user.email,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                } finally {
                    await connection.end();
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/login",
    },
    callbacks: {
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
