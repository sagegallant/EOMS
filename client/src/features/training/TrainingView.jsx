import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Badge,
  Modal,
  AnimatedList,
  AnimatedItem,
  PageHeader,
} from '../../components/common/ui';
import { RadialProgress, HorizontalBar } from '../../components/common/charts';
import {
  GraduationCap,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  HelpCircle,
  Award,
  RotateCcw,
} from 'lucide-react';
import { trainingApi } from '../../api/training';
import { useAuthStore } from '../../store/authStore';
import TasksView from '../tasks/TasksView';

export default function TrainingView() {
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  // Quiz Modal State
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const coursesRes = await trainingApi.listCourses();
      const courseList = coursesRes.data || [];
      setCourses(courseList);

      if (user?.employeeId) {
        try {
          const recRes = await trainingApi.getEmployeeTraining(user.employeeId);
          setRecords(recRes.data || []);
        } catch {
          // non-critical
        }
      }
    } catch (err) {
      console.error('Failed to load training courses:', err);
      setError(err?.response?.data?.message || 'Failed to load training courses from server.');
    } finally {
      setLoading(false);
    }
  }, [user?.employeeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenQuiz = async (course) => {
    setSelectedCourse(course);
    setQuizResult(null);
    setAnswers({});
    setQuizModalOpen(true);

    try {
      setQuizLoading(true);
      const res = await trainingApi.getCourseQuiz(course.courseId);
      setQuizData(res.data);
    } catch (err) {
      console.error('Failed to load quiz:', err);
      alert(err?.response?.data?.message || 'Failed to load quiz questions.');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quizData?.questions) return;
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < quizData.questions.length) {
      alert(`Please answer all ${quizData.questions.length} questions before submitting.`);
      return;
    }

    try {
      setSubmittingQuiz(true);
      const res = await trainingApi.submitQuiz(selectedCourse.courseId, {
        employeeId: user?.employeeId,
        answers,
      });
      setQuizResult(res.data);
      await loadData();
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      alert(err?.response?.data?.message || 'Failed to score quiz.');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // Merge course with employee records
  const mergedCourses = courses.map((c) => {
    const rec = records.find((r) => r.courseId === c.courseId);
    return {
      ...c,
      status: rec?.status || 'not_started',
      progress: rec?.progressPercent || 0,
      score: rec?.score ?? null,
      recordId: rec?.recordId,
    };
  });

  const completed = mergedCourses.filter((c) => c.status === 'completed' || c.progress === 100).length;
  const avgProgress = mergedCourses.length ? Math.round(mergedCourses.reduce((sum, c) => sum + c.progress, 0) / mergedCourses.length) : 0;

  const visible = mergedCourses.filter((c) => {
    if (filter === 'ALL') return true;
    if (filter === 'required') return c.isMandatory;
    if (filter === 'completed') return c.status === 'completed';
    return true;
  });

  const [activeTab, setActiveTab] = useState('training');

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <PageHeader
        title="Training & Tasks"
        subtitle="Manage your learning modules and daily tasks"
        action={
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadData} disabled={loading}>
            Refresh
          </Button>
        }
      />

      <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid var(--border-subtle)', marginBottom: 8 }}>
        <button
          onClick={() => setActiveTab('training')}
          style={{
            padding: '12px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'training' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'training' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'training' ? 600 : 500,
            cursor: 'pointer',
            fontSize: '0.9375rem',
            transition: 'all var(--t-fast)'
          }}
        >
          Training Modules
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          style={{
            padding: '12px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'tasks' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'tasks' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'tasks' ? 600 : 500,
            cursor: 'pointer',
            fontSize: '0.9375rem',
            transition: 'all var(--t-fast)'
          }}
        >
          Assigned Tasks
        </button>
      </div>

      {activeTab === 'tasks' ? (
        <TasksView />
      ) : (
        <>
          {error && (
            <Card $p="var(--sp-4)" style={{ borderColor: 'var(--danger-border)', background: 'var(--danger-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)' }}>
                <AlertCircle size={18} />
                <span style={{ fontSize: '0.875rem' }}>{error}</span>
              </div>
            </Card>
          )}

          {/* 4-Column Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-4)' }}>
            <Card $p="var(--sp-5)" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>In Progress</span>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--sage-100)', display: 'grid', placeItems: 'center', color: 'var(--sage-800)' }}>
                  <RefreshCw size={16} />
                </div>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 8 }}>
                {mergedCourses.length - completed}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Active modules</div>
            </Card>
            
            <Card $p="var(--sp-5)" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Modules</span>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--sage-100)', display: 'grid', placeItems: 'center', color: 'var(--sage-800)' }}>
                  <GraduationCap size={16} />
                </div>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 8 }}>
                {mergedCourses.length}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Across all categories</div>
            </Card>

            <Card $p="var(--sp-5)" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</span>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--sage-100)', display: 'grid', placeItems: 'center', color: 'var(--sage-800)' }}>
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 8 }}>
                {completed}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Fully verified</div>
            </Card>

            <Card $p="var(--sp-5)" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Progress</span>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--sage-100)', display: 'grid', placeItems: 'center', color: 'var(--sage-800)' }}>
                  <Award size={16} />
                </div>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 8 }}>
                {avgProgress}%
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Across all plans</div>
            </Card>
          </div>

      <Card $p="var(--sp-5)">
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Courses' },
            { id: 'required', label: 'Mandatory Only' },
            { id: 'completed', label: 'Completed' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--r-full)',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: '1.5px solid',
                cursor: 'pointer',
                transition: 'all var(--t-fast)',
                borderColor: filter === f.id ? 'var(--sage-600)' : 'var(--border-default)',
                background: filter === f.id ? 'var(--sage-100)' : 'transparent',
                color: filter === f.id ? 'var(--sage-800)' : 'var(--text-muted)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <AnimatedList style={{ display: 'grid', gap: 8 }}>
          {visible.map((course) => {
            const isDone = course.status === 'completed' || course.progress === 100;

            return (
              <AnimatedItem key={course.courseId}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface)',
                    transition: 'all var(--t-fast)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    onClick={() => setExpandedCourseId(expandedCourseId === course.courseId ? null : course.courseId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '12px 14px',
                      cursor: 'pointer',
                      flexWrap: 'wrap',
                    }}
                  >
                  <RadialProgress
                    value={course.progress}
                    size={52}
                    strokeWidth={5}
                    color={isDone ? 'var(--chart-1)' : course.progress > 0 ? 'var(--sage-500)' : 'var(--bg-sunken)'}
                    trackColor="var(--sage-100)"
                    label={isDone ? '✓' : `${course.progress}%`}
                  />

                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {course.title}
                    </div>
                    <div className="meta" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                      <span>Pass score: {course.passingScore}%</span>
                      <span>·</span>
                      <span>{course.durationMinutes || 30} mins</span>
                      {course.score !== null && (
                        <>
                          <span>·</span>
                          <span style={{ fontWeight: 600, color: isDone ? 'var(--chart-1)' : 'var(--warning)' }}>
                            Best Score: {course.score}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {course.isMandatory && <Badge tone="sage">Mandatory</Badge>}
                    <Button
                      variant={isDone ? 'ghost' : 'soft'}
                      size="xs"
                      icon={isDone ? CheckCircle2 : PlayCircle}
                      onClick={(e) => { e.stopPropagation(); handleOpenQuiz(course); }}
                    >
                      {isDone ? 'Retake Quiz' : course.progress === 0 ? 'Take Quiz' : 'Continue Quiz'}
                    </Button>
                  </div>
                  </div>
                  
                  {/* Expanded Tasks List */}
                  {expandedCourseId === course.courseId && course.Tasks && course.Tasks.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '12px 14px', background: 'var(--bg-subtle)' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                        Module Checklist ({course.Tasks.filter(t => t.status === 'completed').length}/{course.Tasks.length} Completed)
                      </div>
                      <div style={{ display: 'grid', gap: 6 }}>
                        {Array.from(new Map(course.Tasks.map(t => [t.title, t])).values()).map((t) => {
                          const isTaskDone = t.status === 'completed';
                          return (
                            <div key={t.taskId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)' }}>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    setCourses(prev => prev.map(c => c.courseId === course.courseId ? { ...c, Tasks: c.Tasks.map(task => task.taskId === t.taskId ? { ...task, status: isTaskDone ? 'in_progress' : 'completed' } : task) } : c));
                                    await fetch(`/api/tasks/${t.taskId}/progress`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: isTaskDone ? 'in_progress' : 'completed', employeeId: user?.employeeId }) }).catch(() => {});
                                  } catch (e) {}
                                }}
                                style={{ 
                                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                                  color: isTaskDone ? 'var(--chart-1)' : 'var(--text-muted)',
                                  display: 'flex', alignItems: 'center', transition: 'color var(--t-fast)'
                                }}
                              >
                                <CheckCircle2 size={20} />
                              </button>
                              <div style={{ flex: 1, fontSize: '0.875rem' }}>{t.title}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.estimatedMinutes}m</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </AnimatedItem>
            );
          })}
        </AnimatedList>
      </Card>
      </>
      )}

      {/* Interactive Quiz Engine Modal */}
      <Modal
        isOpen={quizModalOpen}
        onClose={() => setQuizModalOpen(false)}
        title={quizResult ? `Quiz Results: ${selectedCourse?.title}` : `Assessment Quiz: ${selectedCourse?.title}`}
        description={
          quizResult
            ? `Authoritative evaluation based on statutory compliance criteria.`
            : `Passing threshold: ${quizData?.passingScore || 80}% — 5 questions.`
        }
        footer={
          quizResult ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <Button onClick={() => setQuizModalOpen(false)}>Close</Button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
              <Button variant="outline" onClick={() => setQuizModalOpen(false)}>
                Cancel
              </Button>
              <Button
                icon={Award}
                disabled={submittingQuiz || quizLoading}
                onClick={handleSubmitQuiz}
              >
                {submittingQuiz ? 'Submitting & Scoring...' : 'Submit Answers'}
              </Button>
            </div>
          )
        }
      >
        {quizLoading ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading quiz questions from server...
          </div>
        ) : quizResult ? (
          /* Quiz Results View */
          <div style={{ display: 'grid', gap: 16, textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                margin: '0 auto',
                display: 'grid',
                placeItems: 'center',
                background: quizResult.passed ? 'var(--sage-100)' : 'var(--danger-bg)',
                color: quizResult.passed ? 'var(--chart-1)' : 'var(--danger)',
              }}
            >
              {quizResult.passed ? <CheckCircle2 size={36} /> : <AlertCircle size={36} />}
            </div>

            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {quizResult.passed ? 'Assessment Passed! 🎉' : 'Assessment Not Passed'}
              </div>
              <p className="caption" style={{ marginTop: 4 }}>
                {quizResult.message}
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
                background: 'var(--bg-subtle)',
                padding: 12,
                borderRadius: 'var(--r-md)',
              }}
            >
              <div>
                <div className="meta">Your Score</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: quizResult.passed ? 'var(--chart-1)' : 'var(--danger)' }}>
                  {quizResult.score}%
                </div>
              </div>
              <div>
                <div className="meta">Passing Target</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {quizResult.passingThreshold}%
                </div>
              </div>
              <div>
                <div className="meta">Attempt #</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {quizResult.attemptNumber}
                </div>
              </div>
            </div>

            {!quizResult.passed && (
              <Button
                variant="outline"
                icon={RotateCcw}
                onClick={() => {
                  setQuizResult(null);
                  setAnswers({});
                }}
              >
                Try Again
              </Button>
            )}
          </div>
        ) : quizData?.questions ? (
          /* Active Quiz Form */
          <div style={{ display: 'grid', gap: 18, maxHeight: '60vh', overflowY: 'auto', paddingRight: 4 }}>
            {quizData.questions.map((q, idx) => (
              <div
                key={q.id}
                style={{
                  padding: 14,
                  borderRadius: 'var(--r-md)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 10 }}>
                  {idx + 1}. {q.question}
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = answers[q.id] === optIdx;
                    return (
                      <label
                        key={optIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 12px',
                          borderRadius: 'var(--r-sm)',
                          border: `1.5px solid ${isSelected ? 'var(--sage-600)' : 'var(--border-default)'}`,
                          background: isSelected ? 'var(--sage-50)' : 'var(--bg-surface)',
                          cursor: 'pointer',
                          fontSize: '0.8125rem',
                          color: isSelected ? 'var(--sage-900)' : 'var(--text-primary)',
                          transition: 'all var(--t-fast)',
                        }}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={isSelected}
                          onChange={() => setAnswers({ ...answers, [q.id]: optIdx })}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </Modal>

    </div>
  );
}
