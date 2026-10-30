import { expect, test, type Page } from '@playwright/test';

const newTodoInput = (page: Page) => page.getByRole('textbox', { name: 'Новая задача' });

// Ждём окончания анимаций (в том числе View Transition), чтобы измерять итоговое положение элементов.
const waitForAnimations = (page: Page) =>
  page.waitForFunction('document.getAnimations().length === 0');

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

  test('keeps the toolbar above the new todo row and shows the shortcuts button', async ({
    page,
  }) => {
    await page.goto('/');
    await addTodo(page, 'Задача');
    await page.getByRole('checkbox', { name: 'Задача' }).check();

    const clear = await page.getByRole('button', { name: 'Удалить завершённые' }).boundingBox();
    const input = await newTodoInput(page).boundingBox();

    expect(clear?.y).toBeLessThan(input?.y ?? 0);
    await expect(page.getByRole('button', { name: 'Горячие клавиши' })).toBeVisible();
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

  test('puts the toolbar at the bottom of the screen, within thumb reach', async ({ page }) => {
    await page.goto('/');
    await addTodo(page, 'Задача');
    await waitForAnimations(page);

    const input = newTodoInput(page);
    const initialBox = await input.boundingBox();

    await page.getByRole('checkbox', { name: 'Задача' }).tap();

    const clear = page.getByRole('button', { name: 'Удалить завершённые' });
    const clearBox = await clear.boundingBox();
    const viewportHeight = page.viewportSize()?.height ?? 0;

    await expect(clear).toBeVisible();
    // Кнопка у нижнего края окна и ниже всех строк, а поле ввода и список не сдвинулись.
    expect((clearBox?.y ?? 0) + (clearBox?.height ?? 0)).toBeGreaterThan(viewportHeight - 60);
    expect(clearBox?.y).toBeGreaterThan((initialBox?.y ?? 0) + (initialBox?.height ?? 0));
    expect(await input.boundingBox()).toMatchObject({ y: initialBox?.y });

    await clear.tap();

    await expect(page.getByRole('checkbox')).toHaveCount(0);
    await expect(page.getByText('Удалено задач: 1')).toBeVisible();
    await waitForAnimations(page);
    expect(await input.boundingBox()).toMatchObject({ y: initialBox?.y });
  });

  test('does not show the shortcuts button and keyboard hints', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', { name: 'Горячие клавиши' })).toHaveCount(0);
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
