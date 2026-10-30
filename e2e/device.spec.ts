import { expect, test, type Page } from '@playwright/test';

const newTodoInput = (page: Page) => page.getByRole('textbox', { name: 'Новая задача' });

const addTodo = async (page: Page, title: string) => {
  await newTodoInput(page).fill(title);
  await newTodoInput(page).press('Enter');
  // Добавление применяется внутри View Transition, то есть чуть позже нажатия Enter.
  await expect(page.getByRole('checkbox', { name: title, exact: true })).toBeVisible();
};

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

  test('has no confirm and cancel buttons while typing a new todo', async ({ page }) => {
    await page.goto('/');
    await newTodoInput(page).fill('Черновик');

    await expect(page.getByRole('button', { name: 'Подтвердить' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Отмена' })).toHaveCount(0);
  });
});

test.describe('touch-only mobile device', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('is detected as a mobile touch screen', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');

    await expect(html).toHaveAttribute('data-mobile', 'true');
    await expect(html).toHaveAttribute('data-compact', 'true');
    await expect(html).toHaveAttribute('data-touch', 'true');
    await expect(html).toHaveAttribute('data-mouse', 'false');
  });

  test('does not show keyboard shortcut hints', async ({ page }) => {
    await page.goto('/');
    await newTodoInput(page).focus();

    await expect(page.getByRole('note', { name: 'Подсказка по горячим клавишам' })).toHaveCount(0);
  });

  test('shows confirm and cancel inside the new todo row only while it has text', async ({
    page,
  }) => {
    await page.goto('/');

    const input = newTodoInput(page);
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

  test('edits a todo in place with confirm and cancel buttons inside its row', async ({ page }) => {
    await page.goto('/');
    await addTodo(page, 'Старое');

    const editInput = page.getByRole('textbox', { name: 'Название задачи' });

    await page.getByRole('button', { name: 'Редактировать задачу' }).tap();
    await expect(editInput).toBeFocused();
    await editInput.fill('Несохранённое');
    await page.getByRole('button', { name: 'Отмена' }).tap();

    await expect(page.getByRole('checkbox', { name: 'Старое' })).toBeVisible();
    await expect(page.getByText('Несохранённое')).toHaveCount(0);

    await page.getByRole('button', { name: 'Редактировать задачу' }).tap();
    await editInput.fill('Новое');
    await page.getByRole('button', { name: 'Подтвердить' }).tap();

    await expect(page.getByRole('checkbox', { name: 'Новое' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Подтвердить' })).toHaveCount(0);
  });

  test('does not shift the new todo row when confirm and cancel buttons appear', async ({
    page,
  }) => {
    await page.goto('/');

    const input = newTodoInput(page);
    const initialBox = await input.boundingBox();

    await input.fill('Черновик');
    await expect(page.getByRole('button', { name: 'Подтвердить' })).toBeVisible();

    expect(await input.boundingBox()).toMatchObject({
      y: initialBox?.y,
      height: initialBox?.height,
    });

    await input.fill('');
    await expect(page.getByRole('button', { name: 'Подтвердить' })).toHaveCount(0);

    expect(await input.boundingBox()).toMatchObject({
      y: initialBox?.y,
      height: initialBox?.height,
    });
  });

  test('keeps the task action buttons always visible without hover', async ({ page }) => {
    await page.goto('/');
    await addTodo(page, 'Задача');

    await expect(page.getByRole('button', { name: 'Редактировать задачу' })).toHaveCSS(
      'opacity',
      '1',
    );

    await page.getByRole('checkbox', { name: 'Задача' }).tap();

    await expect(page.getByRole('button', { name: 'Удалить задачу' })).toHaveCSS('opacity', '1');
  });

  test('deletes a todo with the trash button and undoes it by the toast button', async ({
    page,
  }) => {
    await page.goto('/');
    await addTodo(page, 'Задача');
    await page.getByRole('checkbox', { name: 'Задача' }).tap();
    await page.getByRole('button', { name: 'Удалить задачу' }).tap();

    await expect(page.getByRole('checkbox')).toHaveCount(0);

    await page.getByRole('button', { name: 'Отменить' }).tap();

    await expect(page.getByRole('checkbox', { name: 'Задача' })).toBeVisible();
  });
});

test.describe('unfolded foldable smartphone', () => {
  test.use({ viewport: { width: 880, height: 920 }, hasTouch: true, isMobile: true });

  test('stays a touch device on a wide screen and shows confirm and cancel buttons', async ({
    page,
  }) => {
    await page.goto('/');

    const html = page.locator('html');

    await expect(html).toHaveAttribute('data-mobile', 'true');
    await expect(html).toHaveAttribute('data-compact', 'false');
    await expect(html).toHaveAttribute('data-touch', 'true');
    await expect(html).toHaveAttribute('data-mouse', 'false');

    await newTodoInput(page).fill('Задача');

    await expect(page.getByRole('button', { name: 'Подтвердить' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Отмена' })).toBeVisible();
  });
});
