import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, PageHeader, AnimatedList, AnimatedItem } from '../../components/common/ui';
import { Bell, BellOff, CheckCircle2, Clock, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { notificationApi } from '../../api/notifications';

function formatTimeAgo(dateString) {
  if (!dateString) return 'Just now';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function NotificationsView() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await notificationApi.list();
      setNotifs(res.data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError(err?.response?.data?.message || 'Failed to load notifications from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifs((ns) => ns.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
      alert('Failed to update notifications.');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      setNotifs((ns) =>
        ns.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadData} disabled={loading}>
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" icon={BellOff} onClick={handleMarkAllRead}>
                Mark all read
              </Button>
            )}
          </div>
        }
      />

      {error && (
        <Card $p="var(--sp-4)" style={{ borderColor: 'var(--danger-border)', background: 'var(--danger-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)' }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: '0.875rem' }}>{error}</span>
          </div>
        </Card>
      )}

      <Card $p="var(--sp-5)">
        {loading ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading notification feed...
          </div>
        ) : notifs.length === 0 ? (
          <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bell size={32} style={{ margin: '0 auto 8px', color: 'var(--sage-400)' }} />
            <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              No notifications
            </div>
            <p className="caption" style={{ marginTop: 4 }}>
              You're all caught up with your onboarding workflow events.
            </p>
          </div>
        ) : (
          <AnimatedList style={{ display: 'grid', gap: 8 }}>
            {notifs.map((n) => {
              const isUnread = !n.isRead;
              return (
                <AnimatedItem key={n.notificationId}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 'var(--r-md)',
                      border: `1.5px solid ${isUnread ? 'var(--sage-300)' : 'var(--border-subtle)'}`,
                      background: isUnread ? 'var(--sage-50)' : 'var(--bg-surface)',
                      transition: 'all var(--t-fast)',
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--r-md)',
                        background: isUnread ? 'var(--sage-200)' : 'var(--bg-subtle)',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      <Bell size={15} style={{ color: isUnread ? 'var(--sage-800)' : 'var(--text-muted)' }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: isUnread ? 700 : 500, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          {n.title}
                        </span>
                        {isUnread && <Badge tone="warning">New</Badge>}
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
                        {n.message}
                      </p>
                      <div className="meta" style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                        <span>{formatTimeAgo(n.createdAt)}</span>
                        <span>·</span>
                        <span>{n.channel || 'in_app'}</span>
                      </div>
                    </div>

                    {isUnread && (
                      <Button
                        size="xs"
                        variant="ghost"
                        icon={CheckCircle2}
                        onClick={() => handleMarkRead(n.notificationId)}
                      >
                        Read
                      </Button>
                    )}
                  </div>
                </AnimatedItem>
              );
            })}
          </AnimatedList>
        )}
      </Card>
    </div>
  );
}
