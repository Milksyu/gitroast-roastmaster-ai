export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 p-6">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-indigo-800">
          GitRoast & RoastMaster AI
        </h1>
        <p className="text-lg text-gray-600 max-w-xl">
          A playful AI‑driven tool that roasts GitHub profiles, generates RPG‑style developer stats, and suggests pixel‑art avatars.
        </p>
        <a href="/api/roast" className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-shadow hover:shadow-lg">
          Try the Roast API
        </a>
      </div>
    </main>
  );
}
