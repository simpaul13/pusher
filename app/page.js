import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-6">
          Build Realtime Apps
        </h1>
        <p className="text-xl text-gray-400 mb-10 leading-relaxed">
          The hosted websocket service that is easy to set up and scale. Compatible with Pusher libraries.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-xl shadow-emerald-500/20"
          >
            Get Started for Free
          </Link>
          <Link
            href="/auth/login"
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all border border-gray-700"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
