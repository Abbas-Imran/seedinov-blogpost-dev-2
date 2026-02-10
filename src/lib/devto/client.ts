import {
  DevToArticle,
  CreateArticlePayload,
  UpdateArticlePayload,
  GetArticlesParams,
  DevToApiError,
} from './types';

const DEVTO_API_URL = process.env.DEVTO_API_URL || 'https://dev.to/api';
const DEVTO_API_KEY = process.env.DEVTO_API_KEY;

class DevToClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || DEVTO_API_KEY || '';
    this.baseUrl = DEVTO_API_URL;

    if (!this.apiKey) {
      console.warn('Dev.to API key not configured. Some features may not work.');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(this.apiKey && { 'api-key': this.apiKey }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: DevToApiError = {
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };
      throw error;
    }

    return response.json();
  }

  /**
   * Get all articles (published)
   */
  async getArticles(params?: GetArticlesParams): Promise<DevToArticle[]> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/articles${queryString ? `?${queryString}` : ''}`;
    
    return this.request<DevToArticle[]>(endpoint);
  }

  /**
   * Get user's own articles (requires authentication)
   */
  async getMyArticles(params?: { page?: number; per_page?: number }): Promise<DevToArticle[]> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      if (params.page) searchParams.append('page', String(params.page));
      if (params.per_page) searchParams.append('per_page', String(params.per_page));
    }

    const queryString = searchParams.toString();
    const endpoint = `/articles/me${queryString ? `?${queryString}` : ''}`;
    
    return this.request<DevToArticle[]>(endpoint);
  }

  /**
   * Get user's published articles
   */
  async getMyPublishedArticles(params?: { page?: number; per_page?: number }): Promise<DevToArticle[]> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      if (params.page) searchParams.append('page', String(params.page));
      if (params.per_page) searchParams.append('per_page', String(params.per_page));
    }

    const queryString = searchParams.toString();
    const endpoint = `/articles/me/published${queryString ? `?${queryString}` : ''}`;
    
    return this.request<DevToArticle[]>(endpoint);
  }

  /**
   * Get user's unpublished articles (drafts)
   */
  async getMyUnpublishedArticles(params?: { page?: number; per_page?: number }): Promise<DevToArticle[]> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      if (params.page) searchParams.append('page', String(params.page));
      if (params.per_page) searchParams.append('per_page', String(params.per_page));
    }

    const queryString = searchParams.toString();
    const endpoint = `/articles/me/unpublished${queryString ? `?${queryString}` : ''}`;
    
    return this.request<DevToArticle[]>(endpoint);
  }

  /**
   * Get a single article by ID
   */
  async getArticle(id: number): Promise<DevToArticle> {
    return this.request<DevToArticle>(`/articles/${id}`);
  }

  /**
   * Get article by path (username/slug)
   */
  async getArticleByPath(username: string, slug: string): Promise<DevToArticle> {
    return this.request<DevToArticle>(`/articles/${username}/${slug}`);
  }

  /**
   * Create a new article
   */
  async createArticle(payload: CreateArticlePayload): Promise<DevToArticle> {
    return this.request<DevToArticle>('/articles', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Update an existing article
   */
  async updateArticle(id: number, payload: UpdateArticlePayload): Promise<DevToArticle> {
    return this.request<DevToArticle>(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Get current user profile
   */
  async getMe(): Promise<DevToArticle['user'] & { id: number }> {
    return this.request('/users/me');
  }
}

// Export singleton instance
export const devtoClient = new DevToClient();

// Export class for custom instances
export { DevToClient };
