import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs'
const b = await chromium.launch()
async function run(w,h,tag){
  const p = await b.newPage({ viewport: { width: w, height: h } })
  const errs=[]; p.on('pageerror', e=>errs.push(e.message))
  await p.goto('http://localhost:5173/'); await p.waitForTimeout(9800)
  await p.locator('button').filter({ hasText: /roman/i }).first().click().catch(()=>{}); await p.waitForTimeout(2500)
  const H = await p.evaluate(()=>document.documentElement.scrollHeight); console.log(tag,'pageHeight',H)
  const one = await p.evaluate(()=>{const e=document.getElementById('person');return [e.offsetTop,e.offsetHeight]}); console.log(tag,'oneline',one)
  for (const f of [0.0,0.5,1.0]) { await p.evaluate(([t,hh,f,h])=>scrollTo(0,t+(hh-h)*f),[one[0],one[1],f,h]); await p.waitForTimeout(1300); await p.screenshot({path:`/tmp/${tag}_ol${f}.png`}) }
  for (const id of ['lab','transmissions']) {
    await p.evaluate(id=>document.getElementById(id).scrollIntoView(),id); await p.waitForTimeout(1500)
    await p.screenshot({path:`/tmp/${tag}_${id}.png`})
  }
  await p.evaluate(()=>document.getElementById('lab').scrollIntoView()); await p.waitForTimeout(600)
  await p.evaluate(()=>window.scrollBy(0,260)); await p.waitForTimeout(500)
  await p.locator('.reel-btn.next').click(); await p.waitForTimeout(450); await p.screenshot({path:`/tmp/${tag}_shutter.png`}); await p.waitForTimeout(1500); await p.screenshot({path:`/tmp/${tag}_lab2.png`})
  const beat = await p.evaluate(()=>{const e=document.querySelector('.beat');return e.offsetTop}); await p.evaluate(t=>scrollTo(0,t),beat); await p.waitForTimeout(1500); await p.screenshot({path:`/tmp/${tag}_beat.png`})
  console.log(tag,'errs',errs); await p.close()
}
await run(1440,850,'d'); await run(390,844,'m'); await b.close()
