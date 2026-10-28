/* W02L01 V1.5 · comparative advantage, evidence and review */
(()=>{'use strict';
const KEY='ew-depth-v1',ID='W02L01',VER='audit20261028',DAY=86400000,$=id=>document.getElementById(id),put=(id,v)=>{const n=$(id);if(n)n.textContent=v},now=()=>new Date(Date.now()).toISOString();
function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch{return {}}}
const old=read()[ID]||{},s=old[VER]||{};
const ev={predictionText:s.predictionText||'',prediction:!!s.prediction,answers:s.answers||{},transferText:s.transferText||'',teachText:s.teachText||'',teach:!!s.teach,passedAt:s.passedAt||null,errors:Array.isArray(s.errors)?s.errors:[],review:s.review||null};
function save(){const a=read();a[ID]={...(a[ID]||{}),[VER]:ev};try{localStorage.setItem(KEY,JSON.stringify(a));return true}catch{put('caDone','本地存储失败，学习证据尚未保存。');return false}}
function error(k){ev.errors.push({type:k,at:now()});if(ev.errors.length>40)ev.errors.shift()}
function reset(){ev.passedAt=null;drawReview()}
function count(){return [1,2,3,4,5,6].filter(n=>ev.answers['q'+n]===true).length}
function status(){put('caPracticeStatus','练习证据：'+count()+'/6。规则式结构检查无法判断开放题推理正确性。')}
window.caModel=()=>{
 const av=+$('caAVisits').value,bp=+$('caBPlans').value,ac=av/8,bc=6/bp,fmt=n=>n.toFixed(2);
 put('caAVisitsOut',av);put('caBPlansOut',bp);put('caACost',fmt(ac));put('caBCost',fmt(bc));put('caAVisitCost',fmt(8/av));put('caBVisitCost',fmt(bp/6));put('caThreshold',fmt(48/av));
 if(Math.abs(ac-bc)<1e-9){put('caAdvantage','机会成本相同：无严格比较优势');put('caModelExplain','该两商品线性模型不能仅靠专业化提高总产出。')}
 else if(ac>bc){put('caAdvantage','A 在拜访上有比较优势；B 在方案上有比较优势');put('caModelExplain','每份方案的交换比例可在 '+fmt(bc)+' 与 '+fmt(ac)+' 次拜访之间协商；端点使一方无差异。')}
 else{put('caAdvantage','B 在拜访上有比较优势；A 在方案上有比较优势');put('caModelExplain','比较优势翻转。潜在交换比例在 '+fmt(ac)+' 与 '+fmt(bc)+' 次拜访/份方案之间。')}
};
window.caPredict=()=>{ev.predictionText=$('caPrediction').value;ev.prediction=ev.predictionText.trim().length>=20;reset();const ok=save();put('caPredictionFeedback',ok?(ev.prediction?'预测已保存。':'请写至少20字的判断和理由。'):'保存失败。')};
window.caPick=(btn,n,ok)=>{
 const box=btn&&btn.closest?btn.closest('.choices'):null;
 if(box)box.querySelectorAll('button').forEach(x=>x.classList.remove('correct','wrong'));
 if(btn&&btn.classList)btn.classList.add(ok?'correct':'wrong');
 if(ok)ev.answers['q'+n]=true;else{delete ev.answers['q'+n];error('concept-q'+n)}
 reset();save();status();put('caR'+n,ok?'判断正确。':'请区分绝对产量和每单位产出的机会成本。');
};
window.caCheckNumber=(n,expected)=>{
 const v=String($('caN'+n).value).trim(),ok=v!==''&&Number.isFinite(+v)&&Math.abs(+v-expected)<0.001;
 if(ok)ev.answers['q'+n]=true;else{delete ev.answers['q'+n];error('calculation-q'+n)}
 reset();save();status();put('caR'+n,ok?'数值正确。':'请用每小时拜访数除以每小时方案数，单位为次拜访/份方案。');
};
window.caCheckTransfer=()=>{
 const t=$('caTransfer').value.trim();ev.transferText=t;
 const factors=[/沟通|协调/,/合同|履约/,/质量|返工/,/培训|学习/,/客户|需求/,/成本|费用/,/风险|合规/,/规模|产能/].filter(re=>re.test(t)).length;
 const ok=t.length>=80&&/机会成本|比较优势/.test(t)&&/分工|交易|交换|外包/.test(t)&&factors>=2&&/试点|对照|核算|测算|比较|评估/.test(t)&&/条件|限制|可能|无法|不能|取决/.test(t);
 if(ok)ev.answers.q6=true;else{delete ev.answers.q6;error('transfer-structure')}
 reset();save();status();put('caR6',ok?'结构覆盖成本、现实摩擦和核验方案；语义正确性仍需复核。':'至少80字，补齐机会成本、分工、两类摩擦、核验方法与条件。');
};
window.caTeach=()=>{
 const t=$('caTeach').value.trim();ev.teachText=t;
 ev.teach=t.length>=110&&[/绝对优势/,/比较优势/,/机会成本/,/分工|交易|交换/,/比例|区间|价格/,/假设|边界|风险|交易成本/,/1\.5|1\.25|12|8|6/].every(re=>re.test(t));
 reset();save();put('caTeachFeedback',ev.teach?'结构检查通过。规则无法判断公式和论证是否正确，建议用 AI Project 教练核验。':'至少110字：绝对优势、比较优势、机会成本、数字、交换区间与现实边界。');
};
const variants=[
 {prompt:'第1轮：A每小时14次拜访或7份方案；B每小时8次拜访或8份方案。B做1份方案放弃几次拜访？',answer:1,type:'b-plan'},
 {prompt:'第2轮：A每小时12次拜访或6份方案；B每小时9次拜访或6份方案。A做1份方案放弃几次拜访？',answer:2,type:'a-plan'},
 {prompt:'第3轮：A每小时10次拜访或5份方案；B每小时8次拜访或8份方案。A做1次拜访放弃几份方案？',answer:0.5,type:'a-visit'}
];
function drawReview(){
 const card=$('caReviewCard');if(!card)return;card.hidden=true;
 if(!ev.passedAt){put('caReviewStatus','新版证据未通过；旧完成状态不会自动升级。');return}
 const r=ev.review;if(!r){put('caReviewStatus','尚未安排复习。');return}
 if(r.stage>=3){put('caReviewStatus','三轮数值变式已完成；开放式推理仍需语义核验。');return}
 if(!Number.isFinite(Date.parse(r.dueAt))||Date.now()<Date.parse(r.dueAt)){put('caReviewStatus','第'+(r.stage+1)+'轮预计 '+String(r.dueAt).slice(0,10)+' 到期；重访本课作答。');return}
 card.hidden=false;put('caReviewStatus','第'+(r.stage+1)+'轮已到期。');put('caReviewPrompt',variants[r.stage].prompt);
}
window.caCheckReview=()=>{
 const r=ev.review;if(!ev.passedAt||!r||r.stage>=3||Date.now()<Date.parse(r.dueAt))return;
 const q=variants[r.stage],v=String($('caReviewAnswer').value).trim(),ok=v!==''&&Number.isFinite(+v)&&Math.abs(+v-q.answer)<0.001;
 r.history=Array.isArray(r.history)?r.history:[];r.history.push({stage:r.stage+1,correct:ok,type:q.type,at:now()});
 if(ok){r.stage++;if(r.stage===3)r.completedAt=now();else r.dueAt=new Date(Date.now()+(r.stage===1?7:30)*DAY).toISOString()}
 else{error('review-'+q.type);r.stage=0;r.dueAt=new Date(Date.now()+DAY).toISOString()}
 if(!save())return;put('caReviewFeedback',ok?'数值正确；'+(r.stage===3?'三轮完成。':'下一轮已安排。'):'计算错误，次日从第一轮重新开始。');
 $('caReviewAnswer').value='';drawReview();
};
window.caFinish=()=>{
 if(!ev.prediction||count()!==6||!ev.teach){put('caDone','尚未满足条件：保存预测、通过六道练习并完成 Teach-back 结构检查。');return}
 if(!ev.passedAt){ev.passedAt=now();ev.review={stage:0,dueAt:new Date(Date.now()+DAY).toISOString(),history:[]}}
 if(!save())return;window.finishExtra('W02L01',80);put('caDone','本版学习证据已保存，1天后首次变式复习；旧 XP 不重复发放。');drawReview();
};
function track(id,kind,n){const el=$(id);if(!el)return;el.addEventListener('input',()=>{
 if(kind==='prediction'){ev.predictionText=el.value;ev.prediction=false}
 if(kind==='teach'){ev.teachText=el.value;ev.teach=false}
 if(kind==='transfer'){ev.transferText=el.value;delete ev.answers.q6}
 if(n)delete ev.answers['q'+n];reset();save();status();
})}
track('caPrediction','prediction');track('caTeach','teach');track('caTransfer','transfer');[2,3,4].forEach(n=>track('caN'+n,'',n));
$('caPrediction').value=ev.predictionText;$('caTransfer').value=ev.transferText;$('caTeach').value=ev.teachText;
window.caModel();status();drawReview();
})();