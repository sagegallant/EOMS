import { useState } from 'react';
import { Card, Button, Badge, Modal, AnimatedList, AnimatedItem, PageHeader } from '../../components/common/ui';
import { RadialProgress, HorizontalBar } from '../../components/common/charts';
import { GraduationCap, PlayCircle, CheckCircle2, Lock } from 'lucide-react';

const COURSES = [
  { id: 1, title: 'POSH Act 2013 Compliance & Sensitization', category: 'Statutory Compliance', duration: '45 min', progress: 68, required: true, tone: 'info' },
  { id: 2, title: 'Data Protection & IT Act 2000 (DPDP)',     category: 'Legal & Compliance',    duration: '30 min', progress: 40, required: true, tone: 'info' },
  { id: 3, title: 'Engineering Best Practices & Architecture', category: 'Technical',             duration: '60 min', progress: 90, required: false, tone: 'success' },
  { id: 4, title: 'Information Security & Access Governance',  category: 'Security',              duration: '25 min', progress: 100, required: true, tone: 'success' },
  { id: 5, title: 'Workplace Diversity & Inclusion (India)',   category: 'Culture',               duration: '20 min', progress: 0, required: false, tone: 'neutral' },
];

const COMPLETION_BARS = COURSES.map(c => ({
  label: c.title.slice(0, 30) + (c.title.length > 30 ? '…' : ''),
  value: c.progress,
  displayValue: `${c.progress}%`,
  color: c.progress === 100 ? 'var(--chart-emerald)' : c.progress > 50 ? 'var(--chart-blue)' : 'var(--chart-amber)',
}));

export default function TrainingView() {
  const [activeCourse, setActiveCourse] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const visible = filter === 'ALL' ? COURSES : COURSES.filter(c => c.category === filter || (filter === 'required' && c.required));
  const completed = COURSES.filter(c => c.progress === 100).length;

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <PageHeader title="Training" subtitle={`${completed} of ${COURSES.length} courses completed`} />

      {/* ── Completion overview ── */}
      <Card>
        <h2 className="h3" style={{ marginBottom: 14 }}>Course Completion</h2>
        <HorizontalBar items={COMPLETION_BARS} maxValue={100} />
      </Card>

      {/* ── Filter + Courses ── */}
      <Card>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {['ALL', 'required', 'Statutory Compliance', 'Technical'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '4px 10px', borderRadius: 'var(--r-full)', fontSize: '0.75rem', fontWeight: 500, border: '1px solid', cursor: 'pointer', transition: 'all var(--t-fast)',
                borderColor: filter === f ? 'var(--primary)' : 'var(--border-default)',
                background: filter === f ? 'var(--primary-light)' : 'transparent',
                color: filter === f ? 'var(--primary)' : 'var(--text-muted)',
              }}>
              {f === 'ALL' ? 'All' : f === 'required' ? 'Required' : f.split(' ')[0]}
            </button>
          ))}
        </div>
        <AnimatedList style={{ display: 'grid', gap: 8 }}>
          {visible.map(course => (
            <AnimatedItem key={course.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)', transition: 'border-color var(--t-fast)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
              >
                <RadialProgress
                  value={course.progress}
                  size={52}
                  strokeWidth={5}
                  color={course.progress === 100 ? 'var(--chart-emerald)' : course.progress > 0 ? 'var(--chart-blue)' : 'var(--bg-sunken)'}
                  label={course.progress === 100 ? '✓' : `${course.progress}%`}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{course.title}</div>
                  <div className="meta" style={{ color: 'var(--text-muted)', marginTop: 2 }}>{course.category} · {course.duration}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {course.required && <Badge tone="info">Required</Badge>}
                  <Button
                    variant={course.progress === 100 ? 'ghost' : 'soft'}
                    size="xs"
                    icon={course.progress === 100 ? CheckCircle2 : course.progress === 0 ? PlayCircle : PlayCircle}
                    onClick={() => course.progress < 100 && setActiveCourse(course)}
                  >
                    {course.progress === 100 ? 'Done' : course.progress === 0 ? 'Start' : 'Continue'}
                  </Button>
                </div>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedList>
      </Card>

      <Modal isOpen={!!activeCourse} onClose={() => setActiveCourse(null)}
        title={activeCourse?.title}
        description={`${activeCourse?.category} · ${activeCourse?.duration}`}
        footer={<><Button variant="secondary" onClick={() => setActiveCourse(null)}>Later</Button><Button>Mark Complete</Button></>}>
        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ padding: 20, borderRadius: 'var(--r-md)', background: 'var(--bg-subtle)', border: '2px dashed var(--border-default)', display: 'grid', placeItems: 'center', minHeight: 140 }}>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <GraduationCap size={28} style={{ margin: '0 auto 8px', display: 'block', color: 'var(--primary)' }} />
              <p className="caption">{activeCourse?.title}</p>
              <p className="meta" style={{ marginTop: 4 }}>Interactive course content loads here in production</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <RadialProgress value={activeCourse?.progress || 0} size={56} strokeWidth={5} color="var(--chart-blue)" label={`${activeCourse?.progress || 0}%`} />
            <div>
              <div className="h3">Current progress</div>
              <p className="meta" style={{ color: 'var(--text-muted)' }}>Continue where you left off</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
