import { expect, test } from '@playwright/test';

// По умолчанию Playwright скрывает полосы прокрутки, поэтому включаем обычные, чтобы они занимали место.
test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } });

test('scrolls the whole page and keeps only the input stuck to the top', async ({ page }) => {
  await page.goto('/');

  const input = page.getByRole('textbox', { name: 'Название задачи' });
  const themeSwitcher = page.getByRole('radiogroup', { name: 'Тема приложения' });
  const initialBox = await input.boundingBox();

  for (let index = 1; index <= 15; index++) {
    await input.fill(`Задача ${index}`);
    await input.press('Enter');
  }

  await expect(themeSwitcher).toBeInViewport();
  await expect(page.getByRole('checkbox', { name: 'Задача 15' })).not.toBeInViewport();

  await page.mouse.move(640, 400);
  await page.mouse.wheel(0, 3000);

  await expect(page.getByRole('checkbox', { name: 'Задача 15' })).toBeInViewport();
  await expect(page.getByRole('checkbox', { name: 'Задача 1', exact: true })).not.toBeInViewport();
  await expect(themeSwitcher).not.toBeInViewport();
  await expect(input).toBeInViewport({ ratio: 1 });

  const stuckBox = await input.boundingBox();

  expect(stuckBox?.x).toBe(initialBox?.x);
  expect(stuckBox?.y).toBeLessThan(initialBox?.y ?? 0);
  expect(stuckBox?.y).toBeLessThanOrEqual(16);
});
