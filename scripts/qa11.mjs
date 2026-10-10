import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs'
const b = await chromium.launch()
async function run(w,h,tag){
  const p = await b.newPage({ viewport: { width: w, height: h } }); const errs=[]; p.on('pageerror', e=>errs.push(e.message))
  await p.goto('http://localhost:5173/'); await p.waitForTimeout(9800)
  await p.locator('button').filter({ hasText: /roman/i }).first().click().catch(()=>{}); await p.waitForTimeout(2500)
  await p.evaluate(()=>document.getElementById('lab').scrollIntoView()); await p.waitForTimeout(1200)
  await p.evaluate(()=>window.scrollBy(0,330)); await p.waitForTimeout(800)
  await p.screenshot({path:`/tmp/${tag}_lab.png`})
  const x0 = await p.evaluate(()=>document.querySelector('.strip').scrollLeft)
  await p.locator('.orb').click({force:true}); await p.waitForTimeout(1500)
  console.log(tag,'strip scroll',x0,'->',await p.evaluate(()=>document.querySelector('.strip').scrollLeft))
  await p.evaluate(()=>document.getElementById('transmissions').scrollIntoView()); await p.waitForTimeout(800); await p.evaluate(()=>window.scrollBy(0,600)); await p.waitForTimeout(1200)
  await p.screenshot({path:`/tmp/${tag}_blog.png`})
  const m = await p.evaluate(()=>{const e=document.getElementById('meet');return [e.offsetTop,e.offsetHeight]})
  await p.evaluate(([t,hh,h])=>scrollTo(0,t+hh-h-20),[m[0],m[1],h]); await p.waitForTimeout(2500); await p.screenshot({path:`/tmp/${tag}_fin.png`})
  console.log(tag,'gf popup',await p.evaluate(()=>document.body.innerText.includes('WANNA KNOW')), errs); await p.close()
}
await run(1440,850,'d'); await run(800,1000,'t'); await run(390,844,'m'); await b.close()
