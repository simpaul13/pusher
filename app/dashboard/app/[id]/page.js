'use client';

import { useState, useEffect, useRef, use } from 'react';
import { notFound } from 'next/navigation';
import Pusher from 'pusher-js';

export default function AppDetailsPage({ params }) {
    const { id } = use(params);
    const [app, setApp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const pusherRef = useRef(null);

    useEffect(() => {
        fetchAppDetails();
        return () => {
            if (pusherRef.current) {
                pusherRef.current.disconnect();
            }
        };
    }, [id]);

    const fetchAppDetails = async () => {
        try {
            const res = await fetch(`/api/apps/${id}`);
            if (res.ok) {
                const data = await res.json();
                setApp(data);
                startPusher(data);
            } else {
                // handle error
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const startPusher = (appData) => {
        // Configure Pusher to connect to our local Soketi instance
        Pusher.logToConsole = true;
        const pusher = new Pusher(appData.key, {
            wsHost: window.location.hostname,
            wsPort: 6001,
            forceTLS: false,
            disableStats: true,
            enabledTransports: ['ws', 'wss'],
            cluster: '' // Not used for self-hosted
        });

        pusher.connection.bind('state_change', (states) => {
            addLog(`Connection state: ${states.current}`);
            setIsConnected(states.current === 'connected');
        });

        pusher.connection.bind('connected', () => {
            addLog('Connected to WebSocket Server');
        });

        const channel = pusher.subscribe('my-channel');
        channel.bind('bg-test', (data) => {
            addLog(`Received event 'bg-test': ${JSON.stringify(data)}`);
        });

        pusherRef.current = pusher;
    };

    const addLog = (msg) => {
        setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
    };

    const sendTestEvent = async () => {
        try {
            addLog('Sending test event via API...');
            const res = await fetch(`/api/apps/${id}/trigger`, {
                method: 'POST',
                body: JSON.stringify({ message: 'Hello from Debug Console!' })
            });
            if (res.ok) {
                addLog('Event sent successfully');
            } else {
                addLog('Failed to send event');
            }
        } catch (e) {
            addLog('Error sending event: ' + e.message);
        }
    };

    if (loading) return <div className="p-10 text-white">Loading app details...</div>;
    if (!app) return <div className="p-10 text-white">App not found</div>;

    return (
        <div className="p-10 max-w-7xl mx-auto text-white">
            <div className="mb-8">
                <Link href="/dashboard" className="text-gray-400 hover:text-white mb-4 block">&larr; Back to Dashboard</Link>
                <h1 className="text-3xl font-bold flex items-center gap-4">
                    {app.name}
                    {isConnected ? (
                        <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded full border border-emerald-500/20 uppercase tracking-wide font-bold">Live</span>
                    ) : (
                        <span className="bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded full border border-red-500/20 uppercase tracking-wide font-bold">Disconnected</span>
                    )}
                </h1>
                <p className="text-gray-400 font-mono text-sm mt-1">{app.id}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Keys Panel */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                    <h2 className="text-xl font-bold mb-6 text-gray-200">App Keys</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-2">App ID</label>
                            <div className="bg-gray-950 p-3 rounded-lg font-mono text-emerald-400 select-all">{app.id}</div>
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Key</label>
                            <div className="bg-gray-950 p-3 rounded-lg font-mono text-emerald-400 select-all">{app.key}</div>
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Secret</label>
                            <div className="bg-gray-950 p-3 rounded-lg font-mono text-emerald-400 select-all blur-sm hover:blur-none transition-all cursor-pointer" title="Hover to reveal">{app.secret}</div>
                        </div>
                    </div>
                </div>

                {/* Debug Console */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-0 shadow-xl overflow-hidden flex flex-col h-[500px]">
                    <div className="p-4 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
                        <h2 className="text-sm font-bold uppercase text-gray-400">Debug Console</h2>
                        <button
                            onClick={sendTestEvent}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 px-4 rounded transition-all"
                        >
                            Send Test Event
                        </button>
                    </div>
                    <div className="flex-1 bg-gray-950 p-4 overflow-y-auto font-mono text-xs space-y-2">
                        {logs.length === 0 ? (
                            <p className="text-gray-600 italic">Waiting for events...</p>
                        ) : (
                            logs.map((log, i) => (
                                <div key={i} className="border-l-2 border-emerald-500/30 pl-3 py-1">
                                    {log}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-2 bg-gray-900 border-t border-gray-800 text-center text-xs text-gray-600">
                        Auto-subscribed to <span className="text-gray-400">my-channel</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

import Link from 'next/link';
