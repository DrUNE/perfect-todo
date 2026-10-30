import { expect, test } from '@playwright/test';
import { markDone, newTodoInput, todoRow, waitForAnimations } from './helpers.js';

// По умолчанию Playwright скрывает полосы прокрутки, поэтому включаем обычные, чтобы они занимали место.
test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } });

test('scrolls the whole page and keeps only the input stuck to the top', async ({ page }) => {
  await page.goto('/');

  const input = newTodoInput(page);
  const themeSwitcher = page.getByRole('radiogroup', { name: 'Тема приложения' });
  const initialBox = await input.boundingBox();

  for (let index = 1; index <= 15; index++) {
    await input.fill(`Задача ${index}`);
    await input.press('Enter');
    await expect(todoRow(page, `Задача ${index}`)).toBeVisible();
  }

  await expect(themeSwitcher).toBeInViewport();
  // Новые задачи сверху, поэтому самая старая оказывается внизу списка.
  await expect(todoRow(page, 'Задача 1')).not.toBeInViewport();

  await page.mouse.move(640, 400);
  await page.mouse.wheel(0, 3000);

  await expect(todoRow(page, 'Задача 1')).toBeInViewport();
  await expect(todoRow(page, 'Задача 15')).not.toBeInViewport();
  await expect(themeSwitcher).not.toBeInViewport();
  await expect(input).toBeInViewport({ ratio: 1 });

  const stuckBox = await input.boundingBox();

  expect(stuckBox?.x).toBe(initialBox?.x);
  expect(stuckBox?.y).toBeLessThan(initialBox?.y ?? 0);
  // Закрепляется вся полоса: отступ 16px, постоянная панель действий (34px + 8px) и строка ввода.
  expect(stuckBox?.y).toBeLessThanOrEqual(16 + 34 + 8 + 24);
});

test('does not shift the input and the list when toolbar buttons appear and disappear', async ({
  page,
}) => {
  await page.goto('/');

  const input = newTodoInput(page);

  await input.fill('Задача');
  await input.press('Enter');

  const row = todoRow(page, 'Задача');
  const clearButton = page.getByRole('button', { name: 'Удалить завершённые' });

  await waitForAnimations(page);

  const inputBox = await input.boundingBox();
  const rowBox = await row.boundingBox();
  // Ширина поля зависит от фокуса (без фокуса AdwEntryRow показывает значок карандаша), поэтому сравниваем положение и высоту.
  const position = (box: typeof inputBox) => ({ x: box?.x, y: box?.y, height: box?.height });

  await expect(clearButton).toHaveCount(0);
  await markDone(page, 'Задача');
  await expect(clearButton).toBeVisible();
  await waitForAnimations(page);

  expect(position(await input.boundingBox())).toEqual(position(inputBox));
  expect(await row.boundingBox()).toEqual(rowBox);

  await clearButton.click();
  await expect(clearButton).toHaveCount(0);

  await input.fill('Ещё задача');
  await input.press('Enter');
  await expect(todoRow(page, 'Ещё задача')).toBeVisible();
  await waitForAnimations(page);

  expect(position(await input.boundingBox())).toEqual(position(inputBox));
});
