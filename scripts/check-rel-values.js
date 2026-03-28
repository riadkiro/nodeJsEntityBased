const puppeteer=require('puppeteer');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({headless:true,defaultViewport:{width:1920,height:1200}});const p=await b.newPage();const url='http://localhost:3000/account/9194/record/consultations/69c232ce0fa7abd357abd6f3/edit';
await p.goto(url,{waitUntil:'networkidle2'});const e=await p.$('input[type="email"],input[name="email"],input#email');if(e){await p.type('input[type="email"],input[name="email"],input#email','boukirou6@hotmail.com');await p.type('input[type="password"],input[name="password"],input#password','test');const s=await p.$('button[type="submit"],button');if(s) await s.click();await p.waitForNavigation({waitUntil:'networkidle2'}).catch(()=>{});await p.goto(url,{waitUntil:'networkidle2'});}await sleep(2000);
await p.evaluate(()=>{const i=[...document.querySelectorAll('input')].find(x=>/Traitement|Article/i.test(x.placeholder||'')&&!(x.value||'').trim());if(i){i.focus();i.click();}});
await p.keyboard.type('doli',{delay:70});await sleep(1200);
await p.evaluate(()=>{const c=[...document.querySelectorAll('div')].find(d=>/doliprane 1000mg/i.test((d.textContent||'').trim()) && (d.getAttribute('style')||'').includes('cursor: pointer'));if(c){const r=c.getBoundingClientRect();const ev=(t)=>c.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true,clientX:r.left+5,clientY:r.top+5}));ev('mousedown');ev('mouseup');ev('click');}});
await sleep(1200);
const out=await p.evaluate(()=>{
 const relInputs=[...document.querySelectorAll('input')].filter(i=>/Traitement|Article/i.test(i.placeholder||''));
 const vals=relInputs.map(i=>({ph:i.placeholder,val:i.value,row:(i.closest('tr')?.textContent||'').replace(/\s+/g,' ').trim().slice(0,220)}));
 return vals;
});
console.log(JSON.stringify(out,null,2));
await b.close();})();
