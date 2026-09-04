import { useState } from 'react';
import { Card, Button, Badge, Progress, Modal } from '../../components/common/ui';
import { GraduationCap, PlayCircle, CheckCircle2, Clock, Award, BookOpen, AlertCircle } from 'lucide-react';

const INITIAL_COURSES = [
  {
    id: 1,
    title: 'POSH Act 2013 Sensitization & Prevention of Workplace Harassment',
    desc: 'Mandatory Indian statutory training on recognizing, preventing, and reporting workplace misconduct under ICC guidelines.',
    duration: '45 mins',
    mandatory: true,
    passingScore: 80,
    score: 85,
    progress: 64,
    status: 'in_progress',
    modules: [
      'Understanding the POSH Act 2013 & Legal Definitions',
      'Internal Complaints Committee (ICC) Role & Redressal Procedures',
      'Workplace Conduct Scenarios & Case Studies',
      'POSH Mandatory Certification Quiz',
    ],
  },
  {
    id: 2,
    title: 'Information Security & DPDP Act Compliance 2026',
    desc: 'Data protection standards, handling customer PII, corporate phishing defense, and secure engineering practices.',
    duration: '60 mins',
    mandatory: true,
    passingScore: 85,
    score: 92,
    progress: 100,
    status: 'completed',
    modules: [
      'Digital Personal Data Protection (DPDP) Core Principles',
      'Phishing Awareness, 2FA & Password Hygiene',
      'Information Security Final Assessment',
    ],
  },
  {
    id: 3,
    title: 'EOMS Cloud Infrastructure & Git Flow Standards',
    desc: 'Microservices architecture, Docker environment setup, PR code review conventions, and CI/CD deployment policies.',
    duration: '90 mins',
    mandatory: true,
    passingScore: 80,
    score: 95,
    progress: 100,
    status: 'completed',
    modules: [
      'Local Development Environment with Docker',
      'Branching Conventions & GitHub PR Lifecycles',
      'Testing & Zero-Downtime Deployment SOPs',
    ],
  },
  {
    id: 4,
    title: 'Corporate Code of Conduct & Anti-Bribery Standards',
    desc: 'Company ethics, gift policies, conflict of interest, and whistle-blower mechanisms.',
    duration: '30 mins',
    mandatory: false,
    passingScore: 75,
    score: 100,
    progress: 100,
    status: 'completed',
    modules: [
      'Ethical Decision Making at EOMS',
      'Conflict of Interest & Gift Declaration Policies',
      'Whistle-blower Protection & Reporting',
    ],
  },
];

export default function TrainingView() {
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handleStartCourse = course => {
    setActiveCourse(course);
    setActiveModuleIndex(0);
    setQuizSelected(null);
    setQuizSubmitted(false);
  };

  const handleNextModule = () => {
    if (activeModuleIndex < activeCourse.modules.length - 1) {
      setActiveModuleIndex(activeModuleIndex + 1);
    } else if (!quizSubmitted) {
      // Final quiz step
      setQuizSubmitted(true);
      // Mark course completed
      setCourses(
        courses.map(c =>
          c.id === activeCourse.id
            ? { ...c, progress: 100, status: 'completed', score: 90 }
            : c
        )
      );
    }
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-6)' }} className="animate-fade-in">
      {/* ── Header ── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
        <div>
          <h1 className="display">Training &amp; Statutory Compliance</h1>
          <p className="body" style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            Mandatory India regulatory courses (POSH Act 2013, DPDP) and engineering onboarding modules.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Badge tone="success" icon={CheckCircle2}>
            {courses.filter(c => c.status === 'completed').length} of {courses.length} Completed
          </Badge>
        </div>
      </header>

      {/* ── Course Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--sp-4)' }}>
        {courses.map(c => {
          const isDone = c.status === 'completed';
          return (
            <Card key={c.id} $hoverable style={{ display: 'grid', gap: 'var(--sp-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--r-md)',
                      background: isDone ? 'var(--success-bg)' : 'var(--primary-light)',
                      color: isDone ? 'var(--success)' : 'var(--primary)',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    {isDone ? <Award size={20} /> : <BookOpen size={20} />}
                  </div>
                  <div>
                    <h3 className="h3" style={{ fontSize: '0.95rem' }}>{c.title}</h3>
                  </div>
                </div>
                {c.mandatory && <Badge tone="warning" showDot={false}>Mandatory</Badge>}
              </div>

              <p className="body" style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                {c.desc}
              </p>

              <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={13} /> {c.duration}
                </span>
                <span>Passing score: <strong>{c.passingScore}%</strong></span>
                {c.score && <span>Score: <strong style={{ color: 'var(--success)' }}>{c.score}%</strong></span>}
              </div>

              <div>
                <Progress value={c.progress} size="md" label="Course Completion" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                <Badge tone={isDone ? 'success' : 'info'}>
                  {isDone ? 'Certified Completed' : `${c.progress}% In Progress`}
                </Badge>
                <Button
                  size="sm"
                  variant={isDone ? 'secondary' : 'primary'}
                  icon={PlayCircle}
                  onClick={() => handleStartCourse(c)}
                >
                  {isDone ? 'Review Course' : 'Resume Course'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Interactive Course Player Modal ── */}
      {activeCourse && (
        <Modal
          isOpen={true}
          onClose={() => setActiveCourse(null)}
          title={activeCourse.title}
          description={`Module ${activeModuleIndex + 1} of ${activeCourse.modules.length}: ${activeCourse.modules[activeModuleIndex]}`}
          maxWidth={620}
          footer={
            <>
              <Button variant="secondary" onClick={() => setActiveCourse(null)}>Exit Player</Button>
              <Button onClick={handleNextModule}>
                {quizSubmitted
                  ? 'Done'
                  : activeModuleIndex < activeCourse.modules.length - 1
                  ? 'Complete & Continue →'
                  : 'Submit Final Quiz'}
              </Button>
            </>
          }
        >
          <div style={{ display: 'grid', gap: 16 }}>
            {/* Progress stepper */}
            <div style={{ display: 'flex', gap: 6 }}>
              {activeCourse.modules.map((m, idx) => (
                <div
                  key={m}
                  style={{
                    flex: 1,
                    height: 5,
                    borderRadius: 'var(--r-full)',
                    background: idx <= activeModuleIndex ? 'var(--primary)' : 'var(--bg-sunken)',
                    transition: 'all 200ms ease',
                  }}
                />
              ))}
            </div>

            {/* Content Display */}
            <div
              style={{
                padding: '24px 20px',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--r-lg)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {activeModuleIndex < activeCourse.modules.length - 1 ? (
                <div style={{ display: 'grid', gap: 12 }}>
                  <div className="h3" style={{ color: 'var(--primary)' }}>
                    📖 {activeCourse.modules[activeModuleIndex]}
                  </div>
                  <p className="body" style={{ lineHeight: 1.6 }}>
                    This module covers compliance protocols mandated by EOMS People Operations and Indian labor regulations. Ensure you review all case scenarios and guidelines prior to the final evaluation.
                  </p>
                  <div style={{ padding: 12, background: 'var(--bg-surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)', fontSize: '0.84rem' }}>
                    ✔ <strong>Key Takeaway:</strong> All employees have the right to a secure, respectful, and transparent workspace under corporate policies and the POSH Act 2013.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 14 }}>
                  <div className="h3" style={{ color: 'var(--primary)' }}>
                    ✍️ Assessment Question:
                  </div>
                  <p className="body" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    Under the POSH Act 2013, to whom should an aggrieved employee report an incident of workplace harassment?
                  </p>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {[
                      'Internal Complaints Committee (ICC)',
                      'External social media channels',
                      'Immediate supervisor only',
                      'Local police station without reporting internally',
                    ].map((opt, oIdx) => (
                      <label
                        key={opt}
                        onClick={() => setQuizSelected(oIdx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 14px',
                          borderRadius: 'var(--r-sm)',
                          border: `1px solid ${quizSelected === oIdx ? 'var(--primary)' : 'var(--border-default)'}`,
                          background: quizSelected === oIdx ? 'var(--primary-light)' : 'var(--bg-surface)',
                          cursor: 'pointer',
                          fontSize: '0.84rem',
                          fontWeight: quizSelected === oIdx ? 600 : 400,
                        }}
                      >
                        <input
                          type="radio"
                          name="posh-quiz"
                          checked={quizSelected === oIdx}
                          onChange={() => setQuizSelected(oIdx)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>

                  {quizSubmitted && (
                    <div style={{ padding: 12, borderRadius: 'var(--r-md)', background: 'var(--success-bg)', color: 'var(--success-text)', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={18} />
                      <span>Congratulations! You passed with a score of <strong>90%</strong>. Your certificate has been recorded.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
