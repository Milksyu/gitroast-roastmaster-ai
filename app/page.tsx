import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Award,
  Code,
  GitBranch,
  GitCommit,
  Users,
  Calendar,
  Shield,
  Settings,
  Image,
  Copy,
  Download
} from 'lucide/react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-roast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setError(null);
    handleSubmit(new Event('submit') as React.FormEvent);
  };

  const handleDownload = () => {
    // In a real app, this would generate and download an image
    alert('Image download feature would be implemented here!');
  };

  if (!result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mx-auto max-w-2xl"
        >
          <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">
            <span className="text-primary-600">GitRoast & </span>RoastMaster AI
          </h1>
          <p className="mb-8 text-center text-gray-600">
            Enter a GitHub username to get a playful roast and RPG-style developer card
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label htmlFor="username" className="sr-only">
                GitHub Username
              </div>
              <div className="flex items-center gap-2">
                <motion.input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter GitHub username (e.g., torvalds)"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-white ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                  disabled={loading}
                />
                <motion.button
                  type="submit"
                  disabled={loading || !username.trim()}
                  className="px-4 py-3 rounded-lg border border-transparent bg-primary-600 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-transform"
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? 'Roasting...' : 'Roast Me!'}
                </motion.button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800"
              >
                <Zap className="mr-2 h-4 w-4" /> {error}
              </motion.div>
            )}
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            Powered by <span className="text-primary-600">OpenRouter</span> & <span className="text-primary-600">GitHub API</span>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  const { githubData, roastData } = result;
  const { user, repositories, recentCommits } = githubData;
  const { roast, devCard, avatarSuggestion } = roastData;

  // Calculate stats for the card
  const stats = [
    { label: 'Public Repos', value: user.public_repos, icon: GitBranch },
    { label: 'Followers', value: user.followers, icon: Users },
    { label: 'Following', value: user.following, icon: Users },
    { label: 'Public Gists', value: user.public_gists ?? 0, icon: Code },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mx-auto max-w-4xl"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-800">
            <span className="text-primary-600">GitRoast & </span>RoastMaster AI
          </h1>
          <p className="text-sm text-gray-500">
            Roast for <span className="font-medium">{user.login}</span>
            <span className="text-primary-500">• Generated at {new Date().toLocaleTimeString()}</span>
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">

          {/* Roast Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h2 className="mb-4 text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Code className="text-primary-500" /> Your Code Roast
            </h2>
            <blockquote className="text-gray-700 italic border-l-4 border-primary-200 pl-4">
              <p className="text-lg">{roast}</p>
            </blockquote>

            <div className="mt-6 flex justify-between">
              <button
                onClick={handleRetry}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Copy className="mr-2 h-4 w-4" /> Roast Another
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download className="mr-2 h-4 w-4" /> Share Image
              </button>
            </div>
          </motion.div>

          {/* Developer Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h2 className="mb-4 text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Award className="text-primary-500" /> RPG Developer Card
            </h2>

            <div className="grid gap-4">
              {/* Card Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                  {devCard.level}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{devCard.title}</h3>
                  <p className="text-sm text-primary-600">{devCard.class}</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {devCard.badgeText}
                  </span>
                </div>
              </div>

              {/* Avatar Suggestion */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 rounded-xl flex items-center justify-center text-sm font-medium text-gray-600">
                  <Image className="w-10 h-10" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-1">Avatar Suggestion:</p>
                  <p className="text-gray-600 italic">{avatarSuggestion.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {avatarSuggestion.colors.map((color, index) => (
                      <div key={index} className={`w-3 h-3 rounded ${index === 0 ? 'border border-gray-300' : ''} bg-[${color}]`} />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">{avatarSuggestion.style}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg">
                      {React.createElement(stat.icon, { className: "text-primary-500" })}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{stat.label}</p>
                      <p className="text-base font-semibold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <GitCommit className="text-primary-500" /> Recent Activity
                </h3>
                {recentCommits.length > 0 ? (
                  <div className="space-y-2">
                    {recentCommits.slice(0, 3).map((commit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="w-5 h-5 flex items-center justify-center text-xs bg-primary-50 text-primary-600 rounded">
                          {/* Show commit hash or just a dot */}</div>
                        <div className="flex-1 text-sm text-gray-700">
                          {commit.message.split('\n')[0].slice(0, 50)}{commit.message.length > 50 ? '...' : ''}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(commit.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent commits found</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Repository Stats */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-800 flex items-center gap-2">
            <GitBranch className="text-primary-500" /> Repository Overview
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {repositories.slice(0, 3).map((repo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{repo.name}</h3>
                  <span className="px-2 py-0.5 rounded text-xs font-medium
                    {repo.language ? `bg-${getLanguageColor(repo.language)}200 text-${getLanguageColor(repo.language)}800` : 'bg-gray-200 text-gray-800'}"
                  >
                    {repo.language || 'Unknown'}
                  </span>
                </div>
                {repo.description && (
                  <p className="mb-2 text-sm text-gray-600 line-clamp-2">{repo.description}</p>
                )}
                <div className="text-sm text-gray-500 space-x-3">
                  <span>★ {repo.stargazers_count}</span>
                  <span>fork {repo.forks_count}</span>
                  <span>{new Date(repo.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row sm:justify-center sm:space-x-4">
          <button
            onClick={handleRetry}
            className="w-full sm:w-auto px-6 py-3 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors hover:shadow-md"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Try Another User
          </button>
          <button
            onClick={() => setUsername('') && setResult(null) && setError(null)}
            className="w-full sm:w-auto px-6 py-3 rounded-lg border border-transparent bg-primary-600 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-transform hover:shadow-md"
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="mr-2 h-4 w-4" /> New Search
          </button>
        </div>

        <div className="mt-10 text-center text-xs text-gray-400">
          Built with ❤️ for AppBuildersPH Hackathon •
          <a href="#" className="text-primary-600 hover:underline">View Source on GitHub</a>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Helper function to get Tailwind color class for language
function getLanguageColor(language: string | null): string {
  if (!language) return 'gray';
  const lang = language.toLowerCase();
  const colorMap: Record<string, string> = {
    javascript: 'yellow',
    typescript: 'blue',
    python: 'green',
    java: 'red',
    go: 'cyan',
    rust: 'orange',
    php: 'violet',
    ruby: 'pink',
    swift: 'teal',
    kotlin: 'emerald',
    'c++': 'sky',
    c: 'stone',
    html: 'rose',
    css: 'fuchsia',
    scala: 'indigo',
    docker: 'zinc',
  };
  return colorMap[lang] || 'gray';
}