import { chromium, Browser, Page } from 'playwright';

interface ScraperOptions {
  waitForSelector?: string;
  timeout?: number;
  screenshot?: boolean;
  screenshotPath?: string;
}

interface ScraperResult {
  url: string;
  title: string;
  content: string;
  html: string;
  timestamp: Date;
  screenshot?: string;
}

export async function scraper(
  url: string, 
  options: ScraperOptions = {}
): Promise<ScraperResult> {
  const {
    waitForSelector = 'body',
    timeout = 10000,
    screenshot = false,
    screenshotPath = 'screenshot.png'
  } = options;

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // Launch browser
    browser = await chromium.launch({
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
    page = await browser.newPage();

    // Set viewport and user agent
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
 await page.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        route.abort();
      } else {
        route.continue();
      }
    });
    // Navigate to the URL
    await page.goto(url, { 
      waitUntil: 'networkidle',
     
    });

    // Wait for specific selector if provided
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: timeout });
    }

    // Extract content
    const [title, content, html] = await Promise.all([
      page.title(),
      page.evaluate(() => {
        // Remove script and style tags, get clean text
        const scripts = document.querySelectorAll('script, style, nav, footer, header');
        scripts.forEach(el => el.remove());
        return document.body?.innerText?.replace(/\s+/g, ' ').trim() || '';
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

  } catch (error) {
    throw new Error(`Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // Clean up
    if (page) {
      await page.close();
    }
    if (browser) {
      await browser.close();
    }
  }
}
