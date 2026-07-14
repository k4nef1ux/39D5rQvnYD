import { chromium, devices } from 'playwright';
const SC = '/tmp/claude-0/-home-user/ee011e31-65e1-5246-91ca-a0e149ff7211/scratchpad';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell' });
const phone = devices['iPhone 13'];

async function audit(name, base) {
  const ctx = await browser.newContext({ ...phone });
  const page = await ctx.newPage();
  const r = { name };
  await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 30000 }).catch(e => r.err = String(e).slice(0,80));
  await page.waitForTimeout(800);
  const allow = page.locator('.consent button', { hasText: 'allow' });
  if (await allow.count()) { await allow.first().click(); await page.waitForTimeout(400); }
  // 1. horizontal overflow?
  r.hscroll = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  // 2. menu button present? open it
  const toggle = page.locator('.nav-toggle');
  r.menuButton = await toggle.isVisible().catch(() => false);
  if (r.menuButton) {
    await toggle.click(); await page.waitForTimeout(400);
    const menu = page.locator('.nav-menu.open');
    r.menuOpens = await menu.isVisible().catch(() => false);
    if (r.menuOpens) {
      const box = await menu.boundingBox();
      r.menuHeight = Math.round(box?.height ?? 0);
      r.menuBottomOffscreen = Math.round((box.y + box.height) - phone.viewport.height);
      // can the last item be tapped? check last link visibility in viewport
      const links = menu.locator('a');
      r.menuItems = await links.count();
      const last = links.nth(r.menuItems - 1);
      const lb = await last.boundingBox();
      r.lastItemBelowFold = lb ? lb.y + lb.height > phone.viewport.height : null;
      // is the menu scrollable?
      r.menuScrollable = await menu.evaluate(el => getComputedStyle(el).overflowY);
      await page.screenshot({ path: `${SC}/${name}-menu.png` });
      await toggle.click(); await page.waitForTimeout(300);
    }
  }
  // 3. swipe right on home -> drawer?
  await page.goto(base + '/', { waitUntil: 'networkidle' }); await page.waitForTimeout(500);
  await page.touchscreen.tap(10, 400); // ensure touch works
  const swipe = async (x1, x2) => {
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x1, y: 400 }] });
    for (let x = x1; x2 > x1 ? x <= x2 : x >= x2; x += (x2 > x1 ? 30 : -30))
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: 400 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await cdp.detach();
  };
  await swipe(6, 220); await page.waitForTimeout(600);
  r.drawerOnSwipe = await page.locator('.nav-drawer.show').isVisible().catch(() => false);
  await page.screenshot({ path: `${SC}/${name}-drawer.png` });
  await ctx.close();
  return r;
}

console.log(JSON.stringify(await audit('findshq', 'http://localhost:3000'), null, 1));
console.log(JSON.stringify(await audit('q1rk', 'https://q1rk.com'), null, 1));
await browser.close();
