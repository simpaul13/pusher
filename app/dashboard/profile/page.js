'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function ProfilePage() {
    const { data: session } = useSession();

    if (!session) {
        return <div className="p-10 text-white">Loading...</div>;
    }

    return (
        <div className="p-10 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
            <p className="text-gray-400 mb-10">Manage your account information</p>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center space-x-6 mb-8">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                        {session.user.name ? session.user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{session.user.name}</h2>
                        <p className="text-gray-400">{session.user.email}</p>
                        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wide border border-emerald-500/20">
                            Pro Plan (Demo)
                        </div>
                    </div>
                </div>

                <div className="space-y-6 max-w-xl">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Display Name</label>
                        <input
                            type="text"
                            value={session.user.name}
                            readOnly
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed focus:outline-none"
                        />
                        <p className="text-xs text-gray-600 mt-1">Contact support to change your name.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                        <input
                            type="text"
                            value={session.user.email}
                            readOnly
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed focus:outline-none"
                        />
                    </div>
                </div>

                <div className="mt-10 pt-10 border-t border-gray-800">
                    <h3 className="text-lg font-bold text-white mb-4">Account Actions</h3>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold py-3 px-6 rounded-lg transition-all"
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}
