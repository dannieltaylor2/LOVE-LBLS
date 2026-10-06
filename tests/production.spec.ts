import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('every information control opens readable, keyboard-dismissable content', async ({ page }) => {
  await page.goto('/');
  for (const id of ['faq', 'shipping', 'contact', 'terms', 'privacy']) {
    const control = page.locator(`[data-info="${id}"]`);
    await control.click();
    await expect(page.locator('#info-dialog')).toBeVisible();
    await expect(page.locator('#info-title')).not.toBeEmpty();
    const result = await new AxeBuilder({ page })
      .include('#info-dialog')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(result.violations).toEqual([]);
    if (id === 'faq') {
      await page.getByText('How do I apply the label?', { exact: true }).click();
      await expect(page.locator('details').nth(1)).toHaveAttribute('open', '');
    }
    await page.keyboard.press('Escape');
    await expect(control).toBeFocused();
  }
  await expect(page.locator('[data-info="instagram"]')).toHaveCount(0);
});

test('skip link, keyboard form flow and every artwork choice remain usable', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  await page.locator('#recipient').focus();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.type('Production proof');
  await page.keyboard.press('Tab');
  await expect(page.locator('#age')).toBeFocused();
  for (const design of ['birthday', 'name-day', 'friends', 'anniversary']) {
    await page.locator(`[data-design-option="${design}"]`).click();
    await expect(page.locator('.live-can .label-artwork')).toHaveAttribute('data-design', design);
    await expect(page.locator(`[data-design-option="${design}"]`)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  }
  for (const angle of ['-30', '0', '30']) {
    await page.locator(`[data-angle="${angle}"]`).click();
    await expect(page.locator('#can-angle')).toHaveValue(angle);
  }
  await page.locator('.preview-button').click();
  await expect(page.locator('#summary-name')).toHaveText('Production proof');
});

test('touch navigation, reveal and preview work without hover', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto('/');
  await page.locator('.hero-product').tap();
  await expect(page.locator('.hero-product')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.menu-toggle').tap();
  await page.locator('#mobile-menu a[href="#occasions"]').tap();
  await page.locator('.occasion-trigger').nth(2).tap();
  await expect(page.locator('#occasion-panel-2')).toBeVisible();
  await page.locator('#occasion-panel-2 a').tap();
  await page.locator('#recipient').fill('Touch proof');
  await page.locator('.preview-button').tap();
  await expect(page.locator('#summary-name')).toHaveText('Touch proof');
  await page.locator('[aria-label="Close design preview"]').tap();
  await expect(page.locator('#design-preview')).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await context.close();
});

test('long and wide personalized text fits the printed face', async ({ page }) => {
  await page.goto('/#personalize');
  await page.locator('#recipient').fill('漢字漢字漢字漢字漢字漢字漢字漢字漢字漢字漢字漢字');
  await page.locator('#message').fill('W'.repeat(80));
  for (const selector of ['[data-label-name]', '[data-label-message]']) {
    const width = await page
      .locator('.live-can ' + selector)
      .evaluate((el: SVGTextElement) => el.getComputedTextLength());
    expect(width).toBeLessThanOrEqual(351);
  }
});
