import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button, Input, Label } from '../../components/common/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

const DEMOS = [
  { label:'HR Admin',    id:'priya.patel',     role:'HR_ADMIN' },
  { label:'Employee',    id:'aarav.sharma',    role:'EMPLOYEE' },
  { label:'Manager',     id:'vikram.malhotra', role:'MANAGER' },
  { label:'IT Admin',    id:'rohan.verma',     role:'IT_ADMIN' },
  { label:'System Admin',id:'admin',           role:'ADMIN' },
];

export default function LoginPage() {
  const [form, setForm] = useState({ username:'', password:'' });
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const fill = demo => setForm({ username: demo.id, password:'Password@123' });

  const submit = async e => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/dashboard');
    } catch (e) {
      setErr(e.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr', background:'var(--bg-app)' }}>
      {/* ── Left brand panel ── */}
      <div style={{ background:'var(--sage-900)', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'48px 56px', position:'relative', overflow:'hidden' }}>
        {/* Background decoration */}
        <div style={{ position:'absolute', top:-80, right:-80, width:300, height:300, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
        <div style={{ position:'absolute', bottom:-40, left:-40, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.03)' }} />

        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:'var(--r-md)', background:'var(--sage-600)', color:'#fff', display:'grid', placeItems:'center', fontWeight:700, fontSize:'1.1rem' }}>E</div>
            <span style={{ color:'#fff', fontSize:'1rem', fontWeight:700 }}>EOMS</span>
          </div>
        </div>

        <div>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.8125rem', marginBottom:20, fontWeight:500, letterSpacing:'0.05em', textTransform:'uppercase' }}>Employee Onboarding</p>
          <h1 style={{ fontSize:'2.75rem', fontWeight:700, color:'#fff', lineHeight:1.1, letterSpacing:'-0.03em', marginBottom:20 }}>
            Onboarding<br />made human.
          </h1>
          <p style={{ color:'rgba(255,255,255,0.6)', lineHeight:1.7, maxWidth:360, fontSize:'0.9375rem' }}>
            Streamline your 90-day onboarding journey — for HR teams, managers, and every new hire across India's top tech hubs.
          </p>
          <div style={{ marginTop:40, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            {[['18','Active plans'],['98%','SLA rate'],['5','Tech hubs']].map(([v,l])=>(
              <div key={l} style={{ background:'rgba(255,255,255,0.06)', borderRadius:'var(--r-lg)', padding:'16px', border:'1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize:'1.5rem', fontWeight:700, color:'#fff' }}>{v}</div>
                <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.5)', marginTop:4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:'flex', gap:16 }}>
          {['Bengaluru','Hyderabad','Pune','Gurugram','Remote'].map(h => (
            <span key={h} style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.35)', fontWeight:500 }}>{h}</span>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 56px' }}>
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4, ease:[0.16,1,0.3,1] }}
          style={{ width:'100%', maxWidth:400 }}>
          <div style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:'1.75rem', fontWeight:700, color:'var(--text-primary)', letterSpacing:'-0.02em' }}>Welcome back</h2>
            <p className="caption" style={{ marginTop:6 }}>Sign in to your EOMS account to continue.</p>
          </div>

          {/* Demo quick-fill */}
          <div style={{ marginBottom:24 }}>
            <div className="label-caps" style={{ marginBottom:8 }}>Quick sign-in as</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {DEMOS.map(d => (
                <button key={d.id} onClick={() => fill(d)}
                  style={{ padding:'5px 12px', fontSize:'0.75rem', fontWeight:600, borderRadius:'var(--r-full)', border:'1.5px solid var(--border-default)', background: form.username===d.id ? 'var(--sage-100)' : '#fff', color: form.username===d.id ? 'var(--sage-800)' : 'var(--text-secondary)', cursor:'pointer', transition:'all var(--t-fast)' }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submit} style={{ display:'grid', gap:16 }}>
            <div>
              <Label>Username</Label>
              <Input type="text" placeholder="username" value={form.username} autoComplete="username" required
                onChange={e => setForm(f => ({ ...f, username:e.target.value }))} />
            </div>
            <div>
              <Label>Password</Label>
              <div style={{ position:'relative' }}>
                <Input type={showPwd?'text':'password'} placeholder="Password@123" value={form.password} autoComplete="current-password" required
                  onChange={e => setForm(f => ({ ...f, password:e.target.value }))}
                  style={{ paddingRight:42 }} />
                <button type="button" onClick={() => setShowPwd(s=>!s)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', background:'none', border:'none', cursor:'pointer', display:'grid', placeItems:'center' }}>
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {err && (
                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                  style={{ padding:'10px 14px', borderRadius:'var(--r-md)', background:'var(--danger-bg)', border:'1px solid var(--danger-border)', color:'var(--danger)', fontSize:'0.875rem' }}>
                  {err}
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" isLoading={loading} icon={ArrowRight}
              style={{ justifyContent:'center', marginTop:4 }}>
              Sign in to EOMS
            </Button>
          </form>

          <p className="meta" style={{ marginTop:24, textAlign:'center' }}>
            Protected by RBAC · Session encrypted · MFA ready
          </p>
        </motion.div>
      </div>
    </div>
  );
}
