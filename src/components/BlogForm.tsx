'use client';

import { useState, useEffect } from 'react';
import { CreateArticleData, Article } from '@/types';

interface BlogFormProps {
  onSubmit: (data: CreateArticleData, articleId?: number) => Promise<void>;
  loading: boolean;
  editArticle?: Article | null;
  onCancelEdit?: () => void;
}

export default function BlogForm({ onSubmit, loading, editArticle, onCancelEdit }: BlogFormProps) {
  const [formData, setFormData] = useState<CreateArticleData>({
    title: '',
    body_markdown: '',
    description: '',
    tags: [],
    canonical_url: '',
    main_image: '',
    series: '',
    published: false,
  });

  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Load edit article data
  useEffect(() => {
    if (editArticle) {
      setFormData({
        title: editArticle.title || '',
        body_markdown: editArticle.body_markdown || '',
        description: editArticle.description || '',
        tags: editArticle.tag_list || [],
        canonical_url: editArticle.canonical_url || '',
        main_image: editArticle.cover_image || '',
        series: '',
        published: !!editArticle.published_at,
      });
    }
  }, [editArticle]);

  const handleSubmit = async (e: React.FormEvent, publish: boolean) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.body_markdown.trim()) {
      setError('Content is required');
      return;
    }

    try {
      await onSubmit(
        {
          ...formData,
          published: publish,
        },
        editArticle?.id
      );

      // Reset form on success (only if not editing)
      if (!editArticle) {
        setFormData({
          title: '',
          body_markdown: '',
          description: '',
          tags: [],
          canonical_url: '',
          main_image: '',
          series: '',
          published: false,
        });
        setTagInput('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save blog');
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (tag && formData.tags && formData.tags.length < 4 && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((tag) => tag !== tagToRemove) || [],
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleReset = () => {
    if (onCancelEdit) {
      onCancelEdit();
    }
    setFormData({
      title: '',
      body_markdown: '',
      description: '',
      tags: [],
      canonical_url: '',
      main_image: '',
      series: '',
      published: false,
    });
    setTagInput('');
    setError(null);
  };

  // Simple markdown to HTML converter for preview
  const renderMarkdownPreview = (markdown: string) => {
    let html = markdown
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2 text-gray-900">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-3 text-gray-900">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline" target="_blank">$1</a>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600">$1</blockquote>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-200 px-1 rounded text-sm font-mono text-gray-800">$1</code>')
      .replace(/\n/g, '<br/>');
    return html;
  };

  return (
    <form className="space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {editArticle ? 'Edit Blog' : 'Create New Blog'}
        </h2>
        {editArticle && (
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base bg-white placeholder-gray-400"
          placeholder="Enter blog title..."
          disabled={loading}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
          Description
        </label>
        <input
          type="text"
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base bg-white placeholder-gray-400"
          placeholder="Brief description of your blog..."
          disabled={loading}
        />
      </div>

      {/* Markdown Content Editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="body" className="block text-sm font-semibold text-gray-900">
            Content (Markdown) <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                !showPreview
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                showPreview
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {/* Markdown Toolbar */}
        {!showPreview && (
          <div className="flex flex-wrap gap-1 mb-0 p-2 bg-gray-100 rounded-t-lg border-2 border-b-0 border-gray-300">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, body_markdown: formData.body_markdown + '\n# ' })}
              className="px-2.5 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold text-gray-700"
              title="Heading 1"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, body_markdown: formData.body_markdown + '\n## ' })}
              className="px-2.5 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold text-gray-700"
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, body_markdown: formData.body_markdown + '\n### ' })}
              className="px-2.5 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold text-gray-700"
              title="Heading 3"
            >
              H3
            </button>
            <div className="w-px bg-gray-300 mx-1"></div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, body_markdown: formData.body_markdown + '**bold**' })}
              className="px-2.5 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold text-gray-700"
              title="Bold"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, body_markdown: formData.body_markdown + '*italic*' })}
              className="px-2.5 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 italic text-gray-700"
              title="Italic"
            >
              I
            </button>
            <div className="w-px bg-gray-300 mx-1"></div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, body_markdown: formData.body_markdown + '[link text](https://seedinov.com)' })}
              className="px-2.5 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
              title="Link"
            >
              Link
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, body_markdown: formData.body_markdown + '\n- ' })}
              className="px-2.5 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
              title="List"
            >
              • List
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, body_markdown: formData.body_markdown + '\n> ' })}
              className="px-2.5 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
              title="Quote"
            >
              Quote
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, body_markdown: formData.body_markdown + '\n```\ncode here\n```\n' })}
              className="px-2.5 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 font-mono text-gray-700"
              title="Code Block"
            >
              {'</>'}
            </button>
          </div>
        )}

        {showPreview ? (
          <div
            className="w-full min-h-[350px] px-4 py-4 border-2 border-gray-300 rounded-lg bg-white text-gray-900 overflow-auto"
            dangerouslySetInnerHTML={{
              __html: renderMarkdownPreview(formData.body_markdown) || '<p class="text-gray-400 italic">Nothing to preview yet...</p>',
            }}
          />
        ) : (
          <textarea
            id="body"
            value={formData.body_markdown}
            onChange={(e) => setFormData({ ...formData, body_markdown: e.target.value })}
            rows={16}
            className="w-full px-4 py-4 border-2 border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base font-mono bg-white resize-y placeholder-gray-400"
            placeholder={`Write your blog content in Markdown...

# Main Heading

Introduction paragraph with **bold** and *italic* text.

## Subheading

- List item 1
- List item 2

> Blockquote for important notes

[Link to Seedinov Services](https://seedinov.com/services)

### Code Example
\`\`\`javascript
const greeting = 'Hello World';
console.log(greeting);
\`\`\``}
            disabled={loading}
          />
        )}
        <p className="mt-2 text-xs text-gray-500">
          Supports Markdown: **bold**, *italic*, [links](url), # headings, - lists, &gt; quotes, `code`
        </p>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Tags (max 4)
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base bg-white placeholder-gray-400"
            placeholder="Type a tag and press Enter..."
            disabled={loading || (formData.tags?.length || 0) >= 4}
          />
          <button
            type="button"
            onClick={handleAddTag}
            disabled={loading || (formData.tags?.length || 0) >= 4 || !tagInput.trim()}
            className="px-5 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2 min-h-[32px]">
          {formData.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 text-blue-600 hover:text-blue-800 font-bold text-lg leading-none"
                disabled={loading}
              >
                ×
              </button>
            </span>
          ))}
          {(!formData.tags || formData.tags.length === 0) && (
            <span className="text-gray-400 text-sm italic">No tags added yet</span>
          )}
        </div>
      </div>

      {/* URLs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="canonical_url" className="block text-sm font-semibold text-gray-900 mb-2">
            Canonical URL (for backlinks)
          </label>
          <input
            type="url"
            id="canonical_url"
            value={formData.canonical_url}
            onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base bg-white placeholder-gray-400"
            placeholder="https://seedinov.com/blog/your-post"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Original post URL on your site for SEO backlink credit
          </p>
        </div>

        <div>
          <label htmlFor="main_image" className="block text-sm font-semibold text-gray-900 mb-2">
            Cover Image URL
          </label>
          <input
            type="url"
            id="main_image"
            value={formData.main_image}
            onChange={(e) => setFormData({ ...formData, main_image: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base bg-white placeholder-gray-400"
            placeholder="https://example.com/cover-image.jpg"
            disabled={loading}
          />
        </div>
      </div>

      {/* Series */}
      <div>
        <label htmlFor="series" className="block text-sm font-semibold text-gray-900 mb-2">
          Series Name (optional)
        </label>
        <input
          type="text"
          id="series"
          value={formData.series}
          onChange={(e) => setFormData({ ...formData, series: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base bg-white placeholder-gray-400"
          placeholder="My Blog Series"
          disabled={loading}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={(e) => handleSubmit(e, false)}
          disabled={loading}
          className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? 'Saving...' : 'Save as Draft'}
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          disabled={loading}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? 'Publishing...' : editArticle ? 'Update & Publish' : 'Publish Now'}
        </button>
      </div>
    </form>
  );
}
