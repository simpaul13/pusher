'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newAppName, setNewAppName] = useState('');

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async () => {
        try {
            const res = await fetch('/api/apps');
            if (res.ok) {
                const data = await res.json();
                setApps(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createApps = async (e) => {
        e.preventDefault();
        if (!newAppName) return;

        try {
            const res = await fetch('/api/apps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newAppName })
            });

            if (res.ok) {
                setNewAppName('');
                setShowModal(false);
                fetchApps(); // Refresh list
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-10 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-white">Your Apps</h2>
                    <p className="text-gray-400 mt-1">Manage your real-time applications</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-emerald-500/20 transition-all"
                >
                    + Create New App
                </button>
            </div>

            {loading ? (
                <div className="text-center text-gray-500 py-20">Loading apps...</div>
            ) : apps.length === 0 ? (
                <div className="text-center bg-gray-900 rounded-2xl p-20 border border-gray-800 border-dashed">
                    <h3 className="text-xl font-medium text-white mb-2">No apps found</h3>
                    <p className="text-gray-400 mb-6">Get started by creating your first app.</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="text-emerald-400 font-medium hover:underline"
                    >
                        Create your first app
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {apps.map((app) => (
                        <Link key={app.id} href={`/dashboard/app/${app.id}`}>
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-emerald-500/50 hover:bg-gray-800/80 transition-all cursor-pointer group h-full flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">{app.name}</h3>
                                        <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded full uppercase tracking-wide font-bold">Active</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-sm">
                                            <span className="text-gray-500 block text-xs uppercase">App ID</span>
                                            <span className="text-gray-300 font-mono">{app.id}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-gray-500 block text-xs uppercase">Key</span>
                                            <span className="text-gray-300 font-mono">{app.key}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-800 flex justify-between items-center text-sm text-gray-500 group-hover:text-gray-400">
                                    <span>{new Date(app.created_at).toLocaleDateString()}</span>
                                    <span>View Details &rarr;</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 w-full max-w-lg rounded-2xl border border-gray-800 shadow-2xl p-8 transform transition-all">
                        <h3 className="text-2xl font-bold text-white mb-1">Create New App</h3>
                        <p className="text-gray-400 mb-6 text-sm">Give your app a name to get started.</p>

                        <form onSubmit={createApps}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">App Name</label>
                                <input
                                    type="text"
                                    value={newAppName}
                                    onChange={(e) => setNewAppName(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    placeholder="My Awesome App"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all"
                                >
                                    Create App
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
