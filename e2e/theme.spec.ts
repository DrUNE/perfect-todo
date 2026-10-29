import { expect, test } from '@playwright/test';

test('switches light and dark themes and persists the selected theme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');

  const html = page.locator('html');

  await expect(html).toHaveAttribute('data-theme', 'light');
  await page.getByRole('radio', { name: 'Тёмная тема' }).locator('..').click();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(0, 0, 0)');

  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('radio', { name: 'Светлая тема' }).locator('..').click();
  await expect(html).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(245, 245, 245)');
});

test('follows the browser theme in system mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');

  const html = page.locator('html');

  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('radio', { name: 'Светлая тема' }).locator('..').click();
  await expect(html).toHaveAttribute('data-theme', 'light');

  await page.getByRole('radio', { name: 'Тема браузера' }).locator('..').click();
  await expect(html).toHaveAttribute('data-theme', 'dark');

  await page.emulateMedia({ colorScheme: 'light' });
  await expect(html).toHaveAttribute('data-theme', 'light');

  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(html).toHaveAttribute('data-theme', 'dark');
});
