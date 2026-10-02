import { OpenRouter } from "@openrouter/sdk";

interface GitHubUserData {
  user: {
    login: string;
    name?: string | null;
    public_repos: number;
    followers: number;
    following: number;
    created_at: string;
    bio?: string | null;
    company?: string | null;
    location?: string | null;
    blog?: string | null;
  };
  repositories: Array<{
    name: string;
    description?: string | null;
    language?: string | null;
    stargazers_count: number;
    forks_count: number;
    updated_at: string;
  }>;
  recentCommits: Array<{
    message: string;
    timestamp: string;
    url?: string;
  }>;
}

interface RoastResponse {
  roast: string;
  devCard: {
    title: string;
    level: string;
    class: string;
    badgeText: string;
  };
  avatarSuggestion: {
    description: string;
    style: string;
    colors: string[];
  };
}

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Simple in-memory cache for OpenRouter responses to reduce API calls
const openrouterCache = new Map<string, { data: RoastResponse; timestamp: number }>()
const OPENROUTER_CACHE_TTL = 10 * 60 * 1000 // 10 minutes

export async function generateRoast(githubData: GitHubUserData): Promise<RoastResponse> {
  const { user, repositories, recentCommits } = githubData;

  // Create a cache key based on the GitHub data
  const cacheKey = `${user.login}-${user.public_repos}-${user.followers}-${JSON.stringify(recentCommits.slice(0, 3).map(c => c.message))}`;

  // Check cache first
  const cached = openrouterCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < OPENROUTER_CACHE_TTL) {
    return cached.data
  }

  // Prepare context for the AI
  const context = {
    username: user.login,
    name: user.name || user.login,
    bio: user.bio || "No bio provided",
    company: user.company || "Independent",
    location: user.location || "Unknown",
    publicRepos: user.public_repos,
    followers: user.followers,
    following: user.following,
    accountAge: new Date().getFullYear() - new Date(user.created_at).getFullYear(),
    topLanguages: [...new Set(repositories.map(r => r.language).filter(Boolean))].slice(0, 3),
    recentCommitMessages: recentCommits.slice(0, 5).map(c => c.message),
    popularRepos: repositories
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 3)
      .map(r => `${r.name} (${r.stargazers_count}★)`),
  };

  const prompt = `
You are a playful, sarcastic AI that roasts GitHub profiles in a fun, lighthearted way. Your roasts should be humorous but not mean-spirited - think of it as friendly teasing among developers.

Given the following GitHub user data, generate:
1. A sarcastic/playful code roast (1-2 sentences)
2. An RPG-style developer stat card with title, level, class, and badge text
3. An 8-bit/pixel art avatar suggestion based on their primary languages

GitHub User Data:
- Username: ${context.username}
- Name: ${context.name}
- Bio: ${context.bio}
- Company: ${context.company}
- Location: ${context.location}
- Public Repos: ${context.publicRepos}
- Followers: ${context.followers}
- Following: ${context.following}
- Account Age: ${context.accountAge} years
- Top Languages: ${context.topLanguages.join(", ") || "Unknown"}
- Recent Commit Messages: ${context.recentCommitMessages.join(" | ") || "No recent commits"}
- Popular Repos: ${context.popularRepos.join(", ") || "No popular repos"}

Response Format (JSON):
{
  "roast": "Your playful roast here...",
  "devCard": {
    "title": "Fun developer title (e.g., 'Code Ninja Level 4', '404 Bug Wizard')",
    "level": "Level number or rank (e.g., '4', 'Elite')",
    "class": "RPG class (e.g., 'Bug Wizard', 'Syntax Sorcerer', 'DevOps Druid')",
    "badgeText": "Short badge text (e.g., 'COMMIT MASTER', 'ISSUE SLLAYER')"
  },
  "avatarSuggestion": {
    "description": "Description of the 8-bit/pixel art avatar",
    "style": "Pixel art style description",
    "colors": ["color1", "color2", "color3"] // Hex colors for the avatar
  }
}

Rules:
- Keep the roast light and fun - never insulting or offensive
- Make the devCard title and class clever and developer-themed
- Base avatar suggestion on their top languages (e.g., JavaScript = yellow lightning bolt, Python = blue snake, etc.)
- Return ONLY valid JSON, no additional text
`;

  // Check if API key is configured
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn("OpenRouter API key not configured, using fallback roast");
    const fallback = getFallbackRoast(context);
    openrouterCache.set(cacheKey, { data: fallback, timestamp: Date.now() });
    return fallback;
  }

  try {
    const completion = await openrouter.chat.completions.create({
      model: "meta-llama/llama-3-3-70b-instruct",
      messages: [
        {
          role: "system",
          content: "You are a playful AI that generates humorous GitHub profile roasts and RPG-style developer cards. Always return valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 500
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from OpenRouter");
    }

    const parsed = JSON.parse(content);

    // Validate response structure
    if (!parsed.roast || !parsed.devCard || !parsed.avatarSuggestion) {
      throw new Error("Invalid response structure from OpenRouter");
    }

    const result = parsed as RoastResponse;

    // Cache the successful response
    openrouterCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error: any) {
    console.error("OpenRouter API error:", error);

    // Handle rate limiting and other API errors gracefully
    if (error.message?.includes('rate limit') || error.message?.includes('429') || error.message?.includes('quota')) {
      // If rate limited, still try to return a fallback rather than failing completely
      console.warn("OpenRouter rate limit exceeded, using fallback roast");
    } else if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
      console.warn("OpenRouter API key invalid, using fallback roast");
    } else if (error.message?.includes('500') || error.message?.includes('502') || error.message?.includes('503')) {
      console.warn("OpenRouter service unavailable, using fallback roast");
    }

    // Return fallback roast if API fails
    const fallback = getFallbackRoast(context);
    openrouterCache.set(cacheKey, { data: fallback, timestamp: Date.now() });
    return fallback;
  }
}

// Fallback responses for when API is unavailable
function getFallbackRoast(context: any): RoastResponse {
  const fallbackRoasts = [
    `Oh look, it's ${context.username} - another developer who thinks "fixed bug again" is a proper commit message.`,
    `Wow, ${context.username} has ${context.publicRepos} repos and somehow still manages to break the build on Mondays.`,
    `Congratulations ${context.username}! You've mastered the art of creating issues without ever closing them.`,
    `Hey ${context.username}, your code is so mysterious even Stack Overflow won't touch it.`,
    ${context.followers === 0 ?
      `Sorry ${context.username}, but your follower count is currently displaying as a void.` :
      `With ${context.followers} followers, you're basically a micro-influencer in the world of forgotten npm packages.`
    }
  ];

  const roast = fallbackRoasts[Math.floor(Math.random() * fallbackRoasts.length)];

  // Determine dev card based on stats
  let title = "Code Novice";
  let level = "1";
  let classType = "Beginner";
  let badgeText = "JUST STARTING";

  if (context.publicRepos >= 10 && context.followers >= 5) {
    title = "Code Ninja";
    level = "4";
    classType = "Bug Hunter";
    badgeText = "COMMIT MASTER";
  } else if (context.publicRepos >= 20 && context.followers >= 15) {
    title = "Dev Wizard";
    level = "7";
    classType = "Syntax Sorcerer";
    badgeText = "PULL REQUEST KING";
  } else if (context.publicRepos >= 50 || context.followers >= 50) {
    title = "Legendary Developer";
    level = "10";
    classType = "Architect Supreme";
    badgeText = "GITHUB GOD";
  }

  // Language-based avatar suggestions
  const languageAvatars: Record<string, { description: string; style: string; colors: string[] }> = {
    javascript: {
      description: "A yellow lightning bolt crashing through a browser window",
      style: "Electric pixel art with sharp angles",
      colors: ["#f7df1e", "#ffffff", "#000000"]
    },
    python: {
      description: "A blue python coiled around a golden computer",
      style: "Retro 8-bit with smooth curves",
      colors: ["#3776ab", "#ffd43b", "#000000"]
    },
    java: {
      description: "A red coffee cup steaming with binary code",
      style: "Blocky pixel art with warm tones",
      colors: ["#b07219", "#ffffff", "#8b4513"]
    },
    typescript: {
      description: "A blue shield with angular white typescript symbol",
      style: "Geometric pixel art with gradients",
      colors: ["#3178c6", "#ffffff", "#000000"]
    },
    go: {
      description: "A cute gopher wearing pixelated sunglasses",
      style: "Isometric pixel art with friendly proportions",
      colors: ["#00add8", "#ffffff", "#000000"]
    },
    rust: {
      description: "An orange ferris wheel made of gears and bolts",
      style: "Industrial pixel art with metallic textures",
      colors: ["#dea584", "#ffffff", "#333333"]
    }
  };

  const topLang = context.topLanguages[0]?.toLowerCase() || "javascript";
  const avatar = languageAvatars[topLang] || languageAvatars.javascript;

  return {
    roast,
    devCard: {
      title,
      level,
      class: classType,
      badgeText
    },
    avatarSuggestion: avatar
  };
}