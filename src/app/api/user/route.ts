import { NextResponse } from 'next/server';
import { devtoClient } from '@/lib/devto';

// GET /api/user - Get current authenticated user
export async function GET() {
  try {
    const user = await devtoClient.getMe();

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    const apiError = error as { error?: string; status?: number };
    return NextResponse.json(
      {
        success: false,
        error: apiError.error || 'Failed to fetch user profile',
      },
      { status: apiError.status || 500 }
    );
  }
}
