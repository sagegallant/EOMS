/**
 * TrainingView.jsx — v2.1
 * Crextio-inspired layout: PageHeader + MetricPillBars + Charts/Dark card + Course List + Collapsibles
 */
import { useState } from 'react';
import { Card, Button, Badge, Modal, PageHeader, MetricPillBar, DarkTaskCard, CollapsibleRow } from '../../components/common/ui';
import { RadialProgress, HorizontalBar } from '../../components/common/charts';
import { GraduationCap, PlayCircle, CheckCircle2, Lock, BookOpen, ShieldCheck, Award } from 'lucide-react';
import { useScrollReveal } from '../../utils/animations';

const COURSES = [
  { id: 1, title: 'POSH Act 2013 Compliance & Sensitization', category: 'Statutory Compliance', duration: '45 min', progress: 68, required: true, tone: 'info' },
  { id: 2, title: 'Digital Personal Data Protection Act (DPDP 2023)', category: 'Legal & Compliance', duration: '30 min', progress: 40, required: true, tone: 'info' },
  { id: 3, title: 'Engineering Best Practices & Microservices Architecture', category: 'Technical', duration: '60 min', progress: 90, required: false, tone: 'success' },
  { id: 4, title: 'Information Security & Access Governance (ISO 27001)', category: 'Security', duration: '25 min', progress: 100, required: true, tone: 'success' },
  { id: 5, title: 'Diversity, Equity & Cultural Sensitization (India Hubs)', category: 'Culture', duration: '20 min', progress: 20, required: false, tone: 'neutral' },
];

const COMPLETION_BARS = COURSES.map(c => ({
  label: c.title.length > 28 ? c.title.slice(0, 26) + '…' : c.title,
  value: c.progress,
  displayValue: `${c.progress}%`,
}));

const PRIORITY_LEARNING = [
  { title: 'POSH Act 2013 Module 2 Quiz', date: 'Due Tomorrow', done: false },
  { title: 'DPDP Act Consent Architecture', date: 'Due Sep 20', done: false },
  { title: 'Microservices Code Review Guideline', date: 'Due Sep 22', done: false },
  { title: 'ISO 27001 Security Assessment', date: 'Passed 100%', done: true },
];

export default function TrainingView() {
  const [courses, setCourses] = useState(COURSES);
  const [activeCourse, setActiveCourse] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const rowRef = useScrollReveal({ delay: 0.05 });

  const visible = filter === 'ALL'
    ? courses
    : courses.filter(c => c.category === filter || (filter === 'required' && c.required));

  const completedCount = courses.filter(c => c.progress === 100).length;
  const avgProgress = Math.round(courses.reduce((s, c) => s + c.progress, 0) / courses.length);

  const markCourseDone = id => {
    setCourses(cs => cs.map(c => c.id === id ? { ...c, progress: 100, tone: 'success' } : c));
    setActiveCourse(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Learning & Certifications"
        subtitle="Mandatory Indian statutory modules, cloud architecture certifications, and security protocols."
      />

      {/* ── Metric Pill Bars Row ── */}
      <div ref={rowRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--sp-4)', padding: 'var(--sp-4) var(--sp-5)', background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-green)' }}>
        <MetricPillBar label="Curriculum Progress" value={avgProgress} delay={0.0} />
        <MetricPillBar label="Statutory POSH Rate" value={98} delay={0.1} />
        <MetricPillBar label="Security Standards"  value={100} delay={0.2} />
        <MetricPillBar label="Pending Modules"    value={32} delay={0.3} color="amber" />
      </div>

      {/* ── Visual Section: HorizontalBar + DarkTaskCard ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 'var(--sp-4)', alignItems: 'stretch' }}>
        <Card style={{ padding: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 className="h3">Course Completion Metrics</h3>
            <span className="caption" style={{ color: 'var(--primary)', fontWeight: 600 }}>{completedCount} of {courses.length} Certified</span>
          </div>
          <HorizontalBar items={COMPLETION_BARS} maxValue={100} colorVar="--chart-green" />
        </Card>
        <DarkTaskCard title="Priority Learning Tasks" tasks={PRIORITY_LEARNING} />
      </div>

      {/* ── Course List Card ── */}
      <Card style={{ padding: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['ALL', 'required', 'Statutory Compliance', 'Technical', 'Security'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--r-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: '1px solid',
                  cursor: 'pointer',
                  borderColor: filter === f ? 'var(--bg-dark)' : 'var(--border-subtle)',
                  background: filter === f ? 'var(--bg-dark)' : 'var(--bg-subtle)',
                  color: filter === f ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.2s var(--ease)',
                }}
              >
                {f === 'ALL' ? 'All Modules' : f === 'required' ? 'Mandatory' : f}
              </button>
            ))}
          </div>
          <span className="caption" style={{ color: 'var(--text-muted)' }}>
            Showing {visible.length} courses
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visible.map(course => (
            <div
              key={course.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 14px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                flexWrap: 'wrap',
              }}
            >
              <RadialProgress
                value={course.progress}
                size={52}
                strokeWidth={5}
                color="var(--chart-green)"
                label={course.progress === 100 ? '✓' : `${course.progress}%`}
              />
              <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{course.title}</div>
                <div className="caption" style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                  {course.category} · Duration: {course.duration}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {course.required && <Badge tone="info">Mandatory</Badge>}
                <Button
                  variant={course.progress === 100 ? 'ghost' : 'soft'}
                  size="xs"
                  icon={course.progress === 100 ? CheckCircle2 : PlayCircle}
                  onClick={() => setActiveCourse(course)}
                >
                  {course.progress === 100 ? 'Review' : course.progress === 0 ? 'Start' : 'Continue'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Bottom Collapsibles ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <CollapsibleRow title="Mandatory Statutory Frameworks (Government of India)" icon={ShieldCheck}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { name: 'POSH Act 2013 Module', authority: 'Ministry of Women and Child Development', desc: 'Internal Complaints Committee (ICC) structure, reporting avenues, and gender neutral workplace standards.' },
              { name: 'DPDP Act 2023 Privacy Principles', authority: 'Data Protection Board of India', desc: 'Data fiduciary duties, principal consent tracking, cross-border transmission constraints.' },
              { name: 'National Cybersecurity Policy & CERT-In', authority: 'Ministry of Electronics and IT (MeitY)', desc: 'Mandatory 6-hour security incident reporting and vulnerability handling.' },
            ].map((st, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{st.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>{st.authority}</div>
                <div className="caption" style={{ color: 'var(--text-muted)', marginTop: 2 }}>{st.desc}</div>
              </div>
            ))}
          </div>
        </CollapsibleRow>

        <CollapsibleRow title="Engineering Level-Up Pathways & Badges" icon={Award}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { track: 'Platform SRE Specialist', badge: 'Tier 1 Certified', desc: 'Kubernetes production troubleshooting, OpenTelemetry observability, zero-downtime canary rollout.' },
              { track: 'Frontend UI/UX Craftsmanship', badge: 'Tier 2 Certified', desc: 'Design tokens architecture, GSAP micro-animations, Lighthouse performance optimization.' },
              { track: 'Cloud SecOps Defender', badge: 'Tier 1 Certified', desc: 'AWS IAM Least Privilege, KMS envelope encryption, SAST/DAST automated pipelines.' },
            ].map((p, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{p.track}</span>
                  <Badge tone="success">{p.badge}</Badge>
                </div>
                <div className="caption" style={{ color: 'var(--text-muted)' }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </CollapsibleRow>
      </div>

      {/* ── Active Course Modal ── */}
      <Modal
        isOpen={!!activeCourse}
        onClose={() => setActiveCourse(null)}
        title={activeCourse?.title}
      >
        {activeCourse && (
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ padding: 24, borderRadius: 'var(--r-md)', background: 'var(--bg-app)', border: '2px dashed var(--border-green)', display: 'grid', placeItems: 'center', minHeight: 140 }}>
              <div style={{ textAlign: 'center' }}>
                <GraduationCap size={32} style={{ margin: '0 auto 8px', display: 'block', color: 'var(--primary)' }} />
                <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{activeCourse.title}</p>
                <p className="caption" style={{ color: 'var(--text-muted)', marginTop: 4 }}>
                  {activeCourse.category} · Duration: {activeCourse.duration}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="caption" style={{ color: 'var(--text-muted)' }}>Current Progress</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{activeCourse.progress}%</span>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <Button variant="outline" size="sm" onClick={() => setActiveCourse(null)}>Close</Button>
              <Button size="sm" onClick={() => markCourseDone(activeCourse.id)}>Mark as 100% Completed</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
