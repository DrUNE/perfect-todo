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
  // Новые задачи сверху, поэтому самая старая оказывается внизу списка.
  await expect(page.getByRole('checkbox', { name: 'Задача 1', exact: true })).not.toBeInViewport();

  await page.mouse.move(640, 400);
  await page.mouse.wheel(0, 3000);

  await expect(page.getByRole('checkbox', { name: 'Задача 1', exact: true })).toBeInViewport();
  await expect(page.getByRole('checkbox', { name: 'Задача 15' })).not.toBeInViewport();
  await expect(themeSwitcher).not.toBeInViewport();
  await expect(input).toBeInViewport({ ratio: 1 });

  const stuckBox = await input.boundingBox();

  expect(stuckBox?.x).toBe(initialBox?.x);
  expect(stuckBox?.y).toBeLessThan(initialBox?.y ?? 0);
  // Закрепляется вся полоса: отступ 16px, постоянная панель действий (34px + 8px) и поле ввода.
  expect(stuckBox?.y).toBeLessThanOrEqual(16 + 34 + 8);
});

test('does not shift the input and the list when toolbar buttons appear and disappear', async ({
  page,
}) => {
  await page.goto('/');

  const input = page.getByRole('textbox', { name: 'Название задачи' });

  await input.fill('Задача');
  await input.press('Enter');

  const checkbox = page.getByRole('checkbox', { name: 'Задача' });
  const clearButton = page.getByRole('button', { name: 'Удалить завершённые' });
  const inputBox = await input.boundingBox();
  const checkboxBox = await checkbox.boundingBox();

  await expect(clearButton).toHaveCount(0);
  await checkbox.check();
  await expect(clearButton).toBeVisible();

  expect(await input.boundingBox()).toEqual(inputBox);
  expect(await checkbox.boundingBox()).toEqual(checkboxBox);

  await clearButton.click();
  await expect(clearButton).toHaveCount(0);

  await input.fill('Ещё задача');
  await input.press('Enter');

  expect(await input.boundingBox()).toEqual(inputBox);
});
