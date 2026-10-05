(()=> {
const STORAGE='ew-state-v02';
const defaults={xp:0,done:false,mistakes:[],teachHistory:[],completedLessons:[],lang:'cn'};
let parsed={};
try{parsed=JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch(e){}
const state=Object.assign({},defaults,parsed);
state.completedLessons=state.completedLessons||[];
state.mistakes=state.mistakes||[];
state.teachHistory=state.teachHistory||[];

const LESSONS=[
{id:'L01',path:'lessons/w01-l01-opportunity-cost.html',title:'机会成本',world:'World 01',desc:'最好备选、切换阈值与信息价值'},
{id:'L02',path:'lessons/w01-l02-marginal-thinking.html',title:'边际分析',world:'World 01',desc:'再多投入一点，到底还值不值？'},
{id:'L03',path:'lessons/w01-l03-incentives.html',title:'激励',world:'World 01',desc:'规则变化为什么会系统性改变行为？'},
{id:'L04',path:'lessons/w01-l04-models-reality.html',title:'模型与现实',world:'World 01',desc:'模型为什么有用，又会在哪里失效？'},
{id:'W02L01',path:'lessons/w02-l01-comparative-advantage.html',title:'比较优势',world:'World 02',desc:'为什么更强的一方也有理由交易？'},
{id:'W02L02',path:'lessons/w02-l02-terms-of-trade.html',title:'交换比例',world:'World 02',desc:'交易价格落在哪里，双方才愿意交换？'},
{id:'W02L03',path:'lessons/w02-l03-trade-boundaries.html',title:'贸易的现实边界',world:'World 02',desc:'交易成本、风险、分配与动态优势'},
{id:'W03L01',path:'lessons/w03-l01-demand.html',title:'需求',world:'World 03',desc:'价格变了，还是需求本身变了？'},
{id:'W03L02',path:'lessons/w03-l02-supply-equilibrium.html',title:'供给与均衡',world:'World 03',desc:'价格如何协调短缺与过剩？'},
{id:'W03L03',path:'lessons/w03-l03-elasticity.html',title:'弹性',world:'World 03',desc:'同样涨价 10%，为什么后果完全不同？'},
{id:'W03L04',path:'lessons/w03-l04-price-controls-tax.html',title:'价格控制与税',world:'World 03',desc:'政策改变价格以后，谁真正承担成本？'},
{id:'W04L01',path:'lessons/w04-l01-surplus-efficiency.html',title:'剩余与市场效率',world:'World 04',desc:'交易为什么会创造收益？价格又在分配什么？'},
{id:'W04L02',path:'lessons/w04-l02-tax-deadweight-loss.html',title:'税收与无谓损失',world:'World 04',desc:'税为什么会让一部分本来能成交的交易消失？'},
{id:'W04L03',path:'lessons/w04-l03-trade-welfare.html',title:'贸易、关税与福利',world:'World 04',desc:'贸易让总蛋糕变大，为什么现实里仍有人反对？'},
{id:'W05L01',path:'lessons/w05-l01-externalities.html',title:'外部性',world:'World 05',desc:'为什么私人最优有时不是社会最优？'},
{id:'W05L02',path:'lessons/w05-l02-public-goods.html',title:'公共物品与共有资源',world:'World 05',desc:'为什么有些东西市场会供给不足，有些资源又会被过度使用？'},
{id:'W05L03',path:'lessons/w05-l03-tax-design-regulation.html',title:'税制、监管与公平效率',world:'World 05',desc:'政府介入以后，怎样判断制度本身的成本与公平？'},
{id:'W12L01',path:'lessons/w12-l01-money-ledgers-settlement.html',title:'货币、账本与结算',world:'World 12',desc:'Future Finance：从“钱到底是什么”开始'}
];

function root(){return document.body.dataset.root||'.'}
function isDone(id){return id==='L01'?!!state.done:state.completedLessons.includes(id)}
function nextLesson(){return LESSONS.find(x=>!isDone(x.id))||LESSONS[LESSONS.length-1]}
function save(){localStorage.setItem(STORAGE,JSON.stringify(state));render()}
function toast(msg){
  const el=document.getElementById('toast');
  if(!el)return;
  el.textContent=msg;el.classList.add('on');
  clearTimeout(window.__ewToast);window.__ewToast=setTimeout(()=>el.classList.remove('on'),1700)
}
function currentMeta(){
  const id=document.body.dataset.lessonId||'';
  return LESSONS.find(x=>x.id===id)||{id,title:document.body.dataset.lessonTitle||'当前课程',world:''}
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

/* navigation */
window.backHome=()=>{location.href=root()+'/index.html'};
window.goHome=window.backHome;

/* home */
function renderHome(){
  const xp=document.getElementById('xp'), mastery=document.getElementById('mastery'), review=document.getElementById('reviewCount');
  const completed=LESSONS.filter(x=>isDone(x.id)).length;
  if(xp)xp.textContent=state.xp||0;
  if(mastery)mastery.textContent=Math.round((completed/LESSONS.length)*100)+'%';
  if(review)review.textContent=state.mistakes.length;
  const n=nextLesson();
  const nt=document.getElementById('nextTitle'), nd=document.getElementById('nextDesc'), nl=document.getElementById('nextLink'), ni=document.getElementById('nextIndex');
  if(nt)nt.textContent=n.title;if(nd)nd.textContent=n.world+' · '+n.desc;
  if(nl)nl.href='./'+n.path;
  if(ni)ni.textContent=String(LESSONS.indexOf(n)+1).padStart(2,'0');
  document.querySelectorAll('[data-lesson-id]').forEach(el=>{
    const id=el.dataset.lessonId;
    el.classList.toggle('completed',isDone(id));
  });
  const box=document.getElementById('reviewList');
  if(box){
    box.innerHTML=state.mistakes.length
      ?state.mistakes.slice(-5).reverse().map(x=>'<div class="review-item"><b>'+escapeHtml(x.concept)+'</b>'+escapeHtml(x.reason)+'<br><span>待变式复习</span></div>').join('')
      :'<div class="review-item">暂无待复习项。答错后会自动进入这里。</div>';
  }
}

/* lesson state */
function renderLesson(){
  const meta=currentMeta();
  if(meta.id)state.currentLesson=meta.id;
  const done=document.getElementById('lessonDone');
  if(done)done.textContent=isDone(meta.id)?'已完成 ✓':'学习中';
  const aiStatus=document.getElementById('aiLessonStatus');
  if(aiStatus)aiStatus.textContent=meta.world+' · '+meta.title;
}
function render(){renderHome();renderLesson()}

/* L01 interactions */
window.answerMain=(el,ok,reason)=>{
  document.querySelectorAll('#stage1 .choice').forEach(x=>x.classList.remove('correct','wrong'));
  el.classList.add(ok?'correct':'wrong');
  const feedback=document.getElementById('feedback'), next1=document.getElementById('next1');
  if(ok){
    if(feedback)feedback.classList.add('show');
    if(next1)next1.style.display='inline-block';
  }else{
    addMistake('机会成本',reason||'概念判断错误');
    if(feedback){feedback.innerHTML='<b>先别急着看答案。</b> 你这次更像是“'+escapeHtml(reason||'概念判断错误')+'”。想一想：如果你没选 A，你最可能把这 8 小时给谁？那个方案的价值才是关键。';feedback.classList.add('show')}
  }
};
window.goStage=(n)=>{
  state.currentStage=n;localStorage.setItem(STORAGE,JSON.stringify(state));
  for(let i=1;i<=6;i++){const el=document.getElementById('stage'+i);if(el)el.style.display=i===n?'block':'none'}
  document.querySelectorAll('#steps i').forEach((x,i)=>x.classList.toggle('done',i<n));
  window.scrollTo({top:0,behavior:'smooth'})
};
window.calcWelfare=()=>{
  const price=document.getElementById('welfarePrice');
  if(!price)return;
  const wtp=120,cost=50,p=+price.value;
  const cs=Math.max(0,wtp-p), ps=Math.max(0,p-cost), total=wtp>=cost?wtp-cost:0;
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v};
  set('welfarePriceOut',p);set('consumerSurplus',cs);set('producerSurplus',ps);set('totalSurplus',total);
};

window.calcTax=()=>{
  const tax=document.getElementById('taxSlider');
  if(!tax)return;
  const t=+tax.value;
  const q=Math.max(0,(100-t)/2);
  const buyer=120-q, seller=20+q, rev=t*q, dwl=.5*t*(50-q);
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v};
  set('taxOut',t.toFixed(0));set('taxQ',q.toFixed(1));set('buyerPrice',buyer.toFixed(1));
  set('sellerPrice',seller.toFixed(1));set('taxRevenue',rev.toFixed(0));set('taxDwl',dwl.toFixed(0));
};

window.calcExternality=()=>{
  const slider=document.getElementById('externalCost');
  if(!slider)return;
  const e=+slider.value, marketQ=50, socialQ=Math.max(0,(100-e)/2), gap=marketQ-socialQ;
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v};
  set('externalCostOut',e.toFixed(0));set('marketQuantity',marketQ.toFixed(0));
  set('socialQuantity',socialQ.toFixed(1));set('quantityGap',gap.toFixed(1));set('pigouTax',e.toFixed(0));
};

window.calcTaxSystem=()=>{
  const slider=document.getElementById('incomeSlider');
  if(!slider)return;
  const income=+slider.value;
  let tax=0,marginal=0;
  if(income<=5){tax=income*.10;marginal=10}
  else if(income<=15){tax=.5+(income-5)*.20;marginal=20}
  else{tax=.5+2+(income-15)*.30;marginal=30}
  const avg=income?tax/income*100:0;
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v};
  set('incomeOut',income.toFixed(0));set('taxBill',tax.toFixed(2));set('averageRate',avg.toFixed(1));set('marginalRate',marginal.toFixed(0));
};

window.calcTrade=()=>{
  const wp=document.getElementById('worldPrice');
  if(!wp)return;
  const w=+wp.value, autarky=100;
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v};
  set('worldPriceOut',w);
  const role=document.getElementById('tradeRole'), winners=document.getElementById('tradeWinners'), losers=document.getElementById('tradeLosers');
  if(w<autarky){
    if(role)role.textContent='进口国';
    if(winners)winners.textContent='国内消费者';
    if(losers)losers.textContent='国内生产者';
  }else if(w>autarky){
    if(role)role.textContent='出口国';
    if(winners)winners.textContent='国内生产者';
    if(losers)losers.textContent='国内消费者';
  }else{
    if(role)role.textContent='几乎没有贸易动机';
    if(winners)winners.textContent='—';if(losers)losers.textContent='—';
  }
};

window.calc=()=>{
  const prob=document.getElementById('prob'),profit=document.getElementById('profit');
  if(!prob||!profit)return;
  const p=+prob.value,m=+profit.value,ev=p*m/100;
  const po=document.getElementById('probOut'),pro=document.getElementById('profitOut'),be=document.getElementById('bEV'),sw=document.getElementById('switchProb');
  if(po)po.textContent=p;if(pro)pro.textContent=m;if(be)be.textContent=ev.toFixed(1);if(sw)sw.textContent=(8.4/m*100).toFixed(1)
};
function addMistake(concept,reason){
  if(!state.mistakes.some(x=>x.concept===concept&&x.reason===reason)){
    state.mistakes.push({concept,reason,date:new Date().toISOString()});save();toast('已加入复习队列')
  }
}
window.quick=(el,ok,concept)=>{
  el.parentElement.querySelectorAll('.choice').forEach(x=>x.classList.remove('correct','wrong'));
  el.classList.add(ok?'correct':'wrong');
  if(!ok)addMistake(concept,'本课测验中判断错误');else toast('判断正确')
};
window.genericChoice=(el,ok,concept,reason)=>{
  el.parentElement.querySelectorAll('.choice').forEach(x=>x.classList.remove('correct','wrong'));
  el.classList.add(ok?'correct':'wrong');
  if(!ok)addMistake(concept,reason||'概念判断错误');else toast('判断正确')
};

window.evaluateExtra=(textId,resultId,patterns,model)=>{
  const input=document.getElementById(textId),out=document.getElementById(resultId);
  if(!input||!out)return;
  const t=input.value.trim(),hits=patterns.map(p=>new RegExp(p,'i').test(t)),score=hits.filter(Boolean).length;
  if(t.length<15||score<2){
    out.innerHTML='<div class="feedback show warn"><b>先别结束。</b> 你的回答还缺少关键逻辑。<br><br><b>补充参考：</b>'+model+'<br><br>请用自己的话再改一版，而不是照抄。</div>';
    addMistake('Teach-back','表达不完整：'+textId)
  }else{
    out.innerHTML='<div class="feedback show"><b>通过。</b> 你已经抓到核心。<br><br><b>更完整的标准表达：</b>'+model+'</div>'
  }
  state.teachHistory.push({lesson:currentMeta().id,text:t,score,date:new Date().toISOString()});save()
};

window.evaluateTeach=()=>{
  const teach=document.getElementById('teach'),result=document.getElementById('teachResult');
  if(!teach||!result)return;
  const text=teach.value.trim();
  const checks=[
    {label:'说清“最好备选/放弃什么”',hit:/替代|备选|放弃|另一个|其他选择/.test(text)},
    {label:'理解要做相对比较',hit:/比较|更值|相对|更好|收益|价值|机会成本/.test(text)},
    {label:'处理现实中的不确定性',hit:/区间|阈值|切换|信息|试探|概率|不确定|估计/.test(text)}
  ];
  const score=checks.filter(x=>x.hit).length;
  state.teachHistory.push({lesson:'L01-V1',text,score,date:new Date().toISOString()});
  const rubric='<div class="rubric">'+checks.map(x=>'<div class="'+(x.hit?'ok':'miss')+'">'+(x.hit?'✓ ':'△ ')+x.label+'</div>').join('')+'</div>';
  let msg;
  if(text.length<25||score<2){
    msg='<div class="feedback show warn"><b>这版还不能算真正掌握。</b><br>至少补上两层：① 当前方案要和“最好可行备选”比较；② 现实数字不准时，用区间、切换阈值或信息价值，而不是伪精确。</div>';
    addMistake('Teach-back','机会成本 V1：最好备选或不确定性处理不完整')
  }else{
    msg='<div class="feedback show"><b>通过。</b> 你已经从“会背定义”走到“会用它判断”。</div><button class="next" onclick="goStage(6)">进入记忆卡 →</button>'
  }
  result.innerHTML=rubric+msg;save()
};

window.finishLesson=()=>{
  if(!state.done){state.done=true;state.xp=(state.xp||0)+80;save();toast('课程完成 · +80 XP')}else toast('这节课已经完成过了');
  const dm=document.getElementById('doneMsg');if(dm)dm.classList.add('show')
};
window.finishExtra=(id,xp)=>{
  if(!state.completedLessons.includes(id)){state.completedLessons.push(id);state.xp=(state.xp||0)+xp;save();toast('课程完成 · +'+xp+' XP')}else toast('这节课已经完成过了')
};

/* AI coach */
const PROJECT='https://chatgpt.com/g/g-p-6ac24585023881918138fe6973fae444-economics-world/c/6ac244e0-f19c-83e9-9439-1ce4e1ebbaa7';
const AI_MODES={
 explain:'请重新解释我当前最可能没真正理解的点。先用非常直觉的例子，再给标准概念，最后只问我一个检查理解的问题。',
 quiz:'请基于我的近期错题和当前课程给我出 3 道变式题，一次只出 1 道。不要先给答案；我回答后再判断我的思维错误属于哪一类。',
 apply:'请把当前知识点放到现实业务里，优先使用 KA 销售、跨境支付、银行、FX 或数字货币案例，并指出关键变量和切换条件。',
 challenge:'请主动寻找我当前理解中的漏洞、反例、隐含假设和模型边界；如果有主流争议，请公平展示不同观点。'
};
function teachText(){
  const active=document.querySelector('.lesson,.extraLesson');
  const ta=active?.querySelector('textarea');return (ta?.value||'').trim()
}
function context(extra=''){
  const m=currentMeta();
  const mistakes=state.mistakes.slice(-6).map(x=>x.concept+'：'+x.reason).join('；')||'暂无';
  const completed=LESSONS.filter(x=>isDone(x.id)).map(x=>x.title).join('、')||'暂无';
  return '【Economics World 学习上下文】\n当前课程：'+m.world+' / '+m.title+'\n当前步骤：'+(state.currentStage||'课程学习')+'\n已完成课程：'+completed+'\n近期错题/薄弱点：'+mistakes+'\n当前 Teach-back：'+(teachText()||'尚未填写')+'\n\n【助教规则】\n1. 中文优先，先直觉后术语。\n2. 发现错误要明确指出，不因表达像就默认掌握。\n3. 区分教材模型、现实边界和当前事实。\n4. 现实商业/金融问题优先讲机制、变量、切换条件和风险，不制造伪精确。\n5. 合适时结合 KA、银行、FX、跨境支付或 Future Finance。'+(extra?'\n\n【本次任务】\n'+extra:'')
}
function copy(t,msg='学习上下文已复制'){
  if(navigator.clipboard?.writeText){navigator.clipboard.writeText(t).then(()=>toast(msg)).catch(()=>toast('复制失败，请重试'))}
  else toast('浏览器不支持自动复制')
}
window.toggleAI=()=>document.getElementById('atlasAI')?.classList.toggle('on');
window.copyLessonContext=()=>copy(context());
window.openAICoach=(mode)=>{copy(context(AI_MODES[mode]||''),'AI 学习上下文已复制');window.open(PROJECT,'_blank','noopener')};

function enhanceBookResources(){
  document.querySelectorAll('.resource-card.static').forEach(card=>{
    const source=(card.querySelector('.source')?.textContent||'').trim();
    const title=(card.querySelector('h3')?.textContent||'').trim();
    if(source!=='项目教材') return;

    let query='曼昆 经济学原理';
    if(/微观/.test(title)) query='曼昆 经济学原理 微观经济学分册';
    else if(/宏观/.test(title)) query='曼昆 经济学原理 宏观经济学分册';
    else if(/导读/.test(title)) query='曼昆 经济学原理 导读';

    const url='https://weread.qq.com/web/search/books?keyword='+encodeURIComponent(query);
    card.classList.add('book-link');
    card.setAttribute('role','link');
    card.setAttribute('tabindex','0');
    card.setAttribute('aria-label','在微信读书搜索：'+query);
    card.dataset.href=url;

    const go=card.querySelector('.go');
    if(go) go.textContent='微信读书 ↗';

    const meta=card.querySelector('.meta');
    if(meta && !meta.querySelector('.weread-tag')){
      const tag=document.createElement('span');
      tag.className='weread-tag';
      tag.textContent='可点击打开微信读书';
      meta.appendChild(tag);
    }

    const open=()=>window.open(url,'_blank','noopener');
    card.addEventListener('click',open);
    card.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}
    });
  });
}

document.addEventListener('DOMContentLoaded',()=>{
  // Shared brand favicon for home and all standalone lessons.
  if(!document.querySelector('link[rel="icon"]')){
    const icon=document.createElement('link');
    icon.rel='icon';icon.type='image/svg+xml';icon.href=root()+'/favicon.svg';
    document.head.appendChild(icon);
  }
  const m=currentMeta();
  if(m.id){state.currentLesson=m.id;localStorage.setItem(STORAGE,JSON.stringify(state))}
  render();
  enhanceBookResources();
  window.calc?.();
  window.calcWelfare?.();
  window.calcTax?.();
  window.calcTrade?.();
  window.calcExternality?.();
  window.calcTaxSystem?.();
});
})();