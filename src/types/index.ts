// Frontend types for Dev.to integration

export interface Article {
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
  reading_time_minutes: number;
  public_reactions_count: number;
  comments_count: number;
  page_views_count: number;
  positive_reactions_count: number;
  user: {
    name: string;
    username: string;
    profile_image: string;
  };
}

export interface CreateArticleData {
  title: string;
  body_markdown: string;
  published?: boolean;
  tags?: string[];
  description?: string;
  canonical_url?: string;
  main_image?: string;
  series?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}
