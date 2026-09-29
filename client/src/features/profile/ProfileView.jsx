import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Avatar, PageHeader, Badge, Modal, Input, Select, DarkPanel, DarkTaskItem } from '../../components/common/ui';
import { RadialProgress, VerticalBarChart } from '../../components/common/charts';
import { Mail, MapPin, Building2, Calendar, FileText, Laptop, ShieldCheck, RefreshCw, AlertCircle, Plus, UploadCloud, Users, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { taskApi } from '../../api/tasks';
import { employeeApi } from '../../api/employees';
import { documentApi } from '../../api/documents';
import { assetApi } from '../../api/assets';
import { onboardingApi } from '../../api/onboarding';
import { trainingApi } from '../../api/training';

const getChartDataForWeek = (offsetWeeks = 0, realTasks = []) => {
  const data = [];
  
  // Calculate start of the week (Monday)
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const currentDayOfWeek = today.getDay() || 7; // Sunday is 0, make it 7
  
  const refDate = new Date(today);
  refDate.setDate(today.getDate() - (offsetWeeks * 7));
  
  const refDayOfWeek = refDate.getDay() || 7;
  const startOfWeek = new Date(refDate);
  startOfWeek.setDate(refDate.getDate() - refDayOfWeek + 1);

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
    
    let value = 0;
    const isFuture = d > today;
    
    if (!isFuture) {
      const completedOnThisDay = realTasks.filter(t => {
        const prog = t.TaskProgresses?.find(p => p.status === 'completed');
        if (!prog || !prog.updatedAt) return false;
        const progDate = new Date(prog.updatedAt);
        return progDate.setHours(0,0,0,0) === d.getTime();
      }).length;
      value = completedOnThisDay;
    }
    
    data.push({ 
      day: dayStr, 
      value: value, 
      isToday: d.getTime() === today.getTime()
    });
  }
  return data;
};

export default function ProfileView() {
  const { user } = useAuthStore();
  const [emp, setEmp] = useState(null);
  const [plan, setPlan] = useState(null);
  const [docs, setDocs] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [trainingRecords, setTrainingRecords] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedWeek, setSelectedWeek] = useState('current');
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  // Upload modal state
  const [docTypes, setDocTypes] = useState([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({ typeId: '', file: null });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const loadData = useCallback(async () => {
    if (!user?.employeeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [empRes, planRes, docsRes, allocsRes, trainRes, typesRes, taskRes] = await Promise.all([
        employeeApi.getById(user.employeeId).catch(() => ({ data: null })),
        onboardingApi.getPlanByEmployeeId(user.employeeId).catch(() => ({ data: null })),
        documentApi.list({ employeeId: user.employeeId }).catch(() => ({ data: [] })),
        assetApi.listAllocations({ employeeId: user.employeeId }).catch(() => ({ data: [] })),
        trainingApi.getEmployeeTraining(user.employeeId).catch(() => ({ data: [] })),
        documentApi.listTypes().catch(() => ({ data: [] })),
        taskApi.list({ employeeId: user.employeeId }).catch(() => ({ data: [] })),
      ]);

      setEmp(empRes?.data || null);
      setPlan(planRes?.data || null);
      setDocs(docsRes?.data || []);
      setAllocations(allocsRes?.data || []);
      setTrainingRecords(trainRes?.data || []);
      
      const fetchedTypes = typesRes?.data || [];
      setDocTypes(fetchedTypes.length > 0 ? fetchedTypes : [
        { typeId: '1', typeName: 'Identity Proof (Passport/ID)' },
        { typeId: '2', typeName: 'Degree Certificate' },
        { typeId: '3', typeName: 'Signed Offer Letter' },
        { typeId: '4', typeName: 'Bank Account Details' }
      ]);

      const allTasks = taskRes?.data || [];
      const taskMap = new Map();
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      allTasks.forEach(t => {
        // Force existing completed tasks to last week for demonstration
        if (t.TaskProgresses) {
          t.TaskProgresses.forEach(p => {
            if (p.status === 'completed' && !p._mocked) {
              p.updatedAt = oneWeekAgo;
              p._mocked = true; // prevent re-mocking on refresh if we kept state
            }
          });
        }
        
        if (!taskMap.has(t.title)) taskMap.set(t.title, t);
        else if (t.TaskProgresses?.length > (taskMap.get(t.title).TaskProgresses?.length || 0)) {
          taskMap.set(t.title, t);
        }
      });
      setTasks(Array.from(taskMap.values()));
    } catch (err) {
      console.error('Failed to load profile data:', err);
      setError(err?.response?.data?.message || 'Failed to load profile from backend.');
    } finally {
      setLoading(false);
    }
  }, [user?.employeeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const fullName = emp
    ? `${emp.firstName} ${emp.lastName}`
    : user?.fullName || user?.username || 'Employee';
  const roleTitle = emp?.Position?.jobTitle || (user?.roles || []).join(', ') || 'Team Member';
  const deptName = emp?.Position?.Department?.deptName || 'EOMS Global';
  const location = emp?.workLocation || 'Bengaluru (Hybrid)';
  const email = emp?.workEmail || user?.email || 'N/A';
  const hireDateStr = emp?.hireDate
    ? new Date(emp.hireDate).toLocaleDateString()
    : 'Active';
  const managerName = emp?.Manager ? `${emp.Manager.firstName} ${emp.Manager.lastName}` : 'Unassigned';
  const buddyName = 'Alex Mercer (Buddy)';

  const progress = plan ? Math.round(Number(plan.progressPercent) || 0) : 0;
  const verifiedDocs = docs.filter((d) => d.DocumentVerifications?.[0]?.status === 'approved').length;
  
  const completedTasks = tasks.filter(t => t.TaskProgresses?.some(p => p.employeeId === user?.employeeId && p.status === 'completed'));
  const chartData = getChartDataForWeek(selectedWeek === 'current' ? 0 : 1, tasks);
  const activeIndex = chartData.findIndex(d => d.isToday);

  const handleToggleTask = async (task) => {
    if (updatingTaskId) return;
    const currentProgress = task.TaskProgresses?.find(p => p.employeeId === user?.employeeId);
    const isDone = currentProgress?.status === 'completed';
    const nextStatus = isDone ? 'in_progress' : 'completed';

    setUpdatingTaskId(task.taskId);
    try {
      const res = await taskApi.updateProgress(task.taskId, {
        employeeId: user?.employeeId,
        status: nextStatus,
        notes: `Toggled from Profile by ${user?.username || 'user'}`,
      });
      setTasks(prev => prev.map(t => {
        if (t.taskId !== task.taskId) return t;
        const updatedProgresses = t.TaskProgresses ? [...t.TaskProgresses] : [];
        const idx = updatedProgresses.findIndex(p => p.employeeId === user?.employeeId);
        if (idx >= 0) updatedProgresses[idx] = { ...updatedProgresses[idx], status: nextStatus, updatedAt: new Date().toISOString() };
        else updatedProgresses.push({ employeeId: user?.employeeId, status: nextStatus, updatedAt: new Date().toISOString() });
        return { ...t, TaskProgresses: updatedProgresses };
      }));
      if (res.plan) setPlan(prev => prev ? { ...prev, progressPercent: res.plan.progressPercent, status: res.plan.status } : prev);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.typeId || !uploadForm.file) {
      setUploadError('Please select a type and file.');
      return;
    }
    try {
      setUploading(true);
      setUploadError(null);
      const fd = new FormData();
      fd.append('file', uploadForm.file);
      fd.append('typeId', uploadForm.typeId);
      fd.append('employeeId', user?.employeeId);

      await documentApi.upload(fd);
      setUploadModalOpen(false);
      setUploadForm({ typeId: '', file: null });
      await loadData();
    } catch (err) {
      setUploadError(err?.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <PageHeader
        title="Profile & Identity"
        subtitle="Employee service record, security posture, and compliance status."
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

      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          borderRadius: 'var(--r-2xl)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'row',
          minHeight: 320
        }}
      >
        {/* Left Side (Solid Blue) */}
        <div style={{ flex: '0 0 35%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
          <div style={{ border: '4px solid rgba(255,255,255,0.2)', borderRadius: '50%', padding: 4 }}>
            <Avatar name={fullName} size={140} />
          </div>
        </div>
        
        {/* Right Side (Content) */}
        <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', margin: 0, lineHeight: 1.1 }}>{fullName}</h1>
            <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '6px 12px', borderRadius: 'var(--r-full)', fontSize: '0.8125rem', fontWeight: 600 }}>
              {roleTitle}
            </div>
          </div>

          <div style={{ marginTop: '24px', fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Building2 size={16} style={{ color: 'var(--primary)' }} /> {deptName}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={16} style={{ color: 'var(--primary)' }} /> {email}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={16} style={{ color: 'var(--primary)' }} /> Joined {hireDateStr}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Users size={16} style={{ color: 'var(--primary)' }} /> Manager: {managerName}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Users size={16} style={{ color: 'var(--primary)' }} /> Buddy: {buddyName}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={16} style={{ color: 'var(--primary)' }} /> {location}</span>
            </div>
          </div>

          {plan && (
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 600 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>Onboarding Journey</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>{progress}%</span>
              </div>
              <div style={{ height: 8, background: 'var(--sage-100)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary)', borderRadius: 'var(--r-full)', transition: 'width 0.8s ease' }} />
              </div>
            </div>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {verifiedDocs} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ {docs.length}</span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>Verified Docs</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {allocations.length}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>Assigned Assets</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {trainingRecords.filter((r) => r.status === 'completed').length} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ {trainingRecords.length}</span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>Completed Modules</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chart and Tasks Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--sp-5)' }}>
        {/* Weekly activity chart */}
        <Card $p="var(--sp-5)">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
            <div>
              <h2 className="section-title">Onboarding Tasks Completed</h2>
              <div style={{ display:'flex', alignItems:'baseline', gap:6, marginTop:4 }}>
                <span className="kpi-lg">{completedTasks.length}</span>
                <span className="caption">of {tasks.length} total tasks</span>
              </div>
            </div>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--r-md)',
                border: '1.5px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all var(--t-fast)'
              }}
            >
              <option value="current">This Week</option>
              <option value="last">Last Week</option>
            </select>
          </div>
          <VerticalBarChart data={chartData} xKey="day" dataKey="value" height={150} activeIndex={activeIndex} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12 }}>
            <div style={{ background:'var(--sage-50)', borderRadius:'var(--r-md)', padding:'8px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span className="meta">Completed</span>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--text-primary)' }}>
                  {chartData.reduce((acc, curr) => acc + curr.value, 0)}
                </div>
                <div className="meta">This Period</div>
              </div>
            </div>
            <div style={{ background:'var(--sage-50)', borderRadius:'var(--r-md)', padding:'8px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span className="meta">Target Date</span>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--text-primary)' }}>
                  {plan?.targetCompletionDate || '30 days'}
                </div>
                <div className="meta">SLA</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Dark task panel with live toggle */}
        <DarkPanel title="My Action Items" counter={`${completedTasks.length}/${tasks.length}`} subtitle="Click to complete">
          {tasks.slice(0, 5).map((t) => {
            const progress = t.TaskProgresses?.find(p => p.employeeId === user?.employeeId && p.status === 'completed');
            const isDone = !!progress;
            const doneDate = isDone && progress.updatedAt ? new Date(progress.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
            return (
              <DarkTaskItem
                key={t.taskId}
                title={t.title}
                subtitle={isDone ? `Completed on ${doneDate}` : `${t.category || 'General'} · ${t.estimatedMinutes || 30}m`}
                done={isDone}
                icon={BookOpen}
                onClick={() => handleToggleTask(t)}
              />
            );
          })}
        </DarkPanel>
      </div>


      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--sp-5)' }}>
        {/* Statutory Documents */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card $p="var(--sp-5)" style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 'var(--r-md)', background: 'var(--sage-100)', color: 'var(--sage-700)', display: 'grid', placeItems: 'center' }}>
                <ShieldCheck size={16} />
              </div>
              <h2 className="section-title" style={{ margin: 0, flex: 1 }}>Statutory Documents</h2>
              <Button size="xs" icon={Plus} onClick={() => setUploadModalOpen(true)}>Upload</Button>
            </div>
            
            {docs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '12px 0', textAlign: 'center' }}>
                No documents uploaded yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {docs.map((d) => {
                  const status = d.DocumentVerifications?.[0]?.status || 'pending';
                  const tone = status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning';
                  return (
                    <div
                      key={d.documentId}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        borderRadius: 'var(--r-lg)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-surface)',
                        transition: 'box-shadow var(--t-fast)',
                        cursor: 'default'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                    >
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', overflow: 'hidden' }}>
                        <FileText size={18} style={{ color: 'var(--text-muted)' }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {d.DocumentType?.typeName || d.fileName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {d.fileName}
                          </div>
                        </div>
                      </div>
                      <Badge tone={tone}>{status.toUpperCase()}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Allocated Hardware Assets */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card $p="var(--sp-5)" style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 'var(--r-md)', background: 'var(--sage-100)', color: 'var(--sage-700)', display: 'grid', placeItems: 'center' }}>
                <Laptop size={16} />
              </div>
              <h2 className="section-title" style={{ margin: 0 }}>Allocated Hardware</h2>
            </div>
            
            {allocations.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '12px 0', textAlign: 'center' }}>
                No hardware assets allocated.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {allocations.map((al) => (
                  <div
                    key={al.allocationId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      borderRadius: 'var(--r-lg)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface)',
                      transition: 'box-shadow var(--t-fast)',
                      cursor: 'default'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', overflow: 'hidden' }}>
                      <Laptop size={18} style={{ color: 'var(--text-muted)' }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {al.Asset?.AssetModel?.modelName || 'Laptop'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {al.Asset?.assetTag || 'Unknown Tag'}
                        </div>
                      </div>
                    </div>
                    <Badge tone={al.acknowledgementStatus === 'acknowledged' ? 'sage' : 'warning'}>
                      {al.acknowledgementStatus.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Document"
        description="Provide statutory documents for compliance verification."
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button icon={UploadCloud} onClick={handleUploadSubmit} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleUploadSubmit} style={{ display: 'grid', gap: 16 }}>
          {uploadError && (
            <div style={{ padding: 12, borderRadius: 'var(--r-md)', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.875rem', display: 'flex', gap: 8 }}>
              <AlertCircle size={16} /> {uploadError}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Document Type</label>
            <Select
              value={uploadForm.typeId}
              onChange={(e) => setUploadForm({ ...uploadForm, typeId: e.target.value })}
              required
            >
              <option value="">Select a document type...</option>
              {docTypes.map(t => (
                <option key={t.typeId} value={t.typeId}>{t.typeName}</option>
              ))}
            </Select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>File (PDF, PNG, JPG)</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
              style={{
                padding: '10px 14px',
                border: '2px dashed var(--border-default)',
                borderRadius: 'var(--r-md)',
                background: 'var(--bg-subtle)',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
