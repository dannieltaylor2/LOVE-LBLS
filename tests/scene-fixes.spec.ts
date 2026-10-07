import { test, expect } from '@playwright/test';
for (const [width, height] of [
  [1366, 648],
  [1280, 600],
  [1920, 1080],
  [390, 844],
  [360, 800],
]) {
  test(`collection and completed unwrap fit at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.locator('#designs').evaluate((e) => e.scrollIntoView());
    await page.waitForTimeout(250);
    for (const sel of [
      '#collection-heading',
      '.collection .section-intro',
      ...Array.from({ length: 4 }, (_, i) => `.design-display--${i + 1} .design-caption`),
    ]) {
      const r = await page.locator(sel).boundingBox();
      expect(r!.y).toBeGreaterThanOrEqual(64);
      expect(r!.y + r!.height).toBeLessThanOrEqual(height);
    }
    if (width > 900) {
      await page
        .locator('.unwrap-scroll')
        .evaluate((e) =>
          scrollTo(
            0,
            e.getBoundingClientRect().top + scrollY + (e.clientHeight - innerHeight) * 0.85,
          ),
        );
      await page.waitForTimeout(180);
      await expect(page.locator('.motion-label-back')).toHaveCSS('opacity', '1');
      for (const sel of ['.motion-label-surface', '.motion-label-back']) {
        const r = await page.locator(sel).boundingBox();
        expect(r!.y).toBeGreaterThan(72);
        expect(r!.y + r!.height).toBeLessThan(height - 60);
        expect(r!.x + r!.width).toBeLessThan(width);
      }
      expect(
        await page.locator('#how-it-works').evaluate((e) => e.getBoundingClientRect().top),
      ).toBeGreaterThanOrEqual(height - 1);
    }
  });
}
test('returning to the hero clears a toggled reveal and restores cursor reveal on a short laptop viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 648 });
  await page.goto('/');
  const hero = page.locator('.hero-product');
  await hero.focus();
  await page.keyboard.press('Enter');
  await expect(hero).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#designs').evaluate((e) => e.scrollIntoView());
  await page.mouse.move(0, 0);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(200);
  await expect(hero).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.motion-label-surface')).toHaveCSS('opacity', '0');
  const a = await page.locator('.hero-text .hero-actions').boundingBox(),
    cue = await page.locator('.scroll-cue').boundingBox();
  expect(a!.y + a!.height).toBeLessThan(cue!.y - 15);
  const r = (await hero.boundingBox())!;
  await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
  await page.waitForTimeout(150);
  expect(
    await page
      .locator('.hero-can')
      .evaluate((e: HTMLElement) => e.style.getPropertyValue('--reveal-radius')),
  ).toBe('130px');
  await expect(page.locator('.motion-label-surface')).toHaveCSS('opacity', '1');
});
