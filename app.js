
const grid=document.getElementById('grid'), search=document.getElementById('search'), cats=document.getElementById('categories');
const dlg=document.getElementById('detail'); let current=null, activeCat='All', onlyFav=false;
const favs=new Set(JSON.parse(localStorage.getItem('ciu-favs')||'[]'));
const reviewed=new Set(JSON.parse(localStorage.getItem('ciu-reviewed')||'[]'));
const primary=d=>d.group.split(' / ')[0];
const icon=d=>{
 const p=primary(d);
 if(p==='Vasopressors') return '💉'; if(p==='Sedation') return '🫁'; if(p==='Analgesics') return '💉';
 if(p==='Inotropes') return '♥'; if(p==='Antiarrhythmics') return '♥'; if(p==='Electrolytes') return '◧';
 if(p==='Anticoagulation'||p==='Antiplatelets'||p==='Thrombolytics') return '▣'; if(p==='Diuretics') return '💧';
 if(p==='Vasodilators') return '↔'; if(p==='Neuromuscular Blockade') return '⚕'; return '●';
};
function save(){localStorage.setItem('ciu-favs',JSON.stringify([...favs]));localStorage.setItem('ciu-reviewed',JSON.stringify([...reviewed]));}
function renderCounter(){reviewCounter.textContent=`Reviewed ${reviewed.size} / ${DRUGS.length}`;}
const categories=['All',...Array.from(new Set(DRUGS.map(primary))).sort()];
function renderCats(){cats.innerHTML='';categories.forEach(c=>{let b=document.createElement('button');b.className='cat'+(c===activeCat?' active':'');b.textContent=c;b.onclick=()=>{activeCat=c;renderCats();render();};cats.appendChild(b);});}
function dilutionHTML(d){
 if(d.special_dilutions){
   return `<div class="dataTitle">DILUTION <span class="heSub">מיהול</span></div>
   <div class="specialDilutions" dir="ltr">
     <div><div class="sub">STANDARD<br><span dir="rtl">סטנדרטי</span></div><div class="dataText">${d.std_en.replaceAll('\n','<br>')}</div></div>
     <div><div class="sub">CONCENTRATED<br><span dir="rtl">מרוכז</span></div><div class="dataText">${d.conc_en.replaceAll('\n','<br>')}</div></div>
   </div>`;
 }
 return `<div class="dataTitle">DILUTION <span class="heSub">מיהול</span></div><div class="dataText">${d.dilution.replaceAll('\n','<br>')}</div>`;
}
function render(){
 const q=search.value.trim().toLowerCase();
 const arr=DRUGS.filter(d=>(activeCat==='All'||primary(d)===activeCat)&&(!onlyFav||favs.has(d.name))&&
   [d.name,d.group,d.pharm,d.dilution||'',d.std_en||'',d.conc_en||'',d.dose].join(' ').toLowerCase().includes(q));
 grid.innerHTML='';
 arr.forEach(d=>{
   const c=document.createElement('article');c.className='card';c.dataset.primary=primary(d);
   c.innerHTML=`${reviewed.has(d.name)?'<span class="reviewedMark">✓ REVIEWED</span>':''}
   <div class="card-top"><span class="drugIcon">${icon(d)}</span><div class="nameBox"><h3>${d.name}</h3><div class="group">${d.group}</div><div class="pharm">${d.pharm}</div></div><span class="star">${favs.has(d.name)?'★':'☆'}</span></div>
   <div class="mainData" dir="ltr"><div class="dataBox">${dilutionHTML(d)}</div><div class="dataBox rateBox"><div class="dataTitle">DOSE / RATE <span class="heSub">מינון / קצב מתן</span></div><div class="dataText">${d.dose.replaceAll('\n','<br>')}</div></div></div>
   <div class="footLine"><span>Solution: ${d.diluent}</span><span>Access: ${d.route_en}</span></div>`;
   c.onclick=()=>openDrug(d);grid.appendChild(c);
 });
 if(!arr.length)grid.innerHTML='<p>No drugs found.</p>';
}
function openDrug(d){
 current=d;drugName.textContent=d.name;
 drugClasses.innerHTML=`<span class="pill">${d.group}</span><span class="pill">${d.pharm}</span>`;
 favBtn.textContent=favs.has(d.name)?'★':'☆';
 detailDilution.innerHTML=d.special_dilutions?
 `<div class="detailDilutionTitle">DILUTION / <span dir="rtl">מיהול</span></div><div class="dilutionPair"><div><h4>STANDARD DILUTION<br><span dir="rtl">מיהול סטנדרטי</span></h4><pre>${d.std_en}</pre></div><div><h4>CONCENTRATED DILUTION<br><span dir="rtl">מיהול מרוכז</span></h4><pre>${d.conc_en}</pre></div></div>`:
 `<div class="detailDilutionTitle">DILUTION / <span dir="rtl">מיהול</span></div><div class="dilutionSingle"><pre>${d.dilution}</pre></div>`;
 detailDose.textContent=d.dose;detailSolution.textContent=d.diluent;detailRoute.textContent=d.route_en;
 indications.textContent=d.indications;contra.textContent=d.contra;mechanism.textContent=d.mechanism;monitor.textContent=d.monitor;
 sideEffects.textContent=d.side_effects;notes.textContent=d.notes;
 reviewBtn.classList.toggle('done',reviewed.has(d.name));reviewBtn.textContent=reviewed.has(d.name)?'✓ Reviewed — tap to undo':'✓ Mark this card as reviewed';
 dlg.showModal();
}
search.oninput=render;favToggle.onclick=()=>{onlyFav=!onlyFav;favToggle.textContent=onlyFav?'★ All drugs':'☆ Favorites';render();};
favBtn.onclick=()=>{if(!current)return;favs.has(current.name)?favs.delete(current.name):favs.add(current.name);save();favBtn.textContent=favs.has(current.name)?'★':'☆';render();};
reviewBtn.onclick=()=>{if(!current)return;reviewed.has(current.name)?reviewed.delete(current.name):reviewed.add(current.name);save();renderCounter();reviewBtn.classList.toggle('done',reviewed.has(current.name));reviewBtn.textContent=reviewed.has(current.name)?'✓ Reviewed — tap to undo':'✓ Mark this card as reviewed';render();};
closeBtn.onclick=()=>dlg.close();
document.querySelectorAll('.fold button').forEach(b=>b.onclick=()=>b.parentElement.classList.toggle('open'));
renderCats();render();renderCounter();
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
