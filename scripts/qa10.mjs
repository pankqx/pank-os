import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs'
const b = await chromium.launch({ args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader'] })
for (const fx of ['full','lite']) for (const ch of ['roman','reenu']) {
  const ctx = await b.newContext({ viewport: { width: 1900, height: 1000 } })
  await ctx.addInitScript(([fx,ch])=>{ localStorage.setItem('pankos.fx',fx); localStorage.setItem('pankos.character',ch) },[fx,ch])
  const p = await ctx.newPage(); const errs=[]; p.on('pageerror', e=>errs.push(e.message)); p.on('console', m=>{ if(m.type()==='error') errs.push(m.text()) })
  await p.goto('http://localhost:5173/'); await p.waitForTimeout(9800)
  await p.locator('button').filter({ hasText: new RegExp(ch,'i') }).first().click().catch(()=>{}); await p.waitForTimeout(2500)
  const broke = await p.evaluate(()=>document.body.innerText.includes('Something in the')); console.log(fx,ch,'broke',broke,errs.slice(0,3))
  await ctx.close()
}
await b.close()
