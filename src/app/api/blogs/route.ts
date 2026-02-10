import { NextRequest, NextResponse } from 'next/server';
import { devtoClient } from '@/lib/devto';

// GET /api/blogs - Get all blogs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page');
    const per_page = searchParams.get('per_page');
    const type = searchParams.get('type'); // 'all' | 'published' | 'unpublished'

    const params = {
      ...(page && { page: parseInt(page) }),
      ...(per_page && { per_page: parseInt(per_page) }),
    };

    let articles;

    switch (type) {
      case 'published':
        articles = await devtoClient.getMyPublishedArticles(params);
        break;
      case 'unpublished':
        articles = await devtoClient.getMyUnpublishedArticles(params);
        break;
      case 'all':
      default:
        articles = await devtoClient.getMyArticles(params);
        break;
    }

    return NextResponse.json({
      success: true,
      data: articles,
      count: articles.length,
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    const apiError = error as { error?: string; status?: number };
    return NextResponse.json(
      {
        success: false,
        error: apiError.error || 'Failed to fetch blogs',
      },
      { status: apiError.status || 500 }
    );
  }
}

// POST /api/blogs - Create a new blog
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { title, body_markdown, published, tags, description, canonical_url, main_image, series } = body;

    if (!title || !body_markdown) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title and body_markdown are required',
        },
        { status: 400 }
      );
    }

    const article = await devtoClient.createArticle({
      article: {
        title,
        body_markdown,
        published: published ?? false,
        ...(tags && { tags }),
        ...(description && { description }),
        ...(canonical_url && { canonical_url }),
        ...(main_image && { main_image }),
        ...(series && { series }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: article,
        message: published ? 'Blog published successfully!' : 'Blog saved as draft!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating blog:', error);
    const apiError = error as { error?: string; status?: number };
    return NextResponse.json(
      {
        success: false,
        error: apiError.error || 'Failed to create blog',
      },
      { status: apiError.status || 500 }
    );
  }
}
