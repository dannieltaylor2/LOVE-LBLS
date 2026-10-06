import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

test('all navigation targets exist and the site loads without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/LOVE LABELS/);
  await expect(page.locator('h1')).toContainText('FAVORITE GIFT');
  const missing = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) =>
      links.map((l) => l.getAttribute('href')!).filter((h) => !document.querySelector(h)),
    );
  expect(missing).toEqual([]);
  await expect(page.locator('.design-display')).toHaveCount(4);
  await page.locator('.story-main-image img').scrollIntoViewIfNeeded();
  await expect(page.locator('.story-main-image img')).toHaveJSProperty('complete', true);
  expect(
    await page
      .locator('.story-main-image img')
      .evaluate((img: HTMLImageElement) => img.naturalWidth),
  ).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('the label updates, persists and exports a safe personalized SVG', async ({ page }) => {
  await page.goto('/#personalize');
  await page.locator('#recipient').fill('Anna <3');
  await page.locator('#age').fill('30');
  await page.locator('#message').fill('Same time. Next lifetime.');
  await page.getByRole('button', { name: 'Rose label', exact: true }).click();
  await expect(page.locator('.live-can [data-label-name]')).toHaveText('ANNA <3');
  await expect(page.locator('.live-can [data-label-age]')).toHaveText('30');
  await expect(page.locator('#personalizer-status')).toContainText('saved');
  await page.reload();
  await expect(page.locator('#recipient')).toHaveValue('Anna <3');
  await page.locator('.preview-button').click();
  await expect(page.locator('#design-preview')).toBeVisible();
  await expect(page.locator('#summary-name')).toHaveText('Anna <3');
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#download-design').click();
  const download = await downloadEvent;
  const contents = await readFile((await download.path())!, 'utf8');
  expect(contents).toContain('ANNA &lt;3');
  expect(contents).toContain('#e980a1');
  expect(contents).not.toContain('var(--');
  expect(contents).not.toContain('art-name-day');
  expect(contents).toContain('data:image/webp;base64,');
  expect(contents).not.toContain('/images/products/label-artwork.webp');
  const parserError = await page.evaluate(
    (svg) =>
      new DOMParser().parseFromString(svg, 'image/svg+xml').querySelector('parsererror')
        ?.textContent,
    contents,
  );
  expect(parserError).toBeUndefined();
  await page.keyboard.press('Escape');
  await expect(page.locator('#design-preview')).not.toBeVisible();
  await expect(page.locator('.preview-button')).toBeFocused();
});

test('occasion and gallery choices update the studio and angle controls work', async ({ page }) => {
  await page.goto('/#designs');
  await page.locator('.design-display--3 .design-arrow').click();
  await expect(page.locator('#occasion')).toHaveValue('friends');
  await expect(page.locator('.live-can .label-artwork')).toHaveAttribute('data-design', 'friends');
  await page.locator('#occasion').selectOption('wedding');
  await expect(page.locator('.live-can .label-artwork')).toHaveAttribute(
    'data-design',
    'anniversary',
  );
  await page.locator('[data-angle="30"]').click();
  await expect(page.locator('#can-angle')).toHaveValue('30');
  await expect(page.locator('[data-angle="30"]')).toHaveAttribute('aria-pressed', 'true');
});

test('photo uploads stay local, are exported and can be removed', async ({ page }) => {
  await page.goto('/#personalize');
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.method() !== 'GET') requests.push(request.url());
  });
  await page.locator('#photo').setInputFiles('public/images/lifestyle/gift-placeholder.webp');
  await expect(page.locator('#personalizer-status')).toContainText('Photo added');
  await expect(page.locator('.live-can [data-label-photo]')).toHaveAttribute(
    'href',
    /^data:image\/jpeg;base64,/,
  );
  await page.locator('.preview-button').click();
  const event = page.waitForEvent('download');
  await page.locator('#download-design').click();
  const file = await event;
  expect(await readFile((await file.path())!, 'utf8')).toContain('data:image/jpeg;base64,');
  await page.keyboard.press('Escape');
  await page.locator('#remove-photo').click();
  await expect(page.locator('.live-can [data-label-photo]')).not.toHaveAttribute('href');
  expect(requests).toEqual([]);
});

test('invalid files and invalid ages do not silently pass', async ({ page }) => {
  await page.goto('/#personalize');
  await page.locator('#photo').setInputFiles({
    name: 'unsafe.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg/>'),
  });
  await expect(page.locator('#personalizer-status')).toContainText('Choose a JPG');
  await page.locator('#age').fill('999');
  await page.locator('.preview-button').click();
  await expect(page.locator('#design-preview')).not.toBeVisible();
  expect(
    await page.locator('#age').evaluate((e: HTMLInputElement) => e.validity.rangeOverflow),
  ).toBe(true);
});

test('mobile menu, tap-to-preview occasions and dialogs are keyboard accessible', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('.menu-toggle').click();
  await expect(page.locator('#mobile-menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.menu-toggle')).toBeFocused();
  await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false');
  await page.locator('.menu-toggle').click();
  await page.locator('#mobile-menu a[href="#occasions"]').click();
  await expect(page.locator('#mobile-menu')).not.toBeVisible();
  const trigger = page.locator('.occasion-trigger').first();
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#occasion-panel-0')).toBeVisible();
  await page.locator('#occasion-panel-0 a').click();
  await expect(page.locator('#occasion')).toHaveValue('birthday');
});

test('keyboard and pointer reveal the hero label', async ({ page }) => {
  await page.goto('/');
  const product = page.locator('.hero-product');
  await product.focus();
  await page.keyboard.press('Enter');
  await expect(product).toHaveAttribute('aria-pressed', 'true');
  expect(
    await page
      .locator('.hero-can')
      .evaluate((el: HTMLElement) => el.style.getPropertyValue('--reveal-radius')),
  ).toBe('900px');
  await page.keyboard.press('Enter');
  const box = (await product.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await expect
    .poll(() =>
      page
        .locator('.hero-can')
        .evaluate((el: HTMLElement) => el.style.getPropertyValue('--reveal-radius')),
    )
    .toBe('130px');
});

test('one gallery object travels into the story, and the label unrolls', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    (window as any).__traveler = document.querySelector('.traveler');
  });
  await page.locator('.story-can-target').evaluate((el) =>
    window.scrollTo({
      top: el.getBoundingClientRect().top + scrollY + el.clientHeight / 2 - innerHeight / 2,
      behavior: 'instant',
    }),
  );
  await page.waitForTimeout(1000);
  const continuity = await page.evaluate(() => {
    const can = document.querySelector('.traveler')!;
    const target = document.querySelector('.story-can-target')!;
    const a = can.getBoundingClientRect(),
      b = target.getBoundingClientRect();
    return {
      same: can === (window as any).__traveler,
      dx: Math.abs(a.x + a.width / 2 - b.x - b.width / 2),
      dy: Math.abs(a.y + a.height / 2 - b.y - b.height / 2),
    };
  });
  expect(continuity.same).toBe(true);
  expect(continuity.dx).toBeLessThan(25);
  expect(continuity.dy).toBeLessThan(25);
  await page.locator('.unwrap-scroll').evaluate((el) =>
    window.scrollTo({
      top: el.getBoundingClientRect().bottom + scrollY - innerHeight,
      behavior: 'instant',
    }),
  );
  await page.waitForTimeout(1000);
  await expect(page.locator('.unwrapped-label')).toHaveCSS('opacity', '1');
  await expect(page.locator('.unwrap-can .can-label-layer')).toHaveCSS('opacity', '0');
  await expect(page.locator('.label-curl')).toHaveCSS('opacity', '0');
});

test('reduced motion retains visible content and a usable studio', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.hero-text')).toBeVisible();
  await expect(page.locator('.hero-can .can-label-layer')).toHaveCSS('mask-image', 'none');
  await expect(page.locator('.story-fallback')).toHaveCSS('visibility', 'visible');
  await expect(page.locator('.unwrapped-label')).toHaveCSS('opacity', '1');
  await page.locator('#recipient').fill('Sophie');
  await page.locator('.preview-button').click();
  await expect(page.locator('#summary-name')).toHaveText('Sophie');
});

test('enquiries download honestly and stored designs can be cleared', async ({ page }) => {
  await page.goto('/#contact');
  await page.locator('[data-info="contact"]').click();
  await page.locator('#enquiry-name').fill('Taylor');
  await page.locator('#enquiry-email').fill('taylor@example.com');
  await page.locator('#enquiry-message').fill('Twenty labels for a birthday.');
  const event = page.waitForEvent('download');
  await page.locator('#enquiry-form button[type="submit"]').click();
  const file = await event;
  expect(await readFile((await file.path())!, 'utf8')).toContain('It has not been submitted');
  await page.keyboard.press('Escape');
  await page.locator('#recipient').fill('Personal draft');
  await expect(page.locator('#personalizer-status')).toContainText('saved');
  await page.locator('[data-info="privacy"]').click();
  await page.locator('#clear-design').click();
  expect(await page.evaluate(() => localStorage.getItem('love-labels:design:v1'))).toBeNull();
  await page.keyboard.press('Escape');
  await expect(page.locator('#recipient')).toHaveValue('Christopher');
});

for (const width of [2560, 1920, 1440, 1366, 1024, 768, 430, 390, 360]) {
  test(`no overflow or lost content after resize at ${width}px`, async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width, height: width > 1440 ? 1440 : 900 });
    await page.locator('#personalize').scrollIntoViewIfNeeded();
    await page.setViewportSize({ width: width === 390 ? 1440 : 390, height: 900 });
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await expect(page.locator('.live-can')).toBeVisible();
    await expect(page.locator('#recipient')).toBeVisible();
    await expect(page.locator('.unwrapped-label')).toBeAttached();
  });
}

test('main page and preview meet automated WCAG A/AA checks', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const main = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(main.violations).toEqual([]);
  await page.locator('.preview-button').click();
  await expect(page.locator('#design-preview')).toBeVisible();
  const modal = await new AxeBuilder({ page })
    .include('#design-preview')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(modal.violations).toEqual([]);
});

test('mobile accessibility stays intact through the long page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#occasions').scrollIntoViewIfNeeded();
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(result.violations).toEqual([]);
});
