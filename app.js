/* IronCore Gym Management System - data lives in browser localStorage */
const K='gym_db_v1',$=s=>document.querySelector(s),T=()=>new Date().toLocaleDateString('en-CA');
const add=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};
const rs=n=>'₹'+Number(n).toLocaleString('en-IN');
let db=JSON.parse(localStorage.getItem(K)||'null'),S={q:'',f:'',ad:T(),aq:'',pq:'',rm:T().slice(0,7),rf:add(T(),-6),rt:T(),page:'dashboard'};
const save=()=>localStorage.setItem(K,JSON.stringify(db));
const nid=(a,k,p)=>p+(Math.max(0,...a.map(x=>+String(x[k]).replace(/\D/g,'')))+1);
const nm=i=>(db.members.find(m=>m.member_id==i)||{name:'(deleted)'}).name;
const tn=i=>(db.trainers.find(t=>t.trainer_id==i)||{name:'—'}).name;
const pn=i=>(db.plans.find(p=>p.plan_id==i)||{name:'?'}).name;
const mem=id=>db.memberships.filter(x=>x.member_id==id).sort((a,b)=>b.end.localeCompare(a.end));
const msst=e=>e<T()?'expired':e<=add(T(),7)?'expiring':'active';
const st=id=>{const m=mem(id)[0];return m?msst(m.end):'none'};
const bd=s=>`<span class="b ${s}">${s}</span>`;
const tbl=(h,r)=>`<div class=tw><table><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr>${r.length?r.map(x=>`<tr>${x.map(c=>`<td>${c}</td>`).join('')}</tr>`).join(''):`<tr><td colspan=${h.length} class=mu>No records found</td></tr>`}</table></div>`;
const bars=d=>{const mx=Math.max(1,...d.map(x=>x[1]));return `<div class=bars>${d.map(x=>`<div class=bar><b>${x[1]}</b><i style="height:${x[1]/mx*80}%"></i><span>${x[0]}</span></div>`).join('')}</div>`};
const sum=a=>a.reduce((s,p)=>s+ +p.amount,0);

function seed(){
 db={admins:[{admin_id:'A1',username:'admin',password:'admin123'}],
 plans:[{plan_id:'P1',name:'Monthly',days:30,price:1000},{plan_id:'P2',name:'Quarterly',days:90,price:2700},{plan_id:'P3',name:'Annual',days:365,price:9000}],
 trainers:[{trainer_id:'T1',name:'Ravi Shankar',phone:'9876500001',specialization:'Strength Training'},{trainer_id:'T2',name:'Anita Roy',phone:'9876500002',specialization:'Cardio & Yoga'}],
 members:[],memberships:[],payments:[],attendance:[]};
 const N=['Arun Kumar','Priya Sharma','Karthik Raj','Divya Menon','Rahul Verma','Sneha Patel','Vijay Anand','Meena Krishnan'],O=[-5,-25,-40,-70,-10,-100,-24,-3],M=['Cash','UPI','Card'];
 N.forEach((n,i)=>{const id='M'+(101+i),p=db.plans[i%3],s=add(T(),O[i]),e=add(s,p.days);
  db.members.push({member_id:id,name:n,phone:'98765'+(43210+i*111),email:n.split(' ')[0].toLowerCase()+'@mail.com',gender:i%2?'Female':'Male',joined_date:s,trainer_id:i%2?'T2':'T1'});
  db.memberships.push({membership_id:'MS'+(i+1),member_id:id,plan_id:p.plan_id,start:s,end:e});
  db.payments.push({payment_id:'PAY'+(i+1),member_id:id,membership_id:'MS'+(i+1),amount:p.price,method:M[i%3],ref:'TXN'+(9000+i),date:s});
  for(let d=0;d<14;d++){const dt=add(T(),-d);if(dt>=s&&dt<=e&&(d+i)%3)db.attendance.push({attendance_id:'AT'+(db.attendance.length+1),member_id:id,date:dt,time:String(6+(d+i)%10).padStart(2,'0')+':30'})}});
 save()}

/* ---------- UI helpers ---------- */
function toast(m,t='ok'){const e=document.createElement('div');e.className='t '+t;e.textContent=m;$('#toast').append(e);setTimeout(()=>e.remove(),3200)}
const openM=h=>{$('#modal').innerHTML=`<div class=box>${h}</div>`;$('#modal').style.display='flex'};
const closeM=()=>{$('#modal').style.display='none'};
const show=h=>openM(h+`<div class=row><button class="btn ghost" onclick=closeM()>Close</button></div>`);
/* fields: [name,label,type,options,required] ; cb returns an error string or nothing */
function modal(title,fields,vals,cb){
 openM(`<h3>${title}</h3><form id=mf>${fields.map(f=>`<label>${f[1]}${f[4]?' *':''}</label>`+(f[2]=='select'?`<select name=${f[0]}>${f[3].map(o=>`<option value="${o[0]}" ${vals[f[0]]==o[0]?'selected':''}>${o[1]}</option>`).join('')}</select>`:`<input name=${f[0]} type=${f[2]} value="${vals[f[0]]??''}" ${f[2]=='number'?'min=1':''}>`)).join('')}<div class=row><button class=btn>Save</button><button type=button class="btn ghost" onclick=closeM()>Cancel</button></div></form>`);
 $('#mf').onsubmit=e=>{e.preventDefault();const v=Object.fromEntries(new FormData(e.target));
  for(const f of fields)if(f[4]&&!String(v[f[0]]||'').trim())return toast(f[1]+' is required','err');
  const er=cb(v);if(er)return toast(er,'warn');closeM();save();render()}}

/* ---------- Views ---------- */
const V={};
V.dashboard=()=>{const ym=T().slice(0,7),ids=db.members.map(m=>st(m.member_id)),mr=[],at=[];
 for(let i=5;i>=0;i--){const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-i);const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');mr.push([k.slice(2),sum(db.payments.filter(p=>p.date.startsWith(k)))])}
 for(let i=6;i>=0;i--){const d=add(T(),-i);at.push([d.slice(5),db.attendance.filter(a=>a.date==d).length])}
 return `<h2>Dashboard</h2><div class=cards>${[['Total Members',db.members.length],['Active Memberships',ids.filter(s=>s=='active'||s=='expiring').length],['Expired Memberships',ids.filter(s=>s=='expired').length],["Today's Attendance",db.attendance.filter(a=>a.date==T()).length],['Revenue This Month',rs(sum(db.payments.filter(p=>p.date.startsWith(ym))))]].map(c=>`<div class=card><small>${c[0]}</small><h3>${c[1]}</h3></div>`).join('')}</div>
 <div class=grid2><div class=pan><h4>Monthly Revenue (₹)</h4>${bars(mr)}</div><div class=pan><h4>Attendance – Last 7 Days</h4>${bars(at)}</div>
 <div class=pan><h4>Recently Registered Members</h4>${tbl(['ID','Name','Joined'],[...db.members].sort((a,b)=>b.joined_date.localeCompare(a.joined_date)).slice(0,5).map(m=>[m.member_id,m.name,m.joined_date]))}</div>
 <div class=pan><h4>Recent Payments</h4>${tbl(['Member','Amount','Date'],[...db.payments].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5).map(p=>[nm(p.member_id),rs(p.amount),p.date]))}</div></div>`};

V.members=()=>{const q=S.q.toLowerCase(),l=db.members.filter(m=>(!q||(m.name+m.phone+m.member_id).toLowerCase().includes(q))&&(!S.f||st(m.member_id)==S.f));
 return `<h2>Members</h2><div class=bar2><input id=mq placeholder="Search by name, phone or member ID" value="${S.q}" oninput="S.q=this.value;render()"><select onchange="S.f=this.value;render()">${['','active','expiring','expired','none'].map(o=>`<option value="${o}" ${S.f==o?'selected':''}>${o||'All statuses'}</option>`).join('')}</select><button class=btn onclick="memberForm()">+ Add Member</button></div>
 ${tbl(['ID','Name','Phone','Trainer','Status','Actions'],l.map(m=>[m.member_id,m.name,m.phone,tn(m.trainer_id),bd(st(m.member_id)),`<button class="btn sm" onclick="viewMember('${m.member_id}')">View</button> <button class="btn sm ghost" onclick="memberForm('${m.member_id}')">Edit</button> <button class="btn sm ghost" onclick="delMember('${m.member_id}')">Delete</button>`]))}`};
function memberForm(id){const o=db.members.find(m=>m.member_id==id);
 modal(o?'Edit Member':'Add Member',[['name','Full Name','text',0,1],['phone','Phone (10 digits)','text',0,1],['email','Email','email'],['gender','Gender','select',[['Male','Male'],['Female','Female'],['Other','Other']]],['trainer_id','Trainer','select',[['','None'],...db.trainers.map(t=>[t.trainer_id,t.name])]],['joined_date','Join Date','date',0,1]],o||{joined_date:T()},v=>{
  if(!/^\d{10}$/.test(v.phone))return 'Invalid phone: enter exactly 10 digits';
  if(db.members.some(m=>m.phone==v.phone&&m.member_id!=id))return 'Duplicate record: phone number already exists';
  if(o)Object.assign(o,v);else db.members.push({member_id:nid(db.members,'member_id','M'),...v});toast('Member saved')})}
function delMember(id){if(!confirm('Delete this member and all their memberships, payments and attendance?'))return;
 ['members','memberships','payments','attendance'].forEach(t=>db[t]=db[t].filter(x=>x.member_id!=id));save();toast('Member deleted');render()}
function viewMember(id){const m=db.members.find(x=>x.member_id==id);
 show(`<h3>${m.name} ${bd(st(id))}</h3><p class=mu>${m.member_id} · ${m.phone} · ${m.email||'-'} · ${m.gender} · Trainer: ${tn(m.trainer_id)} · Joined ${m.joined_date}</p>
 <h4>Membership History</h4>${tbl(['Plan','Start','Expiry','Status'],mem(id).map(x=>[pn(x.plan_id),x.start,x.end,bd(msst(x.end))]))}
 <h4>Payment History</h4>${tbl(['Date','Amount','Method','Ref'],db.payments.filter(p=>p.member_id==id).map(p=>[p.date,rs(p.amount),p.method,p.ref]))}
 <p style="margin-top:10px">Total visits: <b>${db.attendance.filter(a=>a.member_id==id).length}</b></p>`)}

V.memberships=()=>`<h2>Membership Plans & Memberships</h2><div class=bar2><button class=btn onclick="planForm()">+ Create Plan</button><button class=btn onclick="assign()">Assign Plan to Member</button></div>
 <h4>Plans</h4>${tbl(['ID','Plan','Duration (days)','Price','Actions'],db.plans.map(p=>[p.plan_id,p.name,p.days,rs(p.price),`<button class="btn sm ghost" onclick="planForm('${p.plan_id}')">Edit</button> <button class="btn sm ghost" onclick="delPlan('${p.plan_id}')">Delete</button>`]))}
 <h4>All Memberships (history)</h4>${tbl(['ID','Member','Plan','Start','Expiry','Status','Action'],[...db.memberships].sort((a,b)=>b.end.localeCompare(a.end)).map(x=>[x.membership_id,nm(x.member_id),pn(x.plan_id),x.start,x.end,bd(msst(x.end)),`<button class="btn sm" onclick="assign('${x.member_id}','${x.plan_id}')">Renew</button>`]))}`;
function planForm(id){const o=db.plans.find(p=>p.plan_id==id);
 modal(o?'Edit Plan':'Create Plan',[['name','Plan Name (Monthly / Quarterly / Annual)','text',0,1],['days','Duration (days)','number',0,1],['price','Price (₹)','number',0,1]],o||{},v=>{
  if(+v.days<1||+v.price<1)return 'Days and price must be positive';
  if(db.plans.some(p=>p.name.toLowerCase()==v.name.toLowerCase()&&p.plan_id!=id))return 'Duplicate record: plan already exists';
  v.days=+v.days;v.price=+v.price;if(o)Object.assign(o,v);else db.plans.push({plan_id:nid(db.plans,'plan_id','P'),...v});toast('Plan saved')})}
function delPlan(id){if(db.memberships.some(m=>m.plan_id==id))return toast('Plan is in use by memberships – cannot delete','err');if(!confirm('Delete plan?'))return;db.plans=db.plans.filter(p=>p.plan_id!=id);save();toast('Plan deleted');render()}
function assign(mid,pid){if(!db.members.length||!db.plans.length)return toast('Add members and plans first','warn');
 modal('Assign / Renew Membership',[['member_id','Member','select',db.members.map(m=>[m.member_id,m.name+' ('+m.member_id+')'])],['plan_id','Plan','select',db.plans.map(p=>[p.plan_id,p.name+' – '+rs(p.price)+' / '+p.days+' days'])],['method','Payment Method','select',['Cash','UPI','Card'].map(x=>[x,x])],['ref','Transaction Reference','text']],{member_id:mid,plan_id:pid},v=>{
  const p=db.plans.find(x=>x.plan_id==v.plan_id),last=mem(v.member_id)[0],s=last&&last.end>=T()?last.end:T(),e=add(s,p.days),id=nid(db.memberships,'membership_id','MS');
  db.memberships.push({membership_id:id,member_id:v.member_id,plan_id:p.plan_id,start:s,end:e});
  db.payments.push({payment_id:nid(db.payments,'payment_id','PAY'),member_id:v.member_id,membership_id:id,amount:p.price,method:v.method,ref:v.ref||'-',date:T()});
  toast(`Membership valid ${s} to ${e}; payment recorded`)})}

V.attendance=()=>{const q=S.aq.toLowerCase(),l=db.attendance.filter(a=>(!S.ad||a.date==S.ad)&&(!q||(nm(a.member_id)+a.member_id).toLowerCase().includes(q))).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));
 return `<h2>Attendance</h2><div class=bar2><select id=cm>${db.members.map(m=>`<option value="${m.member_id}">${m.name} (${m.member_id})</option>`).join('')}</select><button class=btn onclick="checkIn()">Check In</button></div>
 <div class=bar2><input id=aq placeholder="Search by member name / ID" value="${S.aq}" oninput="S.aq=this.value;render()"><input id=ad type=date value="${S.ad}" onchange="S.ad=this.value;render()"><button class="btn ghost" onclick="S.ad='';render()">All dates</button></div>
 ${tbl(['Member ID','Name','Date','Check-in Time'],l.map(a=>[a.member_id,nm(a.member_id),a.date,a.time]))}`};
function checkIn(){const id=$('#cm').value;if(!id)return toast('Select a member','warn');
 if(['expired','none'].includes(st(id)))return toast(nm(id)+' has no valid membership – check-in blocked','err');
 if(db.attendance.some(a=>a.member_id==id&&a.date==T()))return toast('Duplicate: already checked in today','warn');
 db.attendance.push({attendance_id:nid(db.attendance,'attendance_id','AT'),member_id:id,date:T(),time:new Date().toTimeString().slice(0,5)});save();toast(nm(id)+' checked in');render()}

V.payments=()=>{const q=S.pq.toLowerCase(),l=db.payments.filter(p=>!q||(nm(p.member_id)+p.member_id+p.ref).toLowerCase().includes(q)).sort((a,b)=>b.date.localeCompare(a.date));
 return `<h2>Payments</h2><div class=bar2><input id=pq placeholder="Search member / reference" value="${S.pq}" oninput="S.pq=this.value;render()"><button class=btn onclick="payForm()">+ Record Payment</button></div>
 <p class=mu style="margin-bottom:10px">Revenue this month: <b style="color:#fff">${rs(sum(db.payments.filter(p=>p.date.startsWith(T().slice(0,7)))))}</b></p>
 ${tbl(['Receipt','Member','Amount','Method','Reference','Date','Action'],l.map(p=>[p.payment_id,nm(p.member_id),rs(p.amount),p.method,p.ref,p.date,`<button class="btn sm" onclick="receipt('${p.payment_id}')">Receipt</button>`]))}`};
function payForm(){if(!db.members.length)return toast('Add a member first','warn');
 modal('Record Payment',[['member_id','Member','select',db.members.map(m=>[m.member_id,m.name+' ('+m.member_id+')'])],['amount','Amount (₹)','number',0,1],['method','Method','select',['Cash','UPI','Card'].map(x=>[x,x])],['ref','Transaction Reference','text',0,1],['date','Date','date',0,1]],{date:T()},v=>{
  if(+v.amount<1)return 'Amount must be positive';
  if(db.payments.some(p=>p.ref==v.ref&&v.method!='Cash'))return 'Duplicate record: transaction reference already used';
  const l=mem(v.member_id)[0];db.payments.push({payment_id:nid(db.payments,'payment_id','PAY'),member_id:v.member_id,membership_id:l?l.membership_id:'',amount:+v.amount,method:v.method,ref:v.ref,date:v.date});toast('Payment recorded')})}
function receipt(id){const p=db.payments.find(x=>x.payment_id==id),ms=db.memberships.find(x=>x.membership_id==p.membership_id),w=window.open('','_blank');
 w.document.write(`<html><title>${p.payment_id}</title><body style="font-family:Arial;max-width:420px;margin:30px auto;border:3px solid #e10600;padding:22px"><h2 style="color:#e10600;text-align:center">IRONCORE GYM</h2><p style="text-align:center">Payment Receipt</p><hr><p>Receipt No: <b>${p.payment_id}</b></p><p>Date: ${p.date}</p><p>Member: ${nm(p.member_id)} (${p.member_id})</p><p>Plan: ${ms?pn(ms.plan_id)+' ('+ms.start+' to '+ms.end+')':'-'}</p><p>Method: ${p.method}</p><p>Reference: ${p.ref}</p><h3>Amount Paid: ${rs(p.amount)}</h3><hr><p style="text-align:center">Thank you!</p></body></html>`);w.document.close();w.print()}

V.trainers=()=>`<h2>Trainers</h2><div class=bar2><button class=btn onclick="trainerForm()">+ Add Trainer</button></div>
 ${tbl(['ID','Name','Phone','Specialization','Members','Actions'],db.trainers.map(t=>[t.trainer_id,t.name,t.phone,t.specialization,db.members.filter(m=>m.trainer_id==t.trainer_id).length,`<button class="btn sm" onclick="viewTrainer('${t.trainer_id}')">View</button> <button class="btn sm ghost" onclick="trainerForm('${t.trainer_id}')">Edit</button> <button class="btn sm ghost" onclick="delTrainer('${t.trainer_id}')">Delete</button>`]))}`;
function trainerForm(id){const o=db.trainers.find(t=>t.trainer_id==id);
 modal(o?'Edit Trainer':'Add Trainer',[['name','Name','text',0,1],['phone','Phone (10 digits)','text',0,1],['specialization','Specialization','text',0,1]],o||{},v=>{
  if(!/^\d{10}$/.test(v.phone))return 'Invalid phone: enter exactly 10 digits';
  if(db.trainers.some(t=>t.phone==v.phone&&t.trainer_id!=id))return 'Duplicate record: phone already exists';
  if(o)Object.assign(o,v);else db.trainers.push({trainer_id:nid(db.trainers,'trainer_id','T'),...v});toast('Trainer saved')})}
function delTrainer(id){if(!confirm('Delete trainer? Assigned members will be unassigned.'))return;db.members.forEach(m=>{if(m.trainer_id==id)m.trainer_id=''});db.trainers=db.trainers.filter(t=>t.trainer_id!=id);save();toast('Trainer deleted');render()}
function viewTrainer(id){const t=db.trainers.find(x=>x.trainer_id==id);
 show(`<h3>${t.name}</h3><p class=mu>${t.phone} · ${t.specialization}</p><h4>Assigned Members</h4>${tbl(['ID','Name','Phone','Status'],db.members.filter(m=>m.trainer_id==id).map(m=>[m.member_id,m.name,m.phone,bd(st(m.member_id))]))}`)}

V.reports=()=>{const rp=db.payments.filter(p=>p.date.startsWith(S.rm)),ra=db.attendance.filter(a=>a.date>=S.rf&&a.date<=S.rt),cnt={};
 db.attendance.forEach(a=>cnt[a.member_id]=(cnt[a.member_id]||0)+1);
 const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,5),pop=db.plans.map(p=>[p.name,db.memberships.filter(m=>m.plan_id==p.plan_id).length]).sort((a,b)=>b[1]-a[1]);
 const act=db.members.filter(m=>['active','expiring'].includes(st(m.member_id))),exp=db.members.filter(m=>st(m.member_id)=='expired');
 return `<h2>Reports & Analytics</h2><div class=bar2><button class=btn onclick="window.print()">🖨 Print Report</button></div><div class=grid2>
 <div class=pan><h4>Monthly Revenue Report</h4><input type=month value="${S.rm}" onchange="S.rm=this.value;render()" style="margin-bottom:8px">${tbl(['Date','Member','Amount'],rp.map(p=>[p.date,nm(p.member_id),rs(p.amount)]))}<p style="margin-top:8px"><b>Total: ${rs(sum(rp))}</b></p></div>
 <div class=pan><h4>Attendance Report</h4><div class=bar2><input type=date value="${S.rf}" onchange="S.rf=this.value;render()"><input type=date value="${S.rt}" onchange="S.rt=this.value;render()"></div>${tbl(['Date','Member','Time'],ra.map(a=>[a.date,nm(a.member_id),a.time]))}<p style="margin-top:8px"><b>Total visits: ${ra.length}</b></p></div>
 <div class=pan><h4>Active Memberships (${act.length})</h4>${tbl(['Member','Expiry'],act.map(m=>[m.name,mem(m.member_id)[0].end]))}</div>
 <div class=pan><h4>Expired Memberships (${exp.length})</h4>${tbl(['Member','Expired On'],exp.map(m=>[m.name,mem(m.member_id)[0].end]))}</div>
 <div class=pan><h4>Highest Attendance</h4>${tbl(['Member','Visits'],top.map(t=>[nm(t[0]),t[1]]))}</div>
 <div class=pan><h4>Most Popular Plans</h4>${bars(pop)}</div></div>`};

/* ---------- Database design page ---------- */
const TB={Members:'member_id VARCHAR(10) PK|name VARCHAR(50) NOT NULL|phone CHAR(10) UNIQUE|email VARCHAR(60)|gender VARCHAR(10)|joined_date DATE|trainer_id FK → Trainers',
 Membership_Plans:'plan_id VARCHAR(10) PK|plan_name VARCHAR(30) UNIQUE|duration_days INT|price DECIMAL(8,2)',
 Memberships:'membership_id VARCHAR(10) PK|member_id FK → Members|plan_id FK → Membership_Plans|start_date DATE|end_date DATE',
 Attendance:'attendance_id VARCHAR(10) PK|member_id FK → Members|check_in_date DATE|check_in_time TIME|UNIQUE(member_id, check_in_date)',
 Payments:'payment_id VARCHAR(10) PK|member_id FK → Members|membership_id FK → Memberships|amount DECIMAL(8,2)|method ENUM(Cash,UPI,Card)|txn_ref VARCHAR(30)|payment_date DATE|admin_id FK → Admins',
 Trainers:'trainer_id VARCHAR(10) PK|name VARCHAR(50)|phone CHAR(10) UNIQUE|specialization VARCHAR(40)',
 Admins:'admin_id VARCHAR(10) PK|username VARCHAR(30) UNIQUE|password VARCHAR(60)'};
const SQL=[['JOIN – members with their plan and expiry date',"SELECT m.name, p.plan_name, ms.end_date\nFROM Members m\nJOIN Memberships ms ON m.member_id = ms.member_id\nJOIN Membership_Plans p ON p.plan_id = ms.plan_id\nWHERE ms.end_date >= CURDATE();"],
['GROUP BY + SUM – monthly revenue',"SELECT DATE_FORMAT(payment_date,'%Y-%m') AS month, SUM(amount) AS revenue\nFROM Payments\nGROUP BY DATE_FORMAT(payment_date,'%Y-%m');"],
['GROUP BY + COUNT – most popular plans',"SELECT p.plan_name, COUNT(*) AS total_members\nFROM Memberships ms JOIN Membership_Plans p ON p.plan_id = ms.plan_id\nGROUP BY p.plan_name\nORDER BY total_members DESC;"],
['Aggregate + JOIN – top 5 attendance',"SELECT m.name, COUNT(a.attendance_id) AS visits\nFROM Members m JOIN Attendance a ON m.member_id = a.member_id\nGROUP BY m.member_id, m.name\nORDER BY visits DESC LIMIT 5;"],
['Subquery – members who never attended',"SELECT name FROM Members\nWHERE member_id NOT IN (SELECT member_id FROM Attendance);"],
['Subquery – members who paid more than the average payment',"SELECT m.name, SUM(p.amount) AS total_paid\nFROM Members m JOIN Payments p ON m.member_id = p.member_id\nGROUP BY m.member_id, m.name\nHAVING SUM(p.amount) > (SELECT AVG(amount) FROM Payments);"],
['Expiring in the next 7 days',"SELECT m.name, ms.end_date FROM Members m\nJOIN Memberships ms ON m.member_id = ms.member_id\nWHERE ms.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY);"]];
V.database=()=>{
 const E={Trainers:[30,140],Members:[300,140],Membership_Plans:[600,20],Memberships:[600,170],Attendance:[30,330],Payments:[300,330],Admins:[600,330]},W=175,
 box=n=>{const l=TB[n].split('|').slice(0,4),h=30+l.length*16;return [E[n][0],E[n][1],h]},
 R=[['Trainers','Members','1 : N'],['Members','Memberships','1 : N'],['Membership_Plans','Memberships','1 : N'],['Members','Payments','1 : N'],['Memberships','Payments','1 : N'],['Members','Attendance','1 : N'],['Admins','Payments','1 : N']],
 c=n=>{const b=box(n);return [b[0]+W/2,b[1]+b[2]/2]};
 const svg=`<svg class=er viewBox="0 0 800 440">${R.map(r=>{const a=c(r[0]),b=c(r[1]);return `<line x1=${a[0]} y1=${a[1]} x2=${b[0]} y2=${b[1]} stroke="#e10600" stroke-width=2 /><text x=${(a[0]+b[0])/2} y=${(a[1]+b[1])/2-4} fill="#fff" font-size=12 text-anchor=middle>${r[2]}</text>`}).join('')}
 ${Object.keys(E).map(n=>{const b=box(n),l=TB[n].split('|').slice(0,4);return `<rect x=${b[0]} y=${b[1]} width=${W} height=${b[2]} fill="#161616" stroke="#e10600" stroke-width=2 rx=6 /><rect x=${b[0]} y=${b[1]} width=${W} height=24 fill="#e10600" rx=6 /><text x=${b[0]+W/2} y=${b[1]+17} fill="#fff" font-size=13 font-weight=bold text-anchor=middle>${n}</text>${l.map((x,i)=>`<text x=${b[0]+8} y=${b[1]+40+i*16} font-size=11 fill="${x.includes(' PK')?'#ffb020':x.includes('FK')?'#ff3b30':'#ddd'}">${x.split(' ').slice(0,x.includes(' FK')?1:2).join(' ')}${x.includes(' PK')?' (PK)':x.includes('FK')?' (FK)':''}</text>`).join('')}`}).join('')}</svg>`;
 return `<h2>Database Design</h2><div class=pan style="margin-bottom:16px"><h4>ER Diagram</h4>${svg}<p class=mu style="margin-top:6px">PK = primary key · FK = foreign key · (Attendance and Payments show only first 4 attributes; see tables below.)</p></div>
 <h4>Logical Tables</h4><div class=dbt>${Object.entries(TB).map(([n,c])=>`<div class=pan><b>${n}</b>${c.split('|').map(x=>`<div class="${x.includes(' PK')?'pk':x.includes('FK')?'fk':''}">${x}</div>`).join('')}</div>`).join('')}</div>
 <h4>Relationships</h4><div class=pan><div>• <b>Trainers → Members (1:N)</b>: one trainer trains many members; each member has at most one trainer.</div><div>• <b>Members → Memberships (1:N)</b>: a member can buy/renew many memberships over time.</div><div>• <b>Membership_Plans → Memberships (1:N)</b>: one plan is bought in many memberships.</div><div>• <b>Members → Attendance (1:N)</b>: one check-in row per member per day (UNIQUE constraint).</div><div>• <b>Members / Memberships → Payments (1:N)</b>: every payment belongs to one member and one membership.</div><div>• <b>Admins → Payments (1:N)</b>: the admin who recorded the payment.</div><div>• <b>Members ↔ Membership_Plans (M:N)</b> is resolved by the Memberships table.</div></div>
 <h4>Example SQL Queries</h4>${SQL.map(q=>`<b>${q[0]}</b><pre>${q[1]}</pre>`).join('')}`};

V.settings=()=>`<h2>Settings & Data</h2><div class=pan><p>All data is stored in this browser's <b>localStorage</b> and stays after refresh or reopening.</p><br><div class=row><button class=btn onclick="restore()">Restore Demo Data</button><button class="btn ghost" onclick="wipe()">Reset (Delete All Data)</button></div><p class=mu style="margin-top:12px">Records: ${db.members.length} members · ${db.memberships.length} memberships · ${db.payments.length} payments · ${db.attendance.length} attendance · ${db.trainers.length} trainers</p></div>`;
function restore(){if(!confirm('Replace ALL current data with demo data?'))return;seed();toast('Demo data restored');render()}
function wipe(){if(!confirm('This will permanently delete ALL data. Continue?'))return;db={admins:db.admins,plans:[],trainers:[],members:[],memberships:[],payments:[],attendance:[]};save();toast('All data cleared','warn');render()}

/* ---------- Search, notifications, router ---------- */
function gsearch(v){const q=v.toLowerCase(),g=$('#gres');if(!q){g.style.display='none';return}
 const r=[...db.members.filter(m=>(m.name+m.phone+m.member_id).toLowerCase().includes(q)).map(m=>`<div onclick="viewMember('${m.member_id}');gclose()">👤 ${m.name} <small class=mu>${m.member_id}</small></div>`),...db.trainers.filter(t=>(t.name+t.phone+t.specialization).toLowerCase().includes(q)).map(t=>`<div onclick="viewTrainer('${t.trainer_id}');gclose()">🏋 ${t.name} <small class=mu>Trainer</small></div>`)];
 g.innerHTML=r.join('')||'<div class=mu>No results</div>';g.style.display='block'}
const gclose=()=>{$('#gres').style.display='none';$('#gs').value=''};
function notifs(){const l=db.members.filter(m=>st(m.member_id)=='expiring');
 show(`<h3>⚠ Memberships Expiring Soon (7 days)</h3>${tbl(['Member','Phone','Expiry','Days Left'],l.map(m=>{const e=mem(m.member_id)[0].end;return [m.name,m.phone,e,Math.max(0,Math.round((new Date(e)-new Date(T()))/864e5))]}))}`)}
const pages=[['dashboard','📊 Dashboard'],['members','👥 Members'],['memberships','🎟 Memberships'],['attendance','✅ Attendance'],['payments','💳 Payments'],['trainers','🏋 Trainers'],['reports','📈 Reports'],['database','🗄 Database Design'],['settings','⚙ Settings']];
const go=p=>{S.page=p;render()};
function render(){const a=document.activeElement.id;
 $('#nav').innerHTML=pages.map(p=>`<a class="${S.page==p[0]?'on':''}" onclick="go('${p[0]}')">${p[1]}</a>`).join('');
 $('#app').innerHTML=V[S.page]();$('#nc').textContent=db.members.filter(m=>st(m.member_id)=='expiring').length;
 if(a&&a!='gs'){const e=$('#'+a);if(e){e.focus();try{e.setSelectionRange(1e4,1e4)}catch(_){}}}}
if(!db){seed()}render();
