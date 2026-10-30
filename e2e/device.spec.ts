import { expect, test } from '@playwright/test';

test.describe('desktop with mouse', () => {
  test('is not mobile, has no touch and has a mouse', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');

    await expect(html).toHaveAttribute('data-mobile', 'false');
    await expect(html).toHaveAttribute('data-touch', 'false');
    await expect(html).toHaveAttribute('data-mouse', 'true');
  });

  test('reacts to a narrow window', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 400, height: 700 });

    const html = page.locator('html');

    await expect(html).toHaveAttribute('data-compact', 'true');
    await expect(html).toHaveAttribute('data-mobile', 'false');
  });
});

test.describe('touch-only mobile device', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('detects mobile touch screen and cancels editing with a button', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');

    await expect(html).toHaveAttribute('data-mobile', 'true');
    await expect(html).toHaveAttribute('data-compact', 'true');
    await expect(html).toHaveAttribute('data-touch', 'true');
    await expect(html).toHaveAttribute('data-mouse', 'false');

    const input = page.getByRole('textbox', { name: 'Название задачи' });

    await input.fill('Задача');
    await input.press('Enter');
    await expect(page.getByRole('button', { name: 'Отмена' })).toHaveCount(0);

    await page.getByRole('button', { name: 'Редактировать задачу' }).tap();
    await input.fill('Несохранённое название');
    await page.getByRole('button', { name: 'Отмена' }).tap();

    await expect(input).toHaveValue('');
    await expect(page.getByRole('button', { name: 'Отмена' })).toHaveCount(0);
    await expect(page.getByRole('checkbox', { name: 'Задача' })).toBeVisible();
  });
});

test.describe('unfolded foldable smartphone', () => {
  test.use({ viewport: { width: 880, height: 920 }, hasTouch: true, isMobile: true });

  test('stays a touch device on a wide screen and offers the cancel button', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');

    await expect(html).toHaveAttribute('data-mobile', 'true');
    await expect(html).toHaveAttribute('data-compact', 'false');
    await expect(html).toHaveAttribute('data-touch', 'true');
    await expect(html).toHaveAttribute('data-mouse', 'false');

    const input = page.getByRole('textbox', { name: 'Название задачи' });

    await input.fill('Задача');
    await input.press('Enter');
    await page.getByRole('button', { name: 'Редактировать задачу' }).tap();

    await expect(page.getByRole('button', { name: 'Отмена' })).toBeVisible();
  });
});
