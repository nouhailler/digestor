import { chromium } from 'playwright-core';
const exe = '/home/patrick/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome';
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const page = await (await browser.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2 })).newPage();
const content = JSON.stringify({ name: 'x', fodmapLevel: 'low', fodmaps: { fructose: 'low', lactose: 'low', fructans: 'low', gos: 'low', polyols: 'low' }, sibo: { verdict: 'favorable', note: 'ok' }, candida: { verdict: 'favorable', note: 'ok' }, summary: 's', tips: [] });
await page.route('**/api/v1/chat/completions', async (route) => {
  await new Promise((r) => setTimeout(r, 4000));
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ choices: [{ message: { content } }] }) });
});
await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Passer' }).click().catch(() => {});
await page.waitForSelector('text=Lundi 9 juin').catch(() => {});
await page.evaluate(async () => {
  const req = indexedDB.open('digestor'); await new Promise((res) => (req.onsuccess = res));
  const db = req.result;
  await new Promise((res) => { const tx = db.transaction('meta', 'readwrite'); tx.objectStore('meta').put({ key: 'aiConfig', value: { apiKey: 'sk-test', modelId: 'x:free' } }); tx.oncomplete = res; });
});
await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector('text=Lundi 9 juin').catch(() => {});
await page.locator('nav button', { hasText: 'Aliments' }).click();
await page.waitForTimeout(300);
await page.getByPlaceholder(/Rechercher un aliment/).fill('aliment test');
await page.waitForTimeout(300);
await page.getByRole('button', { name: /aliment test/ }).first().click();
await page.waitForTimeout(300);
await page.getByRole('button', { name: /Analyser avec/ }).click();
await page.waitForTimeout(2000);
await page.screenshot({ path: '/tmp/ai-running.png' }); // badge + sablier bouton
await page.getByRole('button', { name: 'Fermer' }).click().catch(() => {});
await page.locator('nav button', { hasText: 'Journal' }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: '/tmp/ai-running-other.png' }); // badge persiste
await page.waitForTimeout(2200);
await page.screenshot({ path: '/tmp/ai-done.png' }); // badge vert
await browser.close();
console.log('ok');
