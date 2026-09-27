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

export default function TrainingView() {
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

  const completionBars = mergedCourses.map((c) => ({
    label: c.title.slice(0, 32) + (c.title.length > 32 ? '…' : ''),
    value: c.progress,
    displayValue: `${c.progress}%`,
    color: c.progress === 100 ? 'var(--chart-1)' : c.progress > 50 ? 'var(--sage-500)' : 'var(--sage-300)',
  }));

  const visible = mergedCourses.filter((c) => {
    if (filter === 'ALL') return true;
    if (filter === 'required') return c.isMandatory;
    if (filter === 'completed') return c.status === 'completed';
    return true;
  });

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <PageHeader
        title="Training & Compliance"
        subtitle={`${completed} of ${mergedCourses.length} compliance modules completed`}
        actions={
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadData} disabled={loading}>
            Refresh
          </Button>
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

      {completionBars.length > 0 && (
        <Card $p="var(--sp-5)">
          <h2 className="section-title" style={{ marginBottom: 14 }}>Module Completion Overview</h2>
          <HorizontalBar items={completionBars} maxValue={100} />
        </Card>
      )}

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
                    alignItems: 'center',
                    gap: 14,
                    padding: '12px 14px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface)',
                    transition: 'all var(--t-fast)',
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
                      onClick={() => handleOpenQuiz(course)}
                    >
                      {isDone ? 'Retake Quiz' : course.progress === 0 ? 'Take Quiz' : 'Continue Quiz'}
                    </Button>
                  </div>
                </div>
              </AnimatedItem>
            );
          })}
        </AnimatedList>
      </Card>

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
