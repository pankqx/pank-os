import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs'
const b = await chromium.launch()
const [w,h]=[Number(process.argv[2]||390),Number(process.argv[3]||844)]
const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 })
const p = await ctx.newPage(); const errs=[]; p.on('pageerror', e=>errs.push(e.message))
await p.goto('http://localhost:5173/'); await p.waitForTimeout(2500); await p.screenshot({path:`/tmp/p_open.png`})
await p.waitForTimeout(7500); await p.screenshot({path:`/tmp/p_choice.png`})
await p.locator('button').filter({ hasText: /reenu/i }).first().click().catch(()=>{}); await p.waitForTimeout(3000)
const ids=['person','person-notes','prontopy','lab','transmissions','meet','contact']
for (const id of ids){ await p.evaluate(id=>{const e=document.getElementById(id); if(e){const hs=e.classList.contains('hscene'); scrollTo(0,e.getBoundingClientRect().top+scrollY+(hs? (e.offsetHeight-innerHeight)*(id==='meet'?0.99:0.55):0))}},id); await p.waitForTimeout(1600); await p.screenshot({path:`/tmp/p_${id}.png`}) }
const ov = await p.evaluate(()=>{const W=innerWidth; return [document.documentElement.scrollWidth, W, [...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect(); return r.right>W+2 && r.width>0 && !e.closest('.strip,.hscene,.marquee,.hobby-board,.snake-scroll,.fin-arrival,.fin-intro,.neurons,svg')}).slice(0,8).map(e=>e.className+':'+Math.round(e.getBoundingClientRect().right))]})
console.log(w,'overflow',ov,errs); await b.close()
