import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required and must be a string' },
        { status: 400 }
      );
    }

    // Mock response – replace with actual OpenRouter call later
    const mockRoast = {
      roast: `Oh look, it's ${username}. Your commit history looks like a toddler's art project—lots of 'fixed bug' and 'pls work' messages. Keep practicing!`,
      stats: {
        level: 'Code Novice',
        title: 'Bug Hunter',
        avatarSuggestion: 'pixel-art-badge',
      },
    };

    return NextResponse.json(mockRoast);
  } catch (error) {
    console.error('Roast API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
