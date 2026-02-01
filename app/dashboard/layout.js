import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from 'next/link';

export default async function DashboardLayout({ children }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    return (
        <div className="flex min-h-screen bg-gray-950 text-white font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 flex-shrink-0">
                <div className="p-6">
                    <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        PusherClone
                    </Link>
                </div>

                <nav className="mt-6 px-4 space-y-2">
                    <Link href="/dashboard" className="block px-4 py-3 rounded-lg bg-gray-800 text-emerald-400 font-medium">
                        Dashboard
                    </Link>
                    <Link href="/dashboard/docs" className="block px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                        Documentation
                    </Link>
                    <Link href="/dashboard/support" className="block px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                        Support
                    </Link>
                </nav>

                <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-800 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold">
                            {session.user.name ? session.user.name[0].toUpperCase() : 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{session.user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                        </div>
                    </div>
                    {/* Simple logout button handling can be added here or in the profile page */}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
