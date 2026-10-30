import { expect, test } from '@playwright/test';
import {
  addTodo,
  markDone,
  newTodoInput,
  swipeRow,
  todoRow,
  todoRows,
  waitForAnimations,
} from './helpers.js';

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
    await markDone(page, 'Задача');

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

  test('has no horizontal scroll: the layout viewport is as wide as the screen', async ({
    page,
  }) => {
    await page.goto('/');

    const html = page.locator('html');
    const overflow = () => html.evaluate((element) => element.scrollWidth - element.clientWidth);

    expect(await overflow()).toBe(0);

    await addTodo(page, 'Задача');
    await addTodo(page, 'Вторая');
    await todoRow(page, 'Задача').tap();
    await expect(page.getByRole('textbox', { name: 'Название задачи' })).toBeFocused();
    expect(await overflow()).toBe(0);
  });

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

    await swipeRow(page, 'Задача');

    const clear = page.getByRole('button', { name: 'Удалить завершённые' });

    await expect(clear).toBeVisible();
    await waitForAnimations(page);

    const clearBox = await clear.boundingBox();
    const viewportHeight = page.viewportSize()?.height ?? 0;

    // Кнопка у нижнего края окна и ниже всех строк, а поле ввода и список не сдвинулись.
    expect((clearBox?.y ?? 0) + (clearBox?.height ?? 0)).toBeGreaterThan(viewportHeight - 60);
    expect(clearBox?.y).toBeGreaterThan((initialBox?.y ?? 0) + (initialBox?.height ?? 0));
    expect(await input.boundingBox()).toMatchObject({ y: initialBox?.y });

    await clear.tap();

    await expect(todoRows(page)).toHaveCount(0);
    await expect(page.getByText('Удалено задач: 1')).toBeVisible();
    await waitForAnimations(page);
    expect(await input.boundingBox()).toMatchObject({ y: initialBox?.y });
  });

  test('has no checkboxes and no status button: a horizontal swipe changes the status', async ({
    page,
  }) => {
    await page.goto('/');
    await addTodo(page, 'Свайп');

    const row = todoRow(page, 'Свайп');

    await expect(page.getByRole('checkbox')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Отметить как сделанное' })).toHaveCount(0);
    await expect(row.getByRole('button', { name: 'Редактировать задачу' })).toHaveCount(0);

    await swipeRow(page, 'Свайп', 120);
    await expect(row).toHaveAccessibleName('Свайп, выполнено');
    await expect(page.getByRole('textbox', { name: 'Название задачи' })).toHaveCount(0);
    await expect(row.getByRole('button', { name: 'Удалить задачу' })).toBeVisible();
    await expect(page.getByText('Задача «Свайп» выполнена')).toBeAttached();

    // Влево тоже переключает: возвращаем в работу.
    await swipeRow(page, 'Свайп', -120);
    await expect(row).toHaveAccessibleName('Свайп');
  });

  test('ignores a short swipe', async ({ page }) => {
    await page.goto('/');
    await addTodo(page, 'Короткий');

    await swipeRow(page, 'Короткий', 40);

    await expect(todoRow(page, 'Короткий')).toHaveAccessibleName('Короткий');
  });

  test('does not widen the page after a swipe', async ({ page }) => {
    await page.goto('/');
    await addTodo(page, 'Ширина');

    const before = await page.evaluate('[innerWidth, innerHeight]');

    await swipeRow(page, 'Ширина', 120);
    await expect(todoRow(page, 'Ширина')).toHaveAccessibleName('Ширина, выполнено');
    await waitForAnimations(page);

    const after = await page.evaluate('[innerWidth, innerHeight]');

    expect(after).toEqual(before);
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

    await expect(todoRow(page, 'Новая через кнопку')).toBeVisible();
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

    await todoRow(page, 'Старое').tap();
    await expect(editInput).toBeFocused();
    await editInput.fill('Несохранённое');
    await page.getByRole('button', { name: 'Отмена' }).tap();

    await expect(todoRow(page, 'Старое')).toBeVisible();
    await expect(page.getByText('Несохранённое')).toHaveCount(0);

    await todoRow(page, 'Старое').tap();
    await editInput.fill('Новое');
    await page.getByRole('button', { name: 'Подтвердить' }).tap();

    await expect(todoRow(page, 'Новое')).toBeVisible();
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

    await swipeRow(page, 'Задача');

    await expect(page.getByRole('button', { name: 'Удалить задачу' })).toHaveCSS('opacity', '1');
  });

  test('deletes a todo with the trash button and undoes it by the toast button', async ({
    page,
  }) => {
    await page.goto('/');
    await addTodo(page, 'Задача');
    await swipeRow(page, 'Задача');
    await page.getByRole('button', { name: 'Удалить задачу' }).tap();

    await expect(todoRows(page)).toHaveCount(0);

    await page.getByRole('button', { name: 'Отменить' }).tap();

    await expect(todoRow(page, 'Задача')).toBeVisible();
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
