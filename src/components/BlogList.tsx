'use client';

import { Article } from '@/types';
import { useState } from 'react';

interface BlogListProps {
  articles: Article[];
  onRefresh: () => void;
  onEdit: (article: Article) => void;
  onDelete: (articleId: number) => void;
  loading: boolean;
  deleteLoading?: number | null;
}

export default function BlogList({ articles, onRefresh, onEdit, onDelete, loading, deleteLoading }: BlogListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not published';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDeleteClick = (articleId: number) => {
    if (deleteConfirm === articleId) {
      onDelete(articleId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(articleId);
      // Auto-cancel after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading blogs...</span>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-lg border border-gray-200">
        <div className="text-4xl mb-4">📝</div>
        <p className="text-gray-600 text-lg mb-2">No blogs found</p>
        <p className="text-gray-500 text-sm mb-4">Create your first blog to get started!</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Your Blogs ({articles.length})</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4">
        {articles.map((article) => (
          <div
            key={article.id}
            className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="font-semibold text-lg text-gray-900">{article.title}</h3>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      article.published_at
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {article.published_at ? 'Published' : 'Draft'}
                  </span>
                </div>

                {article.description && (
                  <p className="text-gray-600 text-sm mb-3">{article.description}</p>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  {article.tag_list?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>📅 {formatDate(article.published_at || article.created_at)}</span>
                  {article.reading_time_minutes && (
                    <span>⏱️ {article.reading_time_minutes} min read</span>
                  )}
                  {article.public_reactions_count > 0 && (
                    <span>❤️ {article.public_reactions_count}</span>
                  )}
                  {article.comments_count > 0 && (
                    <span>💬 {article.comments_count}</span>
                  )}
                  {article.page_views_count > 0 && (
                    <span>👁️ {article.page_views_count} views</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <div className="flex gap-2">
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      View
                    </a>
                  )}
                  <button
                    onClick={() => onEdit(article)}
                    className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Edit
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    {expandedId === article.id ? 'Hide' : 'Details'}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(article.id)}
                    disabled={deleteLoading === article.id}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors font-medium ${
                      deleteConfirm === article.id
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    } disabled:opacity-50`}
                  >
                    {deleteLoading === article.id
                      ? 'Deleting...'
                      : deleteConfirm === article.id
                      ? 'Confirm?'
                      : 'Delete'}
                  </button>
                </div>
              </div>
            </div>

            {expandedId === article.id && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium">Article ID:</span>
                    <span className="ml-2 font-mono text-gray-900">{article.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Slug:</span>
                    <span className="ml-2 font-mono text-gray-900">{article.slug}</span>
                  </div>
                  {article.canonical_url && (
                    <div className="col-span-2">
                      <span className="text-gray-500 font-medium">Canonical URL:</span>
                      <a
                        href={article.canonical_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:underline break-all"
                      >
                        {article.canonical_url}
                      </a>
                    </div>
                  )}
                  {article.cover_image && (
                    <div className="col-span-2">
                      <span className="text-gray-500 font-medium">Cover Image:</span>
                      <div className="mt-2">
                        <img 
                          src={article.cover_image} 
                          alt="Cover" 
                          className="max-w-xs rounded-lg border border-gray-200"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
