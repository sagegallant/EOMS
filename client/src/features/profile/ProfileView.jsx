import { useState } from 'react';
import { Card, Button, Avatar, PageHeader, Collapsible, Badge } from '../../components/common/ui';
import { RadialProgress, Sparkline, ActivityTimeline } from '../../components/common/charts';
import { Mail, MapPin, Building2, Calendar, FileText, Laptop, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const SPARK = [
  { d:'M', v:2 }, { d:'T', v:4 }, { d:'W', v:1 }, { d:'T', v:3 }, { d:'F', v:5 }, { d:'S', v:0 }, { d:'S', v:2 },
];

const ACTIVITY = [
  { title:'Completed: POSH Act 2013 Module',      type:'success', time:'2h ago',    meta:'Training'  },
  { title:'Submitted: PAN Card document',         type:'info',    time:'Yesterday', meta:'Documents' },
  { title:'Acknowledged: MacBook Pro 16"',        type:'success', time:'2d ago',    meta:'IT Assets' },
  { title:'Enrolled in Engineering 90-Day Plan',  type:'info',    time:'3d ago',    meta:'Onboarding'},
];

const MODULES = [
  { label:'POSH Compliance',           pct:68, color:'var(--sage-700)' },
  { label:'DPDP Data Protection',      pct:40, color:'var(--sage-500)' },
  { label:'Engineering Best Practices',pct:90, color:'var(--sage-300)' },
];

export default function ProfileView() {
  return (
    <div style={{ display:'grid', gap:'var(--sp-5)', maxWidth:780 }}>
      <PageHeader title="Profile" />

      {/* Hero card — gradient like Crextio employee card */}
      <div style={{ borderRadius:'var(--r-xl)', overflow:'hidden', border:'1px solid var(--border-subtle)', background:'var(--bg-surface)' }}>
        <div style={{ background:'linear-gradient(135deg, var(--sage-800) 0%, var(--sage-500) 100%)', padding:'var(--sp-5)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
            <Avatar name="Aarav Sharma" size={64} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'1.25rem', fontWeight:700, color:'#fff' }}>Aarav Sharma</div>
              <div style={{ color:'rgba(255,255,255,0.75)', marginTop:2 }}>Senior Software Engineer (SDE-II)</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px 16px', marginTop:8 }}>
                {[[Building2,'Platform Engineering'],[MapPin,'Bengaluru (Hybrid)'],[Mail,'aarav.sharma@eoms.in'],[Calendar,'Joined Jan 12, 2026']].map(([Icon,v])=>(
                  <span key={v} style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.8rem', color:'rgba(255,255,255,0.6)' }}><Icon size={12}/>{v}</span>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <RadialProgress value={72} size={90} strokeWidth={8} color="#86EFAC" trackColor="rgba(255,255,255,0.2)" label="72%" sublabel="journey" />
            </div>
          </div>
        </div>
        <div style={{ padding:'var(--sp-4)', borderTop:'1px solid var(--border-subtle)', display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
          <div>
            <div className="label-caps" style={{ marginBottom:4 }}>Weekly Activity</div>
            <Sparkline data={SPARK} dataKey="v" color="var(--sage-600)" height={36} />
          </div>
          {[['21','Days Active'],['3','Docs Verified'],['2/3','Meetings'],['72%','Programme']].map(([v,l])=>(
            <div key={l} style={{ textAlign:'center' }}>
              <div style={{ fontSize:'1.1rem', fontWeight:700, color:'var(--text-primary)', fontFeatureSettings:'"tnum" 1' }}>{v}</div>
              <div className="meta">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Training progress */}
      <Card $p="var(--sp-5)">
        <h2 className="section-title" style={{ marginBottom:14 }}>Training Progress</h2>
        <div style={{ display:'grid', gap:14 }}>
          {MODULES.map(m => (
            <div key={m.label}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8125rem', marginBottom:5 }}>
                <span style={{ color:'var(--text-secondary)' }}>{m.label}</span>
                <span style={{ fontWeight:700, color:'var(--sage-800)', fontFeatureSettings:'"tnum" 1' }}>{m.pct}%</span>
              </div>
              <div style={{ height:6, borderRadius:'var(--r-full)', background:'var(--sage-100)', overflow:'hidden' }}>
                <motion.div initial={{ width:0 }} animate={{ width:`${m.pct}%` }} transition={{ duration:0.8, ease:[0.16,1,0.3,1] }}
                  style={{ height:'100%', borderRadius:'inherit', background:m.color }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Accordion profile sections — Crextio style */}
      <Card $p="var(--sp-5)">
        <h2 className="section-title" style={{ marginBottom:4 }}>Account Details</h2>
        <Collapsible title="Documents" rightContent={<Badge tone="sage">3 verified</Badge>}>
          <div style={{ display:'grid', gap:8, paddingTop:8 }}>
            {[['PAN Card','AARAV1234A','Verified'],['Aadhaar','xxxx-xxxx-1234','Verified'],['EPFO UAN','100234567890','Submitted']].map(([k,v,s])=>(
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 10px', borderRadius:'var(--r-md)', background:'var(--sage-50)', fontSize:'0.8125rem' }}>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}><FileText size={13} style={{ color:'var(--sage-600)' }}/><span style={{ fontWeight:500 }}>{k}</span></div>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <span style={{ color:'var(--text-muted)' }}>{v}</span>
                  <Badge tone="sage" showDot={false}>{s}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Collapsible>
        <Collapsible title="Assets">
          <div style={{ padding:'8px 10px', borderRadius:'var(--r-md)', background:'var(--sage-50)', display:'flex', gap:12, alignItems:'center', marginTop:8 }}>
            <Laptop size={16} style={{ color:'var(--sage-600)' }} />
            <div>
              <div style={{ fontWeight:500, fontSize:'0.875rem' }}>MacBook Pro 16" M3 Max (36GB)</div>
              <div className="meta">BLR-MBP-2026-108 · Bengaluru Bellandur Hub · Acknowledged</div>
            </div>
          </div>
        </Collapsible>
        <Collapsible title="Compliance">
          <div style={{ display:'grid', gap:8, paddingTop:8 }}>
            {[['POSH Acknowledgement','Signed Mar 13, 2026'],['IP & Confidentiality','Signed Jan 12, 2026']].map(([k,v])=>(
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 10px', borderRadius:'var(--r-md)', background:'var(--sage-50)', fontSize:'0.8125rem' }}>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}><ShieldCheck size={13} style={{ color:'var(--sage-600)' }}/><span style={{ fontWeight:500 }}>{k}</span></div>
                <span style={{ color:'var(--text-muted)' }}>{v}</span>
              </div>
            ))}
          </div>
        </Collapsible>
      </Card>

      <Card $p="var(--sp-5)">
        <h2 className="section-title" style={{ marginBottom:14 }}>Recent Activity</h2>
        <ActivityTimeline events={ACTIVITY} />
      </Card>
    </div>
  );
}
