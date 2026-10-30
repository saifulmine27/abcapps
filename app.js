(()=>{
  'use strict';
  const STORAGE_KEY='takaguchhi-transactions-v1';
  const LANG_KEY='takaguchhi-language-v1';
  const THEME_KEY='takaguchhi-theme-v1';
  const DELETED_KEY='takaguchhi-deleted-v1';
  const $=id=>document.getElementById(id);
  const categories={
    expense:[['food','খাবার','Food'],['restaurant','বাইরে খাওয়া','Dining out'],['transport','যাতায়াত','Transport'],['fuel','জ্বালানি','Fuel'],['rent','বাড়িভাড়া','Rent'],['electricity','বিদ্যুৎ বিল','Electricity'],['water','পানির বিল','Water bill'],['gas','গ্যাস বিল','Gas bill'],['phone','মোবাইল বিল','Mobile bill'],['internet','ইন্টারনেট','Internet'],['health','চিকিৎসা','Healthcare'],['medicine','ওষুধ','Medicine'],['education','শিক্ষা','Education'],['household','ঘর-সংসার','Household'],['shopping','কেনাকাটা','Shopping'],['clothing','পোশাক','Clothing'],['personalCare','ব্যক্তিগত যত্ন','Personal care'],['entertainment','বিনোদন','Entertainment'],['travel','ভ্রমণ','Travel'],['family','পরিবার','Family'],['childcare','শিশুর যত্ন','Childcare'],['loan','ঋণ/কিস্তি','Loan/EMI'],['insurance','বিমা','Insurance'],['subscriptions','সাবস্ক্রিপশন','Subscriptions'],['repairs','মেরামত','Repairs'],['gifts','উপহার','Gifts'],['charity','দান','Charity'],['fees','ফি/কর','Fees/Tax'],['smoking','ধূমপান','Smoking'],['drinks','পানীয়','Drinks'],['teaCoffee','চা-কফি','Tea & coffee'],['snacks','হালকা নাশতা','Snacks'],['pets','পোষা প্রাণী','Pets'],['fitness','ব্যায়াম/ফিটনেস','Fitness'],['parking','পার্কিং','Parking'],['work','কাজ/অফিস','Work/Office'],['other','অন্যান্য','Other']],
    income:[['salary','বেতন','Salary'],['business','ব্যবসা','Business'],['freelance','ফ্রিল্যান্স','Freelance'],['sales','বিক্রয়','Sales'],['rentIncome','ভাড়ার আয়','Rental income'],['bonus','বোনাস','Bonus'],['gift','উপহার','Gift'],['investment','বিনিয়োগ','Investment'],['other','অন্যান্য','Other']]
  };
  const categoryColor=(()=>{const keys=[];[...categories.expense,...categories.income].forEach(c=>{if(!keys.includes(c[0]))keys.push(c[0])});const bands=[[70,44],[60,58],[75,34],[55,68]];const map={};keys.forEach((k,i)=>{const b=bands[i%bands.length];map[k]=`hsl(${Math.round((i*137.508+230)%360)} ${b[0]}% ${b[1]}%)`});return key=>map[key]||'#9aa7a0'})();
const categoryIcons={food:'🍲',restaurant:'🍜',transport:'🚌',fuel:'⛽',rent:'🏠',electricity:'💡',water:'🚿',gas:'🔥',phone:'📱',internet:'🌐',health:'🩺',medicine:'💊',education:'📚',household:'🧹',shopping:'🛍️',clothing:'👕',personalCare:'🧴',entertainment:'🎬',travel:'✈️',family:'👨‍👩‍👧',childcare:'🧸',loan:'🏦',insurance:'🛡️',subscriptions:'📺',repairs:'🛠️',gifts:'🎁',charity:'💝',fees:'🧾',smoking:'🚬',drinks:'🥤',teaCoffee:'☕',snacks:'🍪',pets:'🐾',fitness:'🏋️',parking:'🅿️',work:'💼',salary:'💼',business:'🏪',freelance:'🧑‍💻',sales:'🛒',rentIncome:'🏘️',bonus:'🎉',investment:'📈',other:'•'};
  const chartPalette=['#11a77b','#5faaa3','#e989a6','#44a9a2','#89cc93','#f2a06e','#9380cb','#67b7d5','#cfad5d','#6ebd8a'];
  const text={
    bn:{tagline:'প্রতিদিনের হিসাব, এক জায়গায়',balance:'এই মাসে হাতে আছে',monthHint:'মাসের মোট ব্যালান্স',income:'মোট আয়',expense:'মোট খরচ',history:'লেনদেন',search:'নাম বা বিভাগ খুঁজুন',all:'সব',add:'লেনদেন যোগ করুন',local:'আপনার হিসাব এই ডিভাইসের browser-এ সংরক্ষিত থাকে',newTitle:'নতুন লেনদেন',editTitle:'লেনদেন সম্পাদনা',expenseType:'খরচ',incomeType:'আয়',amount:'টাকার পরিমাণ *',description:'কীসের লেনদেন? *',descriptionHint:'যেমন: বাজার খরচ',category:'বিভাগ',date:'তারিখ',note:'নোট (ঐচ্ছিক)',noteHint:'বাড়তি কোনো তথ্য',cancel:'বাতিল',save:'সেভ করুন',saved:'লেনদেন সেভ হয়েছে',deleted:'লেনদেন মুছে ফেলা হয়েছে',deleteConfirm:'এই লেনদেনটি মুছে ফেলবেন?',empty:'এই মাসে কোনো লেনদেন নেই',emptyHint:'আয় বা খরচ যোগ করে হিসাব শুরু করুন',emptySearch:'মিলেছে এমন লেনদেন নেই',transaction:'টি লেনদেন',count:'টি',incomeSign:'+',expenseSign:'−',noNote:'',chartTab:'গ্রাফ',recordsTab:'হিসাব',monthTab:'মাস',yearTab:'বছর',topCategories:'শীর্ষ বিভাগ',noChartData:'এই সময়ে কোনো লেনদেন নেই',moreCategories:'আরও বিভাগ',
      monthFormat:new Intl.DateTimeFormat('bn-BD',{month:'long',year:'numeric'}),dateFormat:new Intl.DateTimeFormat('bn-BD',{day:'numeric',month:'short'}),currency:new Intl.NumberFormat('bn-BD',{style:'currency',currency:'BDT',maximumFractionDigits:2}),
      cat:Object.fromEntries(Object.values(categories).flat().map(c=>[c[0],c[1]]))},
    en:{tagline:'Your daily money, in one place',balance:'Available this month',monthHint:'Net balance this month',income:'Total income',expense:'Total expenses',history:'Transactions',search:'Search name or category',all:'All',add:'Add transaction',local:'Your records stay in this browser on this device',newTitle:'New transaction',editTitle:'Edit transaction',expenseType:'Expense',incomeType:'Income',amount:'Amount *',description:'What was it for? *',descriptionHint:'e.g. Grocery shopping',category:'Category',date:'Date',note:'Note (optional)',noteHint:'Add a detail if useful',cancel:'Cancel',save:'Save transaction',saved:'Transaction saved',deleted:'Transaction removed',deleteConfirm:'Remove this transaction?',empty:'No transactions this month',emptyHint:'Add income or an expense to get started',emptySearch:'No matching transactions',transaction:'transactions',count:'',incomeSign:'+',expenseSign:'−',noNote:'',chartTab:'Chart',recordsTab:'Records',monthTab:'Month',yearTab:'Year',topCategories:'Top categories',noChartData:'No transactions for this period',moreCategories:'More categories',
      monthFormat:new Intl.DateTimeFormat('en',{month:'long',year:'numeric'}),dateFormat:new Intl.DateTimeFormat('en',{day:'numeric',month:'short'}),currency:new Intl.NumberFormat('en-BD',{style:'currency',currency:'BDT',maximumFractionDigits:2}),
      cat:Object.fromEntries(Object.values(categories).flat().map(c=>[c[0],c[2]]))}
  };
  let transactions=readTransactions();
  let language=localStorage.getItem(LANG_KEY)==='en'?'en':'bn';
  let theme=['emerald','ocean','violet','rose'].includes(localStorage.getItem(THEME_KEY))?localStorage.getItem(THEME_KEY):'emerald';
  let viewMonth=monthStart(new Date());
  let activeType='all';
  let currentView='records';
  let chartPeriod='month';
  let chartDate=monthStart(new Date());
  let chartType='expense';
  let editingId=null;
  let toastTimer;
  let cloudApi=null,cloudUser=null,deletedIds=readDeletedIds();

  function readTransactions(){try{const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');return Array.isArray(value)?value.filter(validTransaction):[]}catch{return[]}}
  function validTransaction(x){return x&&typeof x.id==='string'&&(x.type==='income'||x.type==='expense')&&Number.isFinite(Number(x.amount))&&typeof x.date==='string'}
  function readDeletedIds(){try{return JSON.parse(localStorage.getItem(DELETED_KEY)||'{}')}catch{return{}}}
  function persist(){localStorage.setItem(STORAGE_KEY,JSON.stringify(transactions));localStorage.setItem(DELETED_KEY,JSON.stringify(deletedIds));if(cloudUser&&cloudApi?.configured)cloudApi.saveState({items:transactions,deletedIds}).catch(()=>setAccountStatus(language==='bn'?'Sync হয়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন':'Sync failed. Check your connection and try again'))}
  function setAccountStatus(message){$('accountStatus').textContent=message}
  function updateAccountUi(){const isBn=language==='bn';$('accountTitle').textContent=isBn?'অ্যাকাউন্ট ও Sync':'Account & Sync';$('googleSignInLabel').textContent=isBn?'Google দিয়ে সাইন আপ / সাইন ইন':'Sign up / Sign in with Google';$('accountHint').textContent=isBn?'নতুন হলে Google দিয়ে অ্যাকাউন্ট খোলা হবে, আগে থেকে থাকলে সাইন ইন হবে।':'New here? A Google account will be created. Already signed up? You will just sign in.';$('accountHint').hidden=Boolean(cloudUser);$('googleSignOutLabel').textContent=isBn?'সাইন আউট':'Sign out';$('googleSignIn').hidden=Boolean(cloudUser);$('googleSignOut').hidden=!cloudUser;$('accountEmail').hidden=!cloudUser;$('accountEmail').textContent=cloudUser?.email||'';setAccountStatus(!cloudApi?.configured?(isBn?'Google sync চালু করতে Firebase সেটআপ প্রয়োজন':'Firebase setup is needed to enable Google sync'):cloudUser?(isBn?'Google account-এ হিসাব sync হচ্ছে':'Your records are syncing to your Google account'):(isBn?'এই ডিভাইসে হিসাব সংরক্ষিত আছে':'Your records are saved on this device'))}
  function mergeCloudState(remote={}){const remoteItems=Array.isArray(remote.items)?remote.items.filter(validTransaction):[];deletedIds={...deletedIds,...(remote.deletedIds||{})};const byId=new Map();for(const item of [...transactions,...remoteItems]){const previous=byId.get(item.id);if(!previous||(item.updatedAt||item.createdAt||0)>(previous.updatedAt||previous.createdAt||0))byId.set(item.id,item)}transactions=[...byId.values()].filter(item=>(deletedIds[item.id]||0)<=(item.updatedAt||item.createdAt||0));persist();render()}
  function monthStart(date){return new Date(date.getFullYear(),date.getMonth(),1)}
  function monthKey(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`}
  function localDate(date){const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');return `${y}-${m}-${d}`}
  function escapeHtml(value=''){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
  function words(){return text[language]}
  function amount(value){return words().currency.format(Number(value)||0).replace(/\s/g,' ')}
  function categoryName(key){return words().cat[key]||words().cat.other}
  function monthTransactions(){return transactions.filter(tx=>tx.date.slice(0,7)===monthKey(viewMonth))}
  function setCategoryOptions(type,selected=''){const select=$('categoryInput');select.innerHTML=categories[type].map(([id,bn,en])=>`<option value="${id}">${categoryIcons[id]||'•'} ${language==='bn'?bn:en}</option>`).join('');if(selected&&categories[type].some(c=>c[0]===selected))select.value=selected;const active=select.value||categories[type][0][0];select.value=active;$('categoryGrid').innerHTML=categories[type].map(([id,bn,en])=>`<button class="category-option ${id===active?'selected':''}" type="button" data-category="${id}" aria-pressed="${id===active}"><span class="category-option-icon" aria-hidden="true">${categoryIcons[id]||'•'}</span><span>${language==='bn'?bn:en}</span></button>`).join('')}
  function applyLanguage(){document.documentElement.lang=language;$('languageButton').textContent=language==='bn'?'অ':'EN';$('languageButton').title=language==='bn'?'English':'বাংলা';$('settingsTitle').textContent=language==='bn'?'সেটিংস':'Settings';$('themeLabel').textContent=language==='bn'?'থিমের রং':'Theme color';$('doneSettings').textContent=language==='bn'?'ঠিক আছে':'Done';$('settingsButton').title=language==='bn'?'সেটিংস':'Settings';$('settingsButton').setAttribute('aria-label',language==='bn'?'সেটিংস':'Settings');document.querySelectorAll('.theme-option span').forEach(label=>label.textContent=label.dataset[language]);document.querySelectorAll('.theme-option').forEach(button=>button.classList.toggle('selected',button.dataset.themeChoice===theme));updateAccountUi()}
  function applyTheme(){document.body.dataset.theme=theme;document.querySelectorAll('.theme-option').forEach(button=>button.classList.toggle('selected',button.dataset.themeChoice===theme));document.querySelector('meta[name="theme-color"]').content=({emerald:'#087c60',ocean:'#1876c9',violet:'#7152c8',rose:'#d94c81'})[theme]}
  function render(){
    const w=words(),monthly=monthTransactions();
    const income=monthly.filter(x=>x.type==='income').reduce((s,x)=>s+Number(x.amount),0);
    const expense=monthly.filter(x=>x.type==='expense').reduce((s,x)=>s+Number(x.amount),0);
    const net=income-expense;
    $('tagline').textContent=w.tagline;$('balanceLabel').textContent=w.balance;$('balanceAmount').textContent=amount(net);
    $('monthLabel').textContent=w.monthFormat.format(viewMonth);$('monthHint').textContent=w.monthHint;
    $('incomeLabel').textContent=w.income;$('expenseLabel').textContent=w.expense;
    $('incomeAmount').textContent=amount(income);$('expenseAmount').textContent=amount(expense);
    $('historyTitle').textContent=w.history;$('searchInput').placeholder=w.search;$('localNote').textContent=w.local;
    $('recordsTabLabel').textContent=w.recordsTab;$('chartTabLabel').textContent=w.chartTab;
    $('addButton').setAttribute('aria-label',w.add);
    $('recordsView').hidden=currentView!=='records';$('chartView').hidden=currentView!=='chart';
    document.querySelector('.hero-card').hidden=currentView!=='records';document.querySelector('.summary-grid').hidden=currentView!=='records';
    document.querySelectorAll('.nav-item').forEach(button=>button.classList.toggle('active',button.dataset.view===currentView));
    $('dialogTitle').textContent=editingId?w.editTitle:w.newTitle;
    $('expenseChoice').textContent=w.expenseType;$('incomeChoice').textContent=w.incomeType;
    $('amountLabel').textContent=w.amount;
    $('categoryLabel').textContent=w.category;$('dateLabel').textContent=w.date;$('noteLabel').textContent=w.note;$('noteInput').placeholder=w.noteHint;
    $('cancelDialog').textContent=w.cancel;$('saveButton').textContent=w.save;
    $('transactionCount').textContent=new Intl.NumberFormat(language==='bn'?'bn-BD':'en').format(monthly.length)+' '+w.transaction;
    $('chartExpenseLabel').textContent=w.expenseType;$('chartIncomeLabel').textContent=w.incomeType;
    document.querySelectorAll('.chart-type-button').forEach(button=>{const active=button.dataset.chartType===chartType;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});
    $('monthTab').textContent=w.monthTab;$('yearTab').textContent=w.yearTab;
    document.querySelectorAll('[data-period]').forEach(button=>button.classList.toggle('active',button.dataset.period===chartPeriod));
    $('chartDateLabel').textContent=chartPeriod==='month'?w.monthFormat.format(chartDate):String(chartDate.getFullYear());
    $('donutTotalLabel').textContent=language==='bn'
      ?`${chartPeriod==='month'?'মাসের':'বছরের'} মোট ${chartType==='expense'?'খরচ':'আয়'}`
      :`${chartPeriod==='month'?'Monthly':'Yearly'} ${chartType==='expense'?'expenses':'income'}`;
    $('topListTitle').textContent=w.topCategories;
    if(currentView==='chart')renderCategoryChart();
    document.querySelectorAll('.filter').forEach(button=>{button.classList.toggle('active',button.dataset.type===activeType);button.textContent=button.dataset.type==='all'?w.all:button.dataset.type==='income'?w.incomeType:w.expenseType});
    const query=$('searchInput').value.trim().toLocaleLowerCase();$('clearSearch').classList.toggle('visible',Boolean(query));
    const shown=monthly.filter(tx=>(activeType==='all'||tx.type===activeType)&&(!query||[tx.description,tx.note,categoryName(tx.category)].some(s=>(s||'').toLocaleLowerCase().includes(query))))
      .sort((a,b)=>b.date.localeCompare(a.date)||(b.createdAt||0)-(a.createdAt||0));
    $('visibleCount').textContent=new Intl.NumberFormat(language==='bn'?'bn-BD':'en').format(shown.length)+' '+(language==='bn'?w.count:w.transaction);
    const host=$('transactionList');
    if(!shown.length){host.innerHTML=`<div class="empty"><div class="empty-icon">${query?'⌕':'৳'}</div><h3>${query?w.emptySearch:w.empty}</h3><p>${query?'':w.emptyHint}</p></div>`;return}
    host.innerHTML=shown.map(tx=>`<article class="transaction"><div class="tx-icon ${tx.type==='income'?'income':''}" aria-hidden="true">${categoryIcons[tx.category]||'•'}</div><div><div class="tx-name">${escapeHtml(categoryName(tx.category))}</div><div class="tx-meta">${w.dateFormat.format(new Date(`${tx.date}T12:00:00`))}</div>${tx.note?`<div class="tx-note">${escapeHtml(tx.note)}</div>`:''}</div><div class="tx-right"><div class="tx-amount ${tx.type}">${tx.type==='income'?w.incomeSign:w.expenseSign}${amount(tx.amount)}</div><div class="tx-actions"><button type="button" data-edit="${escapeHtml(tx.id)}" aria-label="${language==='bn'?'সম্পাদনা':'Edit'}">✎</button><button class="delete" type="button" data-delete="${escapeHtml(tx.id)}" aria-label="${language==='bn'?'মুছুন':'Remove'}">×</button></div></div></article>`).join('');
  }
  function renderCategoryChart(){
    const type=chartType;
    const filtered=transactions.filter(tx=>tx.type===type&&(chartPeriod==='month'?tx.date.slice(0,7)===monthKey(chartDate):tx.date.slice(0,4)===String(chartDate.getFullYear())));
    const grouped=new Map();
    filtered.forEach(tx=>grouped.set(tx.category,(grouped.get(tx.category)||0)+Number(tx.amount)));
    const ranked=[...grouped.entries()].map(([key,value])=>({key,value,label:categoryName(key)})).sort((a,b)=>b.value-a.value);
    const total=ranked.reduce((sum,row)=>sum+row.value,0);
    const slices=ranked.map(row=>({...row,color:categoryColor(row.key)}));
    let cursor=0;
    const gradient=slices.map(row=>{const start=cursor;cursor+=total?row.value/total*100:0;return `${row.color} ${start}% ${cursor}%`}).join(',');
    $('donutChart').style.background=total?`conic-gradient(${gradient})`:'#e9eeeb';
    $('donutTotal').textContent=amount(total);
    $('donutChart').setAttribute('aria-label',`${words()[type]} · ${amount(total)}`);
    $('chartLegend').innerHTML=slices.length?slices.map(row=>`<div class="legend-row"><i class="legend-color" style="background:${row.color}"></i><span class="legend-name">${categoryIcons[row.key]||''} ${escapeHtml(row.label)}</span><span class="legend-percent">${total?Math.round(row.value/total*100):0}%</span></div>`).join(''):`<p class="chart-empty">${words().noChartData}</p>`;
    $('categoryBreakdown').innerHTML=ranked.length?ranked.slice(0,10).map((row,index)=>`<div class="breakdown-row"><div class="breakdown-top"><span class="breakdown-name"><i class="legend-color" style="background:${categoryColor(row.key)}"></i>${categoryIcons[row.key]||''} ${escapeHtml(row.label)} <small>${total?Math.round(row.value/total*100):0}%</small></span><strong>${amount(row.value)}</strong></div><div class="breakdown-track"><span style="width:${total?row.value/total*100:0}%;background:${categoryColor(row.key)}"></span></div></div>`).join(''):`<div class="chart-empty">${words().noChartData}</div>`;
  }
  function setType(type){activeType=type;document.querySelectorAll('.type-choice').forEach(b=>b.classList.toggle('active',b.dataset.value===type));setCategoryOptions(type,$('categoryInput').value)}
  function openDialog(tx){editingId=tx?.id||null;$('transactionForm').reset();$('amountInput').value=tx?.amount||'';$('dateInput').value=tx?.date||localDate(new Date());$('noteInput').value=tx?.note||'';setType(tx?.type||'expense');setCategoryOptions(tx?.type||'expense',tx?.category||'');render();$('transactionDialog').showModal();setTimeout(()=>$('amountInput').focus(),40)}
  function showToast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2100)}
  function changeMonth(delta){viewMonth=new Date(viewMonth.getFullYear(),viewMonth.getMonth()+delta,1);chartDate=new Date(chartDate.getFullYear(),chartDate.getMonth()+delta,1);render()}

  $('addButton').addEventListener('click',()=>openDialog());
  $('previousMonth').addEventListener('click',()=>changeMonth(-1));
  $('nextMonth').addEventListener('click',()=>changeMonth(1));
  document.querySelector('.bottom-nav').addEventListener('click',event=>{const button=event.target.closest('[data-view]');if(button){currentView=button.dataset.view;render()}});
  $('chartTypeSwitch').addEventListener('click',event=>{const button=event.target.closest('[data-chart-type]');if(button){chartType=button.dataset.chartType;render()}});
  $('periodTabs').addEventListener('click',event=>{const button=event.target.closest('[data-period]');if(button){chartPeriod=button.dataset.period;render()}});
  $('chartPrevious').addEventListener('click',()=>{chartDate=new Date(chartDate.getFullYear(),chartDate.getMonth()-(chartPeriod==='month'?1:12),1);render()});
  $('chartNext').addEventListener('click',()=>{chartDate=new Date(chartDate.getFullYear(),chartDate.getMonth()+(chartPeriod==='month'?1:12),1);render()});
  $('filters').addEventListener('click',event=>{const button=event.target.closest('[data-type]');if(button){activeType=button.dataset.type;render()}});
  $('searchInput').addEventListener('input',render);
  $('clearSearch').addEventListener('click',()=>{$('searchInput').value='';render();$('searchInput').focus()});
  $('languageButton').addEventListener('click',()=>{language=language==='bn'?'en':'bn';localStorage.setItem(LANG_KEY,language);const type=$('typeSwitch').querySelector('.active')?.dataset.value||'expense';applyLanguage();render();setCategoryOptions(type)});
  $('settingsButton').addEventListener('click',()=>$('settingsDialog').showModal());
  $('googleSignIn').addEventListener('click',async()=>{if(!cloudApi?.configured){setAccountStatus(language==='bn'?'Google sync চালু করতে Firebase project config যোগ করতে হবে':'Add your Firebase project config to enable Google sync');return}try{await cloudApi.signIn()}catch(e){setAccountStatus((language==='bn'?'Google sign-in করা যায়নি':'Google sign-in failed')+(e&&e.message?' ('+e.message+')':''))}});
  $('googleSignOut').addEventListener('click',async()=>{try{await cloudApi?.signOut()}catch{setAccountStatus(language==='bn'?'সাইন আউট করা যায়নি':'Sign out failed')}});
  window.addEventListener('takaguchhi-cloud-ready',event=>{cloudApi=event.detail;updateAccountUi()});
  window.addEventListener('takaguchhi-auth',event=>{cloudUser=event.detail.user;updateAccountUi()});
  window.addEventListener('takaguchhi-cloud-state',event=>mergeCloudState(event.detail));
  window.addEventListener('takaguchhi-cloud-error',()=>setAccountStatus(language==='bn'?'Sync হয়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন':'Sync failed. Check your connection and try again'));
  $('closeSettings').addEventListener('click',()=>$('settingsDialog').close());$('doneSettings').addEventListener('click',()=>$('settingsDialog').close());
  $('settingsDialog').addEventListener('click',event=>{if(event.target===$('settingsDialog'))$('settingsDialog').close()});
  $('settingsDialog').addEventListener('click',event=>{const button=event.target.closest('[data-theme-choice]');if(button){theme=button.dataset.themeChoice;localStorage.setItem(THEME_KEY,theme);applyTheme()}});
  $('typeSwitch').addEventListener('click',event=>{const button=event.target.closest('[data-value]');if(button)setType(button.dataset.value)});
  $('categoryGrid').addEventListener('click',event=>{const button=event.target.closest('[data-category]');if(button){const type=$('typeSwitch').querySelector('.active')?.dataset.value||'expense';setCategoryOptions(type,button.dataset.category)}});
  $('closeDialog').addEventListener('click',()=>$('transactionDialog').close());
  $('cancelDialog').addEventListener('click',()=>$('transactionDialog').close());
  $('transactionList').addEventListener('click',event=>{
    const edit=event.target.closest('[data-edit]');
    if(edit){const tx=transactions.find(x=>x.id===edit.dataset.edit);if(tx)openDialog(tx);return}
    const remove=event.target.closest('[data-delete]');
    if(remove&&confirm(words().deleteConfirm)){deletedIds[remove.dataset.delete]=Date.now();transactions=transactions.filter(x=>x.id!==remove.dataset.delete);persist();render();showToast(words().deleted)}
  });
  $('transactionForm').addEventListener('submit',event=>{
    event.preventDefault();
    const type=$('typeSwitch').querySelector('.active')?.dataset.value||'expense';
    const category=$('categoryInput').value;
    const tx={id:editingId||`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,type,amount:Number($('amountInput').value),category,date:$('dateInput').value,note:$('noteInput').value.trim(),createdAt:editingId?(transactions.find(item=>item.id===editingId)?.createdAt||Date.now()):Date.now(),updatedAt:Date.now()};
    if(!Number.isFinite(tx.amount)||tx.amount<=0||!tx.date)return;
    if(editingId)transactions=transactions.map(old=>old.id===editingId?tx:old);else transactions.push(tx);
    try{persist();$('transactionDialog').close();render();showToast(words().saved)}catch{showToast(language==='bn'?'সংরক্ষণের জায়গা পূর্ণ। browser-এর পুরোনো তথ্য মুছুন।':'Storage is full. Clear old browser data and try again.')}
  });
  applyLanguage();applyTheme();setCategoryOptions('expense');render();
  if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
