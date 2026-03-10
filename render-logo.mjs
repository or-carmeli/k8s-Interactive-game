import puppeteer from 'puppeteer';

/* Renders email-logo.png – centered text-only logo matching the original design */

const html = `<!DOCTYPE html>
<html><head><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width:960px; height:200px; overflow:hidden;
    background:#020817;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
  }
  .title {
    font-size:52px; font-weight:700; letter-spacing:-0.5px; line-height:1;
    margin:0 0 10px;
    color:#4ECDC4;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif;
  }
  .subtitle {
    font-size:18px; color:#64748b; letter-spacing:1.5px;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif;
  }
</style></head><body>
  <div class="title">KubeQuest</div>
  <div class="subtitle">Kubernetes Practice Platform</div>
</body></html>`;

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 960, height: 200, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.screenshot({ path: 'public/email-logo.png', clip: { x: 0, y: 0, width: 960, height: 200 } });
await browser.close();
console.log('Done: public/email-logo.png');
