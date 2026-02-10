import { NextRequest, NextResponse } from 'next/server';
import { devtoClient } from '@/lib/devto';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/blogs/[id] - Get a single blog by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid article ID',
        },
        { status: 400 }
      );
    }

    const article = await devtoClient.getArticle(articleId);

    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    const apiError = error as { error?: string; status?: number };
    return NextResponse.json(
      {
        success: false,
        error: apiError.error || 'Failed to fetch blog',
      },
      { status: apiError.status || 500 }
    );
  }
}

// PUT /api/blogs/[id] - Update an existing blog
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid article ID',
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const { title, body_markdown, published, tags, description, canonical_url, main_image, series } = body;

    const article = await devtoClient.updateArticle(articleId, {
      article: {
        ...(title && { title }),
        ...(body_markdown && { body_markdown }),
        ...(published !== undefined && { published }),
        ...(tags && { tags }),
        ...(description && { description }),
        ...(canonical_url && { canonical_url }),
        ...(main_image && { main_image }),
        ...(series && { series }),
      },
    });

    return NextResponse.json({
      success: true,
      data: article,
      message: 'Blog updated successfully!',
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    const apiError = error as { error?: string; status?: number };
    return NextResponse.json(
      {
        success: false,
        error: apiError.error || 'Failed to update blog',
      },
      { status: apiError.status || 500 }
    );
  }
}

// DELETE /api/blogs/[id] - Delete (unpublish) an article
// Note: Dev.to API doesn't support permanent deletion, only unpublishing
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid article ID',
        },
        { status: 400 }
      );
    }

    // Dev.to doesn't support DELETE, so we unpublish the article instead
    await devtoClient.updateArticle(articleId, {
      article: {
        published: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Blog unpublished successfully! (Dev.to does not support permanent deletion)',
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    const apiError = error as { error?: string; status?: number };
    return NextResponse.json(
      {
        success: false,
        error: apiError.error || 'Failed to delete blog',
      },
      { status: apiError.status || 500 }
    );
  }
}
