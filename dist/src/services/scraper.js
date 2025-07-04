"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scraper = scraper;
const playwright_1 = require("playwright");
function scraper(url_1) {
    return __awaiter(this, arguments, void 0, function* (url, options = {}) {
        const { waitForSelector = 'body', timeout = 10000, screenshot = false, screenshotPath = 'screenshot.png' } = options;
        let browser = null;
        let page = null;
        try {
            // Launch browser
            browser = yield playwright_1.chromium.launch({
                headless: true,
                args: ['--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process', // For better resource usage
                    '--disable-background-timer-throttling',
                    '--disable-features=VizDisplayCompositor']
            });
            // Create a new page
            page = yield browser.newPage();
            // Set viewport and user agent
            yield page.setViewportSize({ width: 1920, height: 1080 });
            yield page.setExtraHTTPHeaders({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            });
            yield page.route('**/*', (route) => {
                const resourceType = route.request().resourceType();
                if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                    route.abort();
                }
                else {
                    route.continue();
                }
            });
            // Navigate to the URL
            yield page.goto(url, {
                waitUntil: 'networkidle',
            });
            // Wait for specific selector if provided
            if (waitForSelector) {
                yield page.waitForSelector(waitForSelector, { timeout: timeout });
            }
            // Extract content
            const [title, content, html] = yield Promise.all([
                page.title(),
                page.evaluate(() => {
                    var _a, _b;
                    // Remove script and style tags, get clean text
                    const scripts = document.querySelectorAll('script, style, nav, footer, header');
                    scripts.forEach(el => el.remove());
                    return ((_b = (_a = document.body) === null || _a === void 0 ? void 0 : _a.innerText) === null || _b === void 0 ? void 0 : _b.replace(/\s+/g, ' ').trim()) || '';
                }),
                screenshot ? page.content() : Promise.resolve('')
            ]);
            return {
                url,
                title,
                content,
                html,
                timestamp: new Date()
            };
        }
        catch (error) {
            throw new Error(`Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        finally {
            // Clean up
            if (page) {
                yield page.close();
            }
            if (browser) {
                yield browser.close();
            }
        }
    });
}
