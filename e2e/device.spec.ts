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

test('desktop with mouse has no confirm and cancel buttons', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Название задачи' }).fill('Черновик');

  await expect(page.getByRole('button', { name: 'Подтвердить' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Отмена' })).toHaveCount(0);
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

test.describe('confirm and cancel buttons on a touch device', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('are shown only while the input is active, confirm adds a todo, cancel clears the input', async ({
    page,
  }) => {
    await page.goto('/');

    const input = page.getByRole('textbox', { name: 'Название задачи' });
    const confirm = page.getByRole('button', { name: 'Подтвердить' });
    const cancel = page.getByRole('button', { name: 'Отмена' });

    await expect(confirm).toHaveCount(0);

    await input.fill('   ');
    await expect(confirm).toBeDisabled();

    await input.fill('Новая через кнопку');
    await expect(confirm).toBeEnabled();
    await confirm.tap();

    await expect(page.getByRole('checkbox', { name: 'Новая через кнопку' })).toBeVisible();
    await expect(input).toHaveValue('');
    await expect(confirm).toHaveCount(0);

    await input.fill('Отменённый текст');
    await cancel.tap();

    await expect(input).toHaveValue('');
    await expect(page.getByText('Отменённый текст')).toHaveCount(0);
    await expect(cancel).toHaveCount(0);
  });

  test('confirm saves an edited todo', async ({ page }) => {
    await page.goto('/');

    const input = page.getByRole('textbox', { name: 'Название задачи' });

    await input.fill('Старое');
    await input.press('Enter');
    await page.getByRole('button', { name: 'Редактировать задачу' }).tap();
    await input.fill('Новое');
    await page.getByRole('button', { name: 'Подтвердить' }).tap();

    await expect(page.getByRole('checkbox', { name: 'Новое' })).toBeVisible();
    await expect(input).toHaveValue('');
  });

  test('keeps the clear icon on the left and the actions on the right', async ({ page }) => {
    await page.goto('/');

    const input = page.getByRole('textbox', { name: 'Название задачи' });

    await input.fill('Готовая');
    await input.press('Enter');
    await page.getByRole('checkbox', { name: 'Готовая' }).check();
    await input.fill('Черновик');

    const clear = await page.getByRole('button', { name: 'Удалить завершённые' }).boundingBox();
    const confirm = await page.getByRole('button', { name: 'Подтвердить' }).boundingBox();

    expect(clear?.x).toBeLessThan(confirm?.x ?? 0);
  });
});

test.describe('toolbar space on a touch device', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('does not shift the input when confirm and cancel buttons appear', async ({ page }) => {
    await page.goto('/');

    const input = page.getByRole('textbox', { name: 'Название задачи' });
    const initialBox = await input.boundingBox();

    await input.fill('Черновик');
    await expect(page.getByRole('button', { name: 'Подтвердить' })).toBeVisible();

    expect(await input.boundingBox()).toEqual(initialBox);

    await input.fill('');
    await expect(page.getByRole('button', { name: 'Подтвердить' })).toHaveCount(0);

    expect(await input.boundingBox()).toEqual(initialBox);
  });
});
