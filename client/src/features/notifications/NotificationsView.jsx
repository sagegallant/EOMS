import { useState } from 'react';
import { Card, Button, Badge } from '../../components/common/ui';
import { Bell, CheckCheck, Clock, ShieldCheck, Laptop, FileCheck, Award, AlertTriangle } from 'lucide-react';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Welcome to EOMS Technologies India! 🎉',
    desc: 'Your 90-day onboarding journey has officially begun. Review your Day 1 task checklist and attend the virtual HR orientation.',
    time: '2 hours ago',
    unread: true,
    category: 'Welcome',
    icon: Award,
    tone: 'primary',
  },
  {
    id: 2,
    title: 'Hardware Handover Acknowledged ✓',
    desc: 'Your MacBook Pro 16" M3 Max (BLR-MBP-2026-108) allocation has been successfully recorded and acknowledged by IT.',
    time: 'Yesterday at 4:30 PM',
    unread: true,
    category: 'IT Equipment',
    icon: Laptop,
    tone: 'success',
  },
  {
    id: 3,
    title: 'Statutory Verification Complete: PAN & EPFO',
    desc: 'Priya Patel (HR) has verified your PAN Card and EPFO Form 11 declarations against government databases.',
    time: '2 days ago',
    unread: false,
    category: 'Compliance',
    icon: ShieldCheck,
    tone: 'success',
  },
  {
    id: 4,
    title: 'Upcoming Milestone: 30-Day Evaluation',
    desc: 'You are on track to complete Week 1. Your 30-day technical check-in with Vikram Malhotra is scheduled for March 25.',
    time: '3 days ago',
    unread: false,
    category: 'Onboarding SLA',
    icon: Clock,
    tone: 'warning',
  },
];

export default function NotificationsView() {
  const [notifs, setNotifs] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState('ALL');

  const markAllRead = () => {
    setNotifs(notifs.map(n => ({ ...n, unread: false })));
  };

  const toggleRead = id => {
    setNotifs(notifs.map(n => (n.id === id ? { ...n, unread: !n.unread } : n)));
  };

  const filtered = notifs.filter(n => (filter === 'UNREAD' ? n.unread : true));

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-6)', maxWidth: 880 }} className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="display">Notifications &amp; Reminders</h1>
          <p className="body" style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            System dispatches, onboarding milestones, and statutory compliance alerts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" size="sm" icon={CheckCheck} onClick={markAllRead}>
            Mark All as Read
          </Button>
        </div>
      </header>

      {/* ── Filter Tabs ── */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => setFilter('ALL')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--r-full)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            background: filter === 'ALL' ? 'var(--primary)' : 'var(--bg-surface)',
            color: filter === 'ALL' ? '#FFFFFF' : 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          All Notifications ({notifs.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--r-full)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            background: filter === 'UNREAD' ? 'var(--primary)' : 'var(--bg-surface)',
            color: filter === 'UNREAD' ? '#FFFFFF' : 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          Unread ({notifs.filter(n => n.unread).length})
        </button>
      </div>

      {/* ── Feed ── */}
      <div style={{ display: 'grid', gap: 10 }}>
        {filtered.map(n => {
          const IconComp = n.icon || Bell;
          return (
            <Card
              key={n.id}
              onClick={() => toggleRead(n.id)}
              $hoverable
              style={{
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start',
                cursor: 'pointer',
                background: n.unread ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                borderLeft: n.unread ? '3px solid var(--primary)' : '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--r-md)',
                  background: n.unread ? 'var(--primary-light)' : 'var(--bg-sunken)',
                  color: n.unread ? 'var(--primary)' : 'var(--text-muted)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <IconComp size={18} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <h3 className="h3" style={{ fontSize: '0.92rem', color: n.unread ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {n.title}
                  </h3>
                  <span className="meta">{n.time}</span>
                </div>
                <p className="body" style={{ fontSize: '0.84rem', marginTop: 4, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                  {n.desc}
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Badge tone={n.tone} showDot={false}>{n.category}</Badge>
                  {n.unread && <Badge tone="info">Unread</Badge>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
