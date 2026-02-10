'use client';

import { useState, useEffect, useCallback } from 'react';
import { BlogList, BlogForm } from '@/components';
import { Article, CreateArticleData, ApiResponse } from '@/types';

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'unpublished'>('all');
  const [editArticle, setEditArticle] = useState<Article | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/blogs?type=${filter}`);
      const data: ApiResponse<Article[]> = await response.json();

      if (data.success && data.data) {
        setArticles(data.data);
      } else {
        showNotification('error', data.error || 'Failed to fetch articles');
      }
    } catch (error) {
      showNotification('error', 'Failed to connect to the server');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleSubmitArticle = async (data: CreateArticleData, articleId?: number) => {
    setFormLoading(true);
    try {
      const isUpdate = !!articleId;
      const url = isUpdate ? `/api/blogs/${articleId}` : '/api/blogs';
      const method = isUpdate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<Article> = await response.json();

      if (result.success) {
        showNotification('success', result.message || (isUpdate ? 'Blog updated successfully!' : 'Blog created successfully!'));
        setActiveTab('list');
        setEditArticle(null);
        fetchArticles();
      } else {
        throw new Error(result.error || (isUpdate ? 'Failed to update blog' : 'Failed to create blog'));
      }
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Failed to save blog');
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditArticle = (article: Article) => {
    setEditArticle(article);
    setActiveTab('create');
  };

  const handleCancelEdit = () => {
    setEditArticle(null);
  };

  const handleDeleteArticle = async (articleId: number) => {
    setDeleteLoading(articleId);
    try {
      const response = await fetch(`/api/blogs/${articleId}`, {
        method: 'DELETE',
      });

      const result: ApiResponse<null> = await response.json();

      if (result.success) {
        showNotification('success', 'Blog deleted successfully!');
        fetchArticles();
      } else {
        throw new Error(result.error || 'Failed to delete blog');
      }
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Failed to delete blog');
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Seedinov Blog Manager</h1>
              <p className="text-sm text-gray-500 mt-1">
                Publish blogs to Dev.to for SEO & Domain Authority
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Connected to Dev.to
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg max-w-sm ${
            notification.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{notification.type === 'success' ? '✓' : '✕'}</span>
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto text-gray-500 hover:text-gray-700 text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              setActiveTab('list');
              setEditArticle(null);
            }}
            className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            My Blogs
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {editArticle ? '✏️ Edit Blog' : '+ Create Blog'}
          </button>
        </div>

        {/* Filter (only show on list tab) */}
        {activeTab === 'list' && (
          <div className="flex gap-2 mb-6">
            {(['all', 'published', 'unpublished'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {activeTab === 'list' ? (
          <BlogList 
            articles={articles} 
            onRefresh={fetchArticles} 
            onEdit={handleEditArticle}
            onDelete={handleDeleteArticle}
            loading={loading} 
            deleteLoading={deleteLoading}
          />
        ) : (
          <BlogForm 
            onSubmit={handleSubmitArticle} 
            loading={formLoading} 
            editArticle={editArticle}
            onCancelEdit={handleCancelEdit}
          />
        )}

        {/* SEO Tips Section */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            SEO & Domain Authority Tips
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>
              • <strong>Canonical URLs:</strong> Always set your original blog URL as canonical to get backlink credit
            </li>
            <li>
              • <strong>Consistent Publishing:</strong> Regular posts improve visibility and authority
            </li>
            <li>
              • <strong>Use Tags:</strong> Add relevant tags (max 4) to increase discoverability
            </li>
            <li>
              • <strong>Quality Content:</strong> Well-written, helpful content gets more engagement
            </li>
            <li>
              • <strong>Cross-linking:</strong> Link back to your main site naturally within content
            </li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>Seedinov Blog Manager - Automated SEO through Dev.to Integration</p>
          <p className="mt-1">
            <a
              href="https://dev.to/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Dev.to API Docs
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
