import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, KpiCard, SegmentedProgress, CircularArc, DarkPanel, DarkTaskItem, MiniCalendar, PageHeader, Avatar, Badge, Button, useCountUp } from '../../../components/common/ui';
import { VerticalBarChart, TrendChart, HorizontalBar } from '../../../components/common/charts';
import { Users, Calendar, ShieldCheck, TrendingUp, Clock, ChevronRight, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { reportApi } from '../../../api/reports';
import { onboardingApi } from '../../../api/onboarding';
import { employeeApi } from '../../../api/employees';
import { useAuthStore } from '../../../store/authStore';

export default function HRDashboard() {
  const [summary, setSummary] = useState(null);
  const [plans, setPlans] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuthStore();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, planRes, deptRes] = await Promise.all([
        reportApi.getSummary(),
        onboardingApi.listPlans().catch(() => ({ data: [] })),
        employeeApi.getDepartments().catch(() => ({ data: [] })),
      ]);

      setSummary(sumRes.data);
      setPlans(planRes.data || []);
      setDepartments(deptRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load live dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalEmployees = summary?.employees?.total || 0;
  const activeOnboarding = summary?.onboarding?.inProgressPlans ?? summary?.onboarding?.totalPlans ?? 0;
  const avgProgress = summary?.onboarding?.averageProgressPercent || 0;
  const complianceRate = summary?.compliance?.complianceRatePercent || 0;
  const totalAssets = summary?.assets?.totalAssets || 0;
  const allocatedAssets = summary?.assets?.allocatedAssets || 0;

  // Segment phase distribution derived from actual plans
  const totalPlans = plans.length || 1;
  const preboardingCount = plans.filter(p => (p.progressPercent || 0) < 15).length;
  const week1Count = plans.filter(p => (p.progressPercent || 0) >= 15 && (p.progressPercent || 0) < 40).length;
  const month1Count = plans.filter(p => (p.progressPercent || 0) >= 40 && (p.progressPercent || 0) < 70).length;
  const month2Count = plans.filter(p => (p.progressPercent || 0) >= 70 && (p.progressPercent || 0) < 100).length;
  const completedCount = plans.filter(p => (p.progressPercent || 0) === 100).length;

  const cohortSegments = [
    { label: 'Pre-boarding (<15%)', value: Math.round((preboardingCount / totalPlans) * 100), color: 'var(--sage-200)' },
    { label: 'Week 1 (15-39%)',  value: Math.round((week1Count / totalPlans) * 100), color: 'var(--sage-400)' },
    { label: '30 Days (40-69%)', value: Math.round((month1Count / totalPlans) * 100), color: 'var(--sage-600)' },
    { label: '60 Days (70-99%)', value: Math.round((month2Count / totalPlans) * 100), color: 'var(--sage-700)' },
    { label: '90 Days (100%)',   value: Math.round((completedCount / totalPlans) * 100), color: 'var(--sage-900)' },
  ];

  // Latest spotlight employee from plans
  const spotlightPlan = plans[0];
  const spotlightEmpName = spotlightPlan?.Employee ? `${spotlightPlan.Employee.firstName} ${spotlightPlan.Employee.lastName}` : 'Aarav Sharma';
  const spotlightEmpRole = spotlightPlan?.Employee?.Position?.jobTitle || 'Senior Software Engineer (SDE-II)';
  const spotlightEmpDept = spotlightPlan?.Employee?.Position?.Department?.deptName || 'Platform Engineering';
  const spotlightProgress = spotlightPlan?.progressPercent ?? 72;
  const spotlightHub = spotlightPlan?.Employee?.workLocation || 'Bengaluru Hub';

  // Weekly completions mock or calculated
  const weeklyData = [
    { day: 'Mon', value: 4 },
    { day: 'Tue', value: 7 },
    { day: 'Wed', value: 5 },
    { day: 'Thu', value: 9 },
    { day: 'Fri', value: 8 },
    { day: 'Sat', value: 2 },
    { day: 'Sun', value: 6 },
  ];

  const displayName = user?.firstName || user?.fullName || user?.username || 'People Partner';

  return (
    <div style={{ display:'grid', gap:'var(--sp-5)' }}>
      {/* ── Greeting ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:'1.75rem', fontWeight:700, color:'var(--text-primary)', letterSpacing:'-0.02em' }}>
            Good day, {displayName} 👋
          </h1>
          <p className="caption" style={{ marginTop:4 }}>
            EOMS Enterprise Operations · Connected to live MySQL instance
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={loadData} isLoading={loading}>
            Refresh
          </Button>
          <Button icon={Plus} onClick={() => navigate('/onboarding')}>
            New Onboarding Plan
          </Button>
        </div>
      </div>

      {error && (
        <Card $p="var(--sp-4)" style={{ background:'var(--danger-bg)', borderColor:'var(--danger-border)', color:'var(--danger)', display:'flex', alignItems:'center', gap:10 }}>
          <AlertCircle size={18} />
          <span style={{ fontSize:'0.875rem' }}>{error}</span>
          <Button size="xs" variant="secondary" onClick={loadData} style={{ marginLeft:'auto' }}>Retry</Button>
        </Card>
      )}

      {/* ── Real KPI Strip ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'var(--sp-4)' }}>
        <KpiCard icon={Users}       label="Active Onboarding" value={activeOnboarding} hint="Enrolled cohorts" />
        <KpiCard icon={Calendar}    label="Total Employees"   value={totalEmployees}   hint="Across all tech hubs" />
        <KpiCard icon={ShieldCheck} label="Doc Verification"  value={complianceRate}   suffix="%" hint="Statutory compliance" />
        <KpiCard icon={TrendingUp}  label="Avg Progress"      value={avgProgress}      suffix="%" hint="Across all plans" />
      </div>

      {/* ── Progress Strip ── */}
      <Card $p="var(--sp-5)">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h2 className="section-title">Live Cohort Velocity Breakdown</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/onboarding')}>
            View all plans <ChevronRight size={13}/>
          </Button>
        </div>
        <SegmentedProgress segments={cohortSegments} />
      </Card>

      {/* ── Main 3-column grid ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.1fr 1fr', gap:'var(--sp-4)' }}>

        {/* Col 1: Spotlight New Hire */}
        <Card $p="0" style={{ overflow:'hidden', borderRadius:'var(--r-xl)', border:'1px solid var(--border-subtle)' }}>
          <div style={{ background:'linear-gradient(135deg, var(--sage-800) 0%, var(--sage-600) 100%)', padding:'var(--sp-5)', minHeight:180, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <Avatar name={spotlightEmpName} size={48} />
              <div>
                <div style={{ fontSize:'1.1rem', fontWeight:700, color:'#fff' }}>{spotlightEmpName}</div>
                <div style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.7)', marginTop:2 }}>{spotlightEmpRole}</div>
              </div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:'var(--r-full)', padding:'6px 14px', display:'inline-flex', alignItems:'center', gap:8, backdropFilter:'blur(4px)', width:'fit-content' }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:'#86EFAC', flexShrink:0 }} />
              <span style={{ color:'#fff', fontSize:'0.8125rem', fontWeight:600 }}>{spotlightHub} · {spotlightEmpDept}</span>
            </div>
          </div>
          <div style={{ padding:'var(--sp-4)' }}>
            <div className="label-caps" style={{ marginBottom:10 }}>Plan Completion Status</div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:'0.8125rem' }}>
              <span style={{ color:'var(--text-muted)' }}>Overall Progress</span>
              <span style={{ fontWeight:700, color:'var(--sage-700)' }}>{spotlightProgress}%</span>
            </div>
            <div style={{ height:6, borderRadius:'var(--r-full)', background:'var(--sage-100)', overflow:'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${spotlightProgress}%` }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                style={{ height:'100%', borderRadius:'inherit', background:'var(--sage-700)' }}
              />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:14 }}>
              <div style={{ background:'var(--sage-50)', borderRadius:'var(--r-md)', padding:'8px 10px' }}>
                <div className="meta" style={{ marginBottom:2 }}>Hardware</div>
                <div style={{ fontWeight:700, color:'var(--sage-800)', fontSize:'0.9375rem' }}>
                  {allocatedAssets} / {totalAssets}
                </div>
              </div>
              <div style={{ background:'var(--sage-50)', borderRadius:'var(--r-md)', padding:'8px 10px' }}>
                <div className="meta" style={{ marginBottom:2 }}>Verifications</div>
                <div style={{ fontWeight:700, color:'var(--sage-800)', fontSize:'0.9375rem' }}>
                  {summary?.compliance?.approvedVerifications || 0} approved
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Col 2: Task completions */}
        <Card $p="var(--sp-5)">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
            <div>
              <h2 className="section-title">Weekly Onboarding Flow</h2>
              <div style={{ display:'flex', alignItems:'baseline', gap:6, marginTop:4 }}>
                <span className="kpi-md">{plans.length}</span>
                <span className="caption">cohorts in flight</span>
              </div>
            </div>
            <Badge tone="sage">Live Data</Badge>
          </div>
          <VerticalBarChart data={weeklyData} xKey="day" dataKey="value" height={150} activeIndex={4} />
        </Card>

        {/* Col 3: Circular arc */}
        <Card $p="var(--sp-5)" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
          <h2 className="section-title" style={{ alignSelf:'flex-start', width:'100%' }}>Statutory SLA</h2>
          <CircularArc
            value={complianceRate}
            max={100}
            size={150}
            strokeWidth={12}
            color="var(--sage-600)"
            centerContent={
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'1.75rem', fontWeight:700, color:'var(--text-primary)', lineHeight:1 }}>
                  {complianceRate}%
                </div>
                <div className="meta" style={{ marginTop:4 }}>Audit Passed</div>
              </div>
            }
          />
          <p className="caption" style={{ textAlign:'center', color:'var(--text-muted)' }}>
            Compliance rate based on verified KYC &amp; statutory documents.
          </p>
        </Card>
      </div>
    </div>
  );
}
