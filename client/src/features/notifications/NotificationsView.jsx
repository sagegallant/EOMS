/**
 * NotificationsView.jsx — v2.1
 * Crextio-inspired layout: PageHeader + MetricPillBars + Charts/Dark card + ActivityTimeline + Collapsibles
 */
import { useState } from 'react';
import { Card, Button, PageHeader, MetricPillBar, DarkTaskCard, CollapsibleRow } from '../../components/common/ui';
import { ActivityTimeline } from '../../components/common/charts';
import { BellOff, Bell, MessageSquare, Send, ShieldAlert } from 'lucide-react';
import { useScrollReveal } from '../../utils/animations';

const INITIAL_NOTIFS = [
  { title: 'POSH Act 2013 mandatory quiz due tomorrow', description: 'Complete the statutory annual sensitization module by 6:00 PM IST.', type: 'warning', time: '2h ago', meta: 'Statutory' },
  { title: 'Statutory document verified: PAN Card', description: 'Priya Patel (People Ops) validated your tax record against NSDL.', type: 'success', time: '5h ago', meta: 'Documents' },
  { title: 'Asset acknowledged: MacBook Pro 16" M3 Max', description: 'Karthik Subramanian logged delivery acknowledgement from BLR Hub.', type: 'success', time: 'Yesterday', meta: 'IT Assets' },
  { title: '1:1 Milestone reminder with Vikram Malhotra', description: '30-Day Engineering Onboarding sync scheduled on Google Meet.', type: 'info', time: 'Yesterday', meta: 'Manager' },
  { title: 'New teammate joining Platform Engineering', description: 'Kabir Mehta joins the Bellandur office team next Monday.', type: 'info', time: '2d ago', meta: 'Team' },
  { title: 'DPDP Act 2023 module progress saved', description: 'You have completed 40% of the data privacy curriculum.', type: 'neutral', time: '3d ago', meta: 'Training' },
];

const URGENT_NOTIFS = [
  { title: 'Complete POSH Sensitization Quiz', date: 'Due Tomorrow', done: false },
  { title: 'Sign Form 11 EPFO Declaration', date: 'Due Sep 18', done: false },
  { title: 'Confirm Delivery of YubiKey 5C', date: 'Delivered Today', done: false },
  { title: 'PAN Card Validation Completed', date: 'Approved', done: true },
];

export default function NotificationsView() {
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);
  const [read, setRead] = useState([]);
  const rowRef = useScrollReveal({ delay: 0.05 });

  const unreadCount = notifs.length - read.length;
  const markAllRead = () => setRead(notifs.map((_, i) => i));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Notification Center"
        subtitle="Real-time alerts, compliance reminders, and onboarding milestone signals."
        action={
          <Button variant="ghost" size="sm" icon={BellOff} onClick={markAllRead}>
            Mark all read
          </Button>
        }
      />

      {/* ── Metric Pill Bars Row ── */}
      <div ref={rowRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--sp-4)', padding: 'var(--sp-4) var(--sp-5)', background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-green)' }}>
        <MetricPillBar label="Unread Signals"     value={unreadCount > 0 ? 60 : 0} delay={0.0} color={unreadCount > 0 ? 'amber' : 'green'} />
        <MetricPillBar label="Statutory Alerts"   value={100} delay={0.1} />
        <MetricPillBar label="IT & Asset Telemetry" value={85} delay={0.2} />
        <MetricPillBar label="Slack Push Delivery" value={100} delay={0.3} />
      </div>

      {/* ── Visual Section: Activity Timeline + DarkTaskCard ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 'var(--sp-4)', alignItems: 'stretch' }}>
        <Card style={{ padding: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 className="h3">Chronological Feed</h3>
            <span className="caption" style={{ color: 'var(--primary)', fontWeight: 600 }}>{unreadCount} new items</span>
          </div>
          <ActivityTimeline
            events={notifs.map((n, i) => ({
              ...n,
              time: n.time,
              title: n.title,
              type: read.includes(i) ? 'neutral' : n.type,
            }))}
            maxVisible={20}
          />
        </Card>
        <DarkTaskCard title="Immediate Action Items" tasks={URGENT_NOTIFS} />
      </div>

      {/* ── Bottom Collapsibles ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <CollapsibleRow title="Multi-Channel Delivery Channels & Webhooks" icon={MessageSquare}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { channel: 'Slack Enterprise Grid Bot', state: 'Connected', desc: 'Direct DMs for 1:1 reminders and statutory quiz deadlines.' },
              { channel: 'Corporate Email (Google Workspace)', state: 'Active', desc: 'Summary digests and formal legal agreements sent via SendGrid.' },
              { channel: 'SMS / WhatsApp Gateway (India)', state: 'Verified', desc: 'Transactional courier tracking OTPs and OTP login via Gupshup API.' },
            ].map((c, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{c.channel}</span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--primary)' }}>{c.state}</span>
                </div>
                <div className="caption" style={{ color: 'var(--text-muted)' }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </CollapsibleRow>

        <CollapsibleRow title="Alert Frequency & Digest Preferences" icon={ShieldAlert}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { type: 'Immediate Broadcast', trigger: 'Critical compliance failures or hardware security alerts.' },
              { type: 'Daily Morning Digest', trigger: '8:30 AM IST summary of open onboarding tasks for the day.' },
              { type: 'Weekly Friday Recap', trigger: 'Manager sync on team progression and 30-day milestone signoffs.' },
            ].map((p, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{p.type}</div>
                <div className="caption" style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{p.trigger}</div>
              </div>
            ))}
          </div>
        </CollapsibleRow>
      </div>
    </div>
  );
}
