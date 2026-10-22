/* Economics World V1.5: structural evidence + spaced variant review.
   Does not grade semantic correctness or upgrade legacy completion automatically. */
(()=>{'use strict';
const KEY='ew-depth-v1', OLD='ew-state-v02', DAY=86400000;
const RULES={
 L02:{keys:['concept','diagnosis','transfer','n1','n2'],numeric:['n1','n2'],rubric:[/边际|新增|下一/,/成本|收益|毛利/,/比较|差额|净增|大于|小于/,/不确定|区间|风险|估计|试验|边界/] },
 W03L01:{keys:['concept','diagnosis','transfer','n1','n2','n3'],numeric:['n1','n2','n3'],rubric:[/价格|降价|自身/,/需求量|曲线|移位/,/函数|120|Qd|计算|数量/,/供给|均衡|假设|识别|限制/]}
};
const VARIANTS={
 L02:[
 {question:'变式 1：追加投放成本 0.90 万元，预计新增毛利 0.65 万元。边际净收益（万元）是多少？',answer:-0.25,tol:.011,explain:'0.65−0.90=−0.25 万元。历史总利润不能替代这一步比较。'},
 {question:'变式 2：再投 0.95 万元，新增毛利预计 1.35 万元。边际净收益（万元）是多少？',answer:.40,tol:.011,explain:'1.35−0.95=0.40 万元。决策还应核查估计误差。'},
 {question:'变式 3：新增毛利 1.10 万元，追加成本 1.30 万元。边际净收益（万元）是多少？',answer:-.20,tol:.011,explain:'1.10−1.30=−0.20 万元。'}],
 W03L01:[
 {question:'变式 1：Qd=150−3P+D。P=20、D=10，每周需求量是多少份？',answer:100,tol:.011,explain:'150−3×20+10=100。'},
 {question:'变式 2：Qd=160−4P+D。P=25、D=−5，每周需求量是多少份？',answer:55,tol:.011,explain:'160−4×25−5=55。'},
 {question:'变式 3：Qd=130−2P+D。P=35、D=15，每周需求量是多少份？',answer:75,tol:.011,explain:'130−2×35+15=75。'}]
};
function all(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch(_){return {}}}
function get(id){const x=all()[id];return x&&typeof x==='object'?x:{answers:{},teach:false}}
function put(id,patch){const x=all(),old=get(id);x[id]={...old,...patch,updatedAt:new Date().toISOString()};localStorage.setItem(KEY,JSON.stringify(x));status(id)}
function err(id,reason){const e=get(id),errors=Array.isArray(e.errors)?e.errors.slice(-19):[];errors.push({reason,date:new Date().toISOString()});put(id,{errors})}
function answer(id,key,ok){if(!RULES[id]||!RULES[id].keys.includes(key))return;const e=get(id),a={...(e.answers||{})};a[key]=!!ok;put(id,{answers:a});}
function eligible(id){const r=RULES[id];if(!r)return true;const e=get(id);return !!(e.prediction&&e.prediction.trim().length>=12&&e.teach===true&&r.keys.every(k=>e.answers?.[k]===true)&&r.numeric.every(k=>e.answers?.[k]===true))}
function prediction(id,inputId,outId){const t=document.getElementById(inputId)?.value.trim()||'';put(id,{prediction:t});const out=document.getElementById(outId);if(out)out.textContent=t.length>=12?'预测理由已保存。之后可与模型结果比较。':'请先写出至少 12 字的预测理由。'}
function pick(btn,id,key,ok,concept,reason){
 if(typeof window.genericChoice==='function')window.genericChoice(btn,ok,concept,reason);
 else{btn.parentElement?.querySelectorAll('.choice').forEach(x=>x.classList.remove('correct','wrong'));btn.classList.add(ok?'correct':'wrong')}
 answer(id,key,ok);
 if(!ok)err(id,reason||'概念判断错误');
}
function number(id,inputId,key,expected,concept,tolerance=.011){
 const el=document.getElementById(inputId),out=document.getElementById(inputId+'Result');
 const raw=el?.value.trim()||'',n=raw===''?NaN:Number(raw);
 const ok=Number.isFinite(n)&&Math.abs(n-expected)<=tolerance;
 answer(id,key,ok);
 if(out)out.textContent=ok?'计算正确，证据已记录。':'未通过。检查单位、公式与代入步骤。';
 if(!ok)err(id,concept||'数值推导错误');
 return ok;
}
function teach(id,inputId,outId){
 const t=document.getElementById(inputId)?.value.trim()||'',r=RULES[id],out=document.getElementById(outId);
 const hits=r.rubric.map(p=>p.test(t)),ok=t.length>=80&&hits.every(Boolean);
 put(id,{teach:ok,teachText:t});
 if(out){
  out.className='feedback show'+(ok?'':' warn');
  out.textContent=(ok?'表达结构已覆盖四项要求。':'表达结构待补充：')+' 检查 '+hits.filter(Boolean).length+'/4 项，'+t.length+' 字。规则无法核实推导与因果是否正确；请用 AI Project 教练复核，并完成延迟复习。';
 }
 return ok;
}
function schedule(id){const e=get(id);if(e.review)return;put(id,{review:{phase:0,due:Date.now()+DAY,correct:0}})}
function legacyDone(id){try{const x=JSON.parse(localStorage.getItem(OLD)||'{}');return Array.isArray(x.completedLessons)&&x.completedLessons.includes(id)}catch(_){return false}}
function complete(id,xp,outId){
 const out=document.getElementById(outId);
 if(!eligible(id)){if(out)out.textContent='尚未达到记录条件：先保存预测，完成全部分层练习（含数值题）并通过 Teach-back 结构检查。';return false}
 schedule(id);
 if(!legacyDone(id)&&typeof window.finishExtra==='function')window.finishExtra(id,xp);
 if(out)out.textContent='V1.5 结构证据已保存。旧记录与 XP 保留；掌握程度仍需延迟变式与语义核验。';
 status(id);return true;
}
function status(id){
 if(!RULES[id])return;
 const e=get(id),r=RULES[id],correct=r.keys.filter(k=>e.answers?.[k]===true).length;
 const out=document.getElementById('depthStatus');
 if(out)out.textContent='深度练习 '+correct+'/'+r.keys.length+'；预测 '+(e.prediction?.length>=12?'已保存':'待保存')+'；Teach-back '+(e.teach?'结构通过':'待检查')+'。';
 const badge=document.getElementById('lessonDone');
 if(badge&&document.body.dataset.lessonId===id&&legacyDone(id))badge.textContent=eligible(id)?'已完成 · V1.5 结构证据已记录':'旧版已完成 · V1.5 待复核';
}
function reviewAnswer(id,inputId,resultId){
 const e=get(id),r=e.review,v=VARIANTS[id]?.[r?.phase||0],el=document.getElementById(inputId),out=document.getElementById(resultId);
 if(!r||!v||r.due>Date.now())return;
 const raw=el?.value.trim()||'',n=raw===''?NaN:Number(raw),ok=Number.isFinite(n)&&Math.abs(n-v.answer)<=v.tol;
 const phase=ok?Math.min(3,(r.phase||0)+1):0;
 const due=phase===3?null:Date.now()+(ok?(phase===1?7:30):1)*DAY;
 put(id,{review:{phase,due,correct:ok?(r.correct||0)+1:0,lastAt:Date.now()}});
 if(!ok)err(id,'延迟变式数值推导错误');
 if(out)out.textContent=(ok?'复习正确。':'复习未通过。')+v.explain+(phase===3?' 三轮变式复习已完成。':' 已安排下一轮。');
 const button=out?.parentElement?.querySelector('button');if(button)button.disabled=true;
 setTimeout(renderReview,3000);
}
function renderReview(){
 const box=document.getElementById('reviewList');if(!box)return;
 box.querySelectorAll('[data-depth-review]').forEach(n=>n.remove());
 let dueCount=0;
 for(const id of Object.keys(RULES)){
  const r=get(id).review;if(!r||r.due===null||r.due>Date.now())continue;
  dueCount++;const card=document.createElement('div');card.className='review-item';card.dataset.depthReview=id;
  const title=document.createElement('b');title.textContent=(id==='L02'?'边际分析':'需求')+' · V1.5 到期变式';
  const p=document.createElement('p');p.textContent=VARIANTS[id][r.phase||0].question;
  const input=document.createElement('input');input.type='number';input.step='any';input.inputMode='decimal';input.id='review-'+id;
  input.setAttribute('aria-label','变式题数值答案');
  const button=document.createElement('button');button.className='next';button.textContent='提交复习';
  const result=document.createElement('div');result.id='review-result-'+id;result.setAttribute('aria-live','polite');
  button.addEventListener('click',()=>reviewAnswer(id,input.id,result.id));
  card.append(title,p,input,button,result);box.appendChild(card);
 }
 const count=document.getElementById('reviewCount');
 if(count){let old=0;try{const x=JSON.parse(localStorage.getItem(OLD)||'{}');old=Array.isArray(x.mistakes)?x.mistakes.length:0}catch(_){}count.textContent=old+dueCount}
}
function calcMarginal(){
 const mb=Number(document.getElementById('marginalMB')?.value),mc=Number(document.getElementById('marginalMC')?.value),err=Number(document.getElementById('marginalErr')?.value);
 if(![mb,mc,err].every(Number.isFinite))return;
 const set=(id,s)=>{const e=document.getElementById(id);if(e)e.textContent=s};
 set('marginalMBOut',mb.toFixed(2));set('marginalMCOut',mc.toFixed(2));set('marginalErrOut',err.toFixed(2));
 set('marginalNet',(mb-mc).toFixed(2));set('marginalTotal',(2+mb-mc).toFixed(2));
 set('marginalSignal',mb-err>mc?'在估计误差范围内仍值得追加':mb+err<mc?'在估计误差范围内仍不宜追加':'结论敏感：先补信息或小规模试验');
}
function calcDemand(){
 const p=Number(document.getElementById('depthPrice')?.value),d=Number(document.getElementById('depthShift')?.value);
 if(![p,d].every(Number.isFinite))return;
 const q=120-2*p+d,eq=(100+d)/3,qs=20+p;
 const set=(id,s)=>{const e=document.getElementById(id);if(e)e.textContent=s};
 set('depthPriceOut',p);set('depthShiftOut',d);set('depthQ',q);set('depthDelta',q-60);set('depthEq',eq.toFixed(2));set('depthEqQ',(20+eq).toFixed(2));
 set('depthInterpret',q>qs?'在设定价格下超额需求 '+(q-qs)+' 份。':q<qs?'在设定价格下过剩 '+(qs-q)+' 份。':'在设定价格下供需恰好相等。');
}
window.EWDepth={eligible,prediction,pick,number,teach,complete,status,calcMarginal,calcDemand,reviewAnswer};
document.addEventListener('DOMContentLoaded',()=>{
 const id=document.body.dataset.lessonId;
 if(RULES[id]){
  document.querySelectorAll('input[data-depth-key]').forEach(el=>el.addEventListener('input',()=>answer(id,el.dataset.depthKey,false)));
  document.querySelectorAll('textarea[data-depth-prediction]').forEach(el=>el.addEventListener('input',()=>put(id,{prediction:''})));
  document.querySelectorAll('textarea[data-depth-teach]').forEach(el=>el.addEventListener('input',()=>put(id,{teach:false})));
  status(id);calcMarginal();calcDemand();
 }
 renderReview();
});
window.addEventListener('storage',()=>{renderReview();const id=document.body.dataset.lessonId;if(RULES[id])status(id)});
})();