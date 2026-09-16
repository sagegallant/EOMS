import { useState } from 'react';
import { Card, Button, Badge, Modal, AnimatedList, AnimatedItem, PageHeader } from '../../components/common/ui';
import { RadialProgress, HorizontalBar } from '../../components/common/charts';
import { GraduationCap, PlayCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const COURSES = [
  { id:1, title:'POSH Act 2013 Compliance & Sensitization', category:'Statutory Compliance', duration:'45 min', progress:68, required:true },
  { id:2, title:'Data Protection & DPDP Training',          category:'Legal & Compliance',   duration:'30 min', progress:40, required:true },
  { id:3, title:'Engineering Best Practices & Architecture', category:'Technical',            duration:'60 min', progress:90, required:false },
  { id:4, title:'Information Security & Access Governance',  category:'Security',             duration:'25 min', progress:100, required:true },
  { id:5, title:'Workplace Diversity & Inclusion (India)',   category:'Culture',              duration:'20 min', progress:0,   required:false },
];

const COMPLETION_BARS = COURSES.map(c => ({
  label: c.title.slice(0,32) + (c.title.length>32?'…':''),
  value: c.progress,
  displayValue: `${c.progress}%`,
  color: c.progress===100?'var(--chart-1)':c.progress>50?'var(--sage-500)':'var(--sage-300)',
}));

export default function TrainingView() {
  const [activeCourse, setActiveCourse] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const visible = filter==='ALL' ? COURSES : COURSES.filter(c=>c.category===filter||(filter==='required'&&c.required));
  const completed = COURSES.filter(c=>c.progress===100).length;

  return (
    <div style={{ display:'grid', gap:'var(--sp-5)' }}>
      <PageHeader title="Training" subtitle={`${completed} of ${COURSES.length} modules completed`} />

      <Card $p="var(--sp-5)">
        <h2 className="section-title" style={{ marginBottom:14 }}>Module Completion</h2>
        <HorizontalBar items={COMPLETION_BARS} maxValue={100} />
      </Card>

      <Card $p="var(--sp-5)">
        <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
          {['ALL','required','Statutory Compliance','Technical'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:'4px 11px', borderRadius:'var(--r-full)', fontSize:'0.75rem', fontWeight:600, border:'1.5px solid', cursor:'pointer', transition:'all var(--t-fast)',
                borderColor: filter===f?'var(--sage-600)':'var(--border-default)',
                background:  filter===f?'var(--sage-100)':'transparent',
                color:       filter===f?'var(--sage-800)':'var(--text-muted)',
              }}>
              {f==='ALL'?'All':f==='required'?'Required':f.split(' ')[0]}
            </button>
          ))}
        </div>
        <AnimatedList style={{ display:'grid', gap:8 }}>
          {visible.map(course => (
            <AnimatedItem key={course.id}>
              <div style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 14px', borderRadius:'var(--r-md)', border:'1px solid var(--border-subtle)', background:'var(--bg-surface)', transition:'all var(--t-fast)' }}
                onMouseEnter={e=>{e.currentTarget.style.background='var(--sage-50)';e.currentTarget.style.borderColor='var(--sage-200)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='var(--bg-surface)';e.currentTarget.style.borderColor='var(--border-subtle)'}}>
                <RadialProgress value={course.progress} size={52} strokeWidth={5}
                  color={course.progress===100?'var(--chart-1)':course.progress>0?'var(--sage-500)':'var(--bg-sunken)'}
                  trackColor="var(--sage-100)" label={course.progress===100?'✓':`${course.progress}%`} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:500, fontSize:'0.875rem', color:'var(--text-primary)' }}>{course.title}</div>
                  <div className="meta">{course.category} · {course.duration}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  {course.required && <Badge tone="sage">Required</Badge>}
                  <Button variant={course.progress===100?'ghost':'soft'} size="xs"
                    icon={course.progress===100?CheckCircle2:PlayCircle}
                    onClick={() => course.progress<100 && setActiveCourse(course)}>
                    {course.progress===100?'Done':course.progress===0?'Start':'Continue'}
                  </Button>
                </div>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedList>
      </Card>

      <Modal isOpen={!!activeCourse} onClose={() => setActiveCourse(null)} title={activeCourse?.title} description={`${activeCourse?.category} · ${activeCourse?.duration}`}
        footer={<><Button variant="secondary" onClick={() => setActiveCourse(null)}>Later</Button><Button>Mark Complete</Button></>}>
        <div style={{ display:'grid', gap:14 }}>
          <div style={{ padding:20, borderRadius:'var(--r-md)', background:'var(--sage-50)', border:'2px dashed var(--border-default)', display:'grid', placeItems:'center', minHeight:140 }}>
            <div style={{ textAlign:'center', color:'var(--text-muted)' }}>
              <GraduationCap size={28} style={{ margin:'0 auto 8px', display:'block', color:'var(--sage-500)' }} />
              <p className="caption">{activeCourse?.title}</p>
              <p className="meta" style={{ marginTop:4 }}>Interactive course content loads here in production</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <RadialProgress value={activeCourse?.progress||0} size={56} strokeWidth={5} color="var(--sage-600)" trackColor="var(--sage-100)" label={`${activeCourse?.progress||0}%`} />
            <div><div className="h3">Current progress</div><p className="meta" style={{ color:'var(--text-muted)' }}>Continue where you left off</p></div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
