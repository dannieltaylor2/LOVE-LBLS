import { test, expect, type Page } from '@playwright/test';

async function settle(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}
async function seek(page: Page, y: number) {
  await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), y);
  await settle(page);
}
async function matrices(page: Page) {
  return page.evaluate(() =>
    ['.motion-can-body', '.motion-label-surface']
      .map((selector) => {
        const el = document.querySelector<HTMLElement>(selector)!;
        return Array.from(new DOMMatrix(getComputedStyle(el).transform).toFloat64Array());
      })
      .flat(),
  );
}

test('forward and reverse scroll reconstruct identical object poses, including rapid jumps', async ({
  page,
}) => {
  await page.goto('/');
  await page.waitForTimeout(350);
  await page.evaluate(() => {
    (window as any).__physical = [
      document.querySelector('.hero-can'),
      document.querySelector('.motion-label-surface .label-artwork'),
    ];
  });
  const stops = await page.evaluate(() => {
    const selectors = [
      '.hero-scroll',
      '.travel-origin',
      '.story-can-target',
      '.unwrap-scroll',
      '.process-print',
      '.personalizer',
      '.final-product',
    ];
    return [
      0,
      ...selectors.map((selector) => {
        const r = document.querySelector(selector)!.getBoundingClientRect();
        return Math.max(0, r.top + scrollY + r.height / 2 - innerHeight / 2);
      }),
    ].sort((a, b) => a - b);
  });
  const forward: number[][] = [];
  for (const y of stops) {
    await seek(page, y);
    forward.push(await matrices(page));
  }
  for (let i = stops.length - 1; i >= 0; i--) {
    await seek(page, stops[i]);
    const reverse = await matrices(page);
    reverse.forEach((value, j) => expect(Math.abs(value - forward[i][j])).toBeLessThan(0.1));
  }
  await page.mouse.wheel(0, 100000);
  await settle(page);
  await page.mouse.wheel(0, -100000);
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect(
    await page.evaluate(
      () =>
        (window as any).__physical[0] === document.querySelector('.hero-can') &&
        (window as any).__physical[1] ===
          document.querySelector('.motion-label-surface .label-artwork'),
    ),
  ).toBe(true);
  await expect(page.locator('.motion-product-stage')).toHaveCount(1);
  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
});

test('real wheel scrolling traverses and reverses the complete story without overflow or invalid transforms', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto('/');
  await page.waitForTimeout(300);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (const direction of [1, -1]) {
    for (let step = 0; step < Math.ceil(max / 450) + 2; step++) {
      await page.mouse.wheel(0, 450 * direction);
      await page.waitForTimeout(30);
      const state = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        invalid: [
          ...document.querySelectorAll<HTMLElement>('.motion-can-body, .motion-label-surface'),
        ].some((el) => /NaN|Infinity/.test(el.style.transform)),
        count: document.querySelectorAll('.motion-product-stage').length,
      }));
      expect(state).toEqual({ overflow: false, invalid: false, count: 1 });
    }
  }
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect(errors).toEqual([]);
});

test('desktop continuity tears down cleanly for mobile and reduced motion, then rebuilds once', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#personalize').scrollIntoViewIfNeeded();
  await page.locator('#recipient').fill('Motion proof');
  for (const width of [1920, 390, 1440, 768, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.waitForTimeout(220);
    await expect(page.locator('.motion-product-stage')).toHaveCount(width > 900 ? 1 : 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await expect(page.locator('.hero-can')).toHaveCount(1);
    if (width <= 900) {
      await expect(page.locator('.hero-stage')).toHaveCSS('position', 'relative');
      await expect(page.locator('.unwrap-stage')).toHaveCSS('position', 'relative');
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(200);
  await expect(page.locator('.motion-product-stage')).toHaveCount(0);
  await expect(page.locator('.hero-can .label-artwork')).toHaveCount(1);
  await expect(page.locator('.unwrapped-label .flat-art--back')).toHaveCount(1);
  await expect(page.locator('.unwrapped-label')).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForTimeout(200);
  await expect(page.locator('.motion-product-stage')).toHaveCount(1);
  await page
    .locator('.personalizer')
    .evaluate((el) =>
      scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' }),
    );
  await settle(page);
  await expect(page.locator('.motion-label-surface [data-label-name]')).toHaveText('MOTION PROOF');
  await page.locator('#can-angle').fill('25');
  await expect(page.locator('.motion-label-surface')).toHaveAttribute('style', /rotateY\(25deg\)/);
});

test('personalized artwork is synchronized in the studio and survives reverse storytelling', async ({
  page,
}) => {
  await page.goto('/#personalize');
  await page.waitForTimeout(300);
  await page.locator('#recipient').fill('Elena');
  await page.locator('#message').fill('The same physical label');
  await expect(page.locator('.motion-label-surface [data-label-name]')).toHaveText('ELENA');
  await seek(page, 0);
  await expect(page.locator('.motion-label-surface [data-label-name]')).toHaveText('CHRISTOPHER');
  await page
    .locator('#personalize')
    .evaluate((el) =>
      scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' }),
    );
  await settle(page);
  await expect(page.locator('.motion-label-surface [data-label-name]')).toHaveText('ELENA');
  await expect(page.locator('.motion-label-surface [data-label-message]')).toHaveText(
    'THE SAME PHYSICAL LABEL',
  );
});

test('mobile unwrap keeps one label and reverses cleanly; short viewports avoid desktop pinning', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForTimeout(250);
  await expect(page.locator('.local-label-surface .label-artwork')).toHaveCount(1);
  const positions = await page.locator('.unwrap-stage').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return [r.top + scrollY - innerHeight * 0.65, r.bottom + scrollY - innerHeight * 0.65];
  });
  await seek(page, positions[0]);
  const before = await page.locator('.local-label-surface').getAttribute('style');
  await seek(page, positions[1]);
  await expect(page.locator('.local-label-surface .motion-label-back')).toHaveCSS('opacity', '1');
  await expect(page.locator('.unwrapped-label')).toHaveCSS('opacity', '0');
  await seek(page, positions[0]);
  expect(await page.locator('.local-label-surface').getAttribute('style')).toBe(before);
  await page.setViewportSize({ width: 1440, height: 520 });
  await page.waitForTimeout(250);
  await expect(page.locator('.motion-product-stage')).toHaveCount(0);
  await expect(page.locator('.unwrap-stage')).toHaveCSS('position', 'relative');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.local-label-surface')).toHaveCount(0);
  await expect(page.locator('.unwrap-can .label-artwork')).toHaveCount(1);
  await expect(page.locator('.unwrapped-label .flat-art--back')).toHaveCount(1);
});
