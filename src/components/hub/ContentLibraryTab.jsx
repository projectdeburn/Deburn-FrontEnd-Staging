/**
 * ContentLibraryTab Component
 * Manages all microlearning content items
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { hubApi } from '@/features/hub/hubApi';
import ContentModal from './ContentModal';

const CATEGORIES = ['featured', 'leadership', 'breath', 'meditation', 'burnout', 'wellbeing', 'other'];
const CONTENT_TYPES = ['text_article', 'audio_article', 'audio_exercise', 'video_link'];
const STATUSES = ['draft', 'in_review', 'published', 'archived'];

const CATEGORY_LABELS = {
  featured: 'Featured',
  leadership: 'Leadership',
  breath: 'Breath Techniques',
  meditation: 'Meditation',
  burnout: 'Burnout',
  wellbeing: 'Wellbeing',
  other: 'Other',
};

const TYPE_LABELS = {
  text_article: 'Text',
  audio_article: 'Audio',
  audio_exercise: 'Exercise',
  video_link: 'Video',
};

const STATUS_COLORS = {
  draft: 'var(--hub-text-secondary)',
  in_review: 'var(--hub-warning)',
  published: 'var(--hub-success)',
  archived: 'var(--hub-text-secondary)',
};

export default function ContentLibraryTab({ showMessage }) {
  const { t } = useTranslation(['hub', 'common']);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    contentType: '',
    status: '',
  });
  const [editingItem, setEditingItem] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadContent();
  }, [filters]);

  async function loadContent() {
    setIsLoading(true);
    try {
      const result = await hubApi.getContent(filters);
      if (result.success) {
        setItems(result.data.items || []);
      }
    } catch (error) {
      showMessage(error.message || t('hub:content.error.load'), 'error');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(data) {
    try {
      await hubApi.createContent(data);
      showMessage(t('hub:content.success.created'), 'success');
      setShowCreateModal(false);
      await loadContent();
    } catch (error) {
      showMessage(error.message || t('hub:content.error.create'), 'error');
    }
  }

  async function handleUpdate(id, data) {
    try {
      await hubApi.updateContent(id, data);
      showMessage(t('hub:content.success.updated'), 'success');
      setEditingItem(null);
      await loadContent();
    } catch (error) {
      showMessage(error.message || t('hub:content.error.update'), 'error');
    }
  }

  async function handleDelete(id) {
    if (!confirm(t('hub:content.confirm.delete'))) return;

    try {
      await hubApi.deleteContent(id);
      showMessage(t('hub:content.success.deleted'), 'success');
      await loadContent();
    } catch (error) {
      showMessage(error.message || t('hub:content.error.delete'), 'error');
    }
  }

  async function handleEditClick(item) {
    try {
      const result = await hubApi.getContentItem(item.id);
      if (result.success) {
        setEditingItem(result.data.item);
      }
    } catch (error) {
      showMessage(error.message || t('hub:content.error.loadItem'), 'error');
    }
  }

  // Group items by category
  const groupedItems = {};
  items.forEach((item) => {
    const cat = item.category || 'other';
    if (!groupedItems[cat]) groupedItems[cat] = [];
    groupedItems[cat].push(item);
  });

  return (
    <>
      {/* Header with filters */}
      <div className="hub-card" style={{ marginBottom: '24px' }}>
        <div className="hub-card-header">
          <div>
            <h3 className="hub-card-title">{t('hub:content.title', 'Content Library')}</h3>
            <p className="hub-card-subtitle">
              {t('hub:content.subtitle', 'Microlearning courses and resources')}
            </p>
          </div>
          <div className="hub-header-actions">
            <button
              className="hub-btn hub-btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              + {t('hub:content.addContent', 'Add Content')}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="hub-filters">
          <div className="hub-filter-group">
            <label className="hub-label">{t('hub:content.filters.category', 'Category')}</label>
            <select
              className="hub-select hub-select-small"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">{t('hub:content.filters.allCategories', 'All Categories')}</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
              ))}
            </select>
          </div>
          <div className="hub-filter-group">
            <label className="hub-label">{t('hub:content.filters.type', 'Content Type')}</label>
            <select
              className="hub-select hub-select-small"
              value={filters.contentType}
              onChange={(e) => setFilters({ ...filters, contentType: e.target.value })}
            >
              <option value="">{t('hub:content.filters.allTypes', 'All Types')}</option>
              {CONTENT_TYPES.map((type) => (
                <option key={type} value={type}>{TYPE_LABELS[type]}</option>
              ))}
            </select>
          </div>
          <div className="hub-filter-group">
            <label className="hub-label">{t('hub:content.filters.status', 'Status')}</label>
            <select
              className="hub-select hub-select-small"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">{t('hub:content.filters.allStatuses', 'All Statuses')}</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>{status.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content List */}
      <div className="hub-card">
        {isLoading ? (
          <div className="hub-empty">{t('common:loading')}</div>
        ) : items.length === 0 ? (
          <div className="hub-empty">
            <p>{t('hub:content.noItems', 'No content items found')}</p>
            <p className="hub-text-muted" style={{ marginTop: '8px' }}>
              {t('hub:content.noItemsHint', 'Click "+ Add Content" to create new microlearning content')}
            </p>
          </div>
        ) : (
          <div className="hub-content-list">
            {CATEGORIES.filter((cat) => groupedItems[cat]?.length > 0).map((cat) => (
              <div key={cat} className="hub-content-category">
                <h4 className="hub-content-category-title">
                  {CATEGORY_LABELS[cat]} ({groupedItems[cat].length})
                </h4>
                <div className="hub-content-grid">
                  {groupedItems[cat].map((item) => (
                    <div key={item.id} className="hub-content-item">
                      <div className="hub-content-item-header">
                        <span className="hub-content-type-badge">
                          {TYPE_LABELS[item.contentType] || item.contentType}
                        </span>
                        <span
                          className="hub-content-status"
                          style={{ color: STATUS_COLORS[item.status] }}
                        >
                          {item.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="hub-content-item-title">{item.titleEn}</div>
                      {item.purpose && (
                        <div className="hub-content-item-purpose">
                          {item.purpose.length > 100
                            ? item.purpose.substring(0, 100) + '...'
                            : item.purpose}
                        </div>
                      )}
                      {item.coachTopics?.length > 0 && (
                        <div className="hub-content-coach-topics">
                          {item.coachTopics.slice(0, 4).map((topic) => (
                            <span key={topic} className="hub-content-coach-topic">
                              {topic.replace('_', ' ')}
                            </span>
                          ))}
                          {item.coachTopics.length > 4 && (
                            <span className="hub-content-coach-topic">
                              +{item.coachTopics.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="hub-content-item-footer">
                        {item.lengthMinutes && (
                          <span>{item.lengthMinutes} min</span>
                        )}
                        <div className="hub-content-item-actions">
                          <button
                            className="hub-btn hub-btn-small"
                            onClick={() => handleEditClick(item)}
                          >
                            {t('common:edit', 'Edit')}
                          </button>
                          <button
                            className="hub-btn hub-btn-small hub-btn-danger"
                            onClick={() => handleDelete(item.id)}
                          >
                            {t('common:delete', 'Delete')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <ContentModal
          mode="create"
          onSave={handleCreate}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingItem && (
        <ContentModal
          mode="edit"
          item={editingItem}
          onSave={(data) => handleUpdate(editingItem.id, data)}
          onClose={() => setEditingItem(null)}
        />
      )}
    </>
  );
}
