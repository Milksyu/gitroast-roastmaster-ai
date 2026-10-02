import { NextRequest, NextResponse } from 'next/server'
import { generateRoast } from '@/lib/ai/openrouter'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username || !username.trim()) {
      return NextResponse.json(
        { error: 'GitHub username is required' },
        { status: 400 }
      )
    }

    const cleanUsername = username.trim()

    // Basic validation
    if (cleanUsername.length < 1 || cleanUsername.length > 39) {
      return NextResponse.json(
        { error: 'GitHub username must be between 1 and 39 characters' },
        { status: 400 }
      )
    }

    // GitHub username validation (alphanumeric and hyphens, cannot start/end with hyphen)
    if (!/^[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9]$/.test(cleanUsername) &&
        !/^[a-zA-Z0-9]$/.test(cleanUsername)) {
      return NextResponse.json(
        { error: 'Invalid GitHub username format' },
        { status: 400 }
      )
    }

    // Fetch GitHub data (with caching and rate limit handling)
    const githubData = await fetchGitHubData(cleanUsername)

    // Generate roast using OpenRouter
    const roastData = await generateRoast(githubData)

    return NextResponse.json({
      githubData,
      roastData
    })
  } catch (error: any) {
    console.error('Generate roast error:', error)

    // Return user-friendly error messages
    let errorMessage = 'Failed to generate roast'
    let statusCode = 500

    if (error.message.includes('not found')) {
      errorMessage = `GitHub user '${username}' not found. Please check the username and try again.`
      statusCode = 404
    } else if (error.message.includes('rate limit')) {
      errorMessage = error.message
      statusCode = 429
    } else if (error.message.includes('Invalid GitHub username')) {
      errorMessage = error.message
      statusCode = 400
    } else if (error.message.includes('OpenRouter') || error.message.includes('API key')) {
      errorMessage = 'AI service temporarily unavailable. Using fallback roast...'
      statusCode = 503
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}

// Simple in-memory cache to reduce API calls
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// GitHub API helper
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

async function fetchGitHubData(username: string) {
  // Check cache first
  const cached = cache.get(username.toLowerCase())
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'GitRoast-RoastMaster-AI/1.0',
  }

  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`
  }

  // Fetch user data
  const userRes = await fetch(
    `https://api.github.com/users/${username}`,
    { headers }
  )

  // Handle rate limiting
  if (userRes.status === 403) {
    const rateLimitReset = userRes.headers.get('x-ratelimit-reset')
    if (rateLimitReset) {
      const resetTime = new Date(parseInt(rateLimitReset) * 1000)
      throw new Error(`GitHub API rate limit exceeded. Resets at ${resetTime.toLocaleTimeString()}`)
    }
    throw new Error('GitHub API rate limit exceeded. Please wait a moment and try again.')
  }

  if (userRes.status === 404) {
    throw new Error(`GitHub user '${username}' not found`)
  }

  if (!userRes.ok) {
    throw new Error(`Failed to fetch GitHub user: ${userRes.status}`)
  }

  const userData = await userRes.json()

  // Fetch repositories
  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`,
    { headers }
  )

  if (!reposRes.ok) {
    throw new Error(`Failed to fetch repositories: ${reposRes.status}`)
  }

  const reposData = await reposRes.json()

  // Fetch recent commits/events
  const eventsRes = await fetch(
    `https://api.github.com/users/${username}/events?per_page=20`,
    { headers }
  )

  if (!eventsRes.ok) {
    // If we can't get events, continue with empty commits
    const commitEvents = []
    const result = {
      user: userData,
      repositories: reposData,
      recentCommits: commitEvents,
    }
    cache.set(username.toLowerCase(), { data: result, timestamp: Date.now() })
    return result
  }

  const eventsData = await eventsRes.json()
  const commitEvents = eventsData
    .filter((event: any) => event.type === 'PushEvent')
    .flat((event: any) => event.payload.commits || [])
    .slice(0, 10)

  const result = {
    user: userData,
    repositories: reposData,
    recentCommits: commitEvents,
  }

  // Cache the result
  cache.set(username.toLowerCase(), { data: result, timestamp: Date.now() })
  return result
}