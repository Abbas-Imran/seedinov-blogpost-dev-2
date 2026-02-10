// Dev.to API Types

export interface DevToArticle {
  id: number;
  title: string;
  description: string;
  body_html: string;
  body_markdown: string;
  cover_image: string | null;
  canonical_url: string | null;
  created_at: string;
  edited_at: string | null;
  published_at: string | null;
  published_timestamp: string;
  url: string;
  path: string;
  slug: string;
  tag_list: string[];
  tags: string;
  user: DevToUser;
  reading_time_minutes: number;
  public_reactions_count: number;
  comments_count: number;
  page_views_count: number;
  positive_reactions_count: number;
}

export interface DevToUser {
  name: string;
  username: string;
  twitter_username: string | null;
  github_username: string | null;
  user_id: number;
  website_url: string | null;
  profile_image: string;
  profile_image_90: string;
}

export interface CreateArticlePayload {
  article: {
    title: string;
    body_markdown: string;
    published?: boolean;
    series?: string;
    main_image?: string;
    canonical_url?: string;
    description?: string;
    tags?: string[];
    organization_id?: number;
  };
}

export interface UpdateArticlePayload {
  article: {
    title?: string;
    body_markdown?: string;
    published?: boolean;
    series?: string;
    main_image?: string;
    canonical_url?: string;
    description?: string;
    tags?: string[];
    organization_id?: number;
  };
}

export interface DevToApiError {
  error: string;
  status: number;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface GetArticlesParams extends PaginationParams {
  state?: 'fresh' | 'rising' | 'all';
  username?: string;
  tag?: string;
  tags?: string;
  tags_exclude?: string;
  top?: number;
  collection_id?: number;
}
