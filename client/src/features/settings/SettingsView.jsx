import { useState } from 'react';
import { Card, Button, Badge, Avatar, AnimatedList, AnimatedItem, PageHeader, Toggle } from '../../components/common/ui';
import { Save, Bell, Shield, Database, Clock } from 'lucide-react';

const SECTIONS = [
  {
    title:'Notifications', icon:Bell,
    settings:[
      { id:'email_notif',   label:'Email Notifications', desc:'Receive onboarding updates via email', type:'toggle', value:true  },
      { id:'task_remind',   label:'Task Reminders',       desc:'Get reminded 24h before due date',   type:'toggle', value:true  },
      { id:'weekly_digest', label:'Weekly Digest',        desc:'Receive a summary every Monday',     type:'toggle', value:false },
    ],
  },
  {
    title:'Security & Compliance', icon:Shield,
    settings:[
      { id:'mfa_required',    label:'Require MFA',       desc:'Enforce 2FA for all users',           type:'toggle', value:true },
      { id:'session_timeout', label:'Session Timeout',   desc:'Auto-logout idle users',             type:'select', value:'30 minutes', options:['15 minutes','30 minutes','1 hour','4 hours'] },
    ],
  },
  {
    title:'Data & Retention', icon:Database,
    settings:[
      { id:'data_retention', label:'Audit Log Retention', desc:'How long to keep audit events', type:'select', value:'90 days', options:['30 days','60 days','90 days','1 year'] },
      { id:'auto_archive',   label:'Auto-Archive Plans',  desc:'Archive completed onboarding plans', type:'toggle', value:true },
    ],
  },
  {
    title:'SLA Configuration', icon:Clock,
    settings:[
      { id:'sla_target', label:'Onboarding SLA Target', desc:'Target completion time', type:'select', value:'45 days', options:['30 days','45 days','60 days','90 days'] },
      { id:'sla_alert',  label:'SLA Alert Threshold',   desc:'Alert when employees exceed this % of SLA', type:'select', value:'80%', options:['60%','70%','80%','90%'] },
    ],
  },
];

export default function SettingsView() {
  const [settings, setSettings] = useState(Object.fromEntries(SECTIONS.flatMap(s=>s.settings).map(s=>[s.id,s.value])));
  const [saved, setSaved] = useState(false);

  const update = (id,val) => setSettings(p=>({...p,[id]:val}));
  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),2000); };

  return (
    <div style={{ display:'grid', gap:'var(--sp-5)', maxWidth:640 }}>
      <PageHeader title="Settings" subtitle="Configure EOMS behaviour, security, and compliance preferences."
        action={<Button size="sm" icon={Save} onClick={save} variant={saved?'secondary':'primary'}>{saved?'✓ Saved':'Save Changes'}</Button>} />

      {SECTIONS.map(section => {
        const Icon = section.icon;
        return (
          <Card key={section.title} $p="var(--sp-5)">
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <div style={{ width:30, height:30, borderRadius:'var(--r-md)', background:'var(--sage-100)', color:'var(--sage-700)', display:'grid', placeItems:'center' }}>
                <Icon size={15} />
              </div>
              <h2 className="section-title">{section.title}</h2>
            </div>
            {section.settings.map((s,i) => (
              <div key={s.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, padding:'11px 0', borderTop:i===0?'none':'1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize:'0.875rem', fontWeight:500, color:'var(--text-primary)' }}>{s.label}</div>
                  <div className="meta" style={{ marginTop:2 }}>{s.desc}</div>
                </div>
                {s.type==='toggle'
                  ? <Toggle value={settings[s.id]} onChange={val=>update(s.id,val)} />
                  : (
                    <select value={settings[s.id]} onChange={e=>update(s.id,e.target.value)}
                      style={{ padding:'5px 10px', fontSize:'0.8125rem', borderRadius:'var(--r-md)', border:'1.5px solid var(--border-default)', background:'var(--bg-surface)', color:'var(--text-primary)', flexShrink:0 }}>
                      {s.options.map(o=><option key={o}>{o}</option>)}
                    </select>
                  )
                }
              </div>
            ))}
          </Card>
        );
      })}
    </div>
  );
}
