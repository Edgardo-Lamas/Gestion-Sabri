import puppeteer from 'puppeteer';

try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('BROWSER ERROR:', msg.text());
        }
    });

    page.on('pageerror', err => {
        console.log('PAGE ERROR:', err.toString());
    });

    await page.goto('http://localhost:5173/Gestion-Sabri/', { waitUntil: 'networkidle0', timeout: 5000 }).catch(e => console.log(e.message));

    await browser.close();
} catch (e) {
    console.log('Script Error:', e.message);
}
